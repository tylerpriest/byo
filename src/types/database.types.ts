export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          current_organization_id: string | null
          default_organization_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          current_organization_id?: string | null
          default_organization_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          current_organization_id?: string | null
          default_organization_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_current_organization_id_fkey"
            columns: ["current_organization_id"]
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_default_organization_id_fkey"
            columns: ["default_organization_id"]
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          avatar_url: string | null
          plan_tier: string
          max_members: number
          settings: Json
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          avatar_url?: string | null
          plan_tier?: string
          max_members?: number
          settings?: Json
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          avatar_url?: string | null
          plan_tier?: string
          max_members?: number
          settings?: Json
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      organization_members: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          role: Database['public']['Enums']['organization_role']
          custom_permissions: Json
          joined_at: string
          invited_by: string | null
          invitation_accepted_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          role?: Database['public']['Enums']['organization_role']
          custom_permissions?: Json
          joined_at?: string
          invited_by?: string | null
          invitation_accepted_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          role?: Database['public']['Enums']['organization_role']
          custom_permissions?: Json
          joined_at?: string
          invited_by?: string | null
          invitation_accepted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_invited_by_fkey"
            columns: ["invited_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      organization_invitations: {
        Row: {
          id: string
          organization_id: string
          email: string
          role: Database['public']['Enums']['organization_role']
          invited_by: string
          token: string
          expires_at: string
          accepted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          email: string
          role?: Database['public']['Enums']['organization_role']
          invited_by: string
          token?: string
          expires_at?: string
          accepted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          email?: string
          role?: Database['public']['Enums']['organization_role']
          invited_by?: string
          token?: string
          expires_at?: string
          accepted_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_invitations_organization_id_fkey"
            columns: ["organization_id"]
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_invitations_invited_by_fkey"
            columns: ["invited_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      roles: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          user_id: string
          role_id: string
          assigned_at: string
          assigned_by: string | null
        }
        Insert: {
          user_id: string
          role_id: string
          assigned_at?: string
          assigned_by?: string | null
        }
        Update: {
          user_id?: string
          role_id?: string
          assigned_at?: string
          assigned_by?: string | null
        }
        Relationships: []
      }
      permissions: {
        Row: {
          id: string
          name: string
          resource: string
          action: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          resource: string
          action: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          resource?: string
          action?: string
          description?: string | null
          created_at?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          role_id: string
          permission_id: string
        }
        Insert: {
          role_id: string
          permission_id: string
        }
        Update: {
          role_id?: string
          permission_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      organization_role: 'owner' | 'admin' | 'member' | 'viewer'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
