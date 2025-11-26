import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { AccountSummaryResponse } from '@/services/api/accountApi'
import { useToast } from '@/hooks/use-toast'

type MemberRecord = AccountSummaryResponse['members'][number]

interface TeamMembersCardProps {
  members: MemberRecord[]
  compensationLookup: Map<string, { rate: number; currency: string; rate_type: string }>
  isOwner: boolean
  onAssignCompensation: (payload: { user_id: string; rate: number; notes?: string }) => void
  assigning: boolean
}

export function TeamMembersCard({ members, compensationLookup, isOwner, onAssignCompensation, assigning }: TeamMembersCardProps) {
  const { toast } = useToast()

  const sortedMembers = useMemo(
    () => [...members].sort((a, b) => a.role.localeCompare(b.role)),
    [members],
  )

  return (
    <Card className="bg-card-dark border-white/10">
      <CardHeader>
        <CardTitle className="text-xl text-white">Team Members</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedMembers.map((member) => {
          const rawMeta = member.auth_users?.raw_user_meta_data as Record<string, unknown> | undefined
          const firstName =
            member.auth_users?.first_name ??
            member.profile?.first_name ??
            (rawMeta?.first_name as string | undefined) ??
            ''
          const lastName =
            member.auth_users?.last_name ??
            member.profile?.last_name ??
            (rawMeta?.last_name as string | undefined) ??
            ''
          const displayName =
            (firstName || lastName) ? `${firstName} ${lastName}`.trim() : member.auth_users?.email ?? 'Member'
          const currentRate = compensationLookup.get(member.user_id)

          return (
            <div key={member.user_id} className="rounded-lg border border-white/5 bg-white/5 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{displayName}</p>
                  <p className="text-xs uppercase tracking-wide text-slate-400">{member.role}</p>
                </div>
                <Badge variant={member.status === 'active' ? 'secondary' : 'outline'} className="capitalize">
                  {member.status}
                </Badge>
              </div>
              <div className="text-sm text-slate-300">
                Current rate:{' '}
                {currentRate
                  ? `$${currentRate.rate.toFixed(2)} ${currentRate.currency} (${currentRate.rate_type})`
                  : 'Not set'}
              </div>
              {isOwner && member.status === 'active' && (
                <form
                  className="flex items-center gap-2"
                  onSubmit={(event) => {
                    event.preventDefault()
                    const formData = new FormData(event.currentTarget)
                    const rate = Number(formData.get('rate'))
                    const notes = String(formData.get('notes') || '')
                    if (Number.isNaN(rate) || rate <= 0) {
                      toast({
                        title: 'Invalid rate',
                        description: 'Enter a rate greater than zero.',
                        variant: 'destructive',
                      })
                      return
                    }
                    onAssignCompensation({ user_id: member.user_id, rate, notes })
                    event.currentTarget.reset()
                  }}
                >
                  <div className="flex flex-1 items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`rate-${member.user_id}`} className="text-xs text-slate-400">
                        Rate ($/hr)
                      </Label>
                      <Input
                        id={`rate-${member.user_id}`}
                        name="rate"
                        type="number"
                        step="0.01"
                        min="0"
                        className="h-9 w-28 bg-obsidian/70 text-white border-white/10"
                        placeholder="25.00"
                      />
                    </div>
                    <Input
                      name="notes"
                      placeholder="Notes (optional)"
                      className="h-9 bg-obsidian/70 text-white border-white/10"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={assigning}
                    className="bg-primary-500 hover:bg-primary-600"
                  >
                    Save
                  </Button>
                </form>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

