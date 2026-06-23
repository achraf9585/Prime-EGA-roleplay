-- CRITICAL FIX: the original migration granted public SELECT on whitelist_questions,
-- which exposed the `correct_answer` column to anyone holding the (public) anon key.
-- That let candidates fetch every answer and defeat the quiz.
--
-- The application reads these tables exclusively through server routes using the
-- service-role key (which bypasses RLS), so removing the public policies does NOT
-- break the app — it only closes the client-side exploit.

drop policy if exists "Public read questions" on whitelist_questions;
drop policy if exists "Public read scenarios" on whitelist_scenarios;

-- RLS stays enabled with no permissive policies → anon/authenticated roles can read
-- nothing directly; only the service-role server routes can access these tables.
-- (whitelist_questions / whitelist_scenarios already have RLS enabled.)
