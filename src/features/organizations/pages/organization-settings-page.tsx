import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOrganization } from '../context/organization-context'
import { useOrganizationMembers } from '../hooks/use-organization-members'
import { useIsOrganizationAdmin, useIsOrganizationOwner } from '@/hooks/use-rbac'
import { useUser } from '@/features/auth/context/auth-context'
import DashboardLayout from '@/features/dashboard/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/use-toast'
import { Building2, UserPlus, Trash2, LogOut, Crown, Shield, User as UserIcon, Eye } from 'lucide-react'
import type { Database } from '@/types/database.types'

type OrganizationRole = Database['public']['Enums']['organization_role']

const roleIcons = {
  owner: Crown,
  admin: Shield,
  member: UserIcon,
  viewer: Eye,
}

export default function OrganizationSettingsPage() {
  const navigate = useNavigate()
  const user = useUser()
  const { toast } = useToast()
  const { currentOrganization, updateOrganization, deleteOrganization, leaveOrganization, removeMember, updateMemberRole, inviteMember } = useOrganization()
  const { members, loading: membersLoading, refetch: refetchMembers } = useOrganizationMembers(currentOrganization?.id)
  const { isAdmin } = useIsOrganizationAdmin(currentOrganization?.id)
  const { isOwner } = useIsOrganizationOwner(currentOrganization?.id)

  // Form state
  const [orgName, setOrgName] = useState(currentOrganization?.name || '')
  const [orgDescription, setOrgDescription] = useState(currentOrganization?.description || '')
  const [saving, setSaving] = useState(false)

  // Invite dialog state
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<OrganizationRole>('member')
  const [inviting, setInviting] = useState(false)

  if (!currentOrganization) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">No organization selected</p>
        </div>
      </DashboardLayout>
    )
  }

  const handleSaveDetails = async () => {
    if (!isAdmin) return

    setSaving(true)
    const { error } = await updateOrganization(currentOrganization.id, {
      name: orgName,
      description: orgDescription,
    })

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update organization details',
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Success',
        description: 'Organization updated successfully',
      })
    }
    setSaving(false)
  }

  const handleInviteMember = async () => {
    if (!inviteEmail) {
      toast({
        title: 'Error',
        description: 'Please enter an email address',
        variant: 'destructive',
      })
      return
    }

    setInviting(true)
    const { error } = await inviteMember(inviteEmail, inviteRole)

    if (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to invite member',
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Success',
        description: `Invitation sent to ${inviteEmail}`,
      })
      setInviteEmail('')
      setInviteRole('member')
      setInviteDialogOpen(false)
    }
    setInviting(false)
  }

  const handleUpdateMemberRole = async (memberId: string, newRole: OrganizationRole) => {
    const { error } = await updateMemberRole(memberId, newRole)

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update member role',
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Success',
        description: 'Member role updated',
      })
      refetchMembers()
    }
  }

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    const { error } = await removeMember(memberId)

    if (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove member',
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Success',
        description: `${memberName} removed from organization`,
      })
      refetchMembers()
    }
  }

  const handleLeaveOrganization = async () => {
    const { error } = await leaveOrganization(currentOrganization.id)

    if (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to leave organization',
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Success',
        description: 'You have left the organization',
      })
      navigate('/dashboard')
    }
  }

  const handleDeleteOrganization = async () => {
    const { error } = await deleteOrganization(currentOrganization.id)

    if (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete organization',
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Success',
        description: 'Organization deleted',
      })
      navigate('/dashboard')
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold">Organization Settings</h1>
            <p className="text-muted-foreground">{currentOrganization.name}</p>
          </div>
        </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>Manage your organization's basic information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="org-name">Organization Name</Label>
            <Input
              id="org-name"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              disabled={!isAdmin}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-slug">Organization Slug</Label>
            <Input
              id="org-slug"
              value={currentOrganization.slug}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Organization slug cannot be changed
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-description">Description</Label>
            <Input
              id="org-description"
              value={orgDescription}
              onChange={(e) => setOrgDescription(e.target.value)}
              placeholder="What does your organization do?"
              disabled={!isAdmin}
            />
          </div>

          <div className="space-y-2">
            <Label>Plan</Label>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {currentOrganization.plan_tier}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {currentOrganization.max_members} member limit
              </span>
            </div>
          </div>

          {isAdmin && (
            <Button onClick={handleSaveDetails} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Members */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Members</CardTitle>
              <CardDescription>
                Manage who has access to your organization ({members.length}/{currentOrganization.max_members})
              </CardDescription>
            </div>
            {isAdmin && (
              <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                    <DialogDescription>
                      Send an invitation to join this organization
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="invite-email">Email Address</Label>
                      <Input
                        id="invite-email"
                        type="email"
                        placeholder="colleague@example.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invite-role">Role</Label>
                      <Select value={inviteRole} onValueChange={(value: string) => setInviteRole(value as OrganizationRole)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer - Read only</SelectItem>
                          <SelectItem value="member">Member - Standard access</SelectItem>
                          <SelectItem value="admin">Admin - Manage settings & members</SelectItem>
                          {isOwner && <SelectItem value="owner">Owner - Full control</SelectItem>}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleInviteMember} disabled={inviting}>
                      {inviting ? 'Sending...' : 'Send Invitation'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {membersLoading ? (
            <p className="text-sm text-muted-foreground">Loading members...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => {
                  const RoleIcon = roleIcons[member.role]
                  const isCurrentUser = member.user_id === user?.id
                  const memberName = member.profile?.display_name || 'Unknown User'

                  return (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            {member.profile?.avatar_url ? (
                              <img src={member.profile.avatar_url} alt={memberName} />
                            ) : (
                              <AvatarFallback>
                                {memberName.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {memberName}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs text-muted-foreground">(You)</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {isAdmin && !isCurrentUser ? (
                          <Select
                            value={member.role}
                            onValueChange={(value: string) => handleUpdateMemberRole(member.id, value as OrganizationRole)}
                          >
                            <SelectTrigger className="w-[140px]">
                              <div className="flex items-center gap-2">
                                <RoleIcon className="h-4 w-4" />
                                <SelectValue />
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="viewer">Viewer</SelectItem>
                              <SelectItem value="member">Member</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                              {isOwner && <SelectItem value="owner">Owner</SelectItem>}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant="outline" className="flex items-center gap-1 w-fit">
                            <RoleIcon className="h-3 w-3" />
                            <span className="capitalize">{member.role}</span>
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(member.joined_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {isAdmin && !isCurrentUser && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Member</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove {memberName} from this organization?
                                  They will lose access immediately.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRemoveMember(member.id, memberName)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions for this organization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isOwner && (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Leave Organization</h3>
                <p className="text-sm text-muted-foreground">
                  You will lose access to this organization
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">
                    <LogOut className="mr-2 h-4 w-4" />
                    Leave
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Leave Organization</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to leave {currentOrganization.name}?
                      You'll need to be re-invited to regain access.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLeaveOrganization}>
                      Leave Organization
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          {isOwner && (
            <div className="flex items-center justify-between p-4 border border-destructive rounded-lg">
              <div>
                <h3 className="font-medium text-destructive">Delete Organization</h3>
                <p className="text-sm text-muted-foreground">
                  Permanently delete this organization and all its data
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Organization</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete {currentOrganization.name} and
                      remove all members.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteOrganization}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete Organization
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  )
}
