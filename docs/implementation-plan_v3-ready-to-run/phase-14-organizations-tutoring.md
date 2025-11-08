# V3 Phase 14: Multi-Tenant Organizations for Tutoring Platform

**Use Case:** Tutors sign up, create their workspace, invite students
**Model:** Multi-tenant B2B2C (Tutor workspaces with student invitations)

---

## Database Schema

### Core Tables

```sql
-- Organizations (Tutor Workspaces)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL, -- "Ms. Smith's Math Tutoring"
  slug TEXT UNIQUE NOT NULL, -- "ms-smith-math"
  description TEXT,
  avatar_url TEXT,
  tutor_id UUID REFERENCES auth.users(id), -- The tutor who owns this workspace
  plan TEXT DEFAULT 'free', -- free, pro, premium
  max_students INTEGER DEFAULT 10, -- Plan-based limit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organization Members (Students + Assistants)
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('tutor', 'assistant', 'student')),
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB, -- For custom fields like grade level, subject, etc.
  UNIQUE(organization_id, user_id)
);

-- Invitations
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('assistant', 'student')),
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  invited_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW() + INTERVAL '7 days',
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB -- For pre-filling student info
);

-- Organization Settings (per tutor workspace)
CREATE TABLE organization_settings (
  organization_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
  allow_student_invites BOOLEAN DEFAULT false, -- Can students invite others?
  require_approval BOOLEAN DEFAULT false, -- Tutor must approve student joins?
  timezone TEXT DEFAULT 'UTC',
  locale TEXT DEFAULT 'en',
  branding JSONB, -- Custom colors, logo, etc.
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## Role Definitions

### **1. Tutor (Owner)**
- Creates and owns the workspace
- Invites students
- Manages all content
- Full admin permissions
- Billing owner

### **2. Assistant (Optional)**
- Helps manage students
- Can view student progress
- Cannot change billing/settings
- Useful for large tutoring businesses

### **3. Student**
- Invited by tutor
- Access to lessons/materials
- Submits assignments
- Read-mostly permissions

---

## User Flows

### **Flow 1: Tutor Signup → Workspace Creation**

```typescript
// Step 1: Tutor signs up
POST /auth/signup
{
  email: "tutor@example.com",
  password: "...",
  role: "tutor" // User picks role during signup
}

// Step 2: Auto-create workspace for tutor
// Triggered by database function
INSERT INTO organizations (name, slug, tutor_id)
VALUES ('My Tutoring', 'my-tutoring-uuid', tutor_user_id);

// Step 3: Add tutor as member
INSERT INTO organization_members (organization_id, user_id, role)
VALUES (org_id, tutor_user_id, 'tutor');
```

---

### **Flow 2: Tutor Invites Student**

```typescript
// Step 1: Tutor creates invitation
POST /api/organizations/{orgId}/invitations
{
  email: "student@example.com",
  role: "student",
  metadata: {
    grade: "10",
    subject: "Math"
  }
}

// Step 2: System creates invitation record
INSERT INTO invitations (organization_id, email, role, invited_by)
VALUES (org_id, 'student@example.com', 'student', tutor_user_id);

// Step 3: Send email with magic link
// Email contains: /accept-invite?token={token}

// Step 4: Student clicks link
GET /accept-invite?token={token}

// Step 5: Student signs up OR logs in
// If new: Create account
// If existing: Just accept invite

// Step 6: Add to organization
INSERT INTO organization_members (organization_id, user_id, role)
VALUES (org_id, student_user_id, 'student');

// Step 7: Mark invitation accepted
UPDATE invitations
SET accepted_at = NOW()
WHERE token = {token};
```

---

### **Flow 3: Student Joins Workspace**

```typescript
// After accepting invite, student sees:
{
  workspace: "Ms. Smith's Math Tutoring",
  role: "student",
  joined_at: "2025-01-07T10:00:00Z"
}

// Student dashboard shows:
- Tutor's lessons/materials
- Assignments
- Progress tracking
- Communication with tutor
```

---

## RLS Policies (Row Level Security)

### Organizations

```sql
-- Tutors can view/edit their own organizations
CREATE POLICY "Tutors can manage their organizations"
ON organizations FOR ALL
USING (tutor_id = auth.uid());

-- Members can view organizations they belong to
CREATE POLICY "Members can view their organizations"
ON organizations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = organizations.id
    AND user_id = auth.uid()
  )
);
```

### Organization Members

```sql
-- Tutors can manage members in their org
CREATE POLICY "Tutors can manage members"
ON organization_members FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM organizations
    WHERE id = organization_members.organization_id
    AND tutor_id = auth.uid()
  )
);

