import { supabase } from './supabase'

/**
 * Platform Roles vs Application Roles
 *
 * Platform Roles (system_roles table):
 * - platform_admin: You/co-founders (full access to everything)
 * - platform_dev: Developers (read-only debugging access)
 * - platform_support: Support team (help tutors/users)
 *
 * Application Roles (roles/user_roles tables):
 * - Admin, Moderator, User, Guest (customer-facing roles)
 *
 * Platform roles are separate and override application permissions.
 */

export type PlatformRole = 'platform_admin' | 'platform_dev' | 'platform_support'

export async function isPlatformAdmin(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('system_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'platform_admin')
    .single()

  return !!data
}

export async function isPlatformDev(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('system_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'platform_dev')
    .single()

  return !!data
}

export async function isPlatformSupport(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('system_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'platform_support')
    .single()

  return !!data
}

export async function hasPlatformRole(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('system_roles')
    .select('role')
    .eq('user_id', userId)

  return (data?.length ?? 0) > 0
}

export async function getPlatformRoles(userId: string): Promise<PlatformRole[]> {
  const { data } = await supabase
    .from('system_roles')
    .select('role')
    .eq('user_id', userId)

  return (data?.map(r => r.role as PlatformRole) ?? [])
}

export async function assignPlatformRole(userId: string, role: PlatformRole, assignedBy: string): Promise<void> {
  const { error } = await supabase
    .from('system_roles')
    .insert({
      user_id: userId,
      role,
    })

  if (error) throw error
}

export async function revokePlatformRole(userId: string, role: PlatformRole): Promise<void> {
  const { error } = await supabase
    .from('system_roles')
    .delete()
    .eq('user_id', userId)
    .eq('role', role)

  if (error) throw error
}
