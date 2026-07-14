-- ============================================================
-- Admin Schedule — recurring weekly duty roster (8pm–2am, 1h slots)
-- ============================================================
create table if not exists schedule_assignments (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references staff (id) on delete cascade,
  day_of_week smallint not null,   -- 0=Mon … 6=Sun (night the shift starts)
  slot_hour smallint not null,     -- 20,21,22,23,0,1 (start hour of the 1h slot)
  created_by text,
  created_at timestamptz default now(),
  unique (staff_id, day_of_week, slot_hour)
);
create index if not exists idx_schedule_day on schedule_assignments (day_of_week, slot_hour);
create index if not exists idx_schedule_staff on schedule_assignments (staff_id);

alter table schedule_assignments enable row level security;
