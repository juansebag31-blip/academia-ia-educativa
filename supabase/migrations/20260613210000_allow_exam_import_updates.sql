create policy "users update own imported exam attempts"
on public.exam_attempts for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

grant update on public.exam_attempts to authenticated;
