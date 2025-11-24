import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, AlertCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PolicyConsentModal } from './PolicyConsentModal';
import { DemoPreviewModal } from './DemoPreviewModal';
import { TemplatePreviewModal } from './TemplatePreviewModal';
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
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [policyConsent, setPolicyConsent] = useState<PolicyConsent | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [sessionId, setSessionId] = useState<string>('');

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

      // Store session_id for later account claiming
      setSessionId(response.session_id);
      // Also store in localStorage for persistence across page navigation
      localStorage.setItem('demo_session_id', response.session_id);

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
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {templates.map((template) => (
                  <div key={template.id} className="relative group">
                    <button
                      onClick={() => handleTemplateSelect(template)}
                      className={`w-full relative rounded-lg overflow-hidden border-2 transition-all ${
                        selectedTemplate === template.id
                          ? 'border-primary-500 ring-2 ring-primary-500/50'
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      {template.preview_url ? (
                        <>
                          <img
                            src={template.preview_url}
                            alt={template.display_name || template.name}
                            className="w-full h-24 object-cover"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2">
                            <p className="text-xs text-white font-medium truncate">
                              {template.display_name || template.name}
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-24 bg-slate-700 flex items-center justify-center p-2">
                          <span className="text-xs text-slate-300 text-center leading-tight">
                            {template.display_name || template.name}
                          </span>
                        </div>
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewTemplate(template);
                        setShowTemplatePreview(true);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-md bg-[#121212]/90 hover:bg-[#121212] text-slate-300 hover:text-white opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm border border-[#1E1E1E]"
                      title="Preview template"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dynamic Input Fields */}
          {selectedTemplateData && selectedTemplateData.input_schema && (
            <div className="bg-[#1E1E1E]/60 border border-[#1E1E1E] rounded-xl p-4">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wide">
                Template Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Required Fields */}
              {selectedTemplateData.input_schema.required?.map((fieldName) => {
                const label = selectedTemplateData.input_schema?.labels?.[fieldName] || fieldName;
                const placeholder = selectedTemplateData.input_schema?.placeholders?.[fieldName] || `Enter ${label.toLowerCase()}`;
                const type = selectedTemplateData.input_schema?.types?.[fieldName] || 'text';
                
                return (
                  <div key={fieldName} className={type === 'textarea' ? 'md:col-span-2' : ''}>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-400"></span>
                      {label}
                      <span className="text-destructive text-sm">*</span>
                    </label>
                    {type === 'textarea' ? (
                      <textarea
                        value={inputs[fieldName] || ''}
                        onChange={(e) => setInputs({ ...inputs, [fieldName]: e.target.value })}
                        placeholder={placeholder}
                        className="w-full px-4 py-3 bg-[#121212]/80 border border-[#1E1E1E] rounded-lg text-sm text-[#E0E0E0] placeholder-[#A8B1B9] focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all hover:border-[#1E1E1E] resize-none"
                        rows={3}
                        disabled={isLoading}
                      />
                    ) : (
                      <input
                        type={type}
                        value={inputs[fieldName] || ''}
                        onChange={(e) => setInputs({ ...inputs, [fieldName]: e.target.value })}
                        placeholder={placeholder}
                        className="w-full px-4 py-3 bg-[#121212]/80 border border-[#1E1E1E] rounded-lg text-sm text-[#E0E0E0] placeholder-[#A8B1B9] focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all hover:border-[#1E1E1E]"
                        disabled={isLoading}
                      />
                    )}
                  </div>
                );
              })}
              
              {/* Optional Fields */}
              {selectedTemplateData.input_schema.optional?.map((fieldName) => {
                const label = selectedTemplateData.input_schema?.labels?.[fieldName] || fieldName;
                const placeholder = selectedTemplateData.input_schema?.placeholders?.[fieldName] || `${label} (optional)`;
                const type = selectedTemplateData.input_schema?.types?.[fieldName] || 'text';
                
                return (
                  <div key={fieldName} className={type === 'textarea' ? 'md:col-span-2' : ''}>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                      {label}
                      <span className="text-slate-600 text-xs ml-1">(optional)</span>
                    </label>
                    {type === 'textarea' ? (
                      <textarea
                        value={inputs[fieldName] || ''}
                        onChange={(e) => setInputs({ ...inputs, [fieldName]: e.target.value })}
                        placeholder={placeholder}
                        className="w-full px-4 py-3 bg-[#121212]/60 border border-[#1E1E1E]/70 rounded-lg text-sm text-[#E0E0E0] placeholder-[#A8B1B9] focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all hover:border-[#1E1E1E] resize-none"
                        rows={3}
                        disabled={isLoading}
                      />
                    ) : (
                      <input
                        type={type}
                        value={inputs[fieldName] || ''}
                        onChange={(e) => setInputs({ ...inputs, [fieldName]: e.target.value })}
                        placeholder={placeholder}
                        className="w-full px-4 py-3 bg-[#121212]/60 border border-[#1E1E1E]/70 rounded-lg text-sm text-[#E0E0E0] placeholder-[#A8B1B9] focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all hover:border-[#1E1E1E]"
                        disabled={isLoading}
                      />
                    )}
                  </div>
                );
              })}
              </div>
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
                  className="bg-gradient-to-r bg-primary-500 h-full transition-all duration-300 ease-out"
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
      <TemplatePreviewModal
        isOpen={showTemplatePreview}
        onClose={() => setShowTemplatePreview(false)}
        template={previewTemplate}
        onSelect={() => {
          if (previewTemplate) {
            handleTemplateSelect(previewTemplate);
          }
        }}
      />

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
