import { supabase } from '@/lib/supabase'

export async function createInvitation(
  organizationId: string,
  email: string,
  role: 'student' | 'assistant',
  metadata?: Record<string, any>
) {
  const { data: user } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('invitations')
    .insert({
      organization_id: organizationId,
      email,
      role,
      invited_by: user?.user?.id,
      metadata,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getInvitation(token: string) {
  const { data, error } = await supabase
    .from('invitations')
    .select('*, organizations(*)')
    .eq('token', token)
    .is('accepted_at', null)
    .gte('expires_at', new Date().toISOString())
    .single()

  if (error) throw error
  return data
}

export async function acceptInvitation(token: string, userId: string) {
  // Get invitation
  const invitation = await getInvitation(token)

  // Add user to organization
  const { error: memberError } = await supabase
    .from('organization_members')
    .insert({
      organization_id: invitation.organization_id,
      user_id: userId,
      role: invitation.role,
      invited_by: invitation.invited_by,
    })

  if (memberError) throw memberError

  // Mark invitation accepted
  const { error: inviteError } = await supabase
    .from('invitations')
    .update({ accepted_at: new Date().toISOString() })
    .eq('token', token)

  if (inviteError) throw inviteError

  return invitation
}

export async function listInvitations(organizationId: string) {
  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('organization_id', organizationId)
    .is('accepted_at', null)
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function cancelInvitation(invitationId: string) {
  const { error } = await supabase
    .from('invitations')
    .delete()
    .eq('id', invitationId)

  if (error) throw error
}
