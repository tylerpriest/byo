# RBAC Guide

Complete guide to the Role-Based Access Control (RBAC) system in BYO.

## Overview

BYO implements a **4-tier RBAC system** with database-level enforcement via Supabase Row Level Security (RLS).

### The Four Roles

1. **Admin** - Full system access, user management
2. **Moderator** - Content management, elevated permissions
3. **User** - Standard user access
4. **Guest** - Read-only or limited access

## Architecture

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │
       │ assigned to
       ↓
┌─────────────┐      granted      ┌──────────────┐
│    Roles    │ ─────────────────→ │ Permissions  │
└─────────────┘                    └──────────────┘
                                           │
                                           │ enforced by
                                           ↓
                                   ┌──────────────┐
                                   │ RLS Policies │
                                   └──────────────┘
```

## Database Schema

### Tables

#### `roles`
```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP
);
```

Default roles inserted by migration.

#### `permissions`
```sql
CREATE TABLE permissions (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,      -- e.g., 'users.read'
  resource TEXT NOT NULL,          -- e.g., 'users'
  action TEXT NOT NULL,            -- e.g., 'read'
  description TEXT,
  created_at TIMESTAMP
);
```

#### `user_roles` (Many-to-Many)
```sql
CREATE TABLE user_roles (
  user_id UUID REFERENCES auth.users(id),
  role_id UUID REFERENCES roles(id),
  assigned_at TIMESTAMP,
  assigned_by UUID REFERENCES auth.users(id),
  PRIMARY KEY (user_id, role_id)
);
```

Users can have **multiple roles** (e.g., both User and Moderator).

#### `role_permissions` (Many-to-Many)
```sql
CREATE TABLE role_permissions (
  role_id UUID REFERENCES roles(id),
  permission_id UUID REFERENCES permissions(id),
  PRIMARY KEY (role_id, permission_id)
);
```

## Default Permissions

Permissions follow the pattern: `resource.action`

### User Management
- `users.read` - View user information
- `users.write` - Edit user information
- `users.delete` - Delete users

### Settings
- `settings.read` - View settings
- `settings.write` - Edit settings

### Content
- `content.read` - View content
- `content.write` - Create/edit content
- `content.delete` - Delete content

### Analytics
- `analytics.view` - View analytics dashboard

### Moderation
- `moderation.manage` - Manage moderation tasks

## Permission Matrix

| Permission           | Guest | User | Moderator | Admin |
|---------------------|-------|------|-----------|-------|
| users.read          | ❌    | ❌   | ✅        | ✅    |
| users.write         | ❌    | ❌   | ❌        | ✅    |
| users.delete        | ❌    | ❌   | ❌        | ✅    |
| settings.read       | ❌    | ✅   | ✅        | ✅    |
| settings.write      | ❌    | ❌   | ❌        | ✅    |
| content.read        | ✅    | ✅   | ✅        | ✅    |
| content.write       | ❌    | ✅   | ✅        | ✅    |
| content.delete      | ❌    | ❌   | ✅        | ✅    |
| analytics.view      | ❌    | ❌   | ✅        | ✅    |
| moderation.manage   | ❌    | ❌   | ✅        | ✅    |

## Usage in Code

### Check User Roles

```tsx
import { useRoles } from '@/hooks/use-rbac'

function MyComponent() {
  const { roles, loading } = useRoles()

  if (loading) return <div>Loading...</div>

  if (roles.includes('Admin')) {
    return <AdminPanel />
  }

  return <UserPanel />
}
```

### Check Specific Role

```tsx
import { useHasRole } from '@/hooks/use-rbac'

function AdminOnlyComponent() {
  const { hasRole, loading } = useHasRole('Admin')

  if (loading) return <div>Loading...</div>

  if (!hasRole) {
    return <div>Access denied</div>
  }

  return <div>Admin content</div>
}
```

### Check Permissions

```tsx
import { useHasPermission } from '@/hooks/use-rbac'

