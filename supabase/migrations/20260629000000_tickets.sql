-- ============================================================
-- Ticket Tracking — snapshots Ticket Tool per-ticket channels so staff
-- response metrics survive channel deletion on close.
-- ============================================================
create table if not exists tickets (
  id uuid primary key default gen_random_uuid(),
  channel_id text not null unique,          -- Discord channel id (ticket-####)
  ticket_number integer,                    -- parsed from the channel name
  channel_name text,
  opener_discord_id text,
  opener_username text,
  opened_at timestamptz not null,           -- derived from the channel's snowflake
  first_response_at timestamptz,            -- first tracked-staff reply
  first_responder_discord_id text,
  first_responder_staff_id uuid references staff (id) on delete set null,
  handler_ids text[] not null default '{}', -- distinct staff discord ids who replied
  staff_msg_count integer not null default 0,
  last_scanned_message_id text,             -- cursor for incremental message reads
  status text not null default 'open',      -- open | closed
  closed_at timestamptz,                    -- set when the channel disappears
  resolution_seconds integer,               -- opened_at → closed_at
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_tickets_status on tickets (status);
create index if not exists idx_tickets_opened_at on tickets (opened_at desc);
create index if not exists idx_tickets_responder on tickets (first_responder_staff_id);

alter table tickets enable row level security;
