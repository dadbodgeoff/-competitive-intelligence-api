/**
 * Design System - Filter Panel Component
 * RestaurantIQ Platform
 */

import { X } from 'lucide-react';
import { cn } from '../utils';

export interface FilterOption {
  id: string;
  label: string;
  count?: number;
  checked: boolean;
}

export interface FilterSection {
  id: string;
  label: string;
  options: FilterOption[];
}

export interface FilterPanelProps {
  sections: FilterSection[];
  onOptionToggle: (sectionId: string, optionId: string) => void;
  onClearAll?: () => void;
  onApply?: () => void;
  className?: string;
}

export function FilterPanel({
  sections,
  onOptionToggle,
  onClearAll,
  onApply,
  className,
}: FilterPanelProps) {
  const totalSelected = sections.reduce(
    (sum, section) => sum + section.options.filter(o => o.checked).length,
    0
  );

  return (
    <div
      className={cn(
        'rounded-lg border border-white/10 bg-gradient-to-br from-slate-850 to-slate-900 p-6',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-100">Filters</h3>
        {totalSelected > 0 && (
          <span className="px-2 py-1 rounded-full bg-primary-500/15 text-primary-500 text-xs font-semibold">
            {totalSelected} active
          </span>
        )}
      </div>

      {/* Filter Sections */}
      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.id}>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
              {section.label}
            </label>
            <div className="space-y-2">
              {section.options.map((option) => (
                <label
                  key={option.id}
                  className={cn(
                    'flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors',
                    'hover:bg-white/5',
                    option.checked && 'bg-primary-500/10'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={option.checked}
                    onChange={() => onOptionToggle(section.id, option.id)}
                    className={cn(
                      'w-4 h-4 rounded border-2 transition-all',
                      'focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-slate-900',
                      option.checked
                        ? 'bg-primary-500 border-primary-500'
                        : 'bg-white/5 border-white/20'
                    )}
                  />
                  <span className="flex-1 text-sm text-slate-200">
                    {option.label}
                  </span>
                  {option.count !== undefined && (
                    <span className="px-2 py-0.5 rounded-full bg-white/5 text-slate-500 text-xs">
                      {option.count}
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      {(onClearAll || onApply) && (
        <div className="flex gap-3 mt-6 pt-6 border-t border-white/10">
          {onClearAll && (
            <button
              onClick={onClearAll}
              disabled={totalSelected === 0}
              className={cn(
                'flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all',
                'bg-white/5 text-slate-400 border border-white/10',
                'hover:bg-white/10 hover:text-slate-300',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <X className="w-4 h-4 inline mr-2" />
              Clear All
            </button>
          )}
          {onApply && (
            <button
              onClick={onApply}
              className={cn(
                'flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all',
                'bg-gradient-to-r bg-primary-500 text-white',
                'hover:bg-primary-400',
                'shadow-primary'
              )}
            >
              Apply Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
