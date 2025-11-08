-- Multi-Tenancy Migration: Shared Database, Shared Schema
-- This migration adds organization support for multi-tenant SaaS architecture

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  avatar_url TEXT,
  -- Subscription and billing
  plan_tier TEXT DEFAULT 'free' CHECK (plan_tier IN ('free', 'starter', 'professional', 'enterprise')),
  max_members INTEGER DEFAULT 5,
  -- Settings
  settings JSONB DEFAULT '{}'::jsonb,
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create organization member roles enum
CREATE TYPE organization_role AS ENUM ('owner', 'admin', 'member', 'viewer');

-- Create organization_members table (many-to-many)
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role organization_role NOT NULL DEFAULT 'member',
  -- Permissions can be customized per member if needed
  custom_permissions JSONB DEFAULT '{}'::jsonb,
  -- Metadata
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  invited_by UUID REFERENCES auth.users(id),
  invitation_accepted_at TIMESTAMP WITH TIME ZONE,
  -- Ensure unique user per organization
  UNIQUE(organization_id, user_id)
);

-- Create organization invitations table
CREATE TABLE IF NOT EXISTS organization_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role organization_role NOT NULL DEFAULT 'member',
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  token UUID UNIQUE DEFAULT uuid_generate_v4(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, email)
);

-- Add organization context to profiles (optional: for storing user's current/default org)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS default_organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_created_by ON organizations(created_by);
CREATE INDEX IF NOT EXISTS idx_organization_members_user_id ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_organization_id ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_invitations_email ON organization_invitations(email);
CREATE INDEX IF NOT EXISTS idx_organization_invitations_token ON organization_invitations(token);

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies for Organizations
-- ============================================================================

-- Users can view organizations they are members of
CREATE POLICY "Users can view their organizations"
  ON organizations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organizations.id
      AND om.user_id = auth.uid()
    )
  );

-- Organization owners and admins can update their organization
CREATE POLICY "Owners and admins can update organization"
  ON organizations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organizations.id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organizations.id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
    )
  );

-- Authenticated users can create organizations
CREATE POLICY "Authenticated users can create organizations"
  ON organizations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Only owners can delete organizations
CREATE POLICY "Owners can delete organization"
  ON organizations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organizations.id
      AND om.user_id = auth.uid()
      AND om.role = 'owner'
    )
  );

-- ============================================================================
-- RLS Policies for Organization Members
-- ============================================================================

-- Users can view members of organizations they belong to
CREATE POLICY "Users can view organization members"
  ON organization_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organization_members.organization_id
      AND om.user_id = auth.uid()
    )
  );

-- Owners and admins can add members
CREATE POLICY "Owners and admins can add members"
  ON organization_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organization_members.organization_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
    )
  );

-- Owners and admins can update member roles
CREATE POLICY "Owners and admins can update members"
  ON organization_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organization_members.organization_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organization_members.organization_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
    )
  );

-- Owners and admins can remove members, users can remove themselves
CREATE POLICY "Owners/admins can remove members, users can leave"
  ON organization_members FOR DELETE
  TO authenticated
  USING (
    -- User is removing themselves
    user_id = auth.uid()
    OR
    -- User is owner/admin of the organization
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organization_members.organization_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- RLS Policies for Organization Invitations
-- ============================================================================

-- Users can view invitations for organizations they're owners/admins of
CREATE POLICY "Owners and admins can view invitations"
  ON organization_invitations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organization_invitations.organization_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
    )
  );

-- Owners and admins can create invitations
CREATE POLICY "Owners and admins can create invitations"
  ON organization_invitations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organization_invitations.organization_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
    )
    AND invited_by = auth.uid()
  );

-- Owners and admins can delete invitations
CREATE POLICY "Owners and admins can delete invitations"
  ON organization_invitations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organization_invitations.organization_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- Functions and Triggers
-- ============================================================================

-- Function to create default organization on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_organization()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
  org_slug TEXT;
