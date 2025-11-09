// Context
export {
  OrganizationProvider,
  useOrganization,
  useCurrentOrganization,
  useOrganizations,
} from './context/organization-context'

// Components
export { OrganizationSwitcher } from './components/organization-switcher'

// Pages
export { default as OrganizationSettingsPage } from './pages/organization-settings-page'

// Hooks
export { useOrganizationMembers } from './hooks/use-organization-members'

// Re-export types
import type { Database } from '@/types/database.types'

export type { Database }
export type OrganizationRole = Database['public']['Enums']['organization_role']
export type Organization = Database['public']['Tables']['organizations']['Row']
export type OrganizationMember = Database['public']['Tables']['organization_members']['Row']
export type OrganizationInvitation = Database['public']['Tables']['organization_invitations']['Row']
