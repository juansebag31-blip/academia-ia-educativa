drop index if exists public.exam_attempts_user_source_idx;

alter table public.exam_attempts
  add constraint exam_attempts_user_source_key
  unique (user_id, source_attempt_id);
