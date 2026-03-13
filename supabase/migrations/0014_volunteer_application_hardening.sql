do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'volunteer_applications_agree_truth_required'
  ) then
    alter table public.volunteer_applications
      add constraint volunteer_applications_agree_truth_required
      check (agree_truth = true);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'volunteer_applications_agree_unpaid_required'
  ) then
    alter table public.volunteer_applications
      add constraint volunteer_applications_agree_unpaid_required
      check (agree_unpaid = true);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'volunteer_applications_agree_guidelines_required'
  ) then
    alter table public.volunteer_applications
      add constraint volunteer_applications_agree_guidelines_required
      check (agree_guidelines = true);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'volunteer_applications_agree_contact_required'
  ) then
    alter table public.volunteer_applications
      add constraint volunteer_applications_agree_contact_required
      check (agree_contact = true);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'volunteer_applications_agree_privacy_required'
  ) then
    alter table public.volunteer_applications
      add constraint volunteer_applications_agree_privacy_required
      check (agree_privacy = true);
  end if;
end $$;

drop policy if exists volunteer_applications_public_insert
  on public.volunteer_applications;

create policy volunteer_applications_public_insert
  on public.volunteer_applications
  for insert
  with check (
    status = 'pending'
    and handled_by is null
    and notes is null
    and agree_truth = true
    and agree_unpaid = true
    and agree_guidelines = true
    and agree_contact = true
    and agree_privacy = true
  );
