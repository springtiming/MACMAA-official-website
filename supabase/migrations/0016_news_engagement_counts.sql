alter table public.articles
  add column if not exists view_count bigint not null default 0,
  add column if not exists like_count bigint not null default 0;

alter table public.articles
  drop constraint if exists articles_view_count_nonnegative,
  add constraint articles_view_count_nonnegative check (view_count >= 0);

alter table public.articles
  drop constraint if exists articles_like_count_nonnegative,
  add constraint articles_like_count_nonnegative check (like_count >= 0);

create or replace function public.record_article_engagement(
  target_article_id uuid,
  engagement_action text
)
returns table(view_count bigint, like_count bigint)
language plpgsql
security definer
set search_path = public
as $$
begin
  if engagement_action = 'view' then
    return query
    update public.articles a
       set view_count = coalesce(a.view_count, 0) + 1
     where a.id = target_article_id
       and a.published = true
     returning a.view_count, a.like_count;
    return;
  end if;

  if engagement_action = 'like' then
    return query
    update public.articles a
       set like_count = coalesce(a.like_count, 0) + 1
     where a.id = target_article_id
       and a.published = true
     returning a.view_count, a.like_count;
    return;
  end if;

  if engagement_action = 'unlike' then
    return query
    update public.articles a
       set like_count = greatest(coalesce(a.like_count, 0) - 1, 0)
     where a.id = target_article_id
       and a.published = true
     returning a.view_count, a.like_count;
    return;
  end if;

  raise exception 'Unsupported engagement action: %', engagement_action;
end;
$$;

revoke all on function public.record_article_engagement(uuid, text) from public;
grant execute on function public.record_article_engagement(uuid, text) to service_role;
