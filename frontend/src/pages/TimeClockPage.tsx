import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { clockWithPin } from '@/services/api/schedulingApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { toast } from '@/hooks/use-toast'

export function TimeClockPage() {
  const [pin, setPin] = useState('')
  const [resultMessage, setResultMessage] = useState<string | null>(null)
  const [statusLabel, setStatusLabel] = useState<'clocked_in' | 'clocked_out' | null>(null)

  const mutation = useMutation({
    mutationFn: () => clockWithPin(pin),
    onSuccess: (data) => {
      setStatusLabel(data.status)
      setResultMessage(data.message)
      setPin('')
    },
    onError: (error: any) => {
      setStatusLabel(null)
      setResultMessage(null)
      toast({
        title: 'PIN check failed',
        description: error?.message ?? 'Please try again.',
        variant: 'destructive',
      })
    },
  })

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-obsidian/80 border-white/10">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl text-white text-center">Team Time Clock</CardTitle>
          <p className="text-center text-slate-400 text-sm">
            Enter your 4-digit PIN to clock in or out. You&apos;ll see a confirmation right away.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault()
              if (!/^\d{4}$/.test(pin)) {
                toast({
                  title: 'Invalid PIN',
                  description: 'PIN must be exactly four digits.',
                  variant: 'destructive',
                })
                return
              }
              mutation.mutate()
            }}
          >
            <Input
              type="password"
              inputMode="numeric"
              pattern="\d{4}"
              maxLength={4}
              placeholder="••••"
              className="text-center text-2xl tracking-[0.4em] bg-white/10 text-white border-white/20"
              value={pin}
              onChange={(event) => setPin(event.target.value)}
              disabled={mutation.isPending}
            />
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500" disabled={mutation.isPending}>
              {mutation.isPending ? 'Checking...' : 'Submit PIN'}
            </Button>
          </form>

          {resultMessage && statusLabel && (
            <Alert
              variant={['clocked_in', 'clocked_out'].includes(statusLabel) ? 'default' : 'destructive'}
              className="bg-white/10 text-white"
            >
              <AlertTitle className="capitalize">{statusLabel.replace('_', ' ')}</AlertTitle>
              <AlertDescription>{resultMessage}</AlertDescription>
            </Alert>
          )}

          <p className="text-center text-xs text-slate-500">
            Need help? Contact your manager to reset your PIN in Team Settings.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

