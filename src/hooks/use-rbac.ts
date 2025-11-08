import { useState, useEffect } from 'react'
import { useUser } from '@/features/auth/context/auth-context'
import {
  getUserRoles,
  getUserPermissions,
  hasRole as checkRole,
  hasPermission as checkPermission,
  hasAnyRole as checkAnyRole,
  hasAnyPermission as checkAnyPermission,
  type Role,
  type OrganizationRole,
  getOrganizationRole,
  getUserOrganizations,
  isOrganizationOwner,
  isOrganizationAdmin,
  canManageOrganizationMembers,
  canManageOrganizationSettings,
} from '@/lib/rbac'

export function useRoles() {
  const user = useUser()
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setRoles([])
      setLoading(false)
      return
    }

    getUserRoles(user.id)
      .then(setRoles)
      .finally(() => setLoading(false))
  }, [user])

  return { roles, loading }
}

export function usePermissions() {
  const user = useUser()
  const [permissions, setPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setPermissions([])
      setLoading(false)
      return
    }

    getUserPermissions(user.id)
      .then(setPermissions)
      .finally(() => setLoading(false))
  }, [user])

  return { permissions, loading }
}

export function useHasRole(role: Role) {
  const user = useUser()
  const [hasRole, setHasRole] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setHasRole(false)
      setLoading(false)
      return
    }

    checkRole(user.id, role)
      .then(setHasRole)
      .finally(() => setLoading(false))
  }, [user, role])

  return { hasRole, loading }
}

export function useHasPermission(permission: string) {
  const user = useUser()
  const [hasPermission, setHasPermission] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setHasPermission(false)
      setLoading(false)
      return
    }

    checkPermission(user.id, permission)
      .then(setHasPermission)
      .finally(() => setLoading(false))
  }, [user, permission])

  return { hasPermission, loading }
}

export function useHasAnyRole(roles: Role[]) {
  const user = useUser()
  const [hasAnyRole, setHasAnyRole] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setHasAnyRole(false)
      setLoading(false)
      return
    }

    checkAnyRole(user.id, roles)
      .then(setHasAnyRole)
      .finally(() => setLoading(false))
  }, [user, roles])

  return { hasAnyRole, loading }
}

export function useHasAnyPermission(permissions: string[]) {
  const user = useUser()
  const [hasAnyPermission, setHasAnyPermission] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setHasAnyPermission(false)
      setLoading(false)
      return
    }

    checkAnyPermission(user.id, permissions)
      .then(setHasAnyPermission)
      .finally(() => setLoading(false))
  }, [user, permissions])

  return { hasAnyPermission, loading }
}

// ============================================================================
// Organization-Level RBAC Hooks
// ============================================================================

export function useOrganizationRole(organizationId: string | undefined) {
  const user = useUser()
  const [role, setRole] = useState<OrganizationRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !organizationId) {
      setRole(null)
      setLoading(false)
      return
    }

    setLoading(true)
    getOrganizationRole(user.id, organizationId)
      .then(setRole)
      .finally(() => setLoading(false))
  }, [user, organizationId])

  return { role, loading }
}

export function useUserOrganizations() {
  const user = useUser()
  const [organizations, setOrganizations] = useState<Array<{ organizationId: string; role: OrganizationRole }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setOrganizations([])
      setLoading(false)
      return
    }

    getUserOrganizations(user.id)
      .then(setOrganizations)
      .finally(() => setLoading(false))
  }, [user])

  return { organizations, loading }
}

export function useIsOrganizationOwner(organizationId: string | undefined) {
  const user = useUser()
  const [isOwner, setIsOwner] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !organizationId) {
      setIsOwner(false)
      setLoading(false)
      return
    }

    setLoading(true)
    isOrganizationOwner(user.id, organizationId)
      .then(setIsOwner)
      .finally(() => setLoading(false))
  }, [user, organizationId])

  return { isOwner, loading }
}

export function useIsOrganizationAdmin(organizationId: string | undefined) {
  const user = useUser()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !organizationId) {
      setIsAdmin(false)
      setLoading(false)
      return
    }

    setLoading(true)
    isOrganizationAdmin(user.id, organizationId)
      .then(setIsAdmin)
      .finally(() => setLoading(false))
  }, [user, organizationId])

  return { isAdmin, loading }
}

export function useCanManageMembers(organizationId: string | undefined) {
  const user = useUser()
  const [canManage, setCanManage] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !organizationId) {
      setCanManage(false)
      setLoading(false)
      return
    }

    setLoading(true)
    canManageOrganizationMembers(user.id, organizationId)
      .then(setCanManage)
      .finally(() => setLoading(false))
  }, [user, organizationId])

  return { canManage, loading }
}

export function useCanManageSettings(organizationId: string | undefined) {
  const user = useUser()
  const [canManage, setCanManage] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !organizationId) {
      setCanManage(false)
      setLoading(false)
      return
    }

    setLoading(true)
    canManageOrganizationSettings(user.id, organizationId)
      .then(setCanManage)
      .finally(() => setLoading(false))
  }, [user, organizationId])

  return { canManage, loading }
}
