import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, AlertCircle, Image, Wand2, Check, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PolicyConsentModal } from './PolicyConsentModal';
import { DemoPreviewModal } from './DemoPreviewModal';
import { startDemoGeneration, streamDemoJob } from '../api/demoClient';
import type { PolicyConsent } from '../types';

// Streamlined demo templates
const DEMO_TEMPLATES = [
  {
    id: 'daily-special',
    name: 'Daily Special',
    emoji: '🍽️',
    color: '#B08968',
    fields: [
      { key: 'restaurant_name', label: 'Restaurant', placeholder: 'Mario\'s Italian Kitchen', example: 'Mario\'s Italian Kitchen' },
      { key: 'special_name', label: 'Special', placeholder: 'Truffle Mushroom Risotto', example: 'Truffle Mushroom Risotto' },
      { key: 'price', label: 'Price', placeholder: '$18.99', example: '$18.99' },
    ],
  },
  {
    id: 'happy-hour',
    name: 'Happy Hour',
    emoji: '🍸',
    color: '#D4A574',
    fields: [
      { key: 'restaurant_name', label: 'Restaurant', placeholder: 'The Local Tavern', example: 'The Local Tavern' },
      { key: 'deal', label: 'Deal', placeholder: '$5 Margaritas', example: '$5 Margaritas & Half-Price Apps' },
      { key: 'hours', label: 'Hours', placeholder: '4-7pm', example: '4-7pm Daily' },
    ],
  },
  {
    id: 'new-menu-item',
    name: 'New Item',
    emoji: '✨',
    color: '#E8C99B',
    fields: [
      { key: 'restaurant_name', label: 'Restaurant', placeholder: 'Sakura Sushi', example: 'Sakura Sushi' },
      { key: 'item_name', label: 'Item', placeholder: 'Dragon Roll', example: 'Dragon Roll Supreme' },
      { key: 'description', label: 'Description', placeholder: 'Fresh salmon...', example: 'Fresh salmon, avocado, topped with eel' },
    ],
  },
];

