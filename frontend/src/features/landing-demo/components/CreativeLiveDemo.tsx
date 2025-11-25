import React, { useState } from 'react';
import { Sparkles, Loader2, AlertCircle, Image, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PolicyConsentModal } from './PolicyConsentModal';
import { DemoPreviewModal } from './DemoPreviewModal';
import { startDemoGeneration, streamDemoJob } from '../api/demoClient';
import type { PolicyConsent } from '../types';

// Simplified demo templates with pre-filled examples
const DEMO_TEMPLATES = [
  {
    id: 'daily-special',
    name: 'Daily Special',
    description: 'Promote your daily special with a stunning food photo',
    icon: '🍽️',
    fields: [
      { key: 'restaurant_name', label: 'Restaurant Name', placeholder: 'Mario\'s Italian Kitchen', example: 'Mario\'s Italian Kitchen' },
      { key: 'special_name', label: 'Today\'s Special', placeholder: 'Truffle Mushroom Risotto', example: 'Truffle Mushroom Risotto' },
      { key: 'price', label: 'Price', placeholder: '$18.99', example: '$18.99' },
    ],
  },
  {
    id: 'happy-hour',
    name: 'Happy Hour',
    description: 'Drive traffic with happy hour promotions',
    icon: '🍸',
    fields: [
      { key: 'restaurant_name', label: 'Restaurant Name', placeholder: 'The Local Tavern', example: 'The Local Tavern' },
      { key: 'deal', label: 'Happy Hour Deal', placeholder: '$5 Margaritas & Half-Price Apps', example: '$5 Margaritas & Half-Price Apps' },
      { key: 'hours', label: 'Hours', placeholder: '4-7pm Daily', example: '4-7pm Daily' },
    ],
  },
  {
    id: 'new-menu-item',
    name: 'New Menu Item',
    description: 'Announce a new addition to your menu',
    icon: '✨',
    fields: [
      { key: 'restaurant_name', label: 'Restaurant Name', placeholder: 'Sakura Sushi', example: 'Sakura Sushi' },
      { key: 'item_name', label: 'New Item', placeholder: 'Dragon Roll Supreme', example: 'Dragon Roll Supreme' },
      { key: 'description', label: 'Description', placeholder: 'Fresh salmon, avocado, topped with eel', example: 'Fresh salmon, avocado, topped with eel' },
    ],
  },
];

export const CreativeLiveDemo: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(DEMO_TEMPLATES[0]);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [policyConsent, setPolicyConsent] = useState<PolicyConsent | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [progress, setProgress] = useState(0);

  const handleTemplateSelect = (template: typeof DEMO_TEMPLATES[0]) => {
    setSelectedTemplate(template);
    // Pre-fill with examples
    const prefilled: Record<string, string> = {};
    template.fields.forEach(f => {
      prefilled[f.key] = f.example;
    });
    setInputs(prefilled);
    setError(null);
  };

  const handleGenerate = () => {
    // Validate required fields
    for (const field of selectedTemplate.fields) {
      if (!inputs[field.key]?.trim()) {
        setError(`Please fill in: ${field.label}`);
        return;
      }
    }

    // Check if user has already consented
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

    try {
      // Map to actual template ID (use a generic one that exists)
      const response = await startDemoGeneration({
        template_id: 'rainy-window-teaser', // Use an existing template
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

  // Initialize with pre-filled values on first render
  React.useEffect(() => {
    handleTemplateSelect(DEMO_TEMPLATES[0]);
  }, []);

  return (
    <div className="w-full">
      {/* Intro */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-primary-500/10 text-primary-400 px-3 py-1.5 rounded-full text-sm font-medium mb-3">
          <Wand2 className="w-4 h-4" />
          AI-Powered
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          Generate a Marketing Image in Seconds
        </h3>
        <p className="text-sm text-slate-400">
          Pick a template, customize the details, and watch AI create a professional image for your restaurant.
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-900/20 border border-red-700 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {/* Step 1: Template Selection */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-500 text-white text-xs font-bold">1</span>
          <span className="text-sm font-semibold text-white">Choose a Template</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {DEMO_TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => handleTemplateSelect(template)}
              className={`p-3 rounded-xl border-2 transition-all text-left ${
                selectedTemplate.id === template.id
                  ? 'border-primary-500 bg-primary-500/10'
                  : 'border-white/10 bg-[#1E1E1E] hover:border-white/20'
              }`}
            >
              <span className="text-2xl mb-1 block">{template.icon}</span>
              <span className="text-sm font-medium text-white block">{template.name}</span>
              <span className="text-xs text-slate-500 line-clamp-2">{template.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Customize */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-500 text-white text-xs font-bold">2</span>
          <span className="text-sm font-semibold text-white">Customize Your Details</span>
          <span className="text-xs text-slate-500">(pre-filled with examples)</span>
        </div>
        <div className="space-y-3 bg-[#1E1E1E] rounded-xl p-4 border border-white/10">
          {selectedTemplate.fields.map((field) => (
            <div key={field.key}>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                {field.label}
              </label>
              <input
                type="text"
                value={inputs[field.key] || ''}
                onChange={(e) => setInputs({ ...inputs, [field.key]: e.target.value })}
                placeholder={field.placeholder}
                className="w-full px-3 py-2 bg-[#121212] border border-white/10 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                disabled={isLoading}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Step 3: Generate */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-500 text-white text-xs font-bold">3</span>
          <span className="text-sm font-semibold text-white">Generate Your Image</span>
        </div>

        {/* Progress Bar */}
        {isLoading && (
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-2">
                <Image className="w-4 h-4 animate-pulse" />
                AI is creating your image...
              </span>
              <span className="text-primary-400 font-medium">{progress}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary-500 to-primary-400 h-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <Button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full h-12 text-base bg-primary-500 hover:bg-primary-400 text-white font-semibold disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Image — Free
            </>
          )}
        </Button>

        <p className="text-xs text-slate-500 text-center mt-3">
          No account required • Takes ~15 seconds • 1 free demo per day
        </p>
      </div>

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
