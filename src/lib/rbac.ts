import { supabase } from './supabase'
import { logger } from './logger'

export type Role = 'Admin' | 'Moderator' | 'User' | 'Guest'

export interface UserRole {
  role_id: string
  role_name: Role
}

export interface Permission {
  name: string
  resource: string
  action: string
}

// Cache for user permissions
const permissionsCache = new Map<string, Set<string>>()
const rolesCache = new Map<string, Set<Role>>()

/**
 * Get user's roles
 */
export async function getUserRoles(userId: string): Promise<Role[]> {
  // Check cache first
  if (rolesCache.has(userId)) {
    return Array.from(rolesCache.get(userId)!)
  }

  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role_id, roles(name)')
      .eq('user_id', userId)

    if (error) {
      logger.error({ msg: 'Error fetching user roles', error, userId })
      return []
    }

    const roles = data
      .map((ur: any) => ur.roles?.name as Role)
      .filter(Boolean)

    // Update cache
    rolesCache.set(userId, new Set(roles))

    return roles
  } catch (error) {
    logger.error({ msg: 'Error in getUserRoles', error, userId })
    return []
  }
}

/**
 * Get user's permissions
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  // Check cache first
  if (permissionsCache.has(userId)) {
    return Array.from(permissionsCache.get(userId)!)
  }

  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role_id, roles(role_permissions(permissions(name)))')
      .eq('user_id', userId)

    if (error) {
      logger.error({ msg: 'Error fetching user permissions', error, userId })
      return []
    }

    const permissions = new Set<string>()

    data.forEach((ur: any) => {
      ur.roles?.role_permissions?.forEach((rp: any) => {
        if (rp.permissions?.name) {
          permissions.add(rp.permissions.name)
        }
      })
    })

    // Update cache
    permissionsCache.set(userId, permissions)

    return Array.from(permissions)
  } catch (error) {
    logger.error({ msg: 'Error in getUserPermissions', error, userId })
    return []
  }
}

/**
 * Check if user has a specific role
 */
export async function hasRole(userId: string, role: Role): Promise<boolean> {
  const roles = await getUserRoles(userId)
  return roles.includes(role)
}

/**
 * Check if user has any of the specified roles
 */
export async function hasAnyRole(userId: string, roles: Role[]): Promise<boolean> {
  const userRoles = await getUserRoles(userId)
  return roles.some((role) => userRoles.includes(role))
}

/**
 * Check if user has a specific permission
 */
export async function hasPermission(userId: string, permission: string): Promise<boolean> {
  const permissions = await getUserPermissions(userId)
  return permissions.includes(permission)
}

/**
 * Check if user has any of the specified permissions
 */
export async function hasAnyPermission(
  userId: string,
  permissions: string[]
): Promise<boolean> {
  const userPermissions = await getUserPermissions(userId)
  return permissions.some((permission) => userPermissions.includes(permission))
}

/**
 * Check if user has all of the specified permissions
 */
export async function hasAllPermissions(
  userId: string,
  permissions: string[]
): Promise<boolean> {
  const userPermissions = await getUserPermissions(userId)
  return permissions.every((permission) => userPermissions.includes(permission))
}

/**
 * Clear the permissions cache for a user
 */
export function clearUserCache(userId: string): void {
  permissionsCache.delete(userId)
  rolesCache.delete(userId)
}

/**
 * Clear all caches
 */
export function clearAllCaches(): void {
  permissionsCache.clear()
  rolesCache.clear()
}
