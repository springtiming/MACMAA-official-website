create table if not exists public.review_audit_logs (
  id uuid primary key default gen_random_uuid(),
  module text not null check (module in ('member_review', 'payment_review')),
  target_type text not null check (target_type in ('member', 'registration')),
  target_id uuid not null,
  action_type text not null,
  from_status text,
  to_status text,
  reviewed_by uuid references public.admin_accounts (id),
  reviewed_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists idx_review_audit_logs_target
  on public.review_audit_logs (module, target_id, reviewed_at desc);

create index if not exists idx_review_audit_logs_reviewed_at
  on public.review_audit_logs (reviewed_at desc);

alter table public.review_audit_logs enable row level security;

drop policy if exists review_audit_logs_select on public.review_audit_logs;
create policy review_audit_logs_select on public.review_audit_logs
for select
using (public.is_admin());

drop policy if exists review_audit_logs_insert on public.review_audit_logs;
create policy review_audit_logs_insert on public.review_audit_logs
for insert
with check (public.is_service_role());

create or replace function public.log_member_review_audit()
returns trigger
language plpgsql
as $$
declare
  actor_id uuid;
  action_label text;
begin
  if new.status is not distinct from old.status then
    return new;
  end if;

  actor_id := coalesce(new.handled_by, old.handled_by);
  if actor_id is null then
    return new;
  end if;

  action_label := case
    when old.status = 'pending' and new.status = 'approved' then 'approve'
    when old.status = 'pending' and new.status = 'rejected' then 'reject'
    when old.status = 'approved' and new.status = 'rejected' then 'revoke'
    when old.status = 'rejected' and new.status = 'pending' then 'reopen'
    else 'status_update'
  end;

  insert into public.review_audit_logs (
    module,
    target_type,
    target_id,
    action_type,
    from_status,
    to_status,
    reviewed_by,
    reviewed_at,
    metadata
  ) values (
    'member_review',
    'member',
    new.id,
    action_label,
    old.status,
    new.status,
    actor_id,
    now(),
    jsonb_build_object(
      'member_name_zh', new.chinese_name,
      'member_name_en', new.english_name
    )
  );

  return new;
end;
$$;

drop trigger if exists trg_log_member_review_audit on public.members;
create trigger trg_log_member_review_audit
after update of status on public.members
for each row
execute function public.log_member_review_audit();

create or replace function public.log_payment_review_audit()
returns trigger
language plpgsql
as $$
declare
  actor_id uuid;
  action_label text;
begin
  if new.payment_status is not distinct from old.payment_status then
    return new;
  end if;

  actor_id := coalesce(new.confirmed_by, old.confirmed_by);
  if actor_id is null then
    return new;
  end if;

  action_label := case
    when old.payment_status = 'pending' and new.payment_status = 'confirmed' then 'approve'
    when old.payment_status = 'pending' and new.payment_status in ('cancelled', 'expired') then 'reject'
    else 'status_update'
  end;

  insert into public.review_audit_logs (
    module,
    target_type,
    target_id,
    action_type,
    from_status,
    to_status,
    reviewed_by,
    reviewed_at,
    metadata
  ) values (
    'payment_review',
    'registration',
    new.id,
    action_label,
    old.payment_status,
    new.payment_status,
    actor_id,
    now(),
    jsonb_build_object(
      'event_id', new.event_id,
      'attendee_name', new.name,
      'payment_method', new.payment_method
    )
  );

  return new;
end;
$$;

drop trigger if exists trg_log_payment_review_audit on public.event_registrations;
create trigger trg_log_payment_review_audit
after update of payment_status on public.event_registrations
for each row
execute function public.log_payment_review_audit();
