create table if not exists public.volunteer_applications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  birth_year integer,
  gender text check (gender in ('male', 'female', 'prefer-not-to-say')),
  phone text not null,
  email text not null,
  suburb text not null,
  language_skills text[] not null default '{}',
  language_other text,
  volunteer_interests text[] not null default '{}',
  interest_other text,
  weekday_availability text[] not null default '{}',
  weekend_availability text[] not null default '{}',
  monthly_hours text not null,
  emergency_name text not null,
  emergency_relation text not null,
  emergency_phone text not null,
  agree_truth boolean not null default false,
  agree_unpaid boolean not null default false,
  agree_guidelines boolean not null default false,
  agree_contact boolean not null default false,
  agree_privacy boolean not null default false,
  apply_date date not null default now(),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  notes text,
  handled_by uuid references public.admin_accounts (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_volunteer_applications_status
  on public.volunteer_applications (status);

create index if not exists idx_volunteer_applications_created_at
  on public.volunteer_applications (created_at desc);

drop trigger if exists set_volunteer_applications_updated_at on public.volunteer_applications;
create trigger set_volunteer_applications_updated_at
before update on public.volunteer_applications
for each row
execute procedure public.set_current_timestamp();

alter table public.volunteer_applications enable row level security;

drop policy if exists volunteer_applications_admin_read on public.volunteer_applications;
create policy volunteer_applications_admin_read on public.volunteer_applications
for select
using (public.is_admin());

drop policy if exists volunteer_applications_public_insert on public.volunteer_applications;
create policy volunteer_applications_public_insert on public.volunteer_applications
for insert
with check (true);

drop policy if exists volunteer_applications_admin_update on public.volunteer_applications;
create policy volunteer_applications_admin_update on public.volunteer_applications
for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists volunteer_applications_admin_delete on public.volunteer_applications;
create policy volunteer_applications_admin_delete on public.volunteer_applications
for delete
using (public.is_admin());
