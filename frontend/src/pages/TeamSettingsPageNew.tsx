/**
 * TeamSettingsPage - Revolutionized Team Management
 * Individual member permissions, not all-or-nothing
 */

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppShell } from '@/components/layout/AppShell'
import { ModulePageHeader } from '@/components/layout/ModulePageHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import {
  fetchAccountSummary,
  inviteAccountMember,
  setClockPin,
  clearClockPin,
  updateModuleAccess,
  type AccountSummaryResponse,
} from '@/services/api/accountApi'
import { MemberProfileSheet } from '@/components/team/MemberProfileSheet'
import { LocationCodeCard } from '@/components/team/LocationCodeCard'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/hooks/use-toast'
import {
  Users,
  Settings,
  Shield,
  UserPlus,
  Clock,
  ChevronRight,
  Mail,
  Building2,
  Crown,
  Loader2,
  Search,
} from 'lucide-react'

type MemberRecord = AccountSummaryResponse['members'][number]

export function TeamSettingsPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const isOwner = user?.account_role === 'owner'

  const [activeTab, setActiveTab] = useState('members')
  const [selectedMember, setSelectedMember] = useState<MemberRecord | null>(null)
  const [profileSheetOpen, setProfileSheetOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member')

  // Module toggle mutation
  const moduleMutation = useMutation({
    mutationFn: ({ slug, enabled }: { slug: string; enabled: boolean }) =>
      updateModuleAccess(slug, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-summary'] })
      toast({ title: 'Module updated' })
    },
    onError: (err: Error) => {
      toast({ title: 'Failed to update', description: err.message, variant: 'destructive' })
    },
  })

  // Clock PIN state
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['account-summary'],
    queryFn: fetchAccountSummary,
    refetchOnWindowFocus: false,
  })

  const inviteMutation = useMutation({
    mutationFn: inviteAccountMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-summary'] })
      toast({ title: 'Invitation sent', description: 'The invite email has been sent.' })
      setInviteEmail('')
      setInviteRole('member')
    },
    onError: (err: Error) => {
      toast({ title: 'Failed to invite', description: err.message, variant: 'destructive' })
    },
  })



  const clockPinMutation = useMutation({
    mutationFn: setClockPin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-summary'] })
      toast({ title: 'PIN updated' })
      setPin('')
      setConfirmPin('')
    },
    onError: (err: Error) => {
      toast({ title: 'Failed to save PIN', description: err.message, variant: 'destructive' })
    },
  })

  const clearPinMutation = useMutation({
    mutationFn: clearClockPin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-summary'] })
      toast({ title: 'PIN removed' })
    },
    onError: (err: Error) => {
      toast({ title: 'Failed to remove PIN', description: err.message, variant: 'destructive' })
    },
  })

  // Build compensation lookup
  const activeCompensation = useMemo(() => {
    const map = new Map<string, { rate: number; currency: string; rate_type: string }>()
    data?.compensation.forEach((record) => {
      if (!record.ends_at) {
        map.set(record.user_id, {
          rate: record.rate_cents / 100,
          currency: record.currency,
          rate_type: record.rate_type,
        })
      }
    })
    return map
  }, [data?.compensation])

  // Filter members by search
  const filteredMembers = useMemo(() => {
    if (!data?.members) return []
    if (!searchQuery.trim()) return data.members

    const query = searchQuery.toLowerCase()
    return data.members.filter((member) => {
      const name = getMemberDisplayName(member).toLowerCase()
      const email = member.auth_users?.email?.toLowerCase() || ''
      return name.includes(query) || email.includes(query)
    })
  }, [data?.members, searchQuery])

  const currentMember = data?.members.find((m) => m.user_id === user?.id)
  const pinStatus = currentMember?.clock_pin

  const handleOpenProfile = (member: MemberRecord) => {
    setSelectedMember(member)
    setProfileSheetOpen(true)
  }

  const handleSavePin = () => {
    if (pin !== confirmPin) {
      toast({ title: 'PINs do not match', variant: 'destructive' })
      return
    }
    if (!/^\d{4}$/.test(pin)) {
      toast({ title: 'PIN must be 4 digits', variant: 'destructive' })
      return
    }
    clockPinMutation.mutate(pin)
  }

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      </AppShell>
    )
  }

  if (isError || !data) {
    return (
      <AppShell>
        <div className="text-center py-12">
          <p className="text-red-400">Failed to load team settings</p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <ModulePageHeader
          icon={Users}
          title="Team & Modules"
          description="Manage team members, permissions, and module access"
          actions={
            isOwner ? (
              <Button
                onClick={() => setActiveTab('invites')}
                size="sm"
                className="bg-primary-500 hover:bg-primary-600 text-white h-8 text-xs"
              >
                <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                Invite Member
              </Button>
            ) : undefined
          }
        />

        {/* Account Overview */}
        <Card className="bg-gradient-to-br from-primary-500/10 to-primary-600/5 border-primary-500/20">
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-primary-500/20 flex items-center justify-center">
                <Building2 className="h-7 w-7 text-primary-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-white">
                  {data.account.name || 'My Restaurant'}
                </h2>
                <div className="flex items-center gap-3 mt-1">
                  <Badge variant="secondary" className="capitalize">
                    {data.account.plan} Plan
                  </Badge>
                  <span className="text-sm text-slate-400">
                    {data.members.length} team member{data.members.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="members" className="data-[state=active]:bg-primary-500">
              <Users className="h-4 w-4 mr-2" />
              Team
            </TabsTrigger>
            {isOwner && (
              <TabsTrigger value="modules" className="data-[state=active]:bg-primary-500">
                <Shield className="h-4 w-4 mr-2" />
                Modules
              </TabsTrigger>
            )}
            <TabsTrigger value="invites" className="data-[state=active]:bg-primary-500">
              <UserPlus className="h-4 w-4 mr-2" />
              Invites
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-primary-500">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Modules Tab (Owner only) */}
          {isOwner && (
            <TabsContent value="modules" className="mt-6 space-y-4">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg">Account Module Access</CardTitle>
                  <CardDescription>
                    Enable or disable modules for your entire account. Individual member access can be customized by clicking on a team member.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {data.modules.map((module) => (
                    <div
                      key={module.module_slug}
                      className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div>
                        <p className="text-white font-medium capitalize">
                          {module.module_slug.replace(/_/g, ' ')}
                        </p>
                        <p className="text-sm text-slate-400">
                          {module.can_access ? 'Enabled for all members' : 'Disabled'}
                        </p>
                      </div>
                      <Switch
                        checked={module.can_access}
                        onCheckedChange={(checked) =>
                          moduleMutation.mutate({ slug: module.module_slug, enabled: checked })
                        }
                        disabled={moduleMutation.isPending}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Team Members Tab */}
          <TabsContent value="members" className="mt-6 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search team members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10"
              />
            </div>

            {/* Members List */}
            <div className="space-y-3">
              {filteredMembers.map((member) => {
                const displayName = getMemberDisplayName(member)
                const comp = activeCompensation.get(member.user_id)
                const isCurrentUser = member.user_id === user?.id

                return (
                  <Card
                    key={member.user_id}
                    className="bg-white/5 border-white/10 hover:border-primary-500/50 hover:bg-white/[0.07] transition-all cursor-pointer"
                    onClick={() => handleOpenProfile(member)}
                  >
                    <CardContent className="py-4">
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="h-12 w-12 rounded-full bg-slate-700 flex items-center justify-center">
                          {member.role === 'owner' ? (
                            <Crown className="h-5 w-5 text-amber-400" />
                          ) : (
                            <span className="text-lg font-medium text-white">
                              {displayName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white truncate">
                              {displayName}
                            </span>
                            {isCurrentUser && (
                              <Badge variant="outline" className="text-xs">You</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <Badge
                              variant="secondary"
                              className={`capitalize text-xs ${
                                member.role === 'owner'
                                  ? 'bg-amber-500/20 text-amber-400'
                                  : member.role === 'admin'
                                  ? 'bg-purple-500/20 text-purple-400'
                                  : ''
                              }`}
                            >
                              {member.role}
                            </Badge>
                            {member.auth_users?.email && (
                              <span className="text-xs text-slate-400 truncate">
                                {member.auth_users.email}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Pay Rate (owner only) */}
                        {isOwner && comp && (
                          <div className="text-right hidden sm:block">
                            <span className="text-sm text-slate-300">
                              ${comp.rate.toFixed(2)}/{comp.rate_type === 'hourly' ? 'hr' : comp.rate_type === 'salary' ? 'yr' : ''}
                            </span>
                          </div>
                        )}

                        {/* Click indicator */}
                        <ChevronRight className="h-5 w-5 text-slate-500" />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Invitations Tab */}
          <TabsContent value="invites" className="mt-6 space-y-6">
            {/* Invite Form */}
            {isOwner && (
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg">Invite Team Member</CardTitle>
                  <CardDescription>
                    Send an invitation to add someone to your team
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <Input
                        type="email"
                        placeholder="team@restaurant.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
                        className="w-full h-10 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                  <Button
                    onClick={() => inviteMutation.mutate({ email: inviteEmail, role: inviteRole })}
                    disabled={!inviteEmail || inviteMutation.isPending}
                    className="bg-primary-500 hover:bg-primary-600"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send Invitation
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Pending Invitations */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg">Pending Invitations</CardTitle>
              </CardHeader>
              <CardContent>
                {data.invitations.length === 0 ? (
                  <p className="text-sm text-slate-400">No pending invitations</p>
                ) : (
                  <div className="space-y-3">
                    {data.invitations.map((invite) => (
                      <div
                        key={invite.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                      >
                        <div>
                          <p className="text-sm text-white">{invite.email}</p>
                          <p className="text-xs text-slate-400">
                            {invite.role} • expires{' '}
                            {new Date(invite.expires_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          variant={invite.status === 'pending' ? 'secondary' : 'outline'}
                          className="capitalize"
                        >
                          {invite.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Settings Tab */}
          <TabsContent value="settings" className="mt-6 space-y-6">
            {/* Location Code (for owners/admins) */}
            {(isOwner || user?.account_role === 'admin') && data.account.clock_location_code && (
              <LocationCodeCard
                locationCode={data.account.clock_location_code}
                accountName={data.account.name ?? undefined}
              />
            )}

            {/* Clock PIN */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary-400" />
                  Time Clock PIN
                </CardTitle>
                <CardDescription>
                  Set a 4-digit PIN to clock in from the public time clock page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-slate-300">
                  Status:{' '}
                  {pinStatus?.is_set ? (
                    <span className="text-green-400">PIN is set</span>
                  ) : (
                    <span className="text-slate-400">Not set</span>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>New PIN</Label>
                    <Input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="••••"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      className="bg-white/5 border-white/10 tracking-[0.4em]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm PIN</Label>
                    <Input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="••••"
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value)}
                      className="bg-white/5 border-white/10 tracking-[0.4em]"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleSavePin}
                    disabled={clockPinMutation.isPending}
                    className="bg-primary-500 hover:bg-primary-600"
                  >
                    Save PIN
                  </Button>
                  {pinStatus?.is_set && (
                    <Button
                      variant="outline"
                      onClick={() => clearPinMutation.mutate()}
                      disabled={clearPinMutation.isPending}
                    >
                      Remove PIN
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Member Profile Sheet */}
      <MemberProfileSheet
        open={profileSheetOpen}
        onClose={() => setProfileSheetOpen(false)}
        member={
          selectedMember
            ? {
                user_id: selectedMember.user_id,
                role: selectedMember.role,
                displayName: getMemberDisplayName(selectedMember),
                email: selectedMember.auth_users?.email,
                joined_at: selectedMember.joined_at,
              }
            : null
        }
        isOwner={isOwner}
        currentCompensation={
          selectedMember ? activeCompensation.get(selectedMember.user_id) : null
        }
      />
    </AppShell>
  )
}

function getMemberDisplayName(member: MemberRecord): string {
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
  return (firstName || lastName) ? `${firstName} ${lastName}`.trim() : member.auth_users?.email ?? 'Team Member'
}

export { TeamSettingsPage as TeamSettingsPageNew }
