import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'

interface ModuleAccess {
  module_slug: string
  can_access: boolean
}

interface ModuleAccessCardProps {
  modules: ModuleAccess[]
  isOwner: boolean
  isUpdating: boolean
  onToggle: (slug: string, enabled: boolean) => void
}

export function ModuleAccessCard({ modules, isOwner, isUpdating, onToggle }: ModuleAccessCardProps) {
  return (
    <Card className="bg-card-dark border-white/10">
      <CardHeader>
        <CardTitle className="text-xl text-white">Module Access</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {modules.map((module) => (
          <div
            key={module.module_slug}
            className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-4"
          >
            <div>
              <p className="text-white font-medium">{module.module_slug.replace(/_/g, ' ')}</p>
              <p className="text-sm text-slate-400">
                {module.can_access ? 'Enabled for all members' : 'Disabled'}
              </p>
            </div>
            <Switch
              checked={module.can_access}
              onCheckedChange={(checked) => onToggle(module.module_slug, checked)}
              disabled={!isOwner || isUpdating}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

