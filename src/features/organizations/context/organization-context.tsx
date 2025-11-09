import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useAuth } from '@/features/auth/context/auth-context'
import { supabase } from '@/lib/supabase'

interface Organization {
  id: string
  name: string
  slug: string
  role: string
}

interface OrganizationContextType {
  currentOrganization: Organization | null
  organizations: Organization[]
  switchOrganization: (orgId: string) => void
  loading: boolean
  refetch: () => Promise<void>
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined)

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)

  const loadOrganizations = async () => {
    if (!user) {
      setOrganizations([])
      setCurrentOrganization(null)
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('organization_members')
      .select('organization_id, role, organizations(id, name, slug)')
      .eq('user_id', user.id)

    const orgs = data?.map((om: any) => ({
      id: om.organizations.id,
      name: om.organizations.name,
      slug: om.organizations.slug,
      role: om.role,
    })) || []

    setOrganizations(orgs)

    // Set current to first org or maintain current selection
    if (orgs.length > 0) {
      if (currentOrganization && orgs.find((o: Organization) => o.id === currentOrganization.id)) {
        // Keep current selection if still valid
        const updated = orgs.find((o: Organization) => o.id === currentOrganization.id)
        if (updated) setCurrentOrganization(updated)
      } else {
        // Otherwise set to first org
        setCurrentOrganization(orgs[0])
      }
    } else {
      setCurrentOrganization(null)
    }

    setLoading(false)
  }

  useEffect(() => {
    loadOrganizations()
  }, [user])

  const switchOrganization = (orgId: string) => {
    const org = organizations.find((o: Organization) => o.id === orgId)
    if (org) {
      setCurrentOrganization(org)
    }
  }

  return (
    <OrganizationContext.Provider
      value={{
        currentOrganization,
        organizations,
        switchOrganization,
        loading,
        refetch: loadOrganizations
      }}
    >
      {children}
    </OrganizationContext.Provider>
  )
}

export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (!context) {
    throw new Error('useOrganization must be used within OrganizationProvider')
  }
  return context
}
