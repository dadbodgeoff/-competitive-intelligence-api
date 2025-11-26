/**
 * SidebarClockIn Component
 * Quick clock in/out widget for the sidebar
 * Auto-fills the restaurant's 4-digit location code when logged in
 */

import { useState, useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Clock, Check, X, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { apiClient, safeRequest } from '@/services/api/client'
import { fetchAccountSummary } from '@/services/api/accountApi'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

interface ClockResponse {
  status: 'clocked_in' | 'clocked_out'
  account_id: string
  account_name: string
  member_user_id: string
  member_name: string
  shift_id: string
  session_id?: string
  entry_id?: string
  occurred_at: string
  message: string
}

async function clockWithLocationPin(locationCode: string, pin: string): Promise<ClockResponse> {
  const result = await safeRequest<ClockResponse>(() =>
    apiClient.post('/api/v1/scheduling/timeclock/clock', { location_code: locationCode, pin })
  )
  if (!result.success || !result.data) {
    throw new Error(result.error?.message || 'Clock operation failed')
  }
  return result.data
}

export function SidebarClockIn() {
  const [isOpen, setIsOpen] = useState(false)
  const [pin, setPin] = useState('')
  const [lastResult, setLastResult] = useState<ClockResponse | null>(null)
  const [showResult, setShowResult] = useState(false)

  // Fetch account data to get the location code
  const { data: accountData } = useQuery({
    queryKey: ['account-summary'],
    queryFn: fetchAccountSummary,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const locationCode = accountData?.account?.clock_location_code || ''

  const clockMutation = useMutation({
    mutationFn: () => clockWithLocationPin(locationCode, pin),
    onSuccess: (data) => {
      setLastResult(data)
      setShowResult(true)
      setPin('')
      
      // Auto-hide result after 3 seconds
      setTimeout(() => {
        setShowResult(false)
        setLastResult(null)
      }, 3000)
    },
    onError: (error: Error) => {
      toast({
        title: 'Clock Failed',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!locationCode) {
      toast({
        title: 'No Location Code',
        description: 'Your account does not have a location code set up.',
        variant: 'destructive',
      })
      return
    }
    
    if (!/^\d{4}$/.test(pin)) {
      toast({
        title: 'Invalid PIN',
        description: 'PIN must be exactly 4 digits.',
        variant: 'destructive',
      })
      return
    }
    
    clockMutation.mutate()
  }

  // Reset result when closing
  useEffect(() => {
    if (!isOpen) {
      setShowResult(false)
      setLastResult(null)
      setPin('')
    }
  }, [isOpen])

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-white/10"
        >
          <Clock className="h-4 w-4" />
          <span>Clock In/Out</span>
          {locationCode && (
            <span className="ml-auto text-xs text-slate-500 font-mono">
              {locationCode}
            </span>
          )}
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="px-3 pb-3">
        {showResult && lastResult ? (
          // Result display
          <div
            className={`rounded-md p-3 text-sm ${
              lastResult.status === 'clocked_in'
                ? 'bg-green-500/10 border border-green-500/30 text-green-300'
                : 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {lastResult.status === 'clocked_in' ? (
                <Check className="h-4 w-4" />
              ) : (
                <X className="h-4 w-4" />
              )}
              <div>
                <p className="font-medium">
                  {lastResult.status === 'clocked_in' ? 'Clocked In' : 'Clocked Out'}
                </p>
                <p className="text-xs opacity-80">
                  {new Date(lastResult.occurred_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>
        ) : (
          // PIN entry form
          <form onSubmit={handleSubmit} className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label className="text-xs text-slate-400">
                Restaurant Code (auto-filled)
              </Label>
              <Input
                type="text"
                value={locationCode}
                disabled
                className="h-8 text-center font-mono tracking-widest bg-white/5 text-slate-400 border-white/10"
              />
            </div>
            
            <div className="space-y-1">
              <Label className="text-xs text-slate-400">
                Your 4-Digit PIN
              </Label>
              <Input
                type="password"
                inputMode="numeric"
                pattern="\d{4}"
                maxLength={4}
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                disabled={clockMutation.isPending || !locationCode}
                className="h-8 text-center font-mono tracking-widest bg-white/10 text-white border-white/20"
                autoFocus={isOpen}
              />
            </div>
            
            <Button
              type="submit"
              size="sm"
              className="w-full bg-primary-500 hover:bg-primary-600"
              disabled={clockMutation.isPending || pin.length !== 4 || !locationCode}
            >
              {clockMutation.isPending ? (
                <>
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Clock In / Out'
              )}
            </Button>
            
            {!locationCode && (
              <p className="text-xs text-amber-400">
                No location code found. Contact your admin.
              </p>
            )}
          </form>
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}
