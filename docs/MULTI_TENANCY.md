# Multi-Tenancy Implementation (byo4)

This document describes the multi-tenancy architecture implemented in byo4 using a **Shared Database, Shared Schema** approach.

## Architecture Overview

### Approach: Shared Database, Shared Schema

- **Database**: Single PostgreSQL database shared across all tenants
- **Schema**: Single schema with tenant isolation via Row-Level Security (RLS)
- **Tenant Identifier**: `organization_id` column in relevant tables
- **Security**: Database-level isolation using PostgreSQL RLS policies

### Benefits

- **Cost-effective**: Single database reduces infrastructure costs
- **Scalable**: Proven pattern for thousands of organizations
- **Maintainable**: Single schema simplifies migrations and updates
- **Performant**: Efficient with proper indexing and RLS policies
- **Integrated**: Leverages existing Supabase RLS infrastructure

## Database Schema

### Core Tables

#### `organizations`
Main tenant/organization table with the following columns:
- `id` (UUID): Primary key
- `name` (TEXT): Organization name
- `slug` (TEXT): Unique URL-friendly identifier
- `description` (TEXT): Organization description
- `avatar_url` (TEXT): Organization logo/avatar
- `plan_tier` (TEXT): Subscription tier (free, starter, professional, enterprise)
- `max_members` (INTEGER): Maximum allowed members based on plan
- `settings` (JSONB): Organization-specific settings
- `created_at`, `updated_at` (TIMESTAMP): Metadata
- `created_by` (UUID): User who created the organization

#### `organization_members`
Junction table for organization membership with roles:
- `id` (UUID): Primary key
- `organization_id` (UUID): Foreign key to organizations
- `user_id` (UUID): Foreign key to auth.users
- `role` (organization_role ENUM): Member's role
- `custom_permissions` (JSONB): Optional custom permissions
- `joined_at` (TIMESTAMP): When user joined
- `invited_by` (UUID): User who invited this member
- `invitation_accepted_at` (TIMESTAMP): When invitation was accepted

#### `organization_invitations`
Pending organization invitations:
- `id` (UUID): Primary key
- `organization_id` (UUID): Foreign key to organizations
- `email` (TEXT): Email of invitee
- `role` (organization_role): Intended role
- `invited_by` (UUID): User who sent invitation
- `token` (UUID): Unique invitation token
- `expires_at` (TIMESTAMP): Invitation expiration (default: 7 days)
- `accepted_at` (TIMESTAMP): When invitation was accepted

#### `profiles` (Updated)
User profile table now includes:
- `current_organization_id` (UUID): User's currently selected organization
- `default_organization_id` (UUID): User's default organization

### Organization Roles

Four-tier role system defined as PostgreSQL ENUM:

1. **Owner** (Level 3)
   - Full control over organization
   - Can delete organization
   - Can manage all settings and members
   - Cannot be removed if they're the last owner

2. **Admin** (Level 2)
   - Can manage organization settings
   - Can invite/remove members
   - Can change member roles (except owner)
   - Cannot delete organization

3. **Member** (Level 1)
   - Standard organization access
   - Can view organization data
   - Can collaborate on resources
   - Cannot manage settings or members

4. **Viewer** (Level 0)
   - Read-only access
   - Can view organization data
   - Cannot create or modify resources

## Row-Level Security (RLS)

### RLS Policies

All organization-related tables have comprehensive RLS policies:

**Organizations**:
- Users can view organizations they're members of
- Owners and admins can update organization details
- Only owners can delete organizations
- Any authenticated user can create an organization

**Organization Members**:
- Users can view members of their organizations
- Owners and admins can add/update/remove members
- Users can remove themselves (leave organization)

**Organization Invitations**:
- Owners and admins can view/create/delete invitations
- Invitation acceptance handled via application logic

### Data Isolation

All future application tables should include:
```sql
organization_id UUID NOT NULL REFERENCES organizations(id)
```

And corresponding RLS policies:
```sql
CREATE POLICY "Users can access their org data"
  ON table_name FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );
```

