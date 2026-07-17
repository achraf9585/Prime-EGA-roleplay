-- ============================================================
-- Attendance — leave / vacation / absence records per staff
-- ============================================================
create table if not exists staff_leave (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references staff (id) on delete cascade,
  type text not null,            -- leave | vacation | absent
  start_date date not null,
  end_date date,
  reason text,
  created_by text,
  created_at timestamptz default now()
);
create index if not exists idx_staff_leave_staff on staff_leave (staff_id, start_date desc);

alter table staff_leave enable row level security;
