-- Articles (published content)
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title_zh text not null,
  title_en text not null,
  summary_zh text,
  summary_en text,
  content_zh text,
  content_en text,
  cover_source text,
  published_at timestamptz,
  author_id uuid references public.admin_accounts (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published boolean not null default false
);

-- Article versions (drafts/history)
create table if not exists public.article_versions (
  id uuid primary key default gen_random_uuid(),
  article_id uuid references public.articles (id) on delete cascade,
  title_zh text not null,
  title_en text not null,
  summary_zh text,
  summary_en text,
  content_zh text,
  content_en text,
  cover_source text,
  status text not null check (status in ('draft','published')),
  version_number integer not null,
  created_by uuid references public.admin_accounts (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_article_versions_article_version
  on public.article_versions (article_id, version_number desc);

-- Backfill from existing news_posts into articles + first published version
insert into public.articles (
  id, title_zh, title_en, summary_zh, summary_en, content_zh, content_en,
  cover_source, published_at, author_id, created_at, updated_at, published
)
select
  id, title_zh, title_en, summary_zh, summary_en, content_zh, content_en,
  cover_source, published_at, author_id, created_at, updated_at, coalesce(published, status = 'published')
from public.news_posts
on conflict (id) do nothing;

insert into public.article_versions (
  article_id, title_zh, title_en, summary_zh, summary_en, content_zh, content_en,
  cover_source, status, version_number, created_by, created_at, updated_at
)
select
  id,
  title_zh, title_en, summary_zh, summary_en, content_zh, content_en,
  cover_source,
  case when coalesce(published, status = 'published') then 'published' else 'draft' end,
  1,
  author_id,
  coalesce(published_at, created_at, now()),
  coalesce(updated_at, published_at, created_at, now())
from public.news_posts
on conflict do nothing;

-- Triggers to maintain updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_articles_updated_at on public.articles;
create trigger trg_articles_updated_at
before update on public.articles
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_article_versions_updated_at on public.article_versions;
create trigger trg_article_versions_updated_at
before update on public.article_versions
for each row execute procedure public.set_updated_at();

-- RLS
alter table public.articles enable row level security;
alter table public.article_versions enable row level security;

-- articles: public read only published; admin can manage
drop policy if exists articles_public_read on public.articles;
create policy articles_public_read on public.articles
for select using (published = true);

create policy articles_admin_read on public.articles
for select using (public.is_admin());

create policy articles_admin_write on public.articles
for all using (public.is_admin()) with check (public.is_admin());

-- article_versions: only admins
drop policy if exists article_versions_admin on public.article_versions;
create policy article_versions_admin on public.article_versions
for all using (public.is_admin()) with check (public.is_admin());
