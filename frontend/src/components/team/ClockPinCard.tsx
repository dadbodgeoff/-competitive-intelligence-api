import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

interface ClockPinStatus {
  is_set: boolean
  updated_at?: string | null
}

interface ClockPinCardProps {
  status?: ClockPinStatus
  onSave: (pin: string) => void
  onRemove: () => void
  saving: boolean
  removing: boolean
}

export function ClockPinCard({ status, onSave, onRemove, saving, removing }: ClockPinCardProps) {
  const { toast } = useToast()
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (pin !== confirmPin) {
      toast({
        title: 'PINs do not match',
        description: 'Enter the same 4-digit value in both fields.',
        variant: 'destructive',
      })
      return
    }
    if (!/^\d{4}$/.test(pin)) {
      toast({
        title: 'Invalid PIN',
        description: 'PIN must be exactly four digits.',
        variant: 'destructive',
      })
      return
    }
    onSave(pin)
  }

  return (
    <Card className="bg-card-dark border-white/10">
      <CardHeader>
        <CardTitle className="text-xl text-white">Time Clock PIN</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-slate-400 text-sm">
          Choose a 4-digit PIN to clock in from the public <code className="text-primary-300">/time</code> page. This PIN
          is private to you and can be updated anytime.
        </p>
        <div className="text-sm text-slate-300">
          Status:{' '}
          {status?.is_set ? `Set ${status.updated_at ? `on ${new Date(status.updated_at).toLocaleString()}` : ''}` : 'Not set'}
        </div>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <Label htmlFor="clock-pin" className="text-slate-300">
              New PIN
            </Label>
            <Input
              id="clock-pin"
              type="password"
              inputMode="numeric"
              pattern="\d{4}"
              maxLength={4}
              value={pin}
              onChange={(event) => setPin(event.target.value)}
              placeholder="••••"
              className="bg-obsidian/70 text-white border-white/10 tracking-[0.4em]"
              disabled={saving}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="clock-pin-confirm" className="text-slate-300">
              Confirm PIN
            </Label>
            <Input
              id="clock-pin-confirm"
              type="password"
              inputMode="numeric"
              pattern="\d{4}"
              maxLength={4}
              value={confirmPin}
              onChange={(event) => setConfirmPin(event.target.value)}
              placeholder="••••"
              className="bg-obsidian/70 text-white border-white/10 tracking-[0.4em]"
              disabled={saving}
            />
          </div>
          <div className="col-span-full flex flex-wrap gap-3">
            <Button type="submit" className="bg-primary-500 hover:bg-primary-500" disabled={saving}>
              Save PIN
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={removing || !status?.is_set}
              onClick={onRemove}
            >
              Remove PIN
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

