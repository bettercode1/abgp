import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Verify connection (simple auth test)
supabase.auth.getSession().then(({ data }) => {
  console.log('[Supabase] Auth check:', data.session ? 'Session active' : 'No session')
})
