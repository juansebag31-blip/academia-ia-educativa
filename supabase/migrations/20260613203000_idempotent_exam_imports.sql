alter table public.exam_attempts
  add column source_attempt_id text;

create unique index exam_attempts_user_source_idx
  on public.exam_attempts(user_id, source_attempt_id)
  where source_attempt_id is not null;
