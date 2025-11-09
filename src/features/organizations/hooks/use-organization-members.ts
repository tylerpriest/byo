import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import type { Database } from '@/types/database.types'

type OrganizationMember = Database['public']['Tables']['organization_members']['Row']

interface MemberWithProfile extends OrganizationMember {
  profile?: {
    display_name: string | null
    avatar_url: string | null
  }
}

export function useOrganizationMembers(organizationId: string | undefined) {
  const [members, setMembers] = useState<MemberWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchMembers = async () => {
    if (!organizationId) {
      setMembers([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('organization_members')
        .select(`
          *,
          profile:profiles(display_name, avatar_url)
        `)
        .eq('organization_id', organizationId)
        .order('joined_at', { ascending: false })

      if (fetchError) throw fetchError

      setMembers(data || [])
      logger.info({ msg: 'Organization members fetched', count: (data || []).length })
    } catch (err) {
      logger.error({ msg: 'Error fetching organization members', error: err })
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [organizationId])

  return {
    members,
    loading,
    error,
    refetch: fetchMembers,
  }
}
