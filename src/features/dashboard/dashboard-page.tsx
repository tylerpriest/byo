import { useAuth } from '@/features/auth/context/auth-context'
import { useRoles, usePermissions } from '@/hooks/use-rbac'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import DashboardLayout from './components/dashboard-layout'

export default function DashboardPage() {
  const { user } = useAuth()
  const { roles, loading: rolesLoading } = useRoles()
  const { permissions, loading: permissionsLoading } = usePermissions()

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        {/* Welcome Card */}
        <Card>
          <CardHeader>
            <CardTitle>Welcome back!</CardTitle>
            <CardDescription>
              Here's what's happening with your account today.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Email:</span> {user?.email}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Roles:</span>
                {rolesLoading ? (
                  <span className="text-sm text-muted-foreground">Loading...</span>
                ) : (
                  <div className="flex gap-1">
                    {roles.map((role) => (
                      <Badge key={role} variant="secondary">
                        {role}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {permissionsLoading ? '...' : permissions.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Active permissions assigned to your roles
              </p>
            </CardContent>
          </Card>

          {/* Example placeholder cards */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Example Metric</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                Replace with your own metrics
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Another Metric</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45</div>
              <p className="text-xs text-muted-foreground">
                Customize this dashboard to your needs
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Example: Role-based content */}
        {roles.includes('Admin') && (
          <Card>
            <CardHeader>
              <CardTitle>Admin Section</CardTitle>
              <CardDescription>
                This section is only visible to administrators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Add admin-specific content, user management, analytics, etc.
              </p>
            </CardContent>
          </Card>
        )}

        {(roles.includes('Admin') || roles.includes('Moderator')) && (
          <Card>
            <CardHeader>
              <CardTitle>Moderation Tools</CardTitle>
              <CardDescription>
                Available to Admins and Moderators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Add moderation features, content management, etc.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Example: Permission-based content */}
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              This is your blank canvas dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">
              This dashboard is ready for you to customize with your own features:
            </p>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>Add widgets and charts using Recharts</li>
              <li>Create data tables with TanStack Table</li>
              <li>Implement role-based sections</li>
              <li>Connect to your business logic</li>
              <li>Add real-time features with Supabase Realtime</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
