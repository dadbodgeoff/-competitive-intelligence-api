import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface SchedulePreferencesCardProps {
  weekStartDay: number | null
  options: Array<{ value: number; label: string }>
  loading: boolean
  saving: boolean
  onWeekStartChange: (value: number | null) => void
  onSave: () => void
}

export function SchedulePreferencesCard({
  weekStartDay,
  options,
  loading,
  saving,
  onWeekStartChange,
  onSave,
}: SchedulePreferencesCardProps) {
  return (
    <Card className="bg-card-dark border-white/10">
      <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Schedule preferences</CardTitle>
          <p className="text-sm text-slate-400">
            Pick the day your scheduling weeks begin. When you create a new week, it will span the next six days starting
            from that date.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="space-y-1">
            <Label htmlFor="week-start-day">Week starts on</Label>
            <select
              id="week-start-day"
              value={weekStartDay ?? ''}
              onChange={(event) => {
                const value = event.target.value
                onWeekStartChange(value === '' ? null : Number(value))
              }}
              disabled={loading || saving}
              className="w-48 rounded-md border border-white/10 bg-obsidian px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            >
              <option value="" disabled>
                {loading ? 'Loading…' : 'Select a weekday'}
              </option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <Button className="btn-primary" onClick={onSave} disabled={loading || saving || weekStartDay === null}>
            Save preferences
          </Button>
        </div>
      </CardHeader>
    </Card>
  )
}

