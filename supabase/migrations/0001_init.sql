-- Schema generated from docs_local/Supabase建表说明.md
create extension if not exists "pgcrypto";

-- 1. 管理账号
create table if not exists public.admin_accounts (
  id uuid primary key,
  username text not null unique,
  email text not null unique,
  password_hash text not null,
  role text not null check (role in ('owner', 'admin')),
  status text not null default 'active' check (status in ('active', 'disabled')),
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);

-- 2. 新闻 / 帖子
create table if not exists public.news_posts (
  id uuid primary key default gen_random_uuid(),
  title_zh text not null,
  title_en text not null,
  summary_zh text,
  summary_en text,
  content_zh text,
  content_en text,
  cover_source text,
  published_at timestamptz not null default now(),
  author_id uuid references public.admin_accounts (id),
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. 活动
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title_zh text not null,
  title_en text not null,
  description_zh text,
  description_en text,
  event_date date not null,
  start_time time,
  end_time time,
  location text not null,
  fee numeric(10, 2) not null default 0,
  member_fee numeric(10, 2),
  capacity integer,
  access_type text check (access_type in ('members-only', 'all-welcome')),
  image_type text check (image_type in ('unsplash', 'upload')),
  image_keyword text,
  image_url text,
  created_by uuid references public.admin_accounts (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. 会员
create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users (id),
  chinese_name text not null,
  english_name text not null,
  gender text check (gender in ('male', 'female')),
  birthday date,
  phone text not null,
  email text,
  address text not null,
  emergency_name text,
  emergency_phone text,
  emergency_relation text,
  apply_date date not null default now(),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  notes text,
  handled_by uuid references public.admin_accounts (id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. 活动报名
create table if not exists public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid references auth.users (id),
  name text not null,
  phone text not null,
  email text,
  tickets integer not null check (tickets > 0),
  payment_method text check (payment_method in ('card', 'cash', 'transfer')),
  registration_date date not null default now(),
  created_at timestamptz not null default now()
);

-- 索引
create index if not exists idx_news_posts_published_at on public.news_posts (published_at desc);
create index if not exists idx_events_event_date on public.events (event_date);
create index if not exists idx_event_registrations_event_id on public.event_registrations (event_id);

-- 更新时间戳触发器
create or replace function public.set_current_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_news_posts_updated_at on public.news_posts;
create trigger set_news_posts_updated_at
before update on public.news_posts
for each row
execute procedure public.set_current_timestamp();

drop trigger if exists set_events_updated_at on public.events;
create trigger set_events_updated_at
before update on public.events
for each row
execute procedure public.set_current_timestamp();

drop trigger if exists set_members_updated_at on public.members;
create trigger set_members_updated_at
before update on public.members
for each row
execute procedure public.set_current_timestamp();

-- 权限辅助函数
create or replace function public.is_service_role()
returns boolean
language sql
stable
as $$
  select coalesce(current_setting('request.jwt.claims', true)::jsonb ->> 'role', '') = 'service_role';
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select
    public.is_service_role()
    or exists (
      select 1
      from public.admin_accounts a
      where a.id = auth.uid()
        and a.status = 'active'
        and a.role in ('admin', 'owner')
    );
$$;

create or replace function public.is_owner()
returns boolean
language sql
stable
as $$
  select
    public.is_service_role()
    or exists (
      select 1
      from public.admin_accounts a
      where a.id = auth.uid()
        and a.status = 'active'
        and a.role = 'owner'
    );
$$;

create or replace function public.is_approved_member()
returns boolean
language sql
stable
as $$
  select
    public.is_service_role()
    or exists (
      select 1
      from public.members m
      where m.auth_user_id = auth.uid()
        and m.status = 'approved'
    );
$$;

-- 启用 RLS
alter table public.admin_accounts enable row level security;
alter table public.news_posts enable row level security;
alter table public.events enable row level security;
alter table public.members enable row level security;
alter table public.event_registrations enable row level security;

-- admin_accounts：owner 全权，admin 只读
create policy admin_accounts_select on public.admin_accounts
for select
using (public.is_admin());

create policy admin_accounts_insert on public.admin_accounts
for insert
with check (public.is_owner());

create policy admin_accounts_update on public.admin_accounts
for update
using (public.is_owner())
with check (public.is_owner());

create policy admin_accounts_delete on public.admin_accounts
for delete
using (public.is_owner());

-- news_posts：游客看已发布，管理员全权
create policy news_posts_public_read on public.news_posts
for select
using (status = 'published');

create policy news_posts_admin_read on public.news_posts
for select
using (public.is_admin());

create policy news_posts_admin_insert on public.news_posts
for insert
with check (public.is_admin());

create policy news_posts_admin_update on public.news_posts
for update
using (public.is_admin())
with check (public.is_admin());

create policy news_posts_admin_delete on public.news_posts
for delete
using (public.is_admin());

-- events：公开可读，会员专享需会员或管理员
create policy events_public_read on public.events
for select
using (coalesce(access_type, 'all-welcome') = 'all-welcome');

create policy events_members_read on public.events
for select
using (public.is_admin() or (access_type = 'members-only' and public.is_approved_member()));

create policy events_admin_insert on public.events
for insert
with check (public.is_admin());

create policy events_admin_update on public.events
for update
using (public.is_admin())
with check (public.is_admin());

create policy events_admin_delete on public.events
for delete
using (public.is_admin());

-- members：申请人可查看，管理员可读写
create policy members_admin_read on public.members
for select
using (public.is_admin());

create policy members_self_read on public.members
for select
using (auth.uid() is not null and auth.uid() = auth_user_id);

create policy members_public_insert on public.members
for insert
with check (true);

create policy members_admin_update on public.members
for update
using (public.is_admin())
with check (public.is_admin());

create policy members_admin_delete on public.members
for delete
using (public.is_admin());

-- event_registrations：管理员可读写，报名人可查看自己的记录
create policy event_registrations_admin_read on public.event_registrations
for select
using (public.is_admin());

create policy event_registrations_self_read on public.event_registrations
for select
using (auth.uid() is not null and auth.uid() = user_id);

create policy event_registrations_public_insert on public.event_registrations
for insert
with check (true);

create policy event_registrations_admin_update on public.event_registrations
for update
using (public.is_admin())
with check (public.is_admin());

create policy event_registrations_admin_delete on public.event_registrations
for delete
using (public.is_admin());
