import { Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/auth-context'
import { useState, useEffect, type ReactNode } from 'react'
import { isPlatformAdmin } from '@/lib/platform-roles'

export function AdminGuard({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

  useEffect(() => {
    if (!user) {
      setIsAdmin(false)
      return
    }

    isPlatformAdmin(user.id).then(setIsAdmin)
  }, [user])

  if (isAdmin === null) return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  if (!isAdmin) return <Navigate to="/dashboard" replace />

  return <>{children}</>
}