BEGIN
  -- Generate a unique slug from email
  org_slug := LOWER(REGEXP_REPLACE(split_part(NEW.email, '@', 1), '[^a-z0-9]+', '-', 'g'));

  -- Ensure slug is unique by appending random suffix if needed
  WHILE EXISTS (SELECT 1 FROM organizations WHERE slug = org_slug) LOOP
    org_slug := org_slug || '-' || substr(md5(random()::text), 1, 6);
  END LOOP;

  -- Create default organization
  INSERT INTO public.organizations (name, slug, created_by, plan_tier, max_members)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)) || '''s Workspace',
    org_slug,
    NEW.id,
    'free',
    5
  )
  RETURNING id INTO org_id;

  -- Add user as organization owner
  INSERT INTO public.organization_members (organization_id, user_id, role, invited_by, invitation_accepted_at)
  VALUES (org_id, NEW.id, 'owner', NEW.id, NOW());

  -- Set as default organization in profile
  UPDATE public.profiles
  SET current_organization_id = org_id, default_organization_id = org_id
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Modify existing trigger to include organization creation
-- First, update the handle_new_user function to call organization creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role_id UUID;
  org_id UUID;
  org_slug TEXT;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  -- Assign default 'User' role
  SELECT id INTO user_role_id FROM public.roles WHERE name = 'User';

  IF user_role_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role_id, assigned_by)
    VALUES (NEW.id, user_role_id, NEW.id);
  END IF;

  -- Generate a unique slug from email
  org_slug := LOWER(REGEXP_REPLACE(split_part(NEW.email, '@', 1), '[^a-z0-9]+', '-', 'g'));

  -- Ensure slug is unique by appending random suffix if needed
  WHILE EXISTS (SELECT 1 FROM organizations WHERE slug = org_slug) LOOP
    org_slug := org_slug || '-' || substr(md5(random()::text), 1, 6);
  END LOOP;

  -- Create default organization
  INSERT INTO public.organizations (name, slug, created_by, plan_tier, max_members)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)) || '''s Workspace',
    org_slug,
    NEW.id,
    'free',
    5
  )
  RETURNING id INTO org_id;

  -- Add user as organization owner
  INSERT INTO public.organization_members (organization_id, user_id, role, invited_by, invitation_accepted_at)
  VALUES (org_id, NEW.id, 'owner', NEW.id, NOW());

  -- Set as default organization in profile
  UPDATE public.profiles
  SET current_organization_id = org_id, default_organization_id = org_id
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp for organizations
CREATE OR REPLACE FUNCTION public.handle_organization_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on organizations
DROP TRIGGER IF EXISTS on_organization_updated ON organizations;
CREATE TRIGGER on_organization_updated
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION public.handle_organization_updated_at();

-- Function to prevent removing the last owner
CREATE OR REPLACE FUNCTION public.prevent_last_owner_removal()
RETURNS TRIGGER AS $$
DECLARE
  owner_count INTEGER;
BEGIN
  -- Check if removing/updating an owner
  IF (TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND OLD.role = 'owner' AND NEW.role != 'owner')) THEN
    -- Count remaining owners
    SELECT COUNT(*) INTO owner_count
    FROM organization_members
    WHERE organization_id = OLD.organization_id
    AND role = 'owner'
    AND id != OLD.id;

    -- Prevent if this is the last owner
    IF owner_count = 0 THEN
      RAISE EXCEPTION 'Cannot remove the last owner from an organization';
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to prevent last owner removal
DROP TRIGGER IF EXISTS prevent_last_owner_removal ON organization_members;
CREATE TRIGGER prevent_last_owner_removal
  BEFORE UPDATE OR DELETE ON organization_members
  FOR EACH ROW EXECUTE FUNCTION public.prevent_last_owner_removal();

-- Function to check member limits based on plan
CREATE OR REPLACE FUNCTION public.check_member_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_member_count INTEGER;
  max_allowed INTEGER;
BEGIN
  -- Get organization's max members
  SELECT max_members INTO max_allowed
  FROM organizations
  WHERE id = NEW.organization_id;

  -- Count current members
  SELECT COUNT(*) INTO current_member_count
  FROM organization_members
  WHERE organization_id = NEW.organization_id;

  -- Check if adding new member would exceed limit
  IF current_member_count >= max_allowed THEN
    RAISE EXCEPTION 'Organization has reached maximum member limit of %', max_allowed;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check member limits on insert
DROP TRIGGER IF EXISTS check_member_limit ON organization_members;
CREATE TRIGGER check_member_limit
  BEFORE INSERT ON organization_members
  FOR EACH ROW EXECUTE FUNCTION public.check_member_limit();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON organizations TO authenticated;
GRANT ALL ON organization_members TO authenticated;
GRANT ALL ON organization_invitations TO authenticated;
