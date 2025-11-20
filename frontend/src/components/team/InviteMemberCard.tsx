import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

interface InviteMemberCardProps {
  isOwner: boolean
  isInviting: boolean
  invitations: Array<{
    id: string
    email: string
    role: string
    status: string
    expires_at: string
  }>
  onInvite: (payload: { email: string; role: 'owner' | 'admin' | 'member' }) => void
}

export function InviteMemberCard({ isOwner, isInviting, invitations, onInvite }: InviteMemberCardProps) {
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'owner' | 'admin' | 'member'>('member')

  return (
    <Card className="bg-card-dark border-white/10">
      <CardHeader>
        <CardTitle className="text-xl text-white">Invite Team Member</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="invite-email" className="text-slate-300">
            Email
          </Label>
          <Input
            id="invite-email"
            type="email"
            placeholder="manager@restaurant.com"
            className="bg-obsidian/70 text-white border-white/10"
            value={inviteEmail}
            onChange={(event) => setInviteEmail(event.target.value)}
            disabled={!isOwner || isInviting}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="invite-role" className="text-slate-300">
            Role
          </Label>
          <select
            id="invite-role"
            className="w-full rounded-md border border-white/10 bg-obsidian/70 px-3 py-2 text-sm text-white"
            value={inviteRole}
            onChange={(event) => setInviteRole(event.target.value as 'owner' | 'admin' | 'member')}
            disabled={!isOwner || isInviting}
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <Button
          onClick={() => {
            onInvite({ email: inviteEmail, role: inviteRole })
            setInviteEmail('')
            setInviteRole('member')
          }}
          disabled={!isOwner || isInviting || !inviteEmail}
          className="bg-emerald-600 hover:bg-emerald-500"
        >
          Send Invite
        </Button>

        <div className="text-xs text-slate-400">
          Invited users will receive an email with a link to join this account. Existing Supabase accounts matching the
          email will be added immediately.
        </div>

        <div className="border-t border-white/5 pt-4 space-y-3">
          <h3 className="text-sm font-semibold text-white">Pending invitations</h3>
          {invitations.length === 0 && <p className="text-xs text-slate-500">No pending invites.</p>}
          {invitations.map((invite) => (
            <div key={invite.id} className="flex items-center justify-between text-sm text-slate-300">
              <div>
                <p className="font-medium">{invite.email}</p>
                <p className="text-xs text-slate-500">
                  {invite.role} • expires {new Date(invite.expires_at).toLocaleDateString()}
                </p>
              </div>
              <Badge variant={invite.status === 'pending' ? 'secondary' : 'outline'} className="capitalize">
                {invite.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

