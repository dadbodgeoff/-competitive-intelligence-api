/**
 * SettingsSheet Component
 * Schedule preferences and settings panel
 */

import { useState, useEffect } from 'react'
import { Settings, Globe, Calendar, Clock, Save, DollarSign } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import type { SchedulingSettings } from '@/types/scheduling'

interface SettingsSheetProps {
  open: boolean
  onClose: () => void
  settings?: SchedulingSettings | null
  onSubmit: (data: SettingsFormData) => Promise<void>
  isSubmitting?: boolean
  isLoading?: boolean
}

export interface SettingsFormData {
  week_start_day: number
  timezone: string
  auto_publish: boolean
  default_shift_length_minutes: number
  overtime_threshold_minutes?: number
  overtime_multiplier?: number
  overtime_enabled?: boolean
}

const WEEKDAYS = [
  { value: 0, label: 'Monday' },
  { value: 1, label: 'Tuesday' },
  { value: 2, label: 'Wednesday' },
  { value: 3, label: 'Thursday' },
  { value: 4, label: 'Friday' },
  { value: 5, label: 'Saturday' },
  { value: 6, label: 'Sunday' },
]

const COMMON_TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Phoenix', label: 'Arizona (MST)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' },
  { value: 'UTC', label: 'UTC' },
]

const SHIFT_LENGTHS = [
  { value: 240, label: '4 hours' },
  { value: 360, label: '6 hours' },
  { value: 480, label: '8 hours' },
  { value: 600, label: '10 hours' },
  { value: 720, label: '12 hours' },
]

const OVERTIME_THRESHOLDS = [
  { value: 2400, label: '40 hours/week' },
  { value: 2640, label: '44 hours/week' },
  { value: 2880, label: '48 hours/week' },
  { value: 480, label: '8 hours/day' },
  { value: 600, label: '10 hours/day' },
  { value: 720, label: '12 hours/day' },
]

const OVERTIME_MULTIPLIERS = [
  { value: 1.25, label: '1.25x (Time and a quarter)' },
  { value: 1.5, label: '1.5x (Time and a half)' },
  { value: 1.75, label: '1.75x' },
  { value: 2.0, label: '2x (Double time)' },
]

