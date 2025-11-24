/**
 * Icon Component Usage Examples
 * 
 * This file demonstrates how to use the Icon wrapper component
 * Copy these patterns into your components
 */

import React from 'react';
import { Icon, IconButton, IconWithBadge, StatusIcon } from './Icon';
import { 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle,
  Bell,
  Settings,
  TrendingUp,
} from './icons';

export const IconExamples: React.FC = () => {
  return (
    <div className="space-y-8 p-8">
      {/* Basic Icons */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Basic Icons</h3>
        <div className="flex items-center gap-4">
          <Icon icon={Sparkles} size="xs" />
          <Icon icon={Sparkles} size="sm" />
          <Icon icon={Sparkles} size="md" />
          <Icon icon={Sparkles} size="lg" />
          <Icon icon={Sparkles} size="xl" />
          <Icon icon={Sparkles} size="2xl" />
        </div>
      </section>

      {/* Color Variants */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Color Variants</h3>
        <div className="flex items-center gap-4">
          <Icon icon={Sparkles} variant="default" />
          <Icon icon={Sparkles} variant="primary" />
          <Icon icon={Sparkles} variant="accent" />
          <Icon icon={Sparkles} variant="success" />
          <Icon icon={Sparkles} variant="warning" />
          <Icon icon={Sparkles} variant="error" />
          <Icon icon={Sparkles} variant="muted" />
        </div>
      </section>

      {/* Animated Icons */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Animations</h3>
        <div className="flex items-center gap-4">
          <Icon icon={Loader2} animate="spin" variant="primary" />
          <Icon icon={CheckCircle2} animate="pulse" variant="success" />
          <Icon icon={AlertTriangle} animate="bounce" variant="warning" />
        </div>
      </section>

      {/* Icon Buttons */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Icon Buttons</h3>
        <div className="flex items-center gap-2">
          <IconButton icon={Settings} label="Settings" />
          <IconButton icon={Bell} label="Notifications" variant="primary" />
          <IconButton icon={TrendingUp} label="Analytics" variant="success" />
        </div>
      </section>

      {/* Icons with Badges */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Icons with Badges</h3>
        <div className="flex items-center gap-4">
          <IconWithBadge icon={Bell} showBadge />
          <IconWithBadge icon={Bell} badgeCount={3} showBadge />
          <IconWithBadge icon={Bell} badgeCount={12} showBadge />
        </div>
      </section>

      {/* Status Icons */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Status Icons</h3>
        <div className="flex items-center gap-4">
          <StatusIcon icon={Settings} status="success" />
          <StatusIcon icon={Settings} status="warning" />
          <StatusIcon icon={Settings} status="error" />
          <StatusIcon icon={Settings} status="idle" />
        </div>
      </section>

      {/* In Context Examples */}
      <section>
        <h3 className="text-lg font-semibold mb-4">In Context</h3>
        
        {/* Button with icon */}
        <button className="btn-cta-primary">
          <Icon icon={Sparkles} size="sm" variant="inherit" className="mr-2" />
          Generate Creative
        </button>

        {/* Alert with icon */}
        <div className="alert-success mt-4">
          <Icon icon={CheckCircle2} size="md" variant="inherit" />
          <span>Your changes have been saved successfully!</span>
        </div>

        {/* Card with icon */}
        <div className="surface-card mt-4 flex items-start gap-3">
          <Icon icon={TrendingUp} size="lg" variant="primary" />
          <div>
            <h4 className="font-semibold">Revenue Growth</h4>
            <p className="text-sm text-slate-400">Up 23% this month</p>
          </div>
        </div>
      </section>
    </div>
  );
};

/**
 * Migration Guide:
 * 
 * OLD WAY:
 * import { Sparkles } from 'lucide-react';
 * <Sparkles className="w-5 h-5 text-emerald-500" />
 * 
 * NEW WAY:
 * import { Icon } from '@/components/ui/Icon';
 * import { Sparkles } from '@/components/ui/icons';
 * <Icon icon={Sparkles} size="md" variant="primary" />
 * 
 * Benefits:
 * - Consistent sizing across app
 * - Centralized color management
 * - Easy to update all icons at once
 * - Better accessibility
 * - Type-safe variants
 */
