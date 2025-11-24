import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import { CreativeDashboard } from '@/features/creative/components/CreativeDashboard';
import { CreativeOnboarding } from '@/features/creative/components/CreativeOnboarding';
import { useOnboarding } from '@/hooks/useOnboarding';

export function CreativeStudioPage() {
  const { shouldShow, isLoading, markAsCompleted, showManually } = useOnboarding('creative-studio');
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!isLoading && shouldShow) {
      // Small delay to let the page render first
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, shouldShow]);

  const handleOnboardingComplete = (dontShowAgain: boolean) => {
    markAsCompleted(dontShowAgain);
    setShowOnboarding(false);
  };

  const handleShowHelp = () => {
    showManually();
    setShowOnboarding(true);
  };

  return (
    <AppShell maxWidth="wide">
      {/* Help Button - Fixed position */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleShowHelp}
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg bg-emerald-500 hover:bg-emerald-600 text-white"
          title="Show help tour"
        >
          <HelpCircle className="h-6 w-6" />
        </Button>
      </div>

      <CreativeDashboard />
      
      <CreativeOnboarding
        open={showOnboarding}
        onOpenChange={setShowOnboarding}
        onComplete={handleOnboardingComplete}
      />
    </AppShell>
  );
}


