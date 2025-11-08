# Admin & Dev Roles in Multi-Tenant Architecture

**Date:** 2025-01-07
**Context:** Where do platform admins/devs fit in the tutoring platform's multi-tenant design?

---

## 🤔 The Two Types of "Admin"

### **1. Platform Admin/Dev** (System-Level)
- Runs the entire platform
- Manages all tutors and students
- Accesses system settings, billing, analytics
- Fixes bugs, deploys updates
- Support role

### **2. Organization Admin/Tutor** (Workspace-Level)
- Owns their tutoring workspace
- Manages their students
- No access to other tutors' data
- Pays for the service

---

## 🏗️ Three Architecture Patterns

### **Pattern A: Separate Platform Roles (Recommended)**

```
┌─────────────────────────────────────┐
│        PLATFORM LEVEL               │
├─────────────────────────────────────┤
│  Platform Admins (you/your team)    │
│  - Can see all organizations        │
│  - Manage system settings           │
│  - Access all data (for support)    │
│  - Not in any organization          │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      ORGANIZATION LEVEL             │
├─────────────────────────────────────┤
│  Tutor (Org Owner)                  │
│  - Owns workspace                   │
│  - Invites students                 │
│  - Admin of their org only          │
│                                     │
│  Students (Org Members)             │
│  - Belong to tutor's workspace      │
│  - No admin rights                  │
└─────────────────────────────────────┘
```

#### Database Schema

```sql
-- System-wide roles (for platform team)
CREATE TABLE system_roles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  role TEXT CHECK (role IN ('platform_admin', 'platform_dev', 'platform_support')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Organization roles (for tutors & students)
CREATE TABLE organization_members (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES auth.users(id),
  role TEXT CHECK (role IN ('tutor', 'assistant', 'student')),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### RLS Policies

```sql
-- Platform admins can see everything
CREATE POLICY "Platform admins see all organizations"
ON organizations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM system_roles
    WHERE user_id = auth.uid()
    AND role = 'platform_admin'
  )
  OR
  tutor_id = auth.uid()  -- Or you own it
);

-- Platform admins can see all lessons (for support)
CREATE POLICY "Platform admins see all lessons"
ON lessons FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM system_roles
    WHERE user_id = auth.uid()
    AND role IN ('platform_admin', 'platform_support')
  )
  OR
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()
  )  -- Or you're a member
);
```

#### User Experience

```typescript
// Check if user is platform admin
async function isPlatformAdmin(userId: string) {
  const { data } = await supabase
    .from('system_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'platform_admin')
    .single()

  return !!data
}

// Platform admin dashboard
if (await isPlatformAdmin(user.id)) {
  // Show platform admin nav
  <AdminNav>
    <Link to="/admin/organizations">All Tutors</Link>
    <Link to="/admin/users">All Users</Link>
    <Link to="/admin/analytics">Platform Analytics</Link>
    <Link to="/admin/billing">Billing</Link>
    <Link to="/admin/support">Support Tickets</Link>
  </AdminNav>
} else if (isTutor(user)) {
  // Show tutor dashboard
  <TutorNav>
    <Link to="/workspace">My Workspace</Link>
    <Link to="/students">My Students</Link>
    <Link to="/lessons">My Lessons</Link>
  </TutorNav>
}
```

#### Pros ✅
- ✅ Clear separation of concerns
- ✅ Platform admins have god mode for support
- ✅ Tutors can't see other tutors' data
- ✅ Easy to audit who did what
- ✅ Simple to understand

#### Cons ❌
- ⚠️ Two role systems to maintain
- ⚠️ Platform admins need special UI

---

### **Pattern B: Platform Org (Special Organization)**

```
┌─────────────────────────────────────┐
│  Organization: "Platform Team"      │
│  (Special system organization)      │
├─────────────────────────────────────┤
│  Members:                           │
│  - You (platform_admin)             │
│  - Developers (platform_dev)        │
│  - Support (platform_support)       │
│                                     │
│  Special permissions:               │
│  - Can access all other orgs        │
│  - System settings                  │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  Regular Organizations              │
│  (Tutor workspaces)                 │
└─────────────────────────────────────┘
```

#### Database Schema

```sql
-- Organizations include platform org
INSERT INTO organizations (id, name, is_platform_org)
VALUES ('platform-org-id', 'Platform Team', true);

-- Platform team members
INSERT INTO organization_members (organization_id, user_id, role)
VALUES ('platform-org-id', 'admin-user-id', 'platform_admin');

-- RLS policies check for platform org
CREATE POLICY "Platform org members see all"
ON organizations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM organization_members om
    JOIN organizations o ON om.organization_id = o.id
    WHERE om.user_id = auth.uid()
    AND o.is_platform_org = true
  )
  OR
  tutor_id = auth.uid()
);
```

#### Pros ✅
- ✅ Single role system
- ✅ Platform admins are treated like any other org
- ✅ Simpler schema

#### Cons ❌
- ⚠️ Platform org is "special" (not really a tutor workspace)
- ⚠️ Confusing: admins are in an org but not tutors
- ⚠️ Hard to explain to users

---

### **Pattern C: Dual Role System (Complex)**

```
Users have BOTH system roles AND org roles

