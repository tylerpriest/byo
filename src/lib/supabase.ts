import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'
import { mockSupabase } from './supabase-mock'

const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'

// Create Supabase client based on mode
const createSupabaseClient = () => {
  if (isDemoMode) {
    console.log('🎭 Running in DEMO MODE - using mock Supabase client')
    console.log('📧 Demo login: demo@example.com / any password')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return mockSupabase as any
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Set VITE_DEMO_MODE=true for demo mode.')
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  })
}

export const supabase = createSupabaseClient()
