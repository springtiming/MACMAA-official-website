-- Ensure admin_accounts.id has a default UUID to avoid failed inserts
alter table public.admin_accounts
  alter column id set default gen_random_uuid();
