alter table public.admin_accounts
  add column if not exists failed_login_attempts integer not null default 0,
  add column if not exists locked_until timestamptz;

alter table public.admin_accounts
  drop constraint if exists admin_accounts_failed_login_attempts_check;

alter table public.admin_accounts
  add constraint admin_accounts_failed_login_attempts_check
  check (failed_login_attempts >= 0);

create index if not exists idx_admin_accounts_locked_until
  on public.admin_accounts (locked_until)
  where locked_until is not null;
