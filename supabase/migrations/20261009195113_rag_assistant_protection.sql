create table public.rag_rate_limit_counters (
  subject_hash text not null
    check (subject_hash ~ '^[0-9a-f]{64}$'),
  subject_type text not null
    check (subject_type in ('anonymous', 'authenticated')),
  bucket_kind text not null
    check (bucket_kind in ('minute', 'day')),
  bucket_started_at timestamptz not null,
  request_count integer not null check (request_count > 0),
  updated_at timestamptz not null default now(),
  primary key (subject_hash, bucket_kind, bucket_started_at)
);

create index rag_rate_limit_counters_updated_at_idx
  on public.rag_rate_limit_counters(updated_at);

create table public.rag_daily_budgets (
  budget_day date not null,
  budget_kind text not null
    check (budget_kind in ('embedding', 'generation')),
  consumed integer not null check (consumed > 0),
  updated_at timestamptz not null default now(),
  primary key (budget_day, budget_kind)
);

create table public.rag_response_cache (
  cache_key text primary key
    check (cache_key ~ '^[0-9a-f]{64}$'),
  question_hash text not null
    check (question_hash ~ '^[0-9a-f]{64}$'),
  course_slug text not null,
  module_slug text,
  corpus_version text not null,
  embedding_model text not null,
  generation_model text not null,
  prompt_version text not null,
  configuration_hash text not null
    check (configuration_hash ~ '^[0-9a-f]{64}$'),
  response jsonb not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  check (expires_at > created_at)
);

create index rag_response_cache_expires_at_idx
  on public.rag_response_cache(expires_at);

create table public.rag_metrics_daily (
  metric_day date not null,
  metric_name text not null check (metric_name in (
    'requests',
    'cache_hits',
    'generations',
    'insufficient_evidence',
    'rate_limits',
    'errors_global_budget',
    'errors_provider_quota',
    'errors_provider_temporary',
    'errors_internal'
  )),
  event_count bigint not null check (event_count > 0),
  updated_at timestamptz not null default now(),
  primary key (metric_day, metric_name)
);

alter table public.rag_rate_limit_counters enable row level security;
alter table public.rag_rate_limit_counters force row level security;
alter table public.rag_daily_budgets enable row level security;
alter table public.rag_daily_budgets force row level security;
alter table public.rag_response_cache enable row level security;
alter table public.rag_response_cache force row level security;
alter table public.rag_metrics_daily enable row level security;
alter table public.rag_metrics_daily force row level security;

revoke all on table public.rag_rate_limit_counters from public, anon, authenticated;
revoke all on table public.rag_daily_budgets from public, anon, authenticated;
revoke all on table public.rag_response_cache from public, anon, authenticated;
revoke all on table public.rag_metrics_daily from public, anon, authenticated;

grant select, insert, update, delete
  on table public.rag_rate_limit_counters to service_role;
grant select, insert, update, delete
  on table public.rag_daily_budgets to service_role;
grant select, insert, update, delete
  on table public.rag_response_cache to service_role;
grant select, insert, update, delete
  on table public.rag_metrics_daily to service_role;

create or replace function public.consume_rag_request_limit(
  p_subject_hash text,
  p_subject_type text,
  p_daily_limit integer,
  p_minute_limit integer
)
returns table (
  allowed boolean,
  rejection_reason text,
  daily_count integer,
  minute_count integer
)
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  v_day_start timestamptz := date_trunc('day', now() at time zone 'UTC') at time zone 'UTC';
  v_minute_start timestamptz := date_trunc('minute', now());
begin
  if p_subject_hash is null or p_subject_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'invalid subject hash';
  end if;
  if p_subject_type not in ('anonymous', 'authenticated') then
    raise exception 'invalid subject type';
  end if;
  if p_daily_limit < 1 or p_minute_limit < 1 then
    raise exception 'invalid request limits';
  end if;

  insert into public.rag_rate_limit_counters (
    subject_hash,
    subject_type,
    bucket_kind,
    bucket_started_at,
    request_count
  ) values (
    p_subject_hash,
    p_subject_type,
    'day',
    v_day_start,
    1
  )
  on conflict (subject_hash, bucket_kind, bucket_started_at) do update
    set request_count = public.rag_rate_limit_counters.request_count + 1,
        updated_at = now()
  returning request_count into daily_count;

  insert into public.rag_rate_limit_counters (
    subject_hash,
    subject_type,
    bucket_kind,
    bucket_started_at,
    request_count
  ) values (
    p_subject_hash,
    p_subject_type,
    'minute',
    v_minute_start,
    1
  )
  on conflict (subject_hash, bucket_kind, bucket_started_at) do update
    set request_count = public.rag_rate_limit_counters.request_count + 1,
        updated_at = now()
  returning request_count into minute_count;

  if minute_count > p_minute_limit then
    return query select false, 'minute_limit'::text, daily_count, minute_count;
  elsif daily_count > p_daily_limit then
    return query select false, 'daily_limit'::text, daily_count, minute_count;
  else
    return query select true, null::text, daily_count, minute_count;
  end if;
end;
$$;

create or replace function public.reserve_rag_daily_budget(
  p_budget_kind text,
  p_daily_budget integer
)
returns boolean
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  v_consumed integer;
begin
  if p_budget_kind not in ('embedding', 'generation') then
    raise exception 'invalid budget kind';
  end if;
  if p_daily_budget < 1 then
    raise exception 'invalid daily budget';
  end if;

  insert into public.rag_daily_budgets (budget_day, budget_kind, consumed)
  values ((now() at time zone 'UTC')::date, p_budget_kind, 1)
  on conflict (budget_day, budget_kind) do update
    set consumed = public.rag_daily_budgets.consumed + 1,
        updated_at = now()
    where public.rag_daily_budgets.consumed < p_daily_budget
  returning consumed into v_consumed;

  return v_consumed is not null and v_consumed <= p_daily_budget;
end;
$$;

create or replace function public.increment_rag_metric(p_metric_name text)
returns void
language plpgsql
volatile
security invoker
set search_path = ''
as $$
begin
  if p_metric_name not in (
    'requests',
    'cache_hits',
    'generations',
    'insufficient_evidence',
    'rate_limits',
    'errors_global_budget',
    'errors_provider_quota',
    'errors_provider_temporary',
    'errors_internal'
  ) then
    raise exception 'invalid metric name';
  end if;

  insert into public.rag_metrics_daily (metric_day, metric_name, event_count)
  values ((now() at time zone 'UTC')::date, p_metric_name, 1)
  on conflict (metric_day, metric_name) do update
    set event_count = public.rag_metrics_daily.event_count + 1,
        updated_at = now();
end;
$$;

revoke all on function public.consume_rag_request_limit(text, text, integer, integer)
  from public, anon, authenticated;
revoke all on function public.reserve_rag_daily_budget(text, integer)
  from public, anon, authenticated;
revoke all on function public.increment_rag_metric(text)
  from public, anon, authenticated;

grant execute on function public.consume_rag_request_limit(text, text, integer, integer)
  to service_role;
grant execute on function public.reserve_rag_daily_budget(text, integer)
  to service_role;
grant execute on function public.increment_rag_metric(text)
  to service_role;
