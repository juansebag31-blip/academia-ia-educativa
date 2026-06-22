create table public.marketing_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(trim(email))),
  display_name text,
  consented_at timestamptz not null,
  source text not null default 'landing_prompt_kit',
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.marketing_rate_limits (
  origin_hash text primary key,
  window_started_at timestamptz not null,
  attempts integer not null check (attempts > 0)
);

create index marketing_subscribers_created_at_idx
  on public.marketing_subscribers(created_at desc);

create index marketing_subscribers_active_idx
  on public.marketing_subscribers(created_at desc)
  where unsubscribed_at is null;

alter table public.marketing_subscribers enable row level security;
alter table public.marketing_rate_limits enable row level security;

revoke all on public.marketing_subscribers from anon, authenticated;
revoke all on public.marketing_rate_limits from anon, authenticated;

create or replace function private.set_marketing_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger marketing_subscribers_set_updated_at
  before update on public.marketing_subscribers
  for each row execute procedure private.set_marketing_updated_at();

create or replace function public.consume_marketing_rate_limit(p_origin_hash text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_attempts integer;
begin
  if p_origin_hash is null or length(p_origin_hash) < 32 then
    return false;
  end if;

  insert into public.marketing_rate_limits (origin_hash, window_started_at, attempts)
  values (p_origin_hash, now(), 1)
  on conflict (origin_hash) do update
    set attempts = case
      when public.marketing_rate_limits.window_started_at <= now() - interval '15 minutes' then 1
      else public.marketing_rate_limits.attempts + 1
    end,
    window_started_at = case
      when public.marketing_rate_limits.window_started_at <= now() - interval '15 minutes' then now()
      else public.marketing_rate_limits.window_started_at
    end
  returning attempts into current_attempts;

  return current_attempts <= 5;
end;
$$;

revoke all on function private.set_marketing_updated_at() from public;
revoke all on function public.consume_marketing_rate_limit(text) from public, anon, authenticated;
grant execute on function public.consume_marketing_rate_limit(text) to service_role;
grant select, insert, update on public.marketing_subscribers to service_role;
grant select, insert, update, delete on public.marketing_rate_limits to service_role;
