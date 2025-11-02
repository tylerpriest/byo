import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'
import { mockSupabase } from './supabase-mock'

const explicitDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Auto-detect demo mode: explicit flag OR missing credentials (graceful degradation)
const isDemoMode = explicitDemoMode || !supabaseUrl || !supabaseAnonKey

// Track whether we're in auto-fallback mode (for showing banners)
export const isAutoFallbackMode = !explicitDemoMode && (!supabaseUrl || !supabaseAnonKey)

// Create Supabase client with graceful degradation
const createSupabaseClient = () => {
  if (isDemoMode) {
    if (isAutoFallbackMode) {
      console.warn('⚠️ Supabase credentials not found - automatically falling back to DEMO MODE')
      console.log('🎭 Using mock Supabase client with demo data')
      console.log('📧 Demo login: demo@example.com / any password')
      console.log('💡 To use real Supabase, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
    } else {
      console.log('🎭 Running in DEMO MODE - using mock Supabase client')
      console.log('📧 Demo login: demo@example.com / any password')
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return mockSupabase as any
  }

  // Real Supabase client
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  })
}

export const supabase = createSupabaseClient()
