import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface AccountOverviewCardProps {
  accountName: string | null
  plan: string
  memberCount: number
  ownerEmail?: string | null
}

export function AccountOverviewCard({ accountName, plan, memberCount, ownerEmail }: AccountOverviewCardProps) {
  return (
    <Card className="bg-card-dark border-white/10">
      <CardHeader>
        <CardTitle className="text-xl text-white">Account Overview</CardTitle>
      </CardHeader>
      <CardContent className="text-slate-300 space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-100">Account:</span>
          <span>{accountName ?? 'Untitled Account'}</span>
          <Badge variant="secondary" className="ml-2 capitalize">
            {plan}
          </Badge>
        </div>
        <div>
          <span className="font-medium text-slate-100">Members:</span>{' '}
          <span>{memberCount}</span>
        </div>
        {ownerEmail && (
          <div>
            <span className="font-medium text-slate-100">Owner:</span>{' '}
            <span>{ownerEmail}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

