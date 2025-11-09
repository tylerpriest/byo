import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface User {
  id: string
  email: string
  display_name: string
  roles: string[]
  created_at: string
}

export function UserManagementTable() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    // Get all profiles with their roles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name, created_at')
      .limit(50)

    if (!profiles) {
      setLoading(false)
      return
    }

    // Get auth data for each profile
    const usersWithRoles = await Promise.all(
      profiles.map(async (profile: { id: string; display_name: string | null; created_at: string }) => {
        // Get email from auth.users (via RPC or admin API if available)
        // For now, we'll just use a placeholder
        const email = `user-${profile.id.substring(0, 8)}@example.com`

        // Get roles
        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('roles(name)')
          .eq('user_id', profile.id)

        const roles = userRoles?.map((ur: any) => ur.roles?.name).filter(Boolean) || []

        return {
          id: profile.id,
          email,
          display_name: profile.display_name || 'Unknown',
          roles,
          created_at: profile.created_at,
        }
      })
    )

    setUsers(usersWithRoles)
    setLoading(false)
  }

  if (loading) return <div>Loading users...</div>

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Roles</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.display_name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <div className="flex gap-1">
                {user.roles.map((role) => (
                  <Badge key={role} variant="secondary">
                    {role}
                  </Badge>
                ))}
              </div>
            </TableCell>
            <TableCell>
              {new Date(user.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <Button variant="ghost" size="sm">
                View
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
