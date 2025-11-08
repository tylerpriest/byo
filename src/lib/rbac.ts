import { supabase } from './supabase'
import { logger } from './logger'
import type { Database } from '@/types/database.types'

export type Role = 'Admin' | 'Moderator' | 'User' | 'Guest'
export type OrganizationRole = Database['public']['Enums']['organization_role']

export interface UserRole {
  role_id: string
  role_name: Role
}

export interface Permission {
  name: string
  resource: string
  action: string
}

export interface OrganizationPermission {
  organizationId: string
  role: OrganizationRole
}

// Cache for user permissions
const permissionsCache = new Map<string, Set<string>>()
const rolesCache = new Map<string, Set<Role>>()
const organizationRolesCache = new Map<string, Map<string, OrganizationRole>>()

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
  organizationRolesCache.delete(userId)
}

/**
 * Clear all caches
 */
export function clearAllCaches(): void {
  permissionsCache.clear()
  rolesCache.clear()
  organizationRolesCache.clear()
}

// ============================================================================
// Organization-Level RBAC
// ============================================================================

/**
 * Get user's role in a specific organization
 */
export async function getOrganizationRole(
  userId: string,
  organizationId: string
): Promise<OrganizationRole | null> {
  // Check cache first
  const userOrgCache = organizationRolesCache.get(userId)
  if (userOrgCache?.has(organizationId)) {
    return userOrgCache.get(organizationId)!
  }

  try {
    const { data, error } = await supabase
      .from('organization_members')
      .select('role')
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .single()

    if (error || !data) {
      logger.debug({ msg: 'User not member of organization', userId, organizationId })
      return null
    }

    // Update cache
    if (!organizationRolesCache.has(userId)) {
      organizationRolesCache.set(userId, new Map())
    }
    organizationRolesCache.get(userId)!.set(organizationId, data.role)

    return data.role
  } catch (error) {
    logger.error({ msg: 'Error getting organization role', error, userId, organizationId })
    return null
  }
}

/**
 * Get all organizations and roles for a user
 */
export async function getUserOrganizations(
  userId: string
): Promise<OrganizationPermission[]> {
  try {
    const { data, error } = await supabase
      .from('organization_members')
      .select('organization_id, role')
      .eq('user_id', userId)

    if (error) {
      logger.error({ msg: 'Error fetching user organizations', error, userId })
      return []
    }

    const orgs = data.map(d => ({
      organizationId: d.organization_id,
      role: d.role as OrganizationRole,
    }))

    // Update cache
    const orgMap = new Map<string, OrganizationRole>()
    orgs.forEach(o => orgMap.set(o.organizationId, o.role))
    organizationRolesCache.set(userId, orgMap)

    return orgs
  } catch (error) {
    logger.error({ msg: 'Error in getUserOrganizations', error, userId })
    return []
  }
}

/**
 * Check if user is a member of an organization
 */
export async function isOrganizationMember(
  userId: string,
  organizationId: string
): Promise<boolean> {
  const role = await getOrganizationRole(userId, organizationId)
  return role !== null
}

/**
 * Check if user has a specific organization role
 */
export async function hasOrganizationRole(
  userId: string,
  organizationId: string,
  role: OrganizationRole
): Promise<boolean> {
  const userRole = await getOrganizationRole(userId, organizationId)
  return userRole === role
}

/**
 * Check if user has any of the specified organization roles
 */
export async function hasAnyOrganizationRole(
  userId: string,
  organizationId: string,
  roles: OrganizationRole[]
): Promise<boolean> {
  const userRole = await getOrganizationRole(userId, organizationId)
  return userRole !== null && roles.includes(userRole)
}

/**
 * Check if user is owner of an organization
 */
export async function isOrganizationOwner(
  userId: string,
  organizationId: string
): Promise<boolean> {
  return hasOrganizationRole(userId, organizationId, 'owner')
}

/**
 * Check if user is admin or owner of an organization
 */
export async function isOrganizationAdmin(
  userId: string,
  organizationId: string
): Promise<boolean> {
  return hasAnyOrganizationRole(userId, organizationId, ['owner', 'admin'])
}

/**
 * Check if user can manage members (owner or admin)
 */
export async function canManageOrganizationMembers(
  userId: string,
  organizationId: string
): Promise<boolean> {
  return isOrganizationAdmin(userId, organizationId)
}

/**
 * Check if user can manage organization settings (owner or admin)
 */
export async function canManageOrganizationSettings(
  userId: string,
  organizationId: string
): Promise<boolean> {
  return isOrganizationAdmin(userId, organizationId)
}

/**
 * Check if user can delete organization (owner only)
 */
export async function canDeleteOrganization(
  userId: string,
  organizationId: string
): Promise<boolean> {
  return isOrganizationOwner(userId, organizationId)
}

/**
 * Get permission level for organization role
 * Returns a numeric level: owner=3, admin=2, member=1, viewer=0
 */
export function getOrganizationRoleLevel(role: OrganizationRole): number {
  const levels: Record<OrganizationRole, number> = {
    owner: 3,
    admin: 2,
    member: 1,
    viewer: 0,
  }
  return levels[role]
}

/**
 * Check if user has sufficient organization role level
 */
export async function hasOrganizationRoleLevel(
  userId: string,
  organizationId: string,
  minLevel: number
): Promise<boolean> {
  const role = await getOrganizationRole(userId, organizationId)
  if (!role) return false
  return getOrganizationRoleLevel(role) >= minLevel
}
