-- Performance indexes for columns used in WHERE filters and ORDER BY.
-- Without these, list/filter queries become sequential scans as data grows.

-- whitelist_applications: filtered by discord_id, status; sorted by created_at
create index if not exists idx_wl_apps_discord_id on whitelist_applications (discord_id);
create index if not exists idx_wl_apps_status on whitelist_applications (status);
create index if not exists idx_wl_apps_created_at on whitelist_applications (created_at desc);

-- whitelist_logs: filtered by application_id; sorted by created_at
create index if not exists idx_wl_logs_application_id on whitelist_logs (application_id);
create index if not exists idx_wl_logs_created_at on whitelist_logs (created_at desc);

-- whitelist_scenarios: filtered by track
create index if not exists idx_wl_scenarios_track on whitelist_scenarios (track);

-- whitelist_questions: filtered by category_number
create index if not exists idx_wl_questions_category on whitelist_questions (category_number);

-- whitelist_staff: looked up by discord_id (unique already, but explicit for clarity)
create index if not exists idx_wl_staff_discord_id on whitelist_staff (discord_id);

-- Application tables: filtered by status, sorted by created_at
create index if not exists idx_streamer_apps_status on "StreamerApplications" (status);
create index if not exists idx_streamer_apps_created_at on "StreamerApplications" (created_at desc);
create index if not exists idx_family_apps_status on "FamilyApplications" (status);
create index if not exists idx_family_apps_created_at on "FamilyApplications" (created_at desc);

-- RedeemCode: looked up by codeHash (unique already)
create index if not exists idx_redeem_code_hash on "RedeemCode" ("codeHash");

-- SiteTraffic: analytics aggregations by created_at
create index if not exists idx_site_traffic_created_at on "SiteTraffic" (created_at desc);

-- Foreign key: whitelist_logs → whitelist_applications.
-- Use ON DELETE SET NULL to PRESERVE the audit trail when an application row is
-- deleted (e.g. on resubmit). The log keeps its denormalized candidate name/discord.
-- Null out existing orphans first so the constraint can be added.
update whitelist_logs set application_id = null
  where application_id is not null
    and application_id not in (select id from whitelist_applications);

-- Wrapped so re-running is safe.
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'fk_wl_logs_application'
  ) then
    alter table whitelist_logs
      add constraint fk_wl_logs_application
      foreign key (application_id) references whitelist_applications (id) on delete set null;
  end if;
end $$;
