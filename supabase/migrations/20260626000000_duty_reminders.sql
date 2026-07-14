-- Track when a "still on duty?" reminder DM was sent, so we only remind once.
alter table duty_sessions add column if not exists reminded_at timestamptz;
