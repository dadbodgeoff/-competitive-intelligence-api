import React, { useState } from 'react';
import { X, FileText, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PolicyConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: (termsVersion: string, privacyVersion: string) => void;
}

const TERMS_VERSION = '1.0';
const PRIVACY_VERSION = '1.0';

export const PolicyConsentModal: React.FC<PolicyConsentModalProps> = ({
  isOpen,
  onClose,
  onAccept,
}) => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  if (!isOpen) return null;

  const handleAccept = () => {
    if (termsAccepted && privacyAccepted) {
      onAccept(TERMS_VERSION, PRIVACY_VERSION);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="rounded-xl shadow-xl max-w-md w-full mx-4" style={{ backgroundColor: '#1E1E1E', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <h2 className="text-xl font-semibold" style={{ color: '#E0E0E0' }}>Before You Continue</h2>
          <button
            onClick={onClose}
            className="transition-colors"
            style={{ color: '#A8B1B9' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-sm" style={{ color: '#A8B1B9' }}>
            To use our live demo, please review and accept our policies:
          </p>

          <div className="space-y-4">
            <label className="flex items-start gap-4 cursor-pointer group">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 rounded"
                style={{ borderColor: '#4A6572' }}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" style={{ color: '#A8B1B9' }} />
                  <span className="text-sm" style={{ color: '#E0E0E0' }}>Terms of Service</span>
                </div>
                <a
                  href="/legal/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs underline"
                  style={{ color: '#4A6572' }}
                >
                  Read our Terms of Service
                </a>
              </div>
            </label>

            <label className="flex items-start gap-4 cursor-pointer group">
              <input
                type="checkbox"
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 rounded"
                style={{ borderColor: '#4A6572' }}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" style={{ color: '#A8B1B9' }} />
                  <span className="text-sm" style={{ color: '#E0E0E0' }}>Privacy Policy</span>
                </div>
                <a
                  href="/legal/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs underline"
                  style={{ color: '#4A6572' }}
                >
                  Read our Privacy Policy
                </a>
              </div>
            </label>
          </div>

          <div className="rounded-xl p-6" style={{ backgroundColor: '#121212', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <p className="text-xs" style={{ color: '#A8B1B9' }}>
              By accepting, you agree to our use of cookies and data processing as described in our policies.
              This demo is rate-limited by IP address.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-6 p-6 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <Button
            variant="outline"
            onClick={onClose}
            style={{ borderColor: '#4A6572', color: '#A8B1B9' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAccept}
            disabled={!termsAccepted || !privacyAccepted}
            className="text-white disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#B08968' }}
          >
            Accept & Continue
          </Button>
        </div>
      </div>
    </div>
  );
};
