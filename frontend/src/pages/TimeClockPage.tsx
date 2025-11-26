import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Clock, MapPin, KeyRound, ArrowLeft, Check, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { toast } from '@/hooks/use-toast'
import { apiClient, safeRequest } from '@/services/api/client'

const STORAGE_KEY = 'timeclock_location'

interface LocationValidation {
  valid: boolean
  location_code: string
  account_id: string
  account_name: string
}

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

async function validateLocation(code: string): Promise<LocationValidation> {
  const result = await safeRequest<LocationValidation>(() =>
    apiClient.post('/api/v1/scheduling/timeclock/validate-location', { location_code: code })
  )
  if (!result.success || !result.data) {
    throw new Error(result.error?.message || 'Invalid location code')
  }
  return result.data
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

type Step = 'location' | 'pin' | 'result'

export function TimeClockPage() {
  const [step, setStep] = useState<Step>('location')
  const [locationCode, setLocationCode] = useState('')
  const [pin, setPin] = useState('')
  const [rememberLocation, setRememberLocation] = useState(false)
  const [validatedLocation, setValidatedLocation] = useState<LocationValidation | null>(null)
  const [clockResult, setClockResult] = useState<ClockResponse | null>(null)

  // Load saved location on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.location_code && parsed.account_name) {
          setLocationCode(parsed.location_code)
          setValidatedLocation(parsed)
          setRememberLocation(true)
          setStep('pin')
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  const locationMutation = useMutation({
    mutationFn: () => validateLocation(locationCode),
    onSuccess: (data) => {
      setValidatedLocation(data)
      if (rememberLocation) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      }
      setStep('pin')
    },
    onError: (error: Error) => {
      toast({
        title: 'Invalid Location',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const clockMutation = useMutation({
    mutationFn: () => clockWithLocationPin(locationCode, pin),
    onSuccess: (data) => {
      setClockResult(data)
      setStep('result')
      setPin('')
    },
    onError: (error: Error) => {
      toast({
        title: 'Clock Failed',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^\d{4}$/.test(locationCode)) {
      toast({
        title: 'Invalid Code',
        description: 'Location code must be exactly 4 digits.',
        variant: 'destructive',
      })
      return
    }
    locationMutation.mutate()
  }

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault()
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

  const handleChangeLocation = () => {
    localStorage.removeItem(STORAGE_KEY)
    setValidatedLocation(null)
    setLocationCode('')
    setRememberLocation(false)
    setStep('location')
  }

  const handleNewClock = () => {
    setClockResult(null)
    setPin('')
    setStep('pin')
  }

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-obsidian/80 border-white/10 backdrop-blur-sm">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary-500/20 flex items-center justify-center mb-2">
            <Clock className="h-8 w-8 text-primary-400" />
          </div>
          <CardTitle className="text-2xl text-white">Team Time Clock</CardTitle>
          {validatedLocation && step !== 'location' && (
            <p className="text-primary-400 text-sm font-medium">
              {validatedLocation.account_name}
            </p>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Location Code */}
          {step === 'location' && (
            <form onSubmit={handleLocationSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location Code
                </Label>
                <p className="text-slate-500 text-xs">
                  Enter your restaurant's 4-digit code
                </p>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="\d{4}"
                  maxLength={4}
                  placeholder="••••"
                  className="text-center text-3xl tracking-[0.5em] bg-white/10 text-white border-white/20 h-16 font-mono"
                  value={locationCode}
                  onChange={(e) => setLocationCode(e.target.value.replace(/\D/g, ''))}
                  disabled={locationMutation.isPending}
                  autoFocus
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberLocation}
                  onCheckedChange={(checked) => setRememberLocation(checked === true)}
                  className="border-white/30 data-[state=checked]:bg-primary-500"
                />
                <Label htmlFor="remember" className="text-slate-400 text-sm cursor-pointer">
                  Remember this location
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-primary-500 hover:bg-primary-600 text-lg"
                disabled={locationMutation.isPending || locationCode.length !== 4}
              >
                {locationMutation.isPending ? 'Checking...' : 'Continue'}
              </Button>
            </form>
          )}

          {/* Step 2: PIN Entry */}
          {step === 'pin' && (
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2">
                  <KeyRound className="h-4 w-4" />
                  Your PIN
                </Label>
                <p className="text-slate-500 text-xs">
                  Enter your personal 4-digit PIN
                </p>
                <Input
                  type="password"
                  inputMode="numeric"
                  pattern="\d{4}"
                  maxLength={4}
                  placeholder="••••"
                  className="text-center text-3xl tracking-[0.5em] bg-white/10 text-white border-white/20 h-16 font-mono"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  disabled={clockMutation.isPending}
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-primary-500 hover:bg-primary-600 text-lg"
                disabled={clockMutation.isPending || pin.length !== 4}
              >
                {clockMutation.isPending ? 'Processing...' : 'Clock In / Out'}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full text-slate-400 hover:text-white"
                onClick={handleChangeLocation}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Change Location
              </Button>
            </form>
          )}

          {/* Step 3: Result */}
          {step === 'result' && clockResult && (
            <div className="space-y-4">
              <Alert
                className={
                  clockResult.status === 'clocked_in'
                    ? 'bg-green-500/10 border-green-500/30 text-green-300'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                }
              >
                <div className="flex items-center gap-3">
                  {clockResult.status === 'clocked_in' ? (
                    <Check className="h-6 w-6" />
                  ) : (
                    <X className="h-6 w-6" />
                  )}
                  <div>
                    <AlertTitle className="text-lg font-semibold">
                      {clockResult.status === 'clocked_in' ? 'Clocked In' : 'Clocked Out'}
                    </AlertTitle>
                    <AlertDescription className="text-sm opacity-90">
                      {clockResult.message}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>

              <div className="text-center space-y-1 py-4">
                <p className="text-2xl font-bold text-white">{clockResult.member_name}</p>
                <p className="text-slate-400 text-sm">
                  {new Date(clockResult.occurred_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              <Button
                className="w-full h-12 bg-white/10 hover:bg-white/20 text-white"
                onClick={handleNewClock}
              >
                Clock Another Person
              </Button>
            </div>
          )}

          {/* Help text */}
          {step !== 'result' && (
            <p className="text-center text-xs text-slate-500 pt-4 border-t border-white/5">
              Need help? Ask your manager for your location code and PIN.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
