import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import { useAuth } from '@/features/auth/context/auth-context'
import type { Database } from '@/types/database.types'

type Organization = Database['public']['Tables']['organizations']['Row']
type OrganizationMember = Database['public']['Tables']['organization_members']['Row']
type OrganizationInvitation = Database['public']['Tables']['organization_invitations']['Row']
type OrganizationRole = Database['public']['Enums']['organization_role']

interface OrganizationWithMembership extends Organization {
  membership?: OrganizationMember
}

interface OrganizationContextType {
  // Current state
  currentOrganization: OrganizationWithMembership | null
  organizations: OrganizationWithMembership[]
  loading: boolean

  // Actions
  switchOrganization: (organizationId: string) => Promise<void>
  createOrganization: (name: string, slug: string) => Promise<{ data: Organization | null; error: Error | null }>
  updateOrganization: (organizationId: string, updates: Partial<Organization>) => Promise<{ error: Error | null }>
  deleteOrganization: (organizationId: string) => Promise<{ error: Error | null }>

  // Member management
  inviteMember: (email: string, role: OrganizationRole) => Promise<{ error: Error | null }>
  updateMemberRole: (memberId: string, role: OrganizationRole) => Promise<{ error: Error | null }>
  removeMember: (memberId: string) => Promise<{ error: Error | null }>
  leaveOrganization: (organizationId: string) => Promise<{ error: Error | null }>

