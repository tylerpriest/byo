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
