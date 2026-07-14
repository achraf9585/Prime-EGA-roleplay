-- ============================================================
-- Promotion Center — rank-change requests with an approval workflow
-- ============================================================
create table if not exists promotions (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references staff (id) on delete cascade,
  from_rank_id uuid references ranks (id) on delete set null,
  to_rank_id uuid references ranks (id) on delete set null,
  reason text,
  status text not null default 'pending',  -- pending | approved | rejected
  requested_by text,
  requested_by_discord_id text,
  decided_by text,
  decided_at timestamptz,
  created_at timestamptz default now()
);
create index if not exists idx_promotions_staff on promotions (staff_id);
create index if not exists idx_promotions_status on promotions (status);
create index if not exists idx_promotions_created_at on promotions (created_at desc);

alter table promotions enable row level security;
