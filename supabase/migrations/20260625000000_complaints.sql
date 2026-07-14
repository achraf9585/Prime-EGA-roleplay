-- ============================================================
-- Complaints & Investigations — staff complaint lifecycle + case notes
-- ============================================================
create table if not exists complaints (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  reporter text,                         -- who reported (player/discord/name)
  reported_staff_id uuid references staff (id) on delete set null,
  reported_staff_text text,              -- fallback if not a tracked staff row
  description text not null,
  evidence text,                         -- links / notes
  status text not null default 'open',   -- open | investigating | waiting_evidence | interview | resolved | rejected | archived
  assigned_to uuid references staff (id) on delete set null,  -- investigator
  decision text,
  punishment text,
  created_by text,
  created_by_discord_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  resolved_at timestamptz
);
create index if not exists idx_complaints_status on complaints (status);
create index if not exists idx_complaints_reported on complaints (reported_staff_id);
create index if not exists idx_complaints_assigned on complaints (assigned_to);
create index if not exists idx_complaints_created_at on complaints (created_at desc);

-- Investigation timeline / case notes
create table if not exists complaint_notes (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references complaints (id) on delete cascade,
  author text,
  author_discord_id text,
  note text not null,
  created_at timestamptz default now()
);
create index if not exists idx_complaint_notes_complaint on complaint_notes (complaint_id, created_at);

alter table complaints enable row level security;
alter table complaint_notes enable row level security;
