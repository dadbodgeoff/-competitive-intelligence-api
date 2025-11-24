import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Sparkles, CheckCircle, ArrowRight } from 'lucide-react';

interface OnboardingStep {
  title: string;
  description: string;
  icon?: React.ReactNode;
  content?: React.ReactNode;
}

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  steps: OnboardingStep[];
  featureName: string;
  onComplete: (dontShowAgain: boolean) => void;
}

export function OnboardingModal({
  open,
  onOpenChange,
  steps,
  featureName: _featureName,
  onComplete,
}: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const isLastStep = currentStep === steps.length - 1;
  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (isLastStep) {
      onComplete(dontShowAgain);
      onOpenChange(false);
      setCurrentStep(0); // Reset for next time
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    onComplete(dontShowAgain);
    onOpenChange(false);
    setCurrentStep(0); // Reset for next time
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-slate-900 border-white/10">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {currentStepData.icon || <Sparkles className="h-6 w-6 text-emerald-500" />}
            <DialogTitle className="text-2xl text-white">
              {currentStepData.title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-slate-300 text-base leading-relaxed">
            {currentStepData.description}
          </DialogDescription>
        </DialogHeader>

        {/* Step Content */}
        {currentStepData.content && (
          <div className="py-4">
            {currentStepData.content}
          </div>
        )}

        {/* Step Indicators */}
        {steps.length > 1 && (
          <div className="flex items-center justify-center gap-2 py-4">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'w-8 bg-emerald-500'
                    : index < currentStep
                    ? 'w-2 bg-emerald-500/50'
                    : 'w-2 bg-slate-700'
                }`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-col gap-4">
          {/* Don't show again checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="dont-show"
              checked={dontShowAgain}
              onCheckedChange={(checked) => setDontShowAgain(checked === true)}
              className="border-white/20"
            />
            <Label
              htmlFor="dont-show"
              className="text-sm text-slate-400 cursor-pointer"
            >
              Don't show this again
            </Label>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 w-full">
            {!isLastStep && (
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="flex-1 text-slate-400 hover:text-white"
              >
                Skip Tour
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              {isLastStep ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Get Started
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
