import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ColorPalettePickerProps {
  primary: string;
  secondary: string;
  accent: string;
  onPrimaryChange: (color: string) => void;
  onSecondaryChange: (color: string) => void;
  onAccentChange: (color: string) => void;
}

export function ColorPalettePicker({
  primary,
  secondary,
  accent,
  onPrimaryChange,
  onSecondaryChange,
  onAccentChange,
}: ColorPalettePickerProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="space-y-2">
        <Label className="text-sm text-slate-200">Primary Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={primary}
            onChange={(e) => onPrimaryChange(e.target.value)}
            className="h-10 w-16 p-1 bg-white/5 border-white/10"
          />
          <Input
            type="text"
            value={primary}
            onChange={(e) => onPrimaryChange(e.target.value)}
            placeholder="#10b981"
            className="flex-1 bg-white/5 border-white/10 text-white"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm text-slate-200">Secondary Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={secondary}
            onChange={(e) => onSecondaryChange(e.target.value)}
            className="h-10 w-16 p-1 bg-white/5 border-white/10"
          />
          <Input
            type="text"
            value={secondary}
            onChange={(e) => onSecondaryChange(e.target.value)}
            placeholder="#0ea5e9"
            className="flex-1 bg-white/5 border-white/10 text-white"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm text-slate-200">Accent Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={accent}
            onChange={(e) => onAccentChange(e.target.value)}
            className="h-10 w-16 p-1 bg-white/5 border-white/10"
          />
          <Input
            type="text"
            value={accent}
            onChange={(e) => onAccentChange(e.target.value)}
            placeholder="#f97316"
            className="flex-1 bg-white/5 border-white/10 text-white"
          />
        </div>
      </div>
    </div>
  );
}
