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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4 border border-slate-700">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-slate-100">Before You Continue</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-slate-300 text-sm">
            To use our live demo, please review and accept our policies:
          </p>

          <div className="space-y-3">
            <label className="flex items-start space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-slate-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-800"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-200">Terms of Service</span>
                </div>
                <a
                  href="/legal/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 underline"
                >
                  Read our Terms of Service
                </a>
              </div>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-slate-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-800"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-200">Privacy Policy</span>
                </div>
                <a
                  href="/legal/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 underline"
                >
                  Read our Privacy Policy
                </a>
              </div>
            </label>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
            <p className="text-xs text-slate-400">
              By accepting, you agree to our use of cookies and data processing as described in our policies.
              This demo is rate-limited by IP address.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-700">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAccept}
            disabled={!termsAccepted || !privacyAccepted}
            className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Accept & Continue
          </Button>
        </div>
      </div>
    </div>
  );
};
