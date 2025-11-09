import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getInvitation, acceptInvitation } from '../lib/invitations'
import { useAuth } from '@/features/auth/context/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function AcceptInvitePage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const { user } = useAuth()
  const navigate = useNavigate()
  const [invitation, setInvitation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link')
      setLoading(false)
      return
    }

    getInvitation(token)
      .then(setInvitation)
      .catch(() => setError('Invitation not found or expired'))
      .finally(() => setLoading(false))
  }, [token])

  const handleAccept = async () => {
    if (!user || !token) return

    try {
      await acceptInvitation(token, user.id)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading invitation...</div>
  if (error) return <div className="flex items-center justify-center min-h-screen text-red-500">{error}</div>
  if (!invitation) return <div className="flex items-center justify-center min-h-screen">Invitation not found</div>

  return (
    <div className="container max-w-md py-12">
      <Card>
        <CardHeader>
          <CardTitle>You've been invited!</CardTitle>
          <CardDescription>
            {invitation.organizations.name} has invited you to join as a{' '}
            {invitation.role}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!user ? (
            <div>
              <p className="mb-4">Please sign up or log in to accept this invitation</p>
              <div className="space-y-2">
                <Button onClick={() => navigate('/signup')} className="w-full">
                  Sign Up
                </Button>
                <Button
                  onClick={() => navigate('/login')}
                  variant="outline"
                  className="w-full"
                >
                  Log In
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={handleAccept} className="w-full">
              Accept Invitation
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
