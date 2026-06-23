import { createClient } from '@supabase/supabase-js'

// Lazy client factory. Constructing (and throwing) at module scope breaks the
// Next.js/Vercel build, because page/route modules are evaluated during
// "collect page data" / prerender before env vars are guaranteed available.
// Call getSupabase() at request/effect time instead.
export function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }
  return createClient(supabaseUrl, supabaseKey)
}
