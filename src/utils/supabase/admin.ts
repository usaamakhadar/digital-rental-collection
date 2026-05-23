import { createClient } from '@supabase/supabase-js'

/**
 * createAdminClient bypasses Row Level Security (RLS).
 * 
 * WARNING: NEVER use this inside Client Components. 
 * ONLY use this in Server Components, Server Actions, or API Routes 
 * where the user's access has already been verified or where access is intentionally public but scoped.
 */
export function createAdminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  }
  
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    }
  )
}
