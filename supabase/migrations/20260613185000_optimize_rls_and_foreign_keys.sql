create index certificates_module_id_idx
  on public.certificates(module_id);

create index enrollments_course_id_idx
  on public.enrollments(course_id);

create index exam_attempts_module_id_idx
  on public.exam_attempts(module_id);

create index learning_states_module_id_idx
  on public.learning_states(module_id);

create index lesson_progress_lesson_id_idx
  on public.lesson_progress(lesson_id);

create index student_notes_lesson_id_idx
  on public.student_notes(lesson_id);

alter policy "administrators manage profiles"
on public.profiles
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

alter policy "administrators manage courses"
on public.courses
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

alter policy "administrators manage modules"
on public.modules
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

alter policy "administrators manage lessons"
on public.lessons
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

alter policy "administrators manage resources"
on public.resources
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

alter policy "administrators manage enrollments"
on public.enrollments
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

alter policy "administrators read progress"
on public.lesson_progress
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

alter policy "administrators read learning states"
on public.learning_states
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

alter policy "administrators read notes"
on public.student_notes
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

alter policy "administrators manage exam attempts"
on public.exam_attempts
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

alter policy "administrators manage certificates"
on public.certificates
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
