create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null,
  description text not null,
  duration text not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  slug text not null unique,
  title text not null,
  purpose text not null,
  module_order integer not null check (module_order > 0),
  duration text not null,
  product text not null,
  certificate_hours integer not null default 2 check (certificate_hours > 0),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, module_order)
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  slug text not null unique,
  title text not null,
  lesson_order integer not null check (lesson_order > 0),
  lesson_type text not null,
  summary text not null,
  content text not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (module_id, lesson_order)
);

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references public.modules(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete cascade,
  title text not null,
  resource_type text not null,
  public_url text,
  storage_path text,
  resource_order integer not null default 1 check (resource_order > 0),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint resources_owner_required check (
    module_id is not null or lesson_id is not null
  ),
  constraint resources_location_required check (
    public_url is not null or storage_path is not null
  )
);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  status text not null default 'active'
    check (status in ('active', 'completed', 'archived')),
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (user_id, course_id)
);

create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  status text not null default 'in_progress'
    check (status in ('not_started', 'in_progress', 'completed')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create table public.learning_states (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id uuid not null references public.modules(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (user_id, module_id)
);

create table public.student_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create table public.exam_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id uuid not null references public.modules(id) on delete cascade,
  correct integer not null check (correct >= 0),
  incorrect integer not null check (incorrect >= 0),
  unanswered integer not null check (unanswered >= 0),
  total integer not null check (total > 0),
  percent integer not null check (percent between 0 and 100),
  passed boolean not null,
  answers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint exam_attempt_totals_match check (
    correct + incorrect + unanswered = total
  )
);

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id uuid not null references public.modules(id) on delete cascade,
  exam_attempt_id uuid not null unique
    references public.exam_attempts(id) on delete restrict,
  certificate_code text not null unique,
  issued_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique (user_id, module_id)
);

create index modules_course_id_idx on public.modules(course_id);
create index lessons_module_id_idx on public.lessons(module_id);
create index resources_module_id_idx on public.resources(module_id);
create index resources_lesson_id_idx on public.resources(lesson_id);
create index lesson_progress_user_id_idx on public.lesson_progress(user_id);
create index exam_attempts_user_module_idx
  on public.exam_attempts(user_id, module_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.resources enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.learning_states enable row level security;
alter table public.student_notes enable row level security;
alter table public.exam_attempts enable row level security;
alter table public.certificates enable row level security;

create policy "published courses are public"
on public.courses for select
to anon, authenticated
using (is_published);

create policy "published modules are public"
on public.modules for select
to anon, authenticated
using (
  is_published
  and exists (
    select 1 from public.courses
    where courses.id = modules.course_id
      and courses.is_published
  )
);

create policy "published lessons are public"
on public.lessons for select
to anon, authenticated
using (
  is_published
  and exists (
    select 1 from public.modules
    join public.courses on courses.id = modules.course_id
    where modules.id = lessons.module_id
      and modules.is_published
      and courses.is_published
  )
);

create policy "published resources are public"
on public.resources for select
to anon, authenticated
using (is_published);

create policy "users read own profile"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

create policy "users update own profile"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "users create own enrollment"
on public.enrollments for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "users read own enrollments"
on public.enrollments for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "users manage own lesson progress"
on public.lesson_progress for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "users manage own learning state"
on public.learning_states for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "users manage own notes"
on public.student_notes for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "users create own exam attempts"
on public.exam_attempts for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "users read own exam attempts"
on public.exam_attempts for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "users read own certificates"
on public.certificates for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "administrators manage profiles"
on public.profiles for all
to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "administrators manage courses"
on public.courses for all
to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "administrators manage modules"
on public.modules for all
to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "administrators manage lessons"
on public.lessons for all
to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "administrators manage resources"
on public.resources for all
to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "administrators manage enrollments"
on public.enrollments for all
to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "administrators read progress"
on public.lesson_progress for select
to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "administrators read learning states"
on public.learning_states for select
to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "administrators read notes"
on public.student_notes for select
to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "administrators manage exam attempts"
on public.exam_attempts for all
to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "administrators manage certificates"
on public.certificates for all
to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create schema if not exists private;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', '')
  );
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure private.handle_new_user();

grant usage on schema public to anon, authenticated;
grant select on public.courses, public.modules, public.lessons, public.resources
  to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert on public.enrollments to authenticated;
grant select, insert, update, delete on
  public.lesson_progress,
  public.learning_states,
  public.student_notes
  to authenticated;
grant select, insert on public.exam_attempts to authenticated;
grant select on public.certificates to authenticated;
