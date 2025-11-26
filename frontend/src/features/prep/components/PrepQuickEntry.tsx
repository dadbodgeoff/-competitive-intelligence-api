import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Sparkles, X } from 'lucide-react'

interface PrepQuickEntryProps {
  onAdd: (item: {
    name: string
    par: number
    onHand: number
    unit?: string
  }) => Promise<void> | void
  isLoading?: boolean
  suggestions?: string[]
  className?: string
}

const COMMON_UNITS = [
  { value: 'each', label: 'Each' },
  { value: 'lbs', label: 'Pounds (lbs)' },
  { value: 'oz', label: 'Ounces (oz)' },
  { value: 'cups', label: 'Cups' },
  { value: 'qt', label: 'Quarts' },
  { value: 'gal', label: 'Gallons' },
  { value: 'pans', label: 'Pans' },
  { value: 'trays', label: 'Trays' },
  { value: 'batches', label: 'Batches' },
]

export function PrepQuickEntry({
  onAdd,
  isLoading,
  suggestions = [],
  className,
}: PrepQuickEntryProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [name, setName] = useState('')
  const [par, setPar] = useState('')
  const [onHand, setOnHand] = useState('')
  const [unit, setUnit] = useState<string>('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const filteredSuggestions = suggestions.filter(s =>
    s.toLowerCase().includes(name.toLowerCase()) && s.toLowerCase() !== name.toLowerCase()
  ).slice(0, 5)
  
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isExpanded])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    
    await onAdd({
      name: name.trim(),
      par: Number(par) || 0,
      onHand: Number(onHand) || 0,
      unit: unit || undefined,
    })
    
    // Reset form
    setName('')
    setPar('')
    setOnHand('')
    setUnit('')
    inputRef.current?.focus()
  }
  
  const handleSuggestionClick = (suggestion: string) => {
    setName(suggestion)
    setShowSuggestions(false)
    // Focus on par input after selecting suggestion
    const parInput = document.getElementById('quick-entry-par')
    parInput?.focus()
  }
  
  const toPrep = Math.max(0, (Number(par) || 0) - (Number(onHand) || 0))
  
  if (!isExpanded) {
    return (
      <Button
        onClick={() => setIsExpanded(true)}
        className={cn(
          'w-full h-14 border-2 border-dashed border-white/20 bg-transparent',
          'hover:border-primary-500/50 hover:bg-primary-500/5',
          'text-slate-400 hover:text-white transition-all',
          className
        )}
        variant="ghost"
      >
        <Plus className="h-5 w-5 mr-2" />
        Add prep item
      </Button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'bg-slate-900/80 border border-white/10 rounded-xl p-4',
        'animate-in slide-in-from-top-2 duration-200',
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary-400" />
          Quick Add Item
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(false)}
          className="h-7 w-7 p-0 text-slate-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-4">
        {/* Item name with suggestions */}
        <div className="relative">
          <Label htmlFor="quick-entry-name" className="text-slate-400 text-xs uppercase tracking-wide">
            Item Name
          </Label>
          <Input
            ref={inputRef}
            id="quick-entry-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setShowSuggestions(e.target.value.length > 0)
            }}
            onFocus={() => setShowSuggestions(name.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="e.g., Dough balls, Pizza sauce..."
            className="mt-1 bg-slate-950 border-white/10 text-white placeholder:text-slate-500"
            autoComplete="off"
          />
          
          {/* Suggestions dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-slate-900 border border-white/10 rounded-lg shadow-xl overflow-hidden">
              {filteredSuggestions.map((suggestion, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-primary-500/10 hover:text-white transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Par, On Hand, Unit row */}
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-3">
            <Label htmlFor="quick-entry-par" className="text-slate-400 text-xs uppercase tracking-wide">
              Par
            </Label>
            <Input
              id="quick-entry-par"
              type="number"
              min={0}
              value={par}
              onChange={(e) => setPar(e.target.value)}
              placeholder="0"
              className="mt-1 bg-slate-950 border-white/10 text-white"
            />
          </div>
          
          <div className="col-span-3">
            <Label htmlFor="quick-entry-onhand" className="text-slate-400 text-xs uppercase tracking-wide">
              On Hand
            </Label>
            <Input
              id="quick-entry-onhand"
              type="number"
              min={0}
              value={onHand}
              onChange={(e) => setOnHand(e.target.value)}
              placeholder="0"
              className="mt-1 bg-slate-950 border-white/10 text-white"
            />
          </div>
          
          <div className="col-span-3">
            <Label className="text-slate-400 text-xs uppercase tracking-wide">
              To Prep
            </Label>
            <div className="mt-1 h-10 flex items-center px-3 bg-slate-950/50 border border-white/5 rounded-md">
              <span className={cn(
                'font-bold',
                toPrep > 0 ? 'text-amber-400' : 'text-slate-500'
              )}>
                {toPrep}
              </span>
            </div>
          </div>
          
          <div className="col-span-3">
            <Label className="text-slate-400 text-xs uppercase tracking-wide">
              Unit
            </Label>
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger className="mt-1 bg-slate-950 border-white/10 text-white">
                <SelectValue placeholder="Unit" />
              </SelectTrigger>
              <SelectContent>
                {COMMON_UNITS.map(u => (
                  <SelectItem key={u.value} value={u.value}>
                    {u.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Submit button */}
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsExpanded(false)}
            className="text-slate-400"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!name.trim() || isLoading}
            className="bg-primary-600 hover:bg-primary-500"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Adding...
              </span>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1.5" />
                Add Item
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
