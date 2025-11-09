import { useState } from 'react'
import { createInvitation } from '../lib/invitations'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'

export function InviteStudentModal({ organizationId }: { organizationId: string }) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleInvite = async () => {
    setLoading(true)
    try {
      const invitation = await createInvitation(organizationId, email, 'student')

      // In production, send email here
      const inviteUrl = `${window.location.origin}/accept-invite?token=${invitation.token}`

      toast({
        title: 'Invitation sent!',
        description: `Invitation link: ${inviteUrl}`,
      })

      setEmail('')
      setOpen(false)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Invite Student</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Student</DialogTitle>
          <DialogDescription>
            Send an invitation to a student to join your workspace
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="student@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button onClick={handleInvite} disabled={loading || !email}>
            {loading ? 'Sending...' : 'Send Invitation'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