export function SettingsSheet({
  open,
  onClose,
  settings,
  onSubmit,
  isSubmitting,
  isLoading,
}: SettingsSheetProps) {
  const [weekStartDay, setWeekStartDay] = useState(0)
  const [timezone, setTimezone] = useState('America/New_York')
  const [autoPublish, setAutoPublish] = useState(false)
  const [defaultShiftLength, setDefaultShiftLength] = useState(480)
  const [overtimeEnabled, setOvertimeEnabled] = useState(true)
  const [overtimeThreshold, setOvertimeThreshold] = useState(2400)
  const [overtimeMultiplier, setOvertimeMultiplier] = useState(1.5)

  // Populate form from settings
  useEffect(() => {
    if (settings) {
      setWeekStartDay(settings.week_start_day)
      setTimezone(settings.timezone)
      setAutoPublish(settings.auto_publish)
      setDefaultShiftLength(settings.default_shift_length_minutes)
      setOvertimeEnabled(settings.overtime_enabled ?? true)
      setOvertimeThreshold(settings.overtime_threshold_minutes ?? 2400)
      setOvertimeMultiplier(settings.overtime_multiplier ?? 1.5)
    }
  }, [settings])

  const handleSubmit = async () => {
    await onSubmit({
      week_start_day: weekStartDay,
      timezone,
      auto_publish: autoPublish,
      default_shift_length_minutes: defaultShiftLength,
      overtime_enabled: overtimeEnabled,
      overtime_threshold_minutes: overtimeThreshold,
      overtime_multiplier: overtimeMultiplier,
    })
  }

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="bg-card-dark border-white/10 w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-white">
            <Settings className="h-5 w-5 text-primary-400" />
            Schedule Settings
          </SheetTitle>
          <SheetDescription className="text-slate-400">
            Configure your scheduling preferences. These settings apply to all schedules.
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="py-8 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-6 py-6">
            {/* Week Start Day */}
            <div className="space-y-3">
              <Label className="text-slate-300 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-500" />
                Week Starts On
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {WEEKDAYS.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => setWeekStartDay(day.value)}
                    className={cn(
                      'px-3 py-2 rounded-lg border text-xs font-medium transition-all',
                      weekStartDay === day.value
                        ? 'bg-primary-500/20 border-primary-500/50 text-primary-300'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    )}
                  >
                    {day.label.slice(0, 3)}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500">
                New weeks will start on {WEEKDAYS.find((d) => d.value === weekStartDay)?.label}
              </p>
            </div>

            {/* Timezone */}
            <div className="space-y-2">
              <Label className="text-slate-300 flex items-center gap-2">
                <Globe className="h-4 w-4 text-slate-500" />
                Timezone
              </Label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-obsidian px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              >
                {COMMON_TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500">
                All shift times will be displayed in this timezone
              </p>
            </div>

            {/* Default Shift Length */}
            <div className="space-y-2">
              <Label className="text-slate-300 flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-500" />
                Default Shift Length
              </Label>
              <select
                value={defaultShiftLength}
                onChange={(e) => setDefaultShiftLength(Number(e.target.value))}
                className="w-full rounded-lg border border-white/10 bg-obsidian px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              >
                {SHIFT_LENGTHS.map((length) => (
                  <option key={length.value} value={length.value}>
                    {length.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500">
                New shifts will default to this duration
              </p>
            </div>

            {/* Auto Publish */}
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="space-y-1">
                <Label className="text-slate-300">Auto-Publish Schedules</Label>
                <p className="text-xs text-slate-500">
                  Automatically publish schedules when created
                </p>
              </div>
              <Switch
                checked={autoPublish}
                onCheckedChange={setAutoPublish}
              />
            </div>

            {/* Overtime Section */}
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-4 w-4 text-amber-400" />
                <Label className="text-slate-200 font-medium">Overtime Settings</Label>
              </div>

              {/* Overtime Enabled */}
              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4 mb-4">
                <div className="space-y-1">
                  <Label className="text-slate-300">Track Overtime</Label>
                  <p className="text-xs text-slate-500">
                    Calculate overtime pay in labor cost reports
                  </p>
                </div>
                <Switch
                  checked={overtimeEnabled}
                  onCheckedChange={setOvertimeEnabled}
                />
              </div>

              {overtimeEnabled && (
                <div className="space-y-4 pl-4 border-l-2 border-amber-500/30">
                  {/* Overtime Threshold */}
                  <div className="space-y-2">
                    <Label className="text-slate-300">Overtime Threshold</Label>
                    <select
                      value={overtimeThreshold}
                      onChange={(e) => setOvertimeThreshold(Number(e.target.value))}
                      className="w-full rounded-lg border border-white/10 bg-obsidian px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    >
                      {OVERTIME_THRESHOLDS.map((threshold) => (
                        <option key={threshold.value} value={threshold.value}>
                          {threshold.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-500">
                      Hours after which overtime rate applies
                    </p>
                  </div>

                  {/* Overtime Multiplier */}
                  <div className="space-y-2">
                    <Label className="text-slate-300">Overtime Rate</Label>
                    <select
                      value={overtimeMultiplier}
                      onChange={(e) => setOvertimeMultiplier(Number(e.target.value))}
                      className="w-full rounded-lg border border-white/10 bg-obsidian px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    >
                      {OVERTIME_MULTIPLIERS.map((mult) => (
                        <option key={mult.value} value={mult.value}>
                          {mult.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-500">
                      Pay multiplier for overtime hours
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <SheetFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-white/10 text-slate-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || isLoading}
            className="btn-primary"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Settings'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