-- Members can view other members in same org
CREATE POLICY "Members can view other members"
ON organization_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.organization_id = organization_members.organization_id
    AND om.user_id = auth.uid()
  )
);
```

### Invitations

```sql
-- Tutors can manage invitations for their org
CREATE POLICY "Tutors can manage invitations"
ON invitations FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM organizations
    WHERE id = invitations.organization_id
    AND tutor_id = auth.uid()
  )
);

-- Anyone can view invitation by token (for acceptance page)
CREATE POLICY "Anyone can view invitation by token"
ON invitations FOR SELECT
USING (token IS NOT NULL);
```

---

## Key Features to Build

### Phase 14A: Core Multi-Tenancy (2-3 hours)

1. **Organization Creation**
   - Auto-create workspace on tutor signup
   - Organization settings page
   - Branding customization

2. **Invitation System**
   - Email invitation form
   - Magic link generation
   - Invitation acceptance flow
   - Email templates (Resend/SendGrid)

3. **Member Management**
   - List students in workspace
   - Remove students
   - View student activity
   - Student profiles

### Phase 14B: Enhanced Features (2-3 hours)

4. **Context Switching**
   - If student is in multiple tutors' workspaces
   - Workspace switcher component
   - Current workspace context

5. **Permissions Per Workspace**
   - Org-scoped permissions (not global)
   - Students can only see their tutor's content
   - RLS enforcement

6. **Onboarding Per Role**
   - Tutor onboarding: "Create your first workspace"
   - Student onboarding: "Accept your tutor's invite"

---

## UI Components Needed

### 1. Organization Switcher (if user in multiple orgs)

```tsx
<OrganizationSwitcher
  current={currentOrg}
  organizations={userOrganizations}
  onChange={(org) => switchOrganization(org.id)}
/>
```

### 2. Invite Students Modal

```tsx
<InviteStudentModal
  organizationId={orgId}
  onInvite={(email, metadata) => {
    // Send invitation
  }}
/>
```

### 3. Student List

```tsx
<StudentList
  organizationId={orgId}
  students={students}
  onRemove={(studentId) => {
    // Remove student from workspace
  }}
/>
```

### 4. Accept Invitation Page

```tsx
<AcceptInvitePage
  token={inviteToken}
  invitation={invitation}
  onAccept={() => {
    // Accept and join workspace
  }}
/>
```

---

## Pricing Implications

### Free Plan
- 1 workspace per tutor
- Up to 10 students
- Basic features

### Pro Plan ($19/month)
- 1 workspace
- Up to 50 students
- Advanced features
- Custom branding

### Premium Plan ($49/month)
- Unlimited students
- Multiple assistants
- Priority support
- White-label option

---

## Migration from Current Schema

### Backward Compatibility

**Option A: Migrate Existing Users**
```sql
-- Convert existing users to tutors with auto-created workspaces
INSERT INTO organizations (name, slug, tutor_id)
SELECT
  CONCAT(display_name, '''s Workspace'),
  CONCAT('workspace-', id),
  id
FROM profiles
WHERE id IN (
  SELECT user_id FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE r.name IN ('Admin', 'Moderator')
);
```

**Option B: Fresh Start**
- Keep current schema for legacy users
- New signups use organization model
- Gradual migration over time

---

## Technical Decisions

### 1. Auto-create workspace on signup?
**✅ Yes** - Better UX, tutor immediately has workspace

### 2. Allow students to be in multiple workspaces?
**✅ Yes** - Student can have multiple tutors

### 3. Allow tutors to have multiple workspaces?
**⚠️ Maybe** - Pro/Premium feature, or keep 1:1 tutor:workspace

### 4. Domain-based auto-join?
**❌ No** - Not applicable for tutoring (email invites only)

### 5. Public join links?
**⚠️ Optional** - Could be useful for group tutoring

---

## Example User Journeys

### Journey 1: Math Tutor with 5 Students

```
Ms. Smith signs up →
  Creates "Ms. Smith's Math Tutoring" workspace →
  Invites 5 students via email →
  Students accept invites →
  Students see Ms. Smith's lessons →
  Students submit homework →
  Ms. Smith grades assignments
```

### Journey 2: Student with Multiple Tutors

```
John is a student →
  Receives invite from Math tutor →
  Accepts → Joins Math workspace →
  Receives invite from English tutor →
  Accepts → Joins English workspace →
  Switches between workspaces in app
```

### Journey 3: Growing Tutoring Business

```
Tutor starts free (10 students) →
  Business grows →
  Upgrades to Pro (50 students) →
  Hires assistant →
  Invites assistant to workspace →
  Assistant helps manage students →
  Grows to Premium (unlimited students)
```

---

## Next Steps

1. **Confirm this model fits your vision**
2. **Decide on features for MVP** (Phase 14A vs 14B)
3. **Add Phase 14 to V3 implementation plan**
4. **Create migration strategy**

Want me to add this as **Phase 14** to the V3 plan?
