import React from 'react';
import { X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: {
    id: string;
    name: string;
    display_name?: string;
    preview_url?: string;
    description?: string;
    input_schema?: {
      required?: string[];
      optional?: string[];
      labels?: Record<string, string>;
      placeholders?: Record<string, string>;
    };
  } | null;
  onSelect: () => void;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  isOpen,
  onClose,
  template,
  onSelect,
}) => {
  if (!isOpen || !template) return null;

  const handleSelect = () => {
    onSelect();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" style={{ backgroundColor: 'rgba(18, 18, 18, 0.9)' }}>
      <div className="relative w-full max-w-2xl rounded-xl shadow-2xl max-h-[85vh] overflow-y-auto" style={{ backgroundColor: '#1E1E1E', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-lg transition-colors"
          style={{ backgroundColor: '#121212', color: '#A8B1B9' }}
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Preview Image */}
        {template.preview_url && (
          <div className="relative w-full h-48 rounded-t-xl overflow-hidden" style={{ backgroundColor: '#121212' }}>
            <img
              src={template.preview_url}
              alt={template.display_name || template.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t via-transparent to-transparent" style={{ backgroundImage: 'linear-gradient(to top, #1E1E1E, transparent, transparent)' }} />
          </div>
        )}

        {/* Content - BRAND: 24px padding */}
        <div className="p-6 space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-xl font-bold mb-2" style={{ color: '#E0E0E0' }}>
              {template.display_name || template.name}
            </h2>
            {template.description && (
              <p className="text-sm" style={{ color: '#A8B1B9' }}>{template.description}</p>
            )}
          </div>

          {/* Required Fields */}
          {template.input_schema?.required && template.input_schema.required.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-[#E0E0E0] mb-2 uppercase tracking-wide">
                Required Information
              </h3>
              <div className="space-y-1.5">
                {template.input_schema.required.map((field) => {
                  const label = template.input_schema?.labels?.[field] || field;
                  const placeholder = template.input_schema?.placeholders?.[field] || '';
                  return (
                    <div
                      key={field}
                      className="flex items-center gap-2.5 p-2.5 bg-[#121212]/60 rounded-lg border border-[#1E1E1E]"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#E0E0E0] truncate">{label}</p>
                        {placeholder && (
                          <p className="text-xs text-[#A8B1B9] mt-0.5 truncate">e.g., {placeholder}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Optional Fields */}
          {template.input_schema?.optional && template.input_schema.optional.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-[#A8B1B9] mb-2 uppercase tracking-wide">
                Optional Information
              </h3>
              <div className="space-y-1.5">
                {template.input_schema.optional.map((field) => {
                  const label = template.input_schema?.labels?.[field] || field;
                  return (
                    <div
                      key={field}
                      className="flex items-center gap-2.5 p-2.5 bg-[#121212]/40 rounded-lg border border-[#1E1E1E]/50"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-[#A8B1B9] flex-shrink-0" />
                      <p className="text-sm text-[#A8B1B9] truncate">{label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-3">
            <Button
              onClick={handleSelect}
              className="flex-1 bg-[#B08968] hover:bg-[#9A5C4A] text-white h-10 text-sm"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Use This Template
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="border-[#1E1E1E] text-[#A8B1B9] hover:text-white hover:bg-[#121212] h-10 px-5 text-sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
