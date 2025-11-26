/**
 * MemberProfileSheet - Full member profile management
 * Opens when clicking a team member in the list
 * Includes: permissions, module access, compensation, and settings
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  getMemberModuleAccess,
  setMemberModuleAccess,
  clearMemberModuleOverride,
  getMemberPermissions,
  setMemberPermission,
  clearMemberPermissionOverride,
  assignMemberCompensation,
  type MemberModuleAccess,
  type MemberPermission,
} from '@/services/api/accountApi'
import { useToast } from '@/hooks/use-toast'
import {
  User,
  Shield,
  Layers,
  DollarSign,
  Crown,
  Loader2,
  RotateCcw,
  Eye,
  Edit,
  Lock,
  Calendar,
  Clock,
} from 'lucide-react'

interface MemberProfileSheetProps {
  open: boolean
  onClose: () => void
  member: {
    user_id: string
    role: string
    displayName: string
    email?: string
    joined_at?: string | null
  } | null
  isOwner: boolean
  currentCompensation?: {
    rate: number
    currency: string
    rate_type: string
  } | null
}

const categoryIcons = {
  view: Eye,
  edit: Edit,
  financial: DollarSign,
  admin: Shield,
}

const categoryColors = {
  view: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  edit: 'bg-green-500/10 text-green-400 border-green-500/30',
  financial: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  admin: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
}

export function MemberProfileSheet({
  open,
  onClose,
  member,
  isOwner,
  currentCompensation,
}: MemberProfileSheetProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('overview')

  // Compensation form state
  const [compRate, setCompRate] = useState(currentCompensation?.rate?.toString() || '')
  const [compRateType, setCompRateType] = useState<'hourly' | 'salary' | 'contract'>(
    (currentCompensation?.rate_type as 'hourly' | 'salary' | 'contract') || 'hourly'
  )
  const [compCurrency, setCompCurrency] = useState(currentCompensation?.currency || 'USD')
  const [compEffectiveDate, setCompEffectiveDate] = useState('')
  const [compNotes, setCompNotes] = useState('')

  // Fetch module access
  const { data: moduleData, isLoading: modulesLoading } = useQuery({
    queryKey: ['member-modules', member?.user_id],
    queryFn: () => getMemberModuleAccess(member!.user_id),
    enabled: !!member?.user_id && open,
  })

  // Fetch permissions
  const { data: permData, isLoading: permsLoading } = useQuery({
    queryKey: ['member-permissions', member?.user_id],
    queryFn: () => getMemberPermissions(member!.user_id),
    enabled: !!member?.user_id && open,
  })

  // Module access mutations
  const setModuleMutation = useMutation({
    mutationFn: setMemberModuleAccess,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member-modules', member?.user_id] })
      toast({ title: 'Module access updated' })
    },
    onError: (err: Error) => {
      toast({ title: 'Failed to update', description: err.message, variant: 'destructive' })
    },
  })

  const clearModuleMutation = useMutation({
    mutationFn: ({ moduleSlug }: { moduleSlug: string }) =>
      clearMemberModuleOverride(member!.user_id, moduleSlug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member-modules', member?.user_id] })
      toast({ title: 'Reset to account default' })
    },
  })

  // Permission mutations
  const setPermMutation = useMutation({
    mutationFn: setMemberPermission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member-permissions', member?.user_id] })
      toast({ title: 'Permission updated' })
    },
    onError: (err: Error) => {
      toast({ title: 'Failed to update', description: err.message, variant: 'destructive' })
    },
  })

  const clearPermMutation = useMutation({
    mutationFn: ({ permissionSlug }: { permissionSlug: string }) =>
      clearMemberPermissionOverride(member!.user_id, permissionSlug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member-permissions', member?.user_id] })
      toast({ title: 'Reset to role default' })
    },
  })

  // Compensation mutation
  const compMutation = useMutation({
    mutationFn: assignMemberCompensation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-summary'] })
      toast({ title: 'Compensation updated' })
      setCompNotes('')
      setCompEffectiveDate('')
    },
    onError: (err: Error) => {
      toast({ title: 'Failed to update', description: err.message, variant: 'destructive' })
    },
  })

  const handleModuleToggle = (mod: MemberModuleAccess, newValue: boolean) => {
    setModuleMutation.mutate({
      user_id: member!.user_id,
      module_slug: mod.module_slug,
      can_access: newValue,
    })
  }

  const handlePermToggle = (perm: MemberPermission, newValue: boolean) => {
    setPermMutation.mutate({
      user_id: member!.user_id,
      permission_slug: perm.permission_slug,
      is_granted: newValue,
    })
  }

  const handleSaveCompensation = () => {
    const rate = parseFloat(compRate)
    if (isNaN(rate) || rate <= 0) {
      toast({ title: 'Invalid rate', variant: 'destructive' })
      return
    }
    compMutation.mutate({
      user_id: member!.user_id,
      rate,
      currency: compCurrency,
      rate_type: compRateType,
      effective_at: compEffectiveDate || undefined,
      notes: compNotes || undefined,
    })
  }

  // Group permissions by module
  const permsByModule = permData?.permissions.reduce((acc, perm) => {
    const mod = perm.module_slug || 'general'
    if (!acc[mod]) acc[mod] = []
    acc[mod].push(perm)
    return acc
  }, {} as Record<string, MemberPermission[]>) || {}

  if (!member) return null

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl bg-slate-900 border-white/10 overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-primary-500/20 flex items-center justify-center">
              {member.role === 'owner' ? (
                <Crown className="h-7 w-7 text-amber-400" />
              ) : (
                <User className="h-7 w-7 text-primary-400" />
              )}
            </div>
            <div>
              <SheetTitle className="text-xl text-white">{member.displayName}</SheetTitle>
              <SheetDescription className="flex items-center gap-2 mt-1">
                <Badge
                  variant="secondary"
                  className={`capitalize ${
                    member.role === 'owner'
                      ? 'bg-amber-500/20 text-amber-400'
                      : member.role === 'admin'
                      ? 'bg-purple-500/20 text-purple-400'
                      : ''
                  }`}
                >
                  {member.role}
                </Badge>
                {member.email && <span className="text-slate-400">{member.email}</span>}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="bg-white/5 border border-white/10 w-full grid grid-cols-4">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary-500 text-xs">
              Overview
            </TabsTrigger>
            <TabsTrigger value="modules" className="data-[state=active]:bg-primary-500 text-xs">
              Modules
            </TabsTrigger>
            <TabsTrigger value="permissions" className="data-[state=active]:bg-primary-500 text-xs">
              Permissions
            </TabsTrigger>
            {isOwner && (
              <TabsTrigger value="compensation" className="data-[state=active]:bg-primary-500 text-xs">
                Pay
              </TabsTrigger>
            )}
          </TabsList>


          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-4 space-y-4">
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-white">Member Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Role</span>
                  <span className="text-white capitalize">{member.role}</span>
                </div>
                {member.email && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Email</span>
                    <span className="text-white">{member.email}</span>
                  </div>
                )}
                {member.joined_at && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Joined</span>
                    <span className="text-white">
                      {new Date(member.joined_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {currentCompensation && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Pay Rate</span>
                    <span className="text-white">
                      ${currentCompensation.rate.toFixed(2)}/{compRateType === 'hourly' ? 'hr' : compRateType === 'salary' ? 'yr' : 'contract'}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-white/5 border-white/10">
                <CardContent className="py-4 text-center">
                  <Layers className="h-5 w-5 text-primary-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {moduleData?.modules.filter(m => m.can_access).length || 0}
                  </p>
                  <p className="text-xs text-slate-400">Modules Enabled</p>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10">
                <CardContent className="py-4 text-center">
                  <Shield className="h-5 w-5 text-green-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {permData?.permissions.filter(p => p.is_granted).length || 0}
                  </p>
                  <p className="text-xs text-slate-400">Permissions Granted</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Modules Tab */}
          <TabsContent value="modules" className="mt-4 space-y-3">
            {modulesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
              </div>
            ) : (
              moduleData?.modules.map((mod) => (
                <div
                  key={mod.module_slug}
                  className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{mod.module_name}</span>
                      {mod.has_override && (
                        <Badge variant="outline" className="text-xs border-primary-500/30 text-primary-400">
                          Custom
                        </Badge>
                      )}
                      {!mod.has_override && (
                        <Badge variant="outline" className="text-xs border-slate-500/30 text-slate-400">
                          {mod.access_source === 'account' ? 'Account Default' : 'Inherited'}
                        </Badge>
                      )}
                    </div>
                    {mod.module_description && (
                      <p className="text-xs text-slate-400 mt-1">{mod.module_description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {mod.has_override && isOwner && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs text-slate-400"
                        onClick={() => clearModuleMutation.mutate({ moduleSlug: mod.module_slug })}
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Reset
                      </Button>
                    )}
                    <Switch
                      checked={mod.can_access}
                      onCheckedChange={(checked) => handleModuleToggle(mod, checked)}
                      disabled={!isOwner || member.role === 'owner'}
                    />
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions" className="mt-4 space-y-4">
            {permsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
              </div>
            ) : (
              Object.entries(permsByModule).map(([moduleName, perms]) => (
                <Card key={moduleName} className="bg-white/5 border-white/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-white capitalize">
                      {moduleName.replace(/_/g, ' ')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {perms.map((perm) => {
                      const Icon = categoryIcons[perm.category as keyof typeof categoryIcons] || Shield
                      const colorClass = categoryColors[perm.category as keyof typeof categoryColors] || ''
                      
                      return (
                        <div
                          key={perm.permission_slug}
                          className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`p-1.5 rounded-md border ${colorClass}`}>
                              <Icon className="h-3 w-3" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-white">{perm.permission_name}</span>
                                {perm.is_sensitive && (
                                  <Lock className="h-3 w-3 text-amber-400" />
                                )}
                                {perm.has_override && (
                                  <Badge variant="outline" className="text-xs border-primary-500/30 text-primary-400">
                                    Custom
                                  </Badge>
                                )}
                              </div>
                              {perm.description && (
                                <p className="text-xs text-slate-400">{perm.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {perm.has_override && isOwner && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2 text-xs text-slate-400"
                                onClick={() => clearPermMutation.mutate({ permissionSlug: perm.permission_slug })}
                              >
                                <RotateCcw className="h-3 w-3" />
                              </Button>
                            )}
                            <Switch
                              checked={perm.is_granted}
                              onCheckedChange={(checked) => handlePermToggle(perm, checked)}
                              disabled={!isOwner || member.role === 'owner'}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Compensation Tab */}
          {isOwner && (
            <TabsContent value="compensation" className="mt-4 space-y-4">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-base text-white flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-400" />
                    Compensation Settings
                  </CardTitle>
                  <CardDescription>
                    Set pay rate for this team member
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Rate Type</Label>
                      <select
                        value={compRateType}
                        onChange={(e) => setCompRateType(e.target.value as 'hourly' | 'salary' | 'contract')}
                        className="w-full h-10 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white"
                      >
                        <option value="hourly">Hourly</option>
                        <option value="salary">Salary (Annual)</option>
                        <option value="contract">Contract</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Currency</Label>
                      <select
                        value={compCurrency}
                        onChange={(e) => setCompCurrency(e.target.value)}
                        className="w-full h-10 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="CAD">CAD ($)</option>
                        <option value="AUD">AUD ($)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">
                      Rate Amount ({compRateType === 'hourly' ? 'per hour' : compRateType === 'salary' ? 'per year' : 'total'})
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={compRate}
                        onChange={(e) => setCompRate(e.target.value)}
                        className="pl-7 bg-white/5 border-white/10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Effective Date (optional)
                    </Label>
                    <Input
                      type="date"
                      value={compEffectiveDate}
                      onChange={(e) => setCompEffectiveDate(e.target.value)}
                      className="bg-white/5 border-white/10"
                    />
                    <p className="text-xs text-slate-500">
                      Leave blank to apply immediately
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">Notes (optional)</Label>
                    <Input
                      placeholder="e.g., Annual raise, promotion..."
                      value={compNotes}
                      onChange={(e) => setCompNotes(e.target.value)}
                      className="bg-white/5 border-white/10"
                    />
                  </div>

                  <Button
                    onClick={handleSaveCompensation}
                    disabled={compMutation.isPending || !compRate}
                    className="w-full bg-primary-500 hover:bg-primary-600"
                  >
                    {compMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <DollarSign className="h-4 w-4 mr-2" />
                    )}
                    Save Compensation
                  </Button>
                </CardContent>
              </Card>

              {currentCompensation && (
                <Card className="bg-green-500/10 border-green-500/20">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-green-400" />
                      <div>
                        <p className="text-sm text-green-300">Current Rate</p>
                        <p className="text-lg font-semibold text-white">
                          ${currentCompensation.rate.toFixed(2)} {currentCompensation.currency}
                          <span className="text-sm font-normal text-slate-400 ml-1">
                            ({currentCompensation.rate_type})
                          </span>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