## Application Layer

### Context Providers

#### OrganizationContext (`/src/features/organizations/context/organization-context.tsx`)

Provides organization state and actions:

```typescript
const {
  // State
  currentOrganization,    // Currently selected organization
  organizations,          // All user's organizations
  loading,               // Loading state

  // Actions
  switchOrganization,    // Switch current organization
  createOrganization,    // Create new organization
  updateOrganization,    // Update organization details
  deleteOrganization,    // Delete organization (owner only)

  // Member management
  inviteMember,          // Invite new member
  updateMemberRole,      // Change member role
  removeMember,          // Remove member
  leaveOrganization,     // Leave organization

  // Utilities
  refetchOrganizations,  // Refresh organization list
  isOwner,              // Check if user is owner
  isAdmin,              // Check if user is admin
  canManageMembers,     // Check member management permission
  canManageSettings,    // Check settings management permission
} = useOrganization()
```

### RBAC Extensions

#### Organization-Level Permissions (`/src/lib/rbac.ts`)

Extended RBAC system with organization-specific functions:

```typescript
// Core functions
getOrganizationRole(userId, organizationId)
getUserOrganizations(userId)
isOrganizationMember(userId, organizationId)

// Permission checks
hasOrganizationRole(userId, organizationId, role)
hasAnyOrganizationRole(userId, organizationId, roles)
isOrganizationOwner(userId, organizationId)
isOrganizationAdmin(userId, organizationId)

// Capability checks
canManageOrganizationMembers(userId, organizationId)
canManageOrganizationSettings(userId, organizationId)
canDeleteOrganization(userId, organizationId)

// Role level comparisons
getOrganizationRoleLevel(role)  // Returns 0-3
hasOrganizationRoleLevel(userId, organizationId, minLevel)
```

#### React Hooks (`/src/hooks/use-rbac.ts`)

Organization RBAC hooks:

```typescript
useOrganizationRole(organizationId)      // Get user's role
useUserOrganizations()                   // Get all user's orgs
useIsOrganizationOwner(organizationId)   // Check if owner
useIsOrganizationAdmin(organizationId)   // Check if admin
useCanManageMembers(organizationId)      // Check member management
useCanManageSettings(organizationId)     // Check settings management
```

### UI Components

#### OrganizationSwitcher (`/src/features/organizations/components/organization-switcher.tsx`)

Dropdown component for switching between organizations:
- Shows all user's organizations with their role
- Indicates current organization with checkmark
- Optional "Create organization" action
- Integrated into dashboard sidebar

## Automatic Setup

### User Signup Flow

When a new user signs up:

1. **Profile Creation** (`handle_new_user` trigger):
   - Creates user profile
   - Assigns default "User" role

2. **Organization Creation** (extended in same trigger):
   - Creates personal workspace: `{username}'s Workspace`
   - Generates unique slug from email
   - Sets plan to 'free' with max 5 members
   - Adds user as organization owner
   - Sets as user's current and default organization

### Business Logic Triggers

**Prevent Last Owner Removal**:
- Cannot remove or demote the last owner
- Ensures organizations always have at least one owner
- Prevents accidental lockout

**Member Limit Enforcement**:
- Checks organization's `max_members` limit
- Prevents adding members beyond plan limits
- Based on organization's `plan_tier`

## Usage Examples

### Creating an Organization

```typescript
const { createOrganization } = useOrganization()

const handleCreate = async () => {
  const { data, error } = await createOrganization(
    'Acme Corporation',
    'acme-corp'
  )

  if (!error) {
    console.log('Organization created:', data)
  }
}
```

### Switching Organizations

```typescript
const { switchOrganization } = useOrganization()

const handleSwitch = async (orgId: string) => {
  await switchOrganization(orgId)
  // Current organization is now updated
  // Profile is updated with new current_organization_id
}
```

### Inviting Members

