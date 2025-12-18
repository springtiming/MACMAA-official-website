-- Add explicit published flag for news and events
alter table public.news_posts
  add column if not exists published boolean not null default false;

alter table public.events
  add column if not exists published boolean not null default false;

-- Backfill existing rows to published=true if status was published
update public.news_posts set published = true where status = 'published';
-- events 没有 published_at 字段，默认全部标记为已发布以保持兼容
update public.events set published = true;
