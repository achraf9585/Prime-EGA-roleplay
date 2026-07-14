-- ============================================================
-- Phase 0 — Staff Operations Foundation (additive, safe to re-run)
-- Does NOT modify existing tables. Login continues via AdminUsers /
-- whitelist_staff; these tables add a profile + org + permission layer.
-- ============================================================

-- 1. RANKS — carry the permission matrix (permissions: { module: [actions] })
create table if not exists ranks (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  level integer not null default 0,          -- higher = more senior
  color text,                                -- hex for UI badge
  permissions jsonb not null default '{}',   -- { "complaints": ["view","create"], "*": ["*"] }
  created_at timestamptz default now()
);

-- 2. DEPARTMENTS
create table if not exists departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  color text,
  created_at timestamptz default now()
);

-- 3. STAFF — canonical operator profile. Links to a login identity by
--    discord_id and/or email (both nullable; at least one expected).
create table if not exists staff (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  discord_id text unique,
  steam_id text,
  fivem_identifier text,
  email text,
  avatar_url text,
  rank_id uuid references ranks (id) on delete set null,
  department_id uuid references departments (id) on delete set null,
  join_date date default current_date,
  status text not null default 'active',     -- active | inactive | on_leave | suspended
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_staff_discord_id on staff (discord_id);
create index if not exists idx_staff_email on staff (email);
create index if not exists idx_staff_rank on staff (rank_id);
create index if not exists idx_staff_department on staff (department_id);
create index if not exists idx_staff_status on staff (status);

-- 4. AUDIT LOGS — general-purpose action trail across all staff-ops modules
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_type text,                 -- admin | staff
  actor_name text,
  actor_discord_id text,
  module text not null,            -- staff | ranks | departments | complaints | ...
  action text not null,            -- create | edit | delete | approve | ...
  target_type text,                -- staff | rank | complaint | ...
  target_id text,
  summary text,
  before jsonb,
  after jsonb,
  reason text,
  ip text,
  created_at timestamptz default now()
);
create index if not exists idx_audit_module on audit_logs (module);
create index if not exists idx_audit_target on audit_logs (target_type, target_id);
create index if not exists idx_audit_created_at on audit_logs (created_at desc);

-- RLS: service-role only (app accesses via server routes)
alter table ranks enable row level security;
alter table departments enable row level security;
alter table staff enable row level security;
alter table audit_logs enable row level security;

-- ============================================================
-- Seed default ranks (only if the table is empty)
-- ============================================================
insert into ranks (name, level, color, permissions)
select * from (values
  -- Leadership
  ('Owner',              100, '#f59e0b', '{"*":["*"]}'::jsonb),
  ('Co-Owner',            95, '#f97316', '{"*":["*"]}'::jsonb),
  ('Supervisor',          80, '#a855f7', '{"staff":["view","create","edit"],"complaints":["view","create","edit","approve"],"investigations":["view","create","edit","approve"],"discipline":["view","create","edit","approve"],"promotions":["view","create","edit","approve"],"attendance":["view","edit"],"duty":["view"],"performance":["view"],"leaderboards":["view"],"audit":["view"]}'::jsonb),
  ('Moderator',           50, '#3b82f6', '{"complaints":["view","create"],"investigations":["view"],"attendance":["view"],"duty":["view"],"leaderboards":["view"]}'::jsonb),
  ('Trial Moderator',     30, '#06b6d4', '{"complaints":["view"],"attendance":["view"],"duty":["view"],"leaderboards":["view"]}'::jsonb),
  -- Task roles
  ('Refund Supervisor',   70, '#22c55e', '{"complaints":["view","create","edit"],"investigations":["view","create"],"attendance":["view"],"duty":["view"]}'::jsonb),
  ('Refund Team',         45, '#4ade80', '{"complaints":["view","create"],"attendance":["view"],"duty":["view"]}'::jsonb),
  ('Legal Supervisor',    70, '#0ea5e9', '{"complaints":["view","create","edit"],"investigations":["view","create"],"attendance":["view"],"duty":["view"]}'::jsonb),
  ('Illegal Supervisor',  70, '#ef4444', '{"complaints":["view","create","edit"],"investigations":["view","create"],"attendance":["view"],"duty":["view"]}'::jsonb),
  ('PC Checker',          45, '#eab308', '{"complaints":["view","create"],"investigations":["view"],"attendance":["view"],"duty":["view"]}'::jsonb)
) as v(name, level, color, permissions)
where not exists (select 1 from ranks);

-- Seed default departments (only if empty)
insert into departments (name, description, color)
select * from (values
  ('Administration', 'Server administration & staff management', '#a855f7'),
  ('Moderation',     'In-game moderation team',                  '#3b82f6'),
  ('Support',        'Player support & tickets',                 '#06b6d4'),
  ('Human Resources','Recruitment, promotions, discipline',      '#ec4899')
) as v(name, description, color)
where not exists (select 1 from departments);