```typescript
const { inviteMember, currentOrganization } = useOrganization()

const handleInvite = async () => {
  const { error } = await inviteMember(
    'user@example.com',
    'member'
  )

  if (!error) {
    console.log('Invitation sent')
  }
}
```

### Checking Permissions

```typescript
const { isAdmin, canManageMembers } = useOrganization()

// Component-level checks
if (isAdmin()) {
  // Show admin UI
}

if (canManageMembers()) {
  // Show member management UI
}

// Hook-based checks
const { isAdmin: isAdminState } = useIsOrganizationAdmin(orgId)

if (isAdminState) {
  // Render admin features
}
```

## Migration Path

To apply the multi-tenancy migration:

1. **Local Development**:
   ```bash
   # Start Supabase
   npx supabase start

   # Apply migrations
   npx supabase db reset
   ```

2. **Production**:
   ```bash
   # Push migrations to Supabase
   npx supabase db push
   ```

3. **Verify**:
   - Check that all tables were created
   - Verify RLS policies are in place
   - Test organization creation on signup
   - Confirm triggers are working

## Future Enhancements

### Potential Additions

1. **Organization Invitations Flow**:
   - Email invitation system
   - Accept/reject invitation UI
   - Invitation link handling

2. **Organization Settings Page**:
   - Update organization details
   - Manage team members
   - View/change subscription plan
   - Delete organization

3. **Billing Integration**:
   - Plan upgrade/downgrade
   - Member limit based on plan
   - Usage tracking per organization

4. **Advanced Permissions**:
   - Custom permissions per member
   - Resource-level permissions
   - Permission inheritance

5. **Organization Analytics**:
   - Member activity tracking
   - Organization usage metrics
   - Audit logs

6. **Multi-Organization Resources**:
   - Projects, tasks, documents
   - Organization-scoped data
   - Cross-organization sharing (optional)

## Security Considerations

### Best Practices

1. **Always Use RLS**: Never bypass RLS policies for organization data
2. **Validate Organization Context**: Always check user's organization membership
3. **Cache Carefully**: Clear organization caches on role changes
4. **Audit Critical Actions**: Log organization admin actions
5. **Rate Limit Invitations**: Prevent invitation spam
6. **Validate Slugs**: Ensure organization slugs are unique and valid

### Common Pitfalls to Avoid

- ❌ Forgetting to add `organization_id` to new tables
- ❌ Missing RLS policies on new tables
- ❌ Not clearing caches after permission changes
- ❌ Allowing last owner removal
- ❌ Not enforcing member limits
- ❌ Hardcoding organization IDs in queries

## Testing

### Key Test Scenarios

1. **User Signup**:
   - Verify organization is auto-created
   - Check user is added as owner
   - Confirm default organization is set

2. **Organization Switching**:
   - Switch between organizations
   - Verify data isolation
   - Check profile is updated

3. **Member Management**:
   - Invite new members
   - Update member roles
   - Remove members
   - Prevent last owner removal

4. **Permissions**:
   - Test role-based access
   - Verify RLS policies
   - Check admin vs member capabilities

5. **Edge Cases**:
   - User with no organizations
   - User with single organization
   - Organization at member limit
   - Expired invitations

## Support

For questions or issues with multi-tenancy:
1. Check this documentation
2. Review migration SQL: `/supabase/migrations/20250108000000_add_multi_tenancy.sql`
3. Inspect context code: `/src/features/organizations/context/organization-context.tsx`
4. Review RBAC extensions: `/src/lib/rbac.ts`

## Changelog

### v4.0.0 (byo4) - Multi-Tenancy Release
- ✅ Added organizations, organization_members, organization_invitations tables
- ✅ Implemented organization_role enum (owner, admin, member, viewer)
- ✅ Created comprehensive RLS policies for tenant isolation
- ✅ Built OrganizationContext provider
- ✅ Extended RBAC system with organization-level permissions
- ✅ Added OrganizationSwitcher UI component
- ✅ Integrated organization switcher into dashboard
- ✅ Automatic organization creation on user signup
- ✅ Business logic triggers (last owner protection, member limits)
