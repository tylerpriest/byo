import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export function WhatsNewBanner() {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-b">
      <div className="container py-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Badge variant="default" className="text-sm">
              🎉 New in V3
            </Badge>
            <h2 className="text-2xl font-bold">What's New</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🔧</span>
                Phase 13: Admin Dashboard
              </CardTitle>
              <CardDescription>Platform administration interface</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>User management table with roles</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Platform statistics (users, activity, orgs)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Demo mode toggle (system-wide control)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Platform admin role (god mode access)</span>
                </li>
              </ul>
              <Link to="/admin">
                <Button variant="outline" size="sm" className="mt-4 w-full">
                  View Admin Dashboard →
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🏢</span>
                Phase 14: Multi-Tenant Organizations
              </CardTitle>
              <CardDescription>B2B2C tutoring platform ready</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Organizations (tutor workspaces)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Email invitations with magic links</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Organization members (tutors, assistants, students)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Row-level multi-tenancy (Type 1)</span>
                </li>
              </ul>
              <Link to="/accept-invite?token=demo-token-abc123">
                <Button variant="outline" size="sm" className="mt-4 w-full">
                  Try Demo Invitation →
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 p-4 bg-white dark:bg-gray-900 rounded-lg border">
          <div className="flex items-start gap-3">
            <div className="text-2xl">📊</div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Architecture Highlights</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium text-foreground">Multi-Tenancy:</span> Row-Level (Type 1) - $25-45/mo for 100+ tutors
                </div>
                <div>
                  <span className="font-medium text-foreground">Deployment:</span> Single-Instance - 97.6% profit margin at scale
                </div>
                <div>
                  <span className="font-medium text-foreground">Security:</span> Complete RLS policies with platform admin override
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            🎯 Demo Mode Active - All features are fully functional with mock data
          </p>
        </div>
      </div>
    </div>
  )
}
