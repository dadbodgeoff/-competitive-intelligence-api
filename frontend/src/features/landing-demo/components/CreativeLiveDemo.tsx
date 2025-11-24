import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PolicyConsentModal } from './PolicyConsentModal';
import { DemoPreviewModal } from './DemoPreviewModal';
import { startDemoGeneration, streamDemoJob, fetchDemoTemplates } from '../api/demoClient';
import type { PolicyConsent } from '../types';

interface Template {
  id: string;
  name: string;
  display_name?: string;
  preview_url?: string;
  input_schema?: {
    required?: string[];
    optional?: string[];
    types?: Record<string, string>;
    labels?: Record<string, string>;
    placeholders?: Record<string, string>;
  };
}

export const CreativeLiveDemo: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedTemplateData, setSelectedTemplateData] = useState<Template | null>(null);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [policyConsent, setPolicyConsent] = useState<PolicyConsent | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const data = await fetchDemoTemplates();
      setTemplates(data);
      if (data.length > 0) {
        handleTemplateSelect(data[0]);
      }
    } catch (err) {
      console.error('Failed to load templates:', err);
      setError('Failed to load templates. Please refresh the page.');
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template.id);
    setSelectedTemplateData(template);
    setInputs({});
    setError(null);
  };

  const handleGenerate = () => {
    if (!selectedTemplate || !selectedTemplateData) {
      setError('Please select a template');
      return;
    }

    // Validate required fields
    const schema = selectedTemplateData.input_schema;
    const required = schema?.required || [];
    
    for (const field of required) {
      if (!inputs[field]?.trim()) {
        const label = schema?.labels?.[field] || field;
        setError(`Please fill in: ${label}`);
        return;
      }
    }

    // Check if user has already consented
    if (!policyConsent) {
      setShowPolicyModal(true);
      return;
    }

    // Proceed with generation
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
    
    // Start generation after consent
    startGeneration();
  };

  const startGeneration = async () => {
    if (!policyConsent) return;

    setIsLoading(true);
    setError(null);
    setProgress(0);

    try {
      const response = await startDemoGeneration({
        template_id: selectedTemplate,
        inputs: inputs,
        policies_acknowledged: policyConsent.acknowledged,
        terms_version: policyConsent.terms_version,
        privacy_version: policyConsent.privacy_version,
        consent_timestamp: policyConsent.timestamp,
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to start generation');
      }

      // Start streaming progress
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
      
      // Handle rate limiting
      if (err.response?.status === 429) {
        const detail = err.response?.data?.detail;
        if (typeof detail === 'object' && detail.retry_after_seconds) {
          const minutes = Math.ceil(detail.retry_after_seconds / 60);
          setError(
            `Rate limit reached. You've used your free demo. Create an account for unlimited access or try again in ${minutes} minutes.`
          );
        } else {
          setError('Rate limit reached. Please create an account for unlimited access.');
        }
      } else {
        setError(err.response?.data?.detail || err.message || 'Failed to generate image');
      }
      
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 flex flex-col space-y-4">

        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-700 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Template Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wide">
              Choose a Template
            </label>
            {loadingTemplates ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                      selectedTemplate === template.id
                        ? 'border-emerald-500 ring-2 ring-emerald-500/50'
                        : 'border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    {template.preview_url ? (
                      <img
                        src={template.preview_url}
                        alt={template.display_name || template.name}
                        className="w-full h-20 object-cover"
                      />
                    ) : (
                      <div className="w-full h-20 bg-slate-700 flex items-center justify-center p-2">
                        <span className="text-xs text-slate-300 text-center leading-tight">
                          {template.display_name || template.name}
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-1.5">
                      <p className="text-xs text-white font-medium truncate">
                        {template.display_name || template.name}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dynamic Input Fields */}
          {selectedTemplateData && selectedTemplateData.input_schema && (
            <div className="space-y-3">
              {/* Required Fields */}
              {selectedTemplateData.input_schema.required?.map((fieldName) => {
                const label = selectedTemplateData.input_schema?.labels?.[fieldName] || fieldName;
                const placeholder = selectedTemplateData.input_schema?.placeholders?.[fieldName] || `Enter ${label.toLowerCase()}`;
                const type = selectedTemplateData.input_schema?.types?.[fieldName] || 'text';
                
                return (
                  <div key={fieldName}>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
                      {label} <span className="text-red-400">*</span>
                    </label>
                    {type === 'textarea' ? (
                      <textarea
                        value={inputs[fieldName] || ''}
                        onChange={(e) => setInputs({ ...inputs, [fieldName]: e.target.value })}
                        placeholder={placeholder}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                        rows={2}
                        disabled={isLoading}
                      />
                    ) : (
                      <input
                        type={type}
                        value={inputs[fieldName] || ''}
                        onChange={(e) => setInputs({ ...inputs, [fieldName]: e.target.value })}
                        placeholder={placeholder}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        disabled={isLoading}
                      />
                    )}
                  </div>
                );
              })}
              
              {/* Optional Fields */}
              {selectedTemplateData.input_schema.optional?.map((fieldName) => {
                const label = selectedTemplateData.input_schema?.labels?.[fieldName] || fieldName;
                const placeholder = selectedTemplateData.input_schema?.placeholders?.[fieldName] || `Enter ${label.toLowerCase()} (optional)`;
                const type = selectedTemplateData.input_schema?.types?.[fieldName] || 'text';
                
                return (
                  <div key={fieldName}>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      {label} <span className="text-slate-500 text-xs">(optional)</span>
                    </label>
                    {type === 'textarea' ? (
                      <textarea
                        value={inputs[fieldName] || ''}
                        onChange={(e) => setInputs({ ...inputs, [fieldName]: e.target.value })}
                        placeholder={placeholder}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                        rows={2}
                        disabled={isLoading}
                      />
                    ) : (
                      <input
                        type={type}
                        value={inputs[fieldName] || ''}
                        onChange={(e) => setInputs({ ...inputs, [fieldName]: e.target.value })}
                        placeholder={placeholder}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        disabled={isLoading}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Progress Bar */}
          {isLoading && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Generating your creative...</span>
                <span className="text-slate-300 font-medium">{progress}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isLoading || !selectedTemplate || loadingTemplates}
            className="btn-cta-primary w-full disabled:opacity-50 disabled:cursor-not-allowed py-2.5"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Creative
              </>
            )}
          </Button>

          <p className="text-xs text-slate-500 text-center">
            Free demo • No credit card required • Rate limited by IP
          </p>
        </div>
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
        prompt={inputs.headline || Object.values(inputs).join(', ')}
      />
    </div>
  );
};
