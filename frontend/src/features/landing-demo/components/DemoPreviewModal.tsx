import React from 'react';
import { X, Download, Save, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface DemoPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  previewUrl: string;
  prompt: string;
}

export const DemoPreviewModal: React.FC<DemoPreviewModalProps> = ({
  isOpen,
  onClose,
  previewUrl,
  prompt,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSignUp = () => {
    navigate('/register');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4" style={{ backgroundColor: 'rgba(18, 18, 18, 0.7)' }}>
      <div className="rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: '#1E1E1E', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <div className="flex items-center justify-between p-6 border-b sticky top-0 z-10" style={{ backgroundColor: '#1E1E1E', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <h2 className="text-xl font-semibold" style={{ color: '#E0E0E0' }}>Your Generated Image</h2>
          <button
            onClick={onClose}
            className="transition-colors"
            style={{ color: '#A8B1B9' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Preview Image */}
          <div className="relative rounded-xl overflow-hidden" style={{ backgroundColor: '#121212', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <img
              src={previewUrl}
              alt="Generated preview"
              className="w-full h-auto"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Prompt Display */}
          <div className="rounded-xl p-6" style={{ backgroundColor: '#121212', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <p className="text-xs mb-1" style={{ color: '#A8B1B9' }}>Prompt used:</p>
            <p className="text-sm" style={{ color: '#E0E0E0' }}>{prompt}</p>
          </div>

          {/* Call to Action - BRAND: CTA Primary Color */}
          <div className="rounded-xl p-6" style={{ backgroundColor: 'rgba(176, 137, 104, 0.1)', border: '1px solid rgba(176, 137, 104, 0.3)' }}>
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(176, 137, 104, 0.2)' }}>
                  <Save className="w-6 h-6" style={{ color: '#B08968' }} />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#E0E0E0' }}>
                  Want to save or download this image?
                </h3>
                <p className="text-sm mb-4" style={{ color: '#A8B1B9' }}>
                  Create a free account to download your generated images, save them to your library, 
                  and generate unlimited variations with our full creative suite.
                </p>
                <div className="flex flex-wrap gap-6">
                  <Button
                    onClick={handleSignUp}
                    className="text-white"
                    style={{ backgroundColor: '#B08968' }}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create Free Account
                  </Button>
                  <Button
                    onClick={handleLogin}
                    variant="outline"
                    style={{ borderColor: '#4A6572', color: '#A8B1B9' }}
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Features List - BRAND: 24px gutters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl p-6" style={{ backgroundColor: '#121212', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <Download className="w-5 h-5 mb-2" style={{ color: '#B08968' }} />
              <h4 className="text-sm font-semibold mb-1" style={{ color: '#E0E0E0' }}>Download HD</h4>
              <p className="text-xs" style={{ color: '#A8B1B9' }}>Get high-resolution downloads</p>
            </div>
            <div className="rounded-xl p-6" style={{ backgroundColor: '#121212', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <Save className="w-5 h-5 mb-2" style={{ color: '#B08968' }} />
              <h4 className="text-sm font-semibold mb-1" style={{ color: '#E0E0E0' }}>Save Library</h4>
              <p className="text-xs" style={{ color: '#A8B1B9' }}>Build your creative collection</p>
            </div>
            <div className="rounded-xl p-6" style={{ backgroundColor: '#121212', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <UserPlus className="w-5 h-5 mb-2" style={{ color: '#264653' }} />
              <h4 className="text-sm font-semibold mb-1" style={{ color: '#E0E0E0' }}>Free Forever</h4>
              <p className="text-xs" style={{ color: '#A8B1B9' }}>No credit card required</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
