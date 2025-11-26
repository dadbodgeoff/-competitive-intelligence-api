import { useState } from 'react'
import { Copy, Check, MapPin, QrCode } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface LocationCodeCardProps {
  locationCode?: string | null
  accountName?: string
}

export function LocationCodeCard({ locationCode, accountName }: LocationCodeCardProps) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!locationCode) return
    
    try {
      await navigator.clipboard.writeText(locationCode)
      setCopied(true)
      toast({
        title: 'Copied!',
        description: 'Location code copied to clipboard.',
      })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast({
        title: 'Failed to copy',
        description: 'Please copy the code manually.',
        variant: 'destructive',
      })
    }
  }

  if (!locationCode) {
    return (
      <Card className="bg-card-dark border-white/10">
        <CardHeader>
          <CardTitle className="text-xl text-white flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary-400" />
            Time Clock Location Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 text-sm">
            Location code not available. Please contact support.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card-dark border-white/10">
      <CardHeader>
        <CardTitle className="text-xl text-white flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary-400" />
          Time Clock Location Code
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-slate-400 text-sm">
          Share this code with your team so they can clock in at{' '}
          <code className="text-primary-300 bg-white/5 px-1.5 py-0.5 rounded">/time</code>.
          They'll enter this code first, then their personal PIN.
        </p>
        
        {/* Large code display */}
        <div className="flex items-center justify-center gap-4 py-6">
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-6 py-4">
            <QrCode className="h-8 w-8 text-primary-400" />
            <div className="flex gap-2">
              {locationCode.split('').map((digit, i) => (
                <span
                  key={i}
                  className="text-4xl font-mono font-bold text-white bg-white/10 rounded-lg w-12 h-14 flex items-center justify-center"
                >
                  {digit}
                </span>
              ))}
            </div>
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopy}
            className="h-12 w-12 border-white/20 hover:bg-white/10"
          >
            {copied ? (
              <Check className="h-5 w-5 text-green-400" />
            ) : (
              <Copy className="h-5 w-5 text-slate-400" />
            )}
          </Button>
        </div>
        
        <div className="bg-primary-500/10 border border-primary-500/20 rounded-lg p-4">
          <p className="text-sm text-primary-300">
            <strong>How it works:</strong> Team members visit{' '}
            <code className="bg-white/10 px-1 rounded">/time</code>, enter this location code,
            then their personal 4-digit PIN to clock in or out.
          </p>
        </div>
        
        {accountName && (
          <p className="text-xs text-slate-500 text-center">
            Location: {accountName}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
