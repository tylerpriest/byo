import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/auth-context'
import { useEffect, useState } from 'react'
import { isPlatformAdmin } from '@/lib/platform-roles'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DemoModeToggle } from '../components/demo-mode-toggle'
import { UserManagementTable } from '../components/user-management-table'
import { PlatformStats } from '../components/platform-stats'

export function AdminDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    isPlatformAdmin(user.id).then((admin) => {
      setIsAdmin(admin)
      setLoading(false)
      if (!admin) {
        navigate('/dashboard')
      }
    })
  }, [user, navigate])

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  if (!isAdmin) return null

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Platform Administration</h1>
        <DemoModeToggle />
      </div>

      <PlatformStats />

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <UserManagementTable />
        </CardContent>
      </Card>
    </div>
  )
}
