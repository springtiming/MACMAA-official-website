-- Make event visibility independent from access_type
drop policy if exists events_public_read on public.events;
drop policy if exists events_members_read on public.events;

-- Everyone can read events; access_type is only a label
create policy events_public_read on public.events
for select
using (true);
