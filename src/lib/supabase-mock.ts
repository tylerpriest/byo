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
const DEMO_PROFILES = new Map<string, {
  id: string
  display_name: string
  avatar_url: string | null
  created_at: string
  updated_at: string
  last_login_at?: string
}>([
  [
    'demo-user-123',
    {
      id: 'demo-user-123',
      display_name: 'Demo User',
      avatar_url: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      last_login_at: new Date().toISOString(),
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
  ['demo-user-123', ['role-1']], // Demo user has "Admin" role for testing
])

// Mock permissions
const DEMO_PERMISSIONS = new Map([
  ['role-1', ['users.read', 'users.write', 'users.delete', 'roles.manage', 'settings.manage']],
  ['role-2', ['users.read', 'users.write', 'content.moderate']],
  ['role-3', ['users.read', 'profile.edit']],
  ['role-4', ['users.read']],
])

// Mock system roles (Platform Admin/Dev/Support)
const DEMO_SYSTEM_ROLES = new Map([
  ['demo-user-123', ['platform_admin']], // Demo user is platform admin
])

// Mock organizations
const DEMO_ORGANIZATIONS = [
  {
    id: 'org-1',
    name: "Demo Tutor's Workspace",
    slug: 'demo-tutor',
    description: 'A demo tutoring workspace',
    avatar_url: null,
    tutor_id: 'demo-user-123',
    plan: 'pro',
    max_students: 50,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'org-2',
    name: 'Math Academy',
    slug: 'math-academy',
    description: 'Advanced mathematics tutoring',
    avatar_url: null,
    tutor_id: 'tutor-2',
    plan: 'free',
    max_students: 10,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
]

// Mock organization members
const DEMO_ORGANIZATION_MEMBERS = [
  {
    id: 'member-1',
    organization_id: 'org-1',
    user_id: 'demo-user-123',
    role: 'tutor',
    invited_by: 'demo-user-123',
    joined_at: '2024-01-01T00:00:00Z',
    last_active_at: new Date().toISOString(),
  },
  {
    id: 'member-2',
    organization_id: 'org-1',
    user_id: 'student-1',
    role: 'student',
    invited_by: 'demo-user-123',
    joined_at: '2024-01-05T00:00:00Z',
    last_active_at: '2024-01-08T00:00:00Z',
  },
  {
    id: 'member-3',
    organization_id: 'org-1',
    user_id: 'student-2',
    role: 'student',
    invited_by: 'demo-user-123',
    joined_at: '2024-01-06T00:00:00Z',
    last_active_at: new Date().toISOString(),
  },
]

// Mock invitations
const DEMO_INVITATIONS: Array<{
  id: string
  organization_id: string
  email: string
  role: string
  token: string
  invited_by: string
  expires_at: string
  accepted_at: string | null
  created_at: string
  [key: string]: any
}> = [
  {
    id: 'invite-1',
    organization_id: 'org-1',
    email: 'newstudent@example.com',
    role: 'student',
    token: 'demo-token-abc123',
    invited_by: 'demo-user-123',
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    accepted_at: null,
    created_at: new Date().toISOString(),
  },
]

// Mock system settings
const DEMO_SYSTEM_SETTINGS = new Map([
  ['demo_mode', { key: 'demo_mode', value: 'true', updated_by: 'demo-user-123', updated_at: new Date().toISOString() }],
])

// Mock additional profiles for testing
DEMO_PROFILES.set('student-1', {
  id: 'student-1',
  display_name: 'Alice Student',
  avatar_url: null,
  created_at: '2024-01-05T00:00:00Z',
  updated_at: '2024-01-05T00:00:00Z',
  last_login_at: '2024-01-08T00:00:00Z',
})

DEMO_PROFILES.set('student-2', {
  id: 'student-2',
  display_name: 'Bob Student',
  avatar_url: null,
  created_at: '2024-01-06T00:00:00Z',
  updated_at: '2024-01-06T00:00:00Z',
  last_login_at: new Date().toISOString(),
})

DEMO_PROFILES.set('tutor-2', {
  id: 'tutor-2',
  display_name: 'Jane Math Teacher',
  avatar_url: null,
  created_at: '2024-01-02T00:00:00Z',
  updated_at: '2024-01-02T00:00:00Z',
  last_login_at: '2024-01-03T00:00:00Z',
})

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
      const queryBuilder: any = {
        // SELECT
        select: (_columns = '*', options?: { count?: string; head?: boolean }) => {
          // Handle count queries
          if (options?.count === 'exact' && options?.head) {
            return {
              gte: (column: string, value: string) => ({
                then: async (resolve: (value: unknown) => void) => {
                  if (table === 'profiles' && column === 'last_login_at') {
                    const count = Array.from(DEMO_PROFILES.values()).filter(
                      p => p.last_login_at && p.last_login_at >= value
                    ).length
                    resolve({ count, error: null })
                  } else {
                    resolve({ count: 0, error: null })
                  }
                },
              }),
              then: async (resolve: (value: unknown) => void) => {
                let count = 0
                if (table === 'profiles') count = DEMO_PROFILES.size
                else if (table === 'organizations') count = DEMO_ORGANIZATIONS.length
                else if (table === 'organization_members') count = DEMO_ORGANIZATION_MEMBERS.length
                resolve({ count, error: null })
              },
            }
          }

          return {
            ...queryBuilder,
            limit: (n: number) => {
              return {
                then: async (resolve: (value: unknown) => void) => {
                  if (table === 'profiles') {
                    const profiles = Array.from(DEMO_PROFILES.values()).slice(0, n)
                    resolve({ data: profiles, error: null })
                  } else {
                    resolve({ data: [], error: null })
                  }
                },
              }
            },
            order: (_column: string, _options?: { ascending: boolean }) => {
              return {
                then: async (resolve: (value: unknown) => void) => {
                  if (table === 'invitations') {
                    resolve({ data: DEMO_INVITATIONS, error: null })
                  } else {
                    resolve({ data: [], error: null })
                  }
                },
              }
            },
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
                  if (table === 'system_roles' && column === 'user_id') {
                    const roles = DEMO_SYSTEM_ROLES.get(value as string) || []
                    return roles.length > 0
                      ? { data: { role: roles[0] }, error: null }
                      : { data: null, error: null }
                  }
                  if (table === 'system_settings' && column === 'key') {
                    const setting = DEMO_SYSTEM_SETTINGS.get(value as string)
                    return setting
                      ? { data: setting, error: null }
                      : { data: null, error: null }
                  }
                  return { data: null, error: null }
                },
                eq: (column2: string, value2: unknown) => {
                  return {
                    single: async () => {
                      if (table === 'system_roles' && column === 'user_id' && column2 === 'role') {
                        const roles = DEMO_SYSTEM_ROLES.get(value as string) || []
                        return roles.includes(value2 as string)
                          ? { data: { role: value2 }, error: null }
                          : { data: null, error: null }
                      }
                      if (table === 'invitations' && column === 'token') {
                        const invitation = DEMO_INVITATIONS.find(i => i.token === value)
                        return invitation && invitation.role === value2
                          ? { data: invitation, error: null }
                          : { data: null, error: null }
                      }
                      return { data: null, error: null }
                    },
                  }
                },
                is: (_column2: string, value2: unknown) => {
                  return {
                    gte: (_column3: string, value3: string) => ({
                      single: async () => {
                        if (table === 'invitations' && column === 'token') {
                          const invitation = DEMO_INVITATIONS.find(i => i.token === value)
                          if (invitation && invitation.accepted_at === value2 && invitation.expires_at >= value3) {
                            return { data: { ...invitation, organizations: DEMO_ORGANIZATIONS[0] }, error: null }
                          }
                        }
                        return { data: null, error: null }
                      },
                    }),
                  }
                },
                gte: (_column2: string, value2: string) => ({
                  then: async (resolve: (value: unknown) => void) => {
                    if (table === 'invitations') {
                      const filtered = DEMO_INVITATIONS.filter(i => i.organization_id === value && i.expires_at >= value2)
                      resolve({ data: filtered, error: null })
                    } else {
                      resolve({ data: [], error: null })
                    }
                  },
                }),
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
                  } else if (table === 'system_roles' && column === 'user_id') {
                    const roles = DEMO_SYSTEM_ROLES.get(value as string) || []
                    resolve({
                      data: roles.map(role => ({ role })),
                      error: null,
                    })
                  } else if (table === 'organization_members' && column === 'user_id') {
                    const members = DEMO_ORGANIZATION_MEMBERS.filter(m => m.user_id === value)
                    const withOrgs = members.map(m => {
                      const org = DEMO_ORGANIZATIONS.find(o => o.id === m.organization_id)
                      return {
                        ...m,
                        organizations: org,
                      }
                    })
                    resolve({ data: withOrgs, error: null })
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
                  } else if (table === 'invitations' && column === 'token') {
                    const invitation = DEMO_INVITATIONS.find(i => i.token === value)
                    if (invitation) {
                      Object.assign(invitation, updates)
                      resolve({ data: invitation, error: null })
                    } else {
                      resolve({ data: null, error: null })
                    }
                  } else {
                    resolve({ data: null, error: null })
                  }
                },
              }
            },
          }
        },

        // UPSERT
        upsert: (data: Record<string, unknown>) => {
          return {
            then: async (resolve: (value: unknown) => void) => {
              if (table === 'system_settings') {
                DEMO_SYSTEM_SETTINGS.set(data.key as string, {
                  key: data.key as string,
                  value: data.value as string,
                  updated_by: data.updated_by as string,
                  updated_at: new Date().toISOString(),
                })
                resolve({ data, error: null })
              } else {
                resolve({ data, error: null })
              }
            },
          }
        },

        // INSERT
        insert: (data: unknown) => {
          return {
            select: () => ({
              single: async () => {
                // Generate mock response with token
                if (table === 'invitations') {
                  const newInvite = {
                    id: `invite-${Date.now()}`,
                    ...(data as Record<string, unknown>),
                    token: `demo-token-${Math.random().toString(36).substr(2, 9)}`,
                    created_at: new Date().toISOString(),
                  } as any
                  DEMO_INVITATIONS.push(newInvite)
                  return { data: newInvite, error: null }
                }
                return { data, error: null }
              },
            }),
            then: async (resolve: (value: unknown) => void) => {
              // In demo mode, just return success
              if (table === 'organization_members') {
                DEMO_ORGANIZATION_MEMBERS.push(data as any)
              }
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
