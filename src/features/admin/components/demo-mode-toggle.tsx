import { useState, useEffect } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/context/auth-context'

export function DemoModeToggle() {
  const { user } = useAuth()
  const [demoMode, setDemoMode] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get current demo mode status from system settings
    supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'demo_mode')
      .single()
      .then(({ data }) => {
        setDemoMode(data?.value === 'true')
        setLoading(false)
      })
  }, [])

  const toggleDemoMode = async (enabled: boolean) => {
    setDemoMode(enabled)

    // Update system setting
    await supabase
      .from('system_settings')
      .upsert({
        key: 'demo_mode',
        value: String(enabled),
        updated_by: user?.id,
        updated_at: new Date().toISOString()
      })
  }

  if (loading) return null

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="demo-mode"
        checked={demoMode}
        onCheckedChange={toggleDemoMode}
      />
      <Label htmlFor="demo-mode">
        Demo Mode {demoMode ? '(Active)' : '(Inactive)'}
      </Label>
    </div>
  )
}
