-- Align news cover fields with events: store type, keyword, and url

-- Add new columns if they don't exist
alter table if exists public.news_posts
  add column if not exists cover_type text check (cover_type in ('unsplash','upload')),
  add column if not exists cover_keyword text,
  add column if not exists cover_url text;

alter table if exists public.articles
  add column if not exists cover_type text check (cover_type in ('unsplash','upload')),
  add column if not exists cover_keyword text,
  add column if not exists cover_url text;

alter table if exists public.article_versions
  add column if not exists cover_type text check (cover_type in ('unsplash','upload')),
  add column if not exists cover_keyword text,
  add column if not exists cover_url text;

-- Backfill from legacy cover_source
with urls as (
  select id,
    case when cover_source ~ '^(https?:|/|data:|blob:)' then cover_source else null end as src_url,
    case when cover_source is not null and cover_source !~ '^(https?:|/|data:|blob:)' then cover_source else null end as src_keyword
  from public.news_posts
)
update public.news_posts np
set
  cover_url = coalesce(np.cover_url, u.src_url),
  cover_keyword = coalesce(np.cover_keyword, u.src_keyword),
  cover_type = coalesce(
    np.cover_type,
    case
      when u.src_url is not null then 'upload'
      when u.src_keyword is not null then 'unsplash'
      else null
    end
  ),
  cover_source = coalesce(np.cover_url, np.cover_keyword, np.cover_source)
from urls u
where np.id = u.id;

with urls as (
  select id,
    case when cover_source ~ '^(https?:|/|data:|blob:)' then cover_source else null end as src_url,
    case when cover_source is not null and cover_source !~ '^(https?:|/|data:|blob:)' then cover_source else null end as src_keyword
  from public.articles
)
update public.articles a
set
  cover_url = coalesce(a.cover_url, u.src_url),
  cover_keyword = coalesce(a.cover_keyword, u.src_keyword),
  cover_type = coalesce(
    a.cover_type,
    case
      when u.src_url is not null then 'upload'
      when u.src_keyword is not null then 'unsplash'
      else null
    end
  ),
  cover_source = coalesce(a.cover_url, a.cover_keyword, a.cover_source)
from urls u
where a.id = u.id;

with urls as (
  select id,
    case when cover_source ~ '^(https?:|/|data:|blob:)' then cover_source else null end as src_url,
    case when cover_source is not null and cover_source !~ '^(https?:|/|data:|blob:)' then cover_source else null end as src_keyword
  from public.article_versions
)
update public.article_versions av
set
  cover_url = coalesce(av.cover_url, u.src_url),
  cover_keyword = coalesce(av.cover_keyword, u.src_keyword),
  cover_type = coalesce(
    av.cover_type,
    case
      when u.src_url is not null then 'upload'
      when u.src_keyword is not null then 'unsplash'
      else null
    end
  ),
  cover_source = coalesce(av.cover_url, av.cover_keyword, av.cover_source)
from urls u
where av.id = u.id;

