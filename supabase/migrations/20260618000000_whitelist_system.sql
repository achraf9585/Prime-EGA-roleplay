-- Whitelist Questions
create table if not exists whitelist_questions (
  id text primary key,
  category_number integer not null,
  category_name text not null,
  question_text text not null,
  options jsonb not null,
  correct_answer text not null,
  created_at timestamptz default now()
);

-- Whitelist Scenarios
create table if not exists whitelist_scenarios (
  id text primary key,
  track text not null, -- 'a', 'b', 'c'
  track_name text not null,
  title text not null,
  scenario_text text not null,
  targeted_rules text not null,
  fail_criteria text not null,
  pass_criteria text not null,
  created_at timestamptz default now()
);

-- Whitelist Applications
create table if not exists whitelist_applications (
  id uuid primary key default gen_random_uuid(),
  discord_id text not null unique,
  discord_username text not null,
  discord_avatar text,
  character_name text not null,
  character_backstory text not null,
  experience_portfolio text not null,
  traits_flaws text not null,
  faction_choice text not null,
  quiz_score integer,
  quiz_answers jsonb,
  tab_out_count integer default 0,
  paste_count integer default 0,
  status text not null default 'pending', -- 'pending', 'approved', 'rejected'
  admin_notes text,
  rejected_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS
alter table whitelist_questions enable row level security;
alter table whitelist_scenarios enable row level security;
alter table whitelist_applications enable row level security;

create policy "Public read questions" on whitelist_questions for select using (true);
create policy "Public read scenarios" on whitelist_scenarios for select using (true);
create policy "Service role all" on whitelist_applications for all using (true);
