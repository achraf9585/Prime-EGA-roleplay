-- ============================================================
-- Discipline Center — disciplinary records attached to staff
-- ============================================================
create table if not exists discipline_records (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references staff (id) on delete cascade,
  type text not null,               -- verbal_warning | written_warning | final_warning | probation | suspension | demotion | termination
  reason text not null,
  evidence text,                    -- link(s) / notes
  expires_at timestamptz,           -- null = permanent
  status text not null default 'active', -- active | revoked
  revoked_at timestamptz,
  revoked_by text,
  issued_by text,                   -- actor display name
  issued_by_discord_id text,
  created_at timestamptz default now()
);
create index if not exists idx_discipline_staff on discipline_records (staff_id);
create index if not exists idx_discipline_status on discipline_records (status);
create index if not exists idx_discipline_created_at on discipline_records (created_at desc);

alter table discipline_records enable row level security;
