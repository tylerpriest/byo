import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function PlatformStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalOrganizations: 0,
    totalRevenue: 0,
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    // Get total users
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    // Get active users (logged in last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { count: activeUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('last_login_at', sevenDaysAgo)

    // Get total organizations
    const { count: totalOrganizations } = await supabase
      .from('organizations')
      .select('*', { count: 'exact', head: true })

    setStats({
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      totalOrganizations: totalOrganizations || 0,
      totalRevenue: 0, // Future: integrate with billing
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Active Users (7d)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeUsers}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Organizations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalOrganizations}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            MRR
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats.totalRevenue}</div>
          <p className="text-xs text-muted-foreground">Future</p>
        </CardContent>
      </Card>
    </div>
  )
}
