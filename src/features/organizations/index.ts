// Context
export {
  OrganizationProvider,
  useOrganization,
  useCurrentOrganization,
  useOrganizations,
} from './context/organization-context'

// Components
export { OrganizationSwitcher } from './components/organization-switcher'

// Re-export types
export type { Database } from '@/types/database.types'
export type OrganizationRole = Database['public']['Enums']['organization_role']
export type Organization = Database['public']['Tables']['organizations']['Row']
export type OrganizationMember = Database['public']['Tables']['organization_members']['Row']
export type OrganizationInvitation = Database['public']['Tables']['organization_invitations']['Row']