User: John
  ├─ System Role: platform_admin
  └─ Org Roles:
      ├─ Org A: tutor (testing)
      └─ Org B: student (support testing)
```

#### Database Schema

```sql
-- Both tables exist
CREATE TABLE system_roles (...);
CREATE TABLE organization_members (...);

-- Check both for permissions
CREATE POLICY "Combined permissions"
ON lessons FOR SELECT
USING (
  -- Platform admin
  EXISTS (SELECT 1 FROM system_roles WHERE user_id = auth.uid() AND role = 'platform_admin')
  OR
  -- Or member of org
  organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
);
```

#### Pros ✅
- ✅ Maximum flexibility
- ✅ Platform admins can also be tutors (for testing)

#### Cons ❌
- ❌ Most complex
- ❌ Hard to reason about permissions
- ❌ Confusing for users

---

## 🎯 Recommendation for Tutoring Platform

### **Use Pattern A: Separate Platform Roles**

**Why:**
- Clear separation: Platform team vs Tutors vs Students
- Easy to explain to users
- Platform admins have god mode for support
- Tutors can't accidentally access platform admin features

---

## 📊 Complete Role Structure

### System-Wide Roles (Platform Team Only)

| Role | Purpose | Access | Who |
|------|---------|--------|-----|
| **platform_admin** | Full platform access | Everything | You, co-founders |
| **platform_dev** | Development & debugging | All data (read-only) | Developers |
| **platform_support** | Customer support | All orgs, help tutors | Support team |

### Organization Roles (Tutors & Students)

| Role | Purpose | Access | Who |
|------|---------|--------|-----|
| **tutor** | Workspace owner | Own org only | Tutors (customers) |
| **assistant** | Helper | Own org only | Tutor's assistants |
| **student** | Learner | Own org only | Students (end users) |

---

## 🔐 Permission Matrix

| Action | Platform Admin | Platform Dev | Platform Support | Tutor | Assistant | Student |
|--------|---------------|--------------|------------------|-------|-----------|---------|
| View all orgs | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| View all users | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete any org | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Change system settings | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View own org | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Invite to own org | N/A | N/A | N/A | ✅ | ⚠️ | ❌ |
| Create lessons | N/A | N/A | N/A | ✅ | ⚠️ | ❌ |
| View lessons | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Submit assignments | N/A | N/A | N/A | N/A | N/A | ✅ |

---

## 💻 Implementation: Platform Admin Features

### 1. Platform Admin Dashboard

```typescript
// /src/features/admin/platform-admin-dashboard.tsx

import { useAuth } from '@/features/auth/context/auth-context'
import { isPlatformAdmin } from '@/lib/platform-roles'

export function PlatformAdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    if (!isPlatformAdmin(user.id)) {
      navigate('/dashboard') // Redirect if not platform admin
      return
    }

    loadPlatformStats()
  }, [user])

  return (
    <div>
      <h1>Platform Administration</h1>

      {/* System Overview */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Total Tutors" value={stats.totalTutors} />
        <StatCard title="Total Students" value={stats.totalStudents} />
        <StatCard title="Active Workspaces" value={stats.activeOrgs} />
        <StatCard title="MRR" value={`$${stats.mrr}`} />
      </div>

      {/* All Organizations */}
      <Card>
        <CardHeader>
          <CardTitle>All Tutor Workspaces</CardTitle>
        </CardHeader>
        <CardContent>
          <OrganizationsTable
            organizations={allOrgs}
            onImpersonate={(orgId) => {
              // Support: Log in as tutor to debug issues
            }}
          />
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityFeed events={recentEvents} />
        </CardContent>
      </Card>
    </div>
  )
}
```

### 2. Platform Role Utilities

```typescript
// /src/lib/platform-roles.ts

import { supabase } from '@/lib/supabase'

