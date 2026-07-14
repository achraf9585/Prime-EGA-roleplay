-- ============================================================
-- Duty Tracking — ingests on/off-duty messages from a Discord channel
-- ============================================================

create table if not exists duty_sessions (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid references staff (id) on delete set null,  -- null = unmatched Discord user
  discord_id text not null,
  discord_username text,
  started_at timestamptz not null,
  ended_at timestamptz,                    -- null = currently on duty
  duration_seconds integer,                -- filled when the session closes
  auto_closed boolean not null default false, -- true if we capped a forgotten "off duty"
  start_message_id text,
  end_message_id text,
  created_at timestamptz default now()
);
create index if not exists idx_duty_discord_id on duty_sessions (discord_id);
create index if not exists idx_duty_staff on duty_sessions (staff_id);
create index if not exists idx_duty_started_at on duty_sessions (started_at desc);
-- fast "who is on duty now" lookup
create index if not exists idx_duty_open on duty_sessions (discord_id) where ended_at is null;

-- Tracks the last Discord message processed per channel (so polling is incremental)
create table if not exists duty_sync_state (
  channel_id text primary key,
  last_message_id text,
  updated_at timestamptz default now()
);

alter table duty_sessions enable row level security;
alter table duty_sync_state enable row level security;