function EditButton() {
  const { hasPermission } = useHasPermission('content.write')

  if (!hasPermission) return null

  return <button>Edit</button>
}
```

### Check Any Role

```tsx
import { useHasAnyRole } from '@/hooks/use-rbac'

function ModeratorPanel() {
  const { hasAnyRole } = useHasAnyRole(['Admin', 'Moderator'])

  if (!hasAnyRole) return null

  return <div>Moderation tools</div>
}
```

### Conditional Rendering

```tsx
function Dashboard() {
  const { roles } = useRoles()

  return (
    <div>
      <h1>Dashboard</h1>

      {/* Everyone sees this */}
      <WelcomeCard />

      {/* Only admins and moderators */}
      {roles.some(r => ['Admin', 'Moderator'].includes(r)) && (
        <ModerationPanel />
      )}

      {/* Only admins */}
      {roles.includes('Admin') && (
        <AdminPanel />
      )}
    </div>
  )
}
```

## Direct Utility Functions

For use in API calls or server-side logic:

```tsx
import { hasRole, hasPermission } from '@/lib/rbac'

async function deleteUser(userId: string, currentUserId: string) {
  // Check if current user has permission
  const canDelete = await hasPermission(currentUserId, 'users.delete')

  if (!canDelete) {
    throw new Error('Permission denied')
  }

  // Proceed with deletion
  await supabase.from('users').delete().eq('id', userId)
}
```

## Row Level Security (RLS)

**All authorization is enforced at the database level using RLS policies.**

### Example: Profile Access

```sql
-- Users can read their own profile
CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.name = 'Admin'
  )
);
```

### How RLS Works

1. User makes database query
2. Supabase extracts JWT token
3. `auth.uid()` available in policy
4. Policy checks if user meets criteria
5. Only matching rows returned

**Benefits:**
- Can't be bypassed from client
- Consistent across all access points
- Single source of truth
- Automatic enforcement

## Assigning Roles

### On Signup

New users automatically get the "User" role via database trigger:

```sql
CREATE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role_id UUID;
BEGIN
  -- Assign default 'User' role
  SELECT id INTO user_role_id FROM roles WHERE name = 'User';

  INSERT INTO user_roles (user_id, role_id, assigned_by)
  VALUES (NEW.id, user_role_id, NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Manually Assign Role

```tsx
async function assignRole(userId: string, roleName: string, assignedBy: string) {
  // Get role ID
  const { data: role } = await supabase
    .from('roles')
    .select('id')
    .eq('name', roleName)
    .single()

  // Assign role
  await supabase
    .from('user_roles')
    .insert({
      user_id: userId,
      role_id: role.id,
      assigned_by: assignedBy,
    })
}
```

### Via SQL (for testing)

```sql
-- Make user an admin
INSERT INTO user_roles (user_id, role_id, assigned_by)
VALUES (
  'user-uuid-here',
  (SELECT id FROM roles WHERE name = 'Admin'),
  'user-uuid-here'
);
```

## Adding Custom Permissions

### 1. Insert Permission

```sql
INSERT INTO permissions (name, resource, action, description)
VALUES (
  'reports.generate',
  'reports',
  'generate',
  'Generate system reports'
);
```

### 2. Assign to Roles

```sql
-- Give Admin and Moderator the new permission
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name IN ('Admin', 'Moderator')
AND p.name = 'reports.generate';
```

### 3. Use in Code

```tsx
const { hasPermission } = useHasPermission('reports.generate')

if (hasPermission) {
  return <GenerateReportButton />
}
```

## Creating Custom Roles

### 1. Insert Role

```sql
INSERT INTO roles (name, description)
VALUES ('Support', 'Customer support agent with limited access');
```

### 2. Assign Permissions

```sql
-- Give Support role specific permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT
  (SELECT id FROM roles WHERE name = 'Support'),
  id
FROM permissions
WHERE name IN ('users.read', 'content.read', 'content.write');
```

### 3. Update TypeScript Types

```tsx
// In src/lib/rbac.ts
export type Role = 'Admin' | 'Moderator' | 'User' | 'Guest' | 'Support'
```

## Caching

The RBAC system includes in-memory caching for performance:

```tsx
// Cache permissions for current user
const permissionsCache = new Map<string, Set<string>>()
const rolesCache = new Map<string, Set<Role>>()
```

### Clear Cache

```tsx
import { clearUserCache, clearAllCaches } from '@/lib/rbac'

// Clear cache for specific user (e.g., after role change)
clearUserCache(userId)

// Clear all caches (e.g., on logout)
clearAllCaches()
```

## Route Guards

Protect entire routes by role:

```tsx
// Create a role guard component
function RoleGuard({
  children,
  allowedRoles
}: {
  children: React.ReactNode
  allowedRoles: Role[]
}) {
  const { roles, loading } = useRoles()

  if (loading) return <LoadingSpinner />

  const hasAccess = roles.some(role => allowedRoles.includes(role))

  if (!hasAccess) {
    return <Navigate to="/unauthorized" />
  }

  return <>{children}</>
}

// Use in routes
<Route
  path="/admin"
  element={
    <RoleGuard allowedRoles={['Admin']}>
      <AdminPage />
    </RoleGuard>
  }
/>
```

## Best Practices

### 1. Always Enforce at Database Level

❌ **Don't:**
```tsx
// Client-side only - can be bypassed
if (hasPermission) {
  await supabase.from('users').delete().eq('id', userId)
}
```

✅ **Do:**
```tsx
// RLS policy enforces this at database level
await supabase.from('users').delete().eq('id', userId)
// Will fail if RLS policy denies access
```

### 2. Use Permissions, Not Roles

❌ **Don't:**
```tsx
if (roles.includes('Admin')) {
  return <DeleteButton />
}
```

✅ **Do:**
```tsx
if (hasPermission('users.delete')) {
  return <DeleteButton />
}
```

This makes it easier to add new roles later.

### 3. Graceful Degradation

```tsx
// Hide features user can't access
const { hasPermission } = useHasPermission('content.write')

return (
  <div>
    <h1>Content</h1>
    {hasPermission && <CreateButton />}
  </div>
)
```

### 4. Loading States

```tsx
const { hasPermission, loading } = useHasPermission('admin.access')

if (loading) {
  return <Skeleton />
}

if (!hasPermission) {
  return <AccessDenied />
}

return <AdminPanel />
```

## Testing RBAC

### Mock User Roles

```tsx
vi.mock('@/hooks/use-rbac', () => ({
  useRoles: () => ({
    roles: ['Admin'],
    loading: false,
  }),
  useHasPermission: () => ({
    hasPermission: true,
    loading: false,
  }),
}))
```

### Test Different Roles

```tsx
test('shows admin panel for admins', () => {
  mockUseRoles({ roles: ['Admin'] })
  render(<Dashboard />)
  expect(screen.getByText('Admin Panel')).toBeInTheDocument()
})

test('hides admin panel for users', () => {
  mockUseRoles({ roles: ['User'] })
  render(<Dashboard />)
  expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument()
})
```

## Troubleshooting

### "Permission denied" errors

1. Check RLS policies in Supabase Studio
2. Verify user has correct role in `user_roles`
3. Verify role has permission in `role_permissions`
4. Check logs for RLS policy failures

### Roles not updating

1. Clear RBAC cache: `clearUserCache(userId)`
2. Refresh auth session
3. Check database for role assignment

### Performance issues

1. Enable caching (already enabled by default)
2. Limit permission checks
3. Use `useHasAnyRole` instead of multiple `useHasRole` calls

---

**Related Docs:**
- [Authentication Guide](./auth.md)
- [Database Schema](./specs/database-schema.md)
- [Architecture](./architecture.md)
