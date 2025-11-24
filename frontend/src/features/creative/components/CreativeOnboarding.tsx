import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { Sparkles, Palette, Wand2, Download } from 'lucide-react';

interface CreativeOnboardingProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (dontShowAgain: boolean) => void;
}

export function CreativeOnboarding({
  open,
  onOpenChange,
  onComplete,
}: CreativeOnboardingProps) {
  const steps = [
    {
      title: 'Welcome to Creative Studio',
      description:
        'Generate professional marketing assets for your restaurant in minutes using AI. Let us show you how it works.',
      icon: <Sparkles className="h-6 w-6 text-primary-500" />,
      content: (
        <div className="space-y-4 text-slate-300">
          <div className="rounded-lg bg-primary-500/10 border border-white/10 p-4">
            <h4 className="font-semibold text-white mb-2">What You Can Create:</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary-500 mt-0.5">•</span>
                <span>Seasonal menu promotions and limited-time offers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-500 mt-0.5">•</span>
                <span>Social media posts with customer testimonials</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-500 mt-0.5">•</span>
                <span>Hiring announcements and team culture highlights</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-500 mt-0.5">•</span>
                <span>Event promotions and special celebrations</span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: 'Choose Your Template',
      description:
        'Browse our curated collection of templates designed specifically for restaurants. Each template is optimized for different marketing goals.',
      icon: <Palette className="h-6 w-6 text-primary-500" />,
      content: (
        <div className="space-y-3 text-slate-300 text-sm">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-card-dark/50">
            <div className="p-2 rounded bg-primary-500/10">
              <Palette className="h-4 w-4 text-primary-500" />
            </div>
            <div>
              <p className="font-medium text-white mb-1">Themes by Category</p>
              <p className="text-slate-400">
                Templates are organized by use case: campaigns, social proof, hiring, and events.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-card-dark/50">
            <div className="p-2 rounded bg-primary-500/10">
              <Wand2 className="h-4 w-4 text-primary-500" />
            </div>
            <div>
              <p className="font-medium text-white mb-1">Restaurant-Specific</p>
              <p className="text-slate-400">
                Filter by your restaurant type (pizza, cafe, bar, etc.) for tailored designs.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Customize with Your Brand',
      description:
        'Add your restaurant details, choose your brand colors, and customize the content. We will generate multiple variations for you to choose from.',
      icon: <Wand2 className="h-6 w-6 text-primary-500" />,
      content: (
        <div className="space-y-3 text-slate-300 text-sm">
          <p className="text-slate-400">
            After selecting a template, you'll be able to:
          </p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary-500 mt-0.5">✓</span>
              <span>Use saved brand profiles or create custom colors</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-500 mt-0.5">✓</span>
              <span>Fill in your specific content (dish names, prices, etc.)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-500 mt-0.5">✓</span>
              <span>Add style preferences for the AI to follow</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-500 mt-0.5">✓</span>
              <span>Generate multiple variations in one go</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      title: 'Download & Share',
      description:
        'Once generated, download your assets in high quality and share them across your marketing channels. All your creations are saved in History.',
      icon: <Download className="h-6 w-6 text-primary-500" />,
      content: (
        <div className="space-y-4 text-slate-300">
          <div className="rounded-lg bg-card-dark/50 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary-500" />
              <span className="text-sm font-medium text-white">Pro Tip:</span>
            </div>
            <p className="text-sm text-slate-400">
              Set up your brand profiles first in the "Brand Settings" section. This will make
              generating assets even faster by pre-filling your brand colors and style preferences.
            </p>
          </div>
          <p className="text-sm text-slate-400 text-center">
            Ready to create your first asset? Let's get started!
          </p>
        </div>
      ),
    },
  ];

  return (
    <OnboardingModal
      open={open}
      onOpenChange={onOpenChange}
      steps={steps}
      featureName="Creative Studio"
      onComplete={onComplete}
    />
  );
}
