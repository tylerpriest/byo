-- Phase 14: Multi-Tenant Organizations
-- Architecture: Row-Level Multi-Tenancy (Type 1) + Single-Instance Deployment

-- Organizations (Tutor Workspaces)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  avatar_url TEXT,
  tutor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'premium')),
  max_students INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organization Members (Students + Assistants)
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('tutor', 'assistant', 'student')),
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  UNIQUE(organization_id, user_id)
);

-- Invitations
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('assistant', 'student')),
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  invited_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW() + INTERVAL '7 days',
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- Organization Settings
CREATE TABLE IF NOT EXISTS organization_settings (
  organization_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
  allow_student_invites BOOLEAN DEFAULT false,
  require_approval BOOLEAN DEFAULT false,
  timezone TEXT DEFAULT 'UTC',
  locale TEXT DEFAULT 'en',
  branding JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System Roles (Platform Admin/Dev/Support)
-- Separate from application roles (Admin, Moderator, User, Guest)
CREATE TABLE IF NOT EXISTS system_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('platform_admin', 'platform_dev', 'platform_support')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- System Settings (for demo mode toggle, etc.)
CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Organizations
CREATE POLICY "Platform admins see all organizations"
ON organizations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM system_roles
    WHERE user_id = auth.uid()
    AND role = 'platform_admin'
  )
  OR tutor_id = auth.uid()
);

CREATE POLICY "Members can view their organizations"
ON organizations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = organizations.id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Tutors can manage their organizations"
ON organizations FOR ALL
USING (tutor_id = auth.uid());

-- RLS Policies: Organization Members
CREATE POLICY "Platform admins see all members"
ON organization_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM system_roles
    WHERE user_id = auth.uid()
    AND role IN ('platform_admin', 'platform_support')
  )
);

CREATE POLICY "Tutors can manage members in their org"
ON organization_members FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM organizations
    WHERE id = organization_members.organization_id
    AND tutor_id = auth.uid()
  )
);

CREATE POLICY "Members can view other members in same org"
ON organization_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.organization_id = organization_members.organization_id
    AND om.user_id = auth.uid()
  )
);

-- RLS Policies: Invitations
CREATE POLICY "Tutors can manage invitations for their org"
ON invitations FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM organizations
    WHERE id = invitations.organization_id
    AND tutor_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view invitation by token"
ON invitations FOR SELECT
USING (token IS NOT NULL);

-- RLS Policies: System Roles
CREATE POLICY "Users can view their own system roles"
ON system_roles FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Platform admins can manage system roles"
ON system_roles FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM system_roles
    WHERE user_id = auth.uid()
    AND role = 'platform_admin'
  )
);

-- RLS Policies: System Settings
CREATE POLICY "Anyone can view system settings"
ON system_settings FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Platform admins can manage system settings"
ON system_settings FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM system_roles
    WHERE user_id = auth.uid()
    AND role = 'platform_admin'
  )
);

-- Auto-create organization on tutor signup
CREATE OR REPLACE FUNCTION public.handle_tutor_signup()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
  org_id UUID;
BEGIN
  -- Get user's role from metadata
  user_role := NEW.raw_user_meta_data->>'role';

  -- If tutor, create organization
  IF user_role = 'tutor' THEN
    INSERT INTO public.organizations (name, slug, tutor_id)
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'organization_name', split_part(NEW.email, '@', 1) || '''s Workspace'),
      NEW.id::text,
      NEW.id
    )
    RETURNING id INTO org_id;

    -- Add tutor as organization member
    INSERT INTO public.organization_members (organization_id, user_id, role, invited_by)
    VALUES (org_id, NEW.id, 'tutor', NEW.id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-creating organization
DROP TRIGGER IF EXISTS on_tutor_signup ON auth.users;
CREATE TRIGGER on_tutor_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_tutor_signup();

-- Update updated_at trigger for organizations
DROP TRIGGER IF EXISTS on_organization_updated ON organizations;
CREATE TRIGGER on_organization_updated
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert default system setting for demo mode
INSERT INTO system_settings (key, value)
VALUES ('demo_mode', 'false')
ON CONFLICT (key) DO NOTHING;

-- Add last_login_at to profiles for tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;

-- Function to update last login timestamp
CREATE OR REPLACE FUNCTION public.handle_user_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET last_login_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update last login on auth
DROP TRIGGER IF EXISTS on_user_login ON auth.users;
CREATE TRIGGER on_user_login
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
  EXECUTE FUNCTION public.handle_user_login();