  // Utilities
  refetchOrganizations: () => Promise<void>
  isOwner: (organizationId?: string) => boolean
  isAdmin: (organizationId?: string) => boolean
  canManageMembers: (organizationId?: string) => boolean
  canManageSettings: (organizationId?: string) => boolean
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined)

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [currentOrganization, setCurrentOrganization] = useState<OrganizationWithMembership | null>(null)
  const [organizations, setOrganizations] = useState<OrganizationWithMembership[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch user's organizations with membership info
  const fetchOrganizations = useCallback(async () => {
    if (!user) {
      setOrganizations([])
      setCurrentOrganization(null)
      setLoading(false)
      return
    }

    try {
      // Fetch organizations where user is a member
      const { data: memberships, error: membershipsError } = await supabase
        .from('organization_members')
        .select(`
          *,
          organization:organizations(*)
        `)
        .eq('user_id', user.id)

      if (membershipsError) throw membershipsError

      // Transform data to include membership info
      const orgsWithMembership: OrganizationWithMembership[] = (memberships || [])
        .filter(m => m.organization)
        .map(m => ({
          ...(m.organization as Organization),
          membership: {
            id: m.id,
            organization_id: m.organization_id,
            user_id: m.user_id,
            role: m.role,
            custom_permissions: m.custom_permissions,
            joined_at: m.joined_at,
            invited_by: m.invited_by,
            invitation_accepted_at: m.invitation_accepted_at,
          }
        }))

      setOrganizations(orgsWithMembership)

      // Get user's current organization from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('current_organization_id')
        .eq('id', user.id)
        .single()

      if (profile?.current_organization_id) {
        const currentOrg = orgsWithMembership.find(o => o.id === profile.current_organization_id)
        setCurrentOrganization(currentOrg || orgsWithMembership[0] || null)
      } else {
        setCurrentOrganization(orgsWithMembership[0] || null)
      }

      logger.info({ msg: 'Organizations fetched', count: orgsWithMembership.length })
    } catch (error) {
      logger.error({ msg: 'Error fetching organizations', error })
    } finally {
      setLoading(false)
    }
  }, [user])

  // Initialize and listen for changes
  useEffect(() => {
    fetchOrganizations()
  }, [fetchOrganizations])

  // Switch to a different organization
  const switchOrganization = async (organizationId: string) => {
    if (!user) return

    const org = organizations.find(o => o.id === organizationId)
    if (!org) {
      logger.error({ msg: 'Organization not found', organizationId })
      return
    }

    // Update current organization in state
    setCurrentOrganization(org)

    // Update profile with current organization
    const { error } = await supabase
      .from('profiles')
      .update({ current_organization_id: organizationId })
      .eq('id', user.id)

    if (error) {
      logger.error({ msg: 'Error switching organization', error })
    } else {
      logger.info({ msg: 'Switched organization', organizationId })
    }
  }

  // Create a new organization
  const createOrganization = async (name: string, slug: string) => {
    if (!user) return { data: null, error: new Error('User not authenticated') }

    try {
      // Create organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name,
          slug,
          created_by: user.id,
        })
        .select()
        .single()

      if (orgError) throw orgError

      // Add user as owner
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: org.id,
          user_id: user.id,
          role: 'owner',
          invited_by: user.id,
          invitation_accepted_at: new Date().toISOString(),
        })

      if (memberError) throw memberError

      logger.info({ msg: 'Organization created', organizationId: org.id })

      // Refetch organizations to include the new one
      await fetchOrganizations()

      return { data: org, error: null }
    } catch (error) {
      logger.error({ msg: 'Error creating organization', error })
      return { data: null, error: error as Error }
    }
  }

  // Update organization details
  const updateOrganization = async (organizationId: string, updates: Partial<Organization>) => {
    try {
      const { error } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', organizationId)

      if (error) throw error

      logger.info({ msg: 'Organization updated', organizationId })
      await fetchOrganizations()

      return { error: null }
    } catch (error) {
      logger.error({ msg: 'Error updating organization', error })
      return { error: error as Error }
    }
  }

  // Delete organization (owner only)
  const deleteOrganization = async (organizationId: string) => {
    try {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', organizationId)

      if (error) throw error

      logger.info({ msg: 'Organization deleted', organizationId })
      await fetchOrganizations()

      return { error: null }
    } catch (error) {
      logger.error({ msg: 'Error deleting organization', error })
      return { error: error as Error }
    }
  }

  // Invite member
  const inviteMember = async (email: string, role: OrganizationRole) => {
    if (!currentOrganization || !user) {
      return { error: new Error('No current organization or user') }
    }

    try {
      const { error } = await supabase
        .from('organization_invitations')
        .insert({
          organization_id: currentOrganization.id,
          email,
          role,
          invited_by: user.id,
        })

      if (error) throw error

      logger.info({ msg: 'Member invited', email, organizationId: currentOrganization.id })

      return { error: null }
    } catch (error) {
      logger.error({ msg: 'Error inviting member', error })
      return { error: error as Error }
    }
  }

  // Update member role
  const updateMemberRole = async (memberId: string, role: OrganizationRole) => {
    try {
      const { error } = await supabase
        .from('organization_members')
        .update({ role })
        .eq('id', memberId)

      if (error) throw error

      logger.info({ msg: 'Member role updated', memberId, role })
      await fetchOrganizations()

      return { error: null }
    } catch (error) {
      logger.error({ msg: 'Error updating member role', error })
      return { error: error as Error }
    }
  }

  // Remove member
  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', memberId)

      if (error) throw error

      logger.info({ msg: 'Member removed', memberId })
      await fetchOrganizations()

      return { error: null }
    } catch (error) {
      logger.error({ msg: 'Error removing member', error })
      return { error: error as Error }
    }
  }

  // Leave organization
  const leaveOrganization = async (organizationId: string) => {
    if (!user) return { error: new Error('User not authenticated') }

    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('organization_id', organizationId)
        .eq('user_id', user.id)

      if (error) throw error

      logger.info({ msg: 'Left organization', organizationId })
      await fetchOrganizations()

      return { error: null }
    } catch (error) {
      logger.error({ msg: 'Error leaving organization', error })
      return { error: error as Error }
    }
  }

  // Utility functions
  const isOwner = (organizationId?: string) => {
    const orgId = organizationId || currentOrganization?.id
    if (!orgId) return false
    const org = organizations.find(o => o.id === orgId)
    return org?.membership?.role === 'owner'
  }

  const isAdmin = (organizationId?: string) => {
    const orgId = organizationId || currentOrganization?.id
    if (!orgId) return false
    const org = organizations.find(o => o.id === orgId)
    return org?.membership?.role === 'admin' || org?.membership?.role === 'owner'
  }

  const canManageMembers = (organizationId?: string) => {
    return isAdmin(organizationId)
  }

  const canManageSettings = (organizationId?: string) => {
    return isAdmin(organizationId)
  }

  const value = {
    currentOrganization,
    organizations,
    loading,
    switchOrganization,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    inviteMember,
    updateMemberRole,
    removeMember,
    leaveOrganization,
    refetchOrganizations: fetchOrganizations,
    isOwner,
    isAdmin,
    canManageMembers,
    canManageSettings,
  }

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>
}

export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider')
  }
  return context
}

export function useCurrentOrganization() {
  const { currentOrganization } = useOrganization()
  return currentOrganization
}

export function useOrganizations() {
  const { organizations } = useOrganization()
  return organizations
}
