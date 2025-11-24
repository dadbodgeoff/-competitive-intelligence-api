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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-800 rounded-lg shadow-2xl max-w-4xl w-full border border-slate-700 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
          <h2 className="text-xl font-semibold text-slate-100">Your Generated Image</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Preview Image */}
          <div className="relative rounded-lg overflow-hidden bg-slate-900 border border-slate-700">
            <img
              src={previewUrl}
              alt="Generated preview"
              className="w-full h-auto"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Prompt Display */}
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
            <p className="text-xs text-slate-400 mb-1">Prompt used:</p>
            <p className="text-sm text-slate-200">{prompt}</p>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-6 border border-blue-700/50">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center">
                  <Save className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-100 mb-2">
                  Want to save or download this image?
                </h3>
                <p className="text-sm text-slate-300 mb-4">
                  Create a free account to download your generated images, save them to your library, 
                  and generate unlimited variations with our full creative suite.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handleSignUp}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create Free Account
                  </Button>
                  <Button
                    onClick={handleLogin}
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
              <Download className="w-5 h-5 text-blue-400 mb-2" />
              <h4 className="text-sm font-semibold text-slate-200 mb-1">Download HD</h4>
              <p className="text-xs text-slate-400">Get high-resolution downloads</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
              <Save className="w-5 h-5 text-purple-400 mb-2" />
              <h4 className="text-sm font-semibold text-slate-200 mb-1">Save Library</h4>
              <p className="text-xs text-slate-400">Build your creative collection</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
              <UserPlus className="w-5 h-5 text-green-400 mb-2" />
              <h4 className="text-sm font-semibold text-slate-200 mb-1">Free Forever</h4>
              <p className="text-xs text-slate-400">No credit card required</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