export const CreativeLiveDemoV2: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(DEMO_TEMPLATES[0]);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [policyConsent, setPolicyConsent] = useState<PolicyConsent | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);

  const handleTemplateSelect = (template: typeof DEMO_TEMPLATES[0]) => {
    setSelectedTemplate(template);
    const prefilled: Record<string, string> = {};
    template.fields.forEach(f => {
      prefilled[f.key] = f.example;
    });
    setInputs(prefilled);
    setError(null);
    setCurrentStep(2);
  };

  const handleGenerate = () => {
    for (const field of selectedTemplate.fields) {
      if (!inputs[field.key]?.trim()) {
        setError(`Please fill in: ${field.label}`);
        return;
      }
    }

    if (!policyConsent) {
      setShowPolicyModal(true);
      return;
    }

    startGeneration();
  };

  const handlePolicyAccept = (termsVersion: string, privacyVersion: string) => {
    const consent: PolicyConsent = {
      acknowledged: true,
      terms_version: termsVersion,
      privacy_version: privacyVersion,
      timestamp: new Date().toISOString(),
    };
    setPolicyConsent(consent);
    startGeneration();
  };

  const startGeneration = async () => {
    if (!policyConsent) return;

    setIsLoading(true);
    setError(null);
    setProgress(0);
    setCurrentStep(3);

    try {
      const response = await startDemoGeneration({
        template_id: 'rainy-window-teaser',
        inputs: {
          restaurant_name: inputs.restaurant_name || inputs.item_name || 'Restaurant',
          todays_special: inputs.special_name || inputs.deal || inputs.item_name || 'Special',
          directions: inputs.description || inputs.hours || inputs.price || 'Details',
        },
        policies_acknowledged: policyConsent.acknowledged,
        terms_version: policyConsent.terms_version,
        privacy_version: policyConsent.privacy_version,
        consent_timestamp: policyConsent.timestamp,
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to start generation');
      }

      localStorage.setItem('demo_session_id', response.session_id);

      const eventSource = await streamDemoJob(response.session_id);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.status === 'completed' && data.preview_url) {
            setPreviewUrl(data.preview_url);
            setShowPreviewModal(true);
            setIsLoading(false);
            eventSource.close();
          } else if (data.status === 'failed') {
            setError(data.error || 'Generation failed');
            setIsLoading(false);
            eventSource.close();
          } else if (data.progress !== undefined) {
            setProgress(data.progress);
          }
        } catch (err) {
          console.error('Failed to parse SSE data:', err);
        }
      };

      eventSource.onerror = () => {
        setError('Connection lost. Please try again.');
        setIsLoading(false);
        eventSource.close();
      };

    } catch (err: any) {
      console.error('Generation error:', err);
      
      if (err.response?.status === 429) {
        setError('Rate limit reached. Create a free account for unlimited access!');
      } else {
        setError(err.response?.data?.detail || err.message || 'Failed to generate image');
      }
      
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleTemplateSelect(DEMO_TEMPLATES[0]);
  }, []);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(176, 137, 104, 0.3) 0%, rgba(176, 137, 104, 0.1) 100%)',
              border: '1px solid rgba(176, 137, 104, 0.3)',
            }}
          >
            <Wand2 className="w-5 h-5 text-[#D4A574]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">AI Creative Studio</h3>
            <p className="text-xs text-[#6B7280]">Generate marketing images instantly</p>
          </div>
        </div>
        
        {/* Step indicator */}
        <div className="hidden sm:flex items-center gap-2">
          {[1, 2, 3].map((step) => (
            <React.Fragment key={step}>
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  currentStep >= step 
                    ? 'bg-[#B08968] text-white' 
                    : 'bg-[#2A2A2A] text-[#6B7280]'
                }`}
              >
                {currentStep > step ? <Check className="w-4 h-4" /> : step}
              </div>
              {step < 3 && (
                <div 
                  className={`w-8 h-0.5 transition-all duration-300 ${
                    currentStep > step ? 'bg-[#B08968]' : 'bg-[#2A2A2A]'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {error && (
        <div 
          className="mb-6 rounded-xl p-4 flex items-start gap-3"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
          }}
        >
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {/* Template Selection */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">
          Choose Template
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {DEMO_TEMPLATES.map((template) => {
            const isSelected = selectedTemplate.id === template.id;
            return (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                className={`
                  relative p-4 rounded-xl text-left transition-all duration-300
                  ${isSelected ? 'scale-[1.02]' : 'hover:scale-[1.01]'}
                `}
                style={{
                  backgroundColor: isSelected ? 'rgba(176, 137, 104, 0.15)' : 'rgba(30, 30, 30, 0.6)',
                  border: isSelected 
                    ? '2px solid rgba(176, 137, 104, 0.5)' 
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: isSelected ? '0 0 20px rgba(176, 137, 104, 0.15)' : 'none',
                }}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <Check className="w-4 h-4 text-[#B08968]" />
                  </div>
                )}
                <div className="flex items-center gap-3 sm:block">
                  <span className="text-2xl sm:block sm:mb-2">{template.emoji}</span>
                  <span className="text-sm font-semibold text-white block">{template.name}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Fields */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">
          Customize Details
        </label>
        <div 
          className="rounded-xl p-4 space-y-4"
          style={{
            backgroundColor: 'rgba(30, 30, 30, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {selectedTemplate.fields.map((field) => (
            <div key={field.key}>
              <label className="block text-xs font-medium text-[#A8B1B9] mb-1.5">
                {field.label}
              </label>
              <input
                type="text"
                value={inputs[field.key] || ''}
                onChange={(e) => {
                  setInputs({ ...inputs, [field.key]: e.target.value });
                  if (currentStep < 2) setCurrentStep(2);
                }}
                placeholder={field.placeholder}
                className="w-full px-4 py-3 rounded-lg text-sm text-white placeholder-[#4B5563] focus:outline-none transition-all duration-200"
                style={{
                  backgroundColor: 'rgba(18, 18, 18, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(176, 137, 104, 0.5)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(176, 137, 104, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.boxShadow = 'none';
                }}
                disabled={isLoading}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      {isLoading && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#A8B1B9] flex items-center gap-2">
              <Image className="w-4 h-4 animate-pulse text-[#B08968]" />
              Creating your image...
            </span>
            <span className="text-sm font-semibold text-[#D4A574]">{progress}%</span>
          </div>
          <div 
            className="w-full h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{ 
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #B08968 0%, #D4A574 100%)',
                boxShadow: '0 0 10px rgba(176, 137, 104, 0.5)',
              }}
            />
          </div>
        </div>
      )}

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={isLoading}
        className="w-full h-14 text-base font-semibold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
        style={{
          backgroundColor: '#B08968',
          boxShadow: '0 0 30px rgba(176, 137, 104, 0.3), 0 10px 25px -10px rgba(176, 137, 104, 0.4)',
        }}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 mr-2" />
            Generate Image
            <ChevronRight className="w-5 h-5 ml-2" />
          </>
        )}
      </Button>

      <p className="text-xs text-center mt-4" style={{ color: '#6B7280' }}>
        No account required • ~15 seconds • 1 free demo per day
      </p>

      {/* Modals */}
      <PolicyConsentModal
        isOpen={showPolicyModal}
        onClose={() => setShowPolicyModal(false)}
        onAccept={handlePolicyAccept}
      />

      <DemoPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        previewUrl={previewUrl}
        prompt={`${selectedTemplate.name} for ${inputs.restaurant_name || 'your restaurant'}`}
      />
    </div>
  );
};
