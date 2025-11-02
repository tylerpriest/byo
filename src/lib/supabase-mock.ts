/**
 * Mock Supabase client for demo/guest mode
 *
 * This allows the app to run without a real Supabase connection.
 * Perfect for demos, testing, or quick previews.
 *
 * To enable demo mode, set:
 * VITE_DEMO_MODE=true
 */

import type { User, Session, AuthError } from '@supabase/supabase-js'

// Demo user data
const DEMO_USER: User = {
  id: 'demo-user-123',
  email: 'demo@example.com',
  aud: 'authenticated',
  role: 'authenticated',
  created_at: '2024-01-01T00:00:00Z',
  app_metadata: {},
  user_metadata: {
    display_name: 'Demo User',
  },
  updated_at: '2024-01-01T00:00:00Z',
}

const DEMO_SESSION: Session = {
  access_token: 'demo-access-token',
  refresh_token: 'demo-refresh-token',
  expires_in: 3600,
  expires_at: Date.now() / 1000 + 3600,
  token_type: 'bearer',
  user: DEMO_USER,
}

// Mock profiles table data
const DEMO_PROFILES = new Map([
  [
    'demo-user-123',
    {
      id: 'demo-user-123',
      display_name: 'Demo User',
      avatar_url: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ],
])

// Mock roles
const DEMO_ROLES = [
  { id: 'role-1', name: 'Admin', description: 'Full system access' },
  { id: 'role-2', name: 'Moderator', description: 'Content moderation' },
  { id: 'role-3', name: 'User', description: 'Standard user' },
  { id: 'role-4', name: 'Guest', description: 'Limited access' },
]

// Mock user roles
const DEMO_USER_ROLES = new Map([
  ['demo-user-123', ['role-3']], // Demo user has "User" role
])

// Mock permissions
const DEMO_PERMISSIONS = new Map([
  ['role-1', ['users.read', 'users.write', 'users.delete', 'roles.manage', 'settings.manage']],
  ['role-2', ['users.read', 'users.write', 'content.moderate']],
  ['role-3', ['users.read', 'profile.edit']],
  ['role-4', ['users.read']],
])

/**
 * Mock Supabase client that mimics the real Supabase client API
 */
export const createMockSupabaseClient = () => {
  let currentSession: Session | null = null
  let authListeners: Array<(event: string, session: Session | null) => void> = []

  return {
    auth: {
      // Get current session
      getSession: async () => {
        return {
          data: { session: currentSession },
          error: null,
        }
      },

      // Get current user
      getUser: async () => {
        return {
          data: { user: currentSession?.user || null },
          error: null,
        }
      },

      // Sign in with email/password
      signInWithPassword: async (_credentials: { email: string; password: string }) => {
        // Always succeed in demo mode
        currentSession = DEMO_SESSION

        // Trigger auth state change
        authListeners.forEach(listener => listener('SIGNED_IN', currentSession))

        return {
          data: {
            user: DEMO_USER,
            session: DEMO_SESSION,
          },
          error: null,
        }
      },

      // Sign up
      signUp: async (_credentials: { email: string; password: string }) => {
        // Always succeed in demo mode
        currentSession = DEMO_SESSION

        // Trigger auth state change
        authListeners.forEach(listener => listener('SIGNED_IN', currentSession))

        return {
          data: {
            user: DEMO_USER,
            session: DEMO_SESSION,
          },
          error: null,
        }
      },

      // Sign out
      signOut: async () => {
        currentSession = null

        // Trigger auth state change
        authListeners.forEach(listener => listener('SIGNED_OUT', null))

        return {
          error: null,
        }
      },

      // Auth state change listener
      onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
        authListeners.push(callback)

        // Immediately call with current session
        callback('INITIAL_SESSION', currentSession)

        return {
          data: {
            subscription: {
              unsubscribe: () => {
                authListeners = authListeners.filter(l => l !== callback)
              },
            },
          },
        }
      },
    },

    // Mock database operations
    from: (table: string) => {
      const queryBuilder = {
        // SELECT
        select: (_columns = '*') => {
          return {
            ...queryBuilder,
            eq: (column: string, value: unknown) => {
              return {
                ...queryBuilder,
                single: async () => {
                  if (table === 'profiles' && column === 'id') {
                    const profile = DEMO_PROFILES.get(value as string)
                    return profile
                      ? { data: profile, error: null }
                      : { data: null, error: { message: 'Profile not found' } as AuthError }
                  }
                  return { data: null, error: null }
                },
                // Return array for non-single queries
                then: async (resolve: (value: unknown) => void) => {
                  if (table === 'user_roles' && column === 'user_id') {
                    const roleIds = DEMO_USER_ROLES.get(value as string) || []
                    const roles = DEMO_ROLES.filter(r => roleIds.includes(r.id))
                    resolve({
                      data: roles.map(r => ({ role_id: r.id, roles: r })),
                      error: null,
                    })
                  } else if (table === 'role_permissions' && column === 'role_id') {
                    const permissions = DEMO_PERMISSIONS.get(value as string) || []
                    resolve({
                      data: permissions.map(p => ({ permission: p })),
                      error: null,
                    })
                  } else {
                    resolve({ data: [], error: null })
                  }
                },
              }
            },
            in: (_column: string, values: unknown[]) => {
              return {
                then: async (resolve: (value: unknown) => void) => {
                  if (table === 'role_permissions') {
                    const allPermissions = new Set<string>()
                    values.forEach(roleId => {
                      const perms = DEMO_PERMISSIONS.get(roleId as string) || []
                      perms.forEach(p => allPermissions.add(p))
                    })
                    resolve({
                      data: Array.from(allPermissions).map(p => ({ permission: p })),
                      error: null,
                    })
                  } else {
                    resolve({ data: [], error: null })
                  }
                },
              }
            },
          }
        },

        // UPDATE
        update: (updates: Record<string, unknown>) => {
          return {
            eq: (column: string, value: unknown) => {
              return {
                then: async (resolve: (value: unknown) => void) => {
                  if (table === 'profiles' && column === 'id') {
                    const profile = DEMO_PROFILES.get(value as string)
                    if (profile) {
                      const updated = { ...profile, ...updates, updated_at: new Date().toISOString() }
                      DEMO_PROFILES.set(value as string, updated)
                      resolve({ data: updated, error: null })
                    } else {
                      resolve({ data: null, error: { message: 'Profile not found' } as AuthError })
                    }
                  } else {
                    resolve({ data: null, error: null })
                  }
                },
              }
            },
          }
        },

        // INSERT
        insert: (data: unknown) => {
          return {
            then: async (resolve: (value: unknown) => void) => {
              // In demo mode, just return success
              resolve({ data, error: null })
            },
          }
        },

        // DELETE
        delete: () => {
          return {
            eq: (_column: string, _value: unknown) => {
              return {
                then: async (resolve: (value: unknown) => void) => {
                  // In demo mode, just return success
                  resolve({ data: null, error: null })
                },
              }
            },
          }
        },
      }

      return queryBuilder
    },
  }
}

// Export singleton instance
export const mockSupabase = createMockSupabaseClient()