export async function isPlatformAdmin(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('system_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'platform_admin')
    .single()

  return !!data
}

export async function isPlatformTeam(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('system_roles')
    .select('role')
    .eq('user_id', userId)
    .in('role', ['platform_admin', 'platform_dev', 'platform_support'])

  return data && data.length > 0
}

export async function getPlatformRole(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from('system_roles')
    .select('role')
    .eq('user_id', userId)
    .single()

  return data?.role || null
}
```

### 3. Navigation Based on Role

```typescript
// /src/components/app-nav.tsx

export function AppNav() {
  const { user } = useAuth()
  const [platformRole, setPlatformRole] = useState(null)
  const [orgRole, setOrgRole] = useState(null)

  useEffect(() => {
    getPlatformRole(user.id).then(setPlatformRole)
    getOrgRole(user.id, currentOrgId).then(setOrgRole)
  }, [user])

  return (
    <nav>
      {platformRole === 'platform_admin' && (
        <div>
          <h3>Platform Admin</h3>
          <NavLink to="/admin/platform">Platform Dashboard</NavLink>
          <NavLink to="/admin/organizations">All Tutors</NavLink>
          <NavLink to="/admin/users">All Users</NavLink>
          <NavLink to="/admin/billing">Billing</NavLink>
          <Separator />
        </div>
      )}

      {orgRole === 'tutor' && (
        <div>
          <h3>My Workspace</h3>
          <NavLink to="/workspace">Dashboard</NavLink>
          <NavLink to="/students">My Students</NavLink>
          <NavLink to="/lessons">My Lessons</NavLink>
        </div>
      )}

      {orgRole === 'student' && (
        <div>
          <h3>Student</h3>
          <NavLink to="/lessons">Available Lessons</NavLink>
          <NavLink to="/assignments">My Assignments</NavLink>
        </div>
      )}
    </nav>
  )
}
```

---

## 🧪 Testing Platform Admin Access

```typescript
// /src/lib/__tests__/platform-roles.test.ts

import { describe, it, expect } from 'vitest'
import { isPlatformAdmin } from '../platform-roles'

describe('Platform Roles', () => {
  it('platform admins can see all organizations', async () => {
    const admin = await createUser({ systemRole: 'platform_admin' })
    const tutor1 = await createTutor()
    const tutor2 = await createTutor()

    // Admin queries all orgs
    const { data } = await supabase
      .from('organizations')
      .select('*')

    // Should see both tutors' orgs
    expect(data).toHaveLength(2)
  })

  it('tutors cannot see other tutors orgs', async () => {
    const tutor1 = await createTutor()
    const tutor2 = await createTutor()

    // Tutor1 queries orgs
    const { data } = await supabase
      .from('organizations')
      .select('*')

    // Should only see own org
    expect(data).toHaveLength(1)
    expect(data[0].id).toBe(tutor1.orgId)
  })

  it('platform support can view but not delete', async () => {
    const support = await createUser({ systemRole: 'platform_support' })
    const tutor = await createTutor()

    // Support can view
    const { data: orgs } = await supabase
      .from('organizations')
      .select('*')
    expect(orgs).toHaveLength(1)

    // But cannot delete (RLS blocks)
    const { error } = await supabase
      .from('organizations')
      .delete()
      .eq('id', tutor.orgId)

    expect(error).toBeTruthy() // Should fail
  })
})
```

---

## 📋 Migration from Current Schema

### Current V1/V2 Schema (Before Multi-Tenancy)

```sql
-- Old: System-wide roles
roles: [Admin, Moderator, User, Guest]
user_roles: many-to-many
```

### New Phase 14 Schema (With Multi-Tenancy)

```sql
-- New: Separate platform and org roles
system_roles: [platform_admin, platform_dev, platform_support]
organization_members: [tutor, assistant, student]
```

### Migration Strategy

**Option A: Map Old Roles to New**
```sql
-- Admins → Platform Admins
INSERT INTO system_roles (user_id, role)
SELECT ur.user_id, 'platform_admin'
FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
WHERE r.name = 'Admin';

-- Moderators → Platform Support
INSERT INTO system_roles (user_id, role)
SELECT ur.user_id, 'platform_support'
FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
WHERE r.name = 'Moderator';

-- Users → Create org as tutor
-- (Depends on business logic - are existing users tutors or students?)
```

**Option B: Fresh Start**
- Keep old schema for existing users (if any)
- New signups use new multi-tenant schema
- Gradual migration

---

## 🎯 Summary

### For Your Tutoring Platform:

**Platform Roles (You & Your Team):**
- `platform_admin` - You, co-founders (full access)
- `platform_dev` - Developers (read access, debugging)
- `platform_support` - Support team (help tutors)

**Organization Roles (Customers):**
- `tutor` - Workspace owner (your paying customers)
- `assistant` - Tutor's helper (optional)
- `student` - Learners (invited by tutors)

**Implementation:**
- Use Pattern A (separate tables)
- Platform admins in `system_roles` table
- Org members in `organization_members` table
- RLS policies check both

**This gives you:**
- ✅ God mode for platform support
- ✅ Clear separation of concerns
- ✅ Tutors can't see each other's data
- ✅ Easy to audit and debug
