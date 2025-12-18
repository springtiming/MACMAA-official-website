-- Ensure article_versions drafts are owned by creator and enforce RLS

-- Default created_by from auth.uid for new inserts
alter table public.article_versions
  alter column created_by drop default,
  alter column created_by set default auth.uid();

-- Backfill missing created_by using article author when possible
update public.article_versions v
set created_by = a.author_id
from public.articles a
where v.article_id = a.id
  and v.created_by is null
  and a.author_id is not null;

-- RLS: drafts only visible to creator; admins can access all
drop policy if exists article_versions_admin on public.article_versions;
drop policy if exists article_versions_select on public.article_versions;
drop policy if exists article_versions_insert on public.article_versions;
drop policy if exists article_versions_update on public.article_versions;
drop policy if exists article_versions_delete on public.article_versions;

create policy article_versions_select on public.article_versions
for select
using (
  public.is_admin()
  or (status = 'draft' and created_by = auth.uid())
  or (status = 'published')
);

create policy article_versions_insert on public.article_versions
for insert
with check (public.is_admin() or created_by = auth.uid());

create policy article_versions_update on public.article_versions
for update
using (public.is_admin() or created_by = auth.uid())
with check (public.is_admin() or created_by = auth.uid());

create policy article_versions_delete on public.article_versions
for delete
using (public.is_admin() or created_by = auth.uid());

-- Utility to clear current user's drafts (or admin)
create or replace function public.clear_my_drafts()
returns void
security definer
set search_path = public, extensions
language plpgsql
as $$
begin
  delete from public.article_versions
  where status = 'draft'
    and (public.is_admin() or created_by = auth.uid());
end;
$$;
