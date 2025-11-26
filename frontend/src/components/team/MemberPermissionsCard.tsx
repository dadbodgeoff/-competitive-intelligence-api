/**
 * MemberPermissionsCard - Granular permission management for team members
 * Allows owners to control exactly what each member can see/do
 */

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  getMemberPermissions,
  setMemberPermission,
  clearMemberPermissionOverride,
  type MemberPermission,
} from '@/services/api/accountApi'
import { useToast } from '@/hooks/use-toast'
import {
  Eye,
  Edit,
  DollarSign,
  Shield,
  RotateCcw,
  Loader2,
  Lock,
  User,
} from 'lucide-react'

interface MemberPermissionsCardProps {
  member: {
    user_id: string
    role: string
    displayName: string
  }
  isOwner: boolean
}

const categoryIcons = {
  view: Eye,
  edit: Edit,
  financial: DollarSign,
  admin: Shield,
}

const categoryLabels = {
  view: 'View Access',
  edit: 'Edit Access',
  financial: 'Financial Data',
  admin: 'Admin Controls',
}

const categoryColors = {
  view: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  edit: 'bg-green-500/10 text-green-400 border-green-500/30',
  financial: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  admin: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
}

export function MemberPermissionsCard({ member, isOwner }: MemberPermissionsCardProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [activeModule, setActiveModule] = useState<string>('all')

  const { data, isLoading, error } = useQuery({
    queryKey: ['member-permissions', member.user_id],
    queryFn: () => getMemberPermissions(member.user_id),
  })

  const setPermissionMutation = useMutation({
    mutationFn: setMemberPermission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member-permissions', member.user_id] })
      toast({ title: 'Permission updated' })
    },
    onError: (err: Error) => {
      toast({ title: 'Failed to update', description: err.message, variant: 'destructive' })
    },
  })

  const clearOverrideMutation = useMutation({
    mutationFn: ({ permissionSlug }: { permissionSlug: string }) =>
      clearMemberPermissionOverride(member.user_id, permissionSlug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member-permissions', member.user_id] })
      toast({ title: 'Reset to default' })
    },
    onError: (err: Error) => {
      toast({ title: 'Failed to reset', description: err.message, variant: 'destructive' })
    },
  })

  // Group permissions by module
  const permissionsByModule = useMemo(() => {
    if (!data?.permissions) return {}
    const grouped: Record<string, MemberPermission[]> = {}
    for (const perm of data.permissions) {
      const module = perm.module_slug || 'general'
      if (!grouped[module]) grouped[module] = []
      grouped[module].push(perm)
    }
    return grouped
  }, [data?.permissions])

  const modules = useMemo(() => Object.keys(permissionsByModule).sort(), [permissionsByModule])

  const filteredPermissions = useMemo(() => {
    if (activeModule === 'all') return data?.permissions || []
    return permissionsByModule[activeModule] || []
  }, [activeModule, data?.permissions, permissionsByModule])

  // Group filtered permissions by category
  const permissionsByCategory = useMemo(() => {
    const grouped: Record<string, MemberPermission[]> = {
      view: [],
      edit: [],
      financial: [],
      admin: [],
    }
    for (const perm of filteredPermissions) {
      const cat = perm.category as keyof typeof grouped
      if (grouped[cat]) grouped[cat].push(perm)
    }
    return grouped
  }, [filteredPermissions])

  const handleToggle = (perm: MemberPermission, newValue: boolean) => {
    setPermissionMutation.mutate({
      user_id: member.user_id,
      permission_slug: perm.permission_slug,
      is_granted: newValue,
    })
  }

  const handleReset = (perm: MemberPermission) => {
    clearOverrideMutation.mutate({ permissionSlug: perm.permission_slug })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-400">
        Failed to load permissions
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Member Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-white/10">
        <div className="h-12 w-12 rounded-full bg-primary-500/20 flex items-center justify-center">
          <User className="h-6 w-6 text-primary-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">{member.displayName}</h3>
          <Badge variant="secondary" className="capitalize mt-1">
            {member.role}
          </Badge>
        </div>
      </div>

      {/* Module Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={activeModule === 'all' ? 'default' : 'outline'}
          onClick={() => setActiveModule('all')}
          className="text-xs"
        >
          All Modules
        </Button>
        {modules.map((mod) => (
          <Button
            key={mod}
            size="sm"
            variant={activeModule === mod ? 'default' : 'outline'}
            onClick={() => setActiveModule(mod)}
            className="text-xs capitalize"
          >
            {mod.replace(/_/g, ' ')}
          </Button>
        ))}
      </div>

      {/* Permissions by Category */}
      <div className="space-y-6">
        {Object.entries(permissionsByCategory).map(([category, perms]) => {
          if (perms.length === 0) return null
          const Icon = categoryIcons[category as keyof typeof categoryIcons]
          const label = categoryLabels[category as keyof typeof categoryLabels]
          const colorClass = categoryColors[category as keyof typeof categoryColors]

          return (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-md border ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-white">{label}</span>
                {category === 'financial' && (
                  <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-400">
                    <Lock className="h-3 w-3 mr-1" />
                    Sensitive
                  </Badge>
                )}
              </div>

              <div className="space-y-2 pl-8">
                {perms.map((perm) => (
                  <div
                    key={perm.permission_slug}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white">{perm.permission_name}</span>
                        {perm.has_override && (
                          <Badge variant="outline" className="text-xs border-primary-500/30 text-primary-400">
                            Custom
                          </Badge>
                        )}
                      </div>
                      {perm.description && (
                        <p className="text-xs text-slate-400 mt-0.5 truncate">
                          {perm.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {perm.has_override && isOwner && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs text-slate-400 hover:text-white"
                          onClick={() => handleReset(perm)}
                          disabled={clearOverrideMutation.isPending}
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Reset
                        </Button>
                      )}
                      <Switch
                        checked={perm.is_granted}
                        onCheckedChange={(checked) => handleToggle(perm, checked)}
                        disabled={!isOwner || setPermissionMutation.isPending}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
