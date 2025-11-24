/**
 * Creative Module Spotlight
 * 
 * Reusable component that showcases the Creative Module with a demo.
 * Can be shown on first login, dashboard, or anywhere in the app.
 * Includes "Don't show again" preference.
 */
import React, { useState } from 'react';
import { X, Sparkles, Image, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CreativeModuleSpotlightProps {
  onClose: () => void;
  onDismissPermanently: () => void;
  variant?: 'modal' | 'card' | 'banner';
  showDemoButton?: boolean;
}

export const CreativeModuleSpotlight: React.FC<CreativeModuleSpotlightProps> = ({
  onClose,
  onDismissPermanently,
  variant = 'modal',
  showDemoButton = true,
}) => {
  const navigate = useNavigate();
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = () => {
    if (dontShowAgain) {
      onDismissPermanently();
    } else {
      onClose();
    }
  };

  const handleTryDemo = () => {
    navigate('/creative/generate');
    handleClose();
  };

  const handleViewExample = () => {
    // Open demo modal or navigate to examples
    navigate('/creative/generate?demo=true');
    handleClose();
  };

  const features = [
    {
      icon: <Sparkles className="w-5 h-5 text-[#F0544F]" />,
      title: 'AI-Powered Generation',
      description: 'Create professional marketing images in seconds',
    },
    {
      icon: <Image className="w-5 h-5 text-[#F0544F]" />,
      title: 'Themed Templates',
      description: 'Pizza drops, review showcases, hiring flyers & more',
    },
    {
      icon: <Zap className="w-5 h-5 text-[#F0544F]" />,
      title: 'Brand Consistency',
      description: 'Automatically matches your brand voice and style',
    },
  ];

  // Modal variant (full overlay)
  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          {/* Header with gradient */}
          <div className="bg-gradient-to-br from-[#F0544F] to-[#E04440] text-white p-8 pb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">AI Creative Studio</h2>
                <p className="text-white/90 text-sm">Generate marketing images in seconds</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 -mt-6">
            {/* Preview card */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 p-6 mb-6 shadow-sm">
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg mb-4 flex items-center justify-center">
                <div className="text-center">
                  <Image className="w-16 h-16 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Preview Example</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 text-center">
                See how restaurants create stunning social media posts, hiring flyers, and promotional materials
              </p>
            </div>

            {/* Features grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {features.map((feature, index) => (
                <div key={index} className="flex flex-col items-center text-center p-4 rounded-lg bg-gray-50">
                  <div className="mb-2">{feature.icon}</div>
                  <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                  <p className="text-xs text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <button
                onClick={handleViewExample}
                className="flex-1 px-6 py-3 border-2 border-[#F0544F] text-[#F0544F] rounded-lg font-semibold hover:bg-[#F0544F] hover:text-white transition-colors"
              >
                View Examples
              </button>
              {showDemoButton && (
                <button
                  onClick={handleTryDemo}
                  className="flex-1 px-6 py-3 bg-[#F0544F] text-white rounded-lg font-semibold hover:bg-[#E04440] transition-colors shadow-lg shadow-[#F0544F]/20"
                >
                  Try Demo Now
                </button>
              )}
            </div>

            {/* Don't show again */}
            <label className="flex items-center justify-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-gray-800">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="rounded border-gray-300 text-[#F0544F] focus:ring-[#F0544F]"
              />
              Don't show this again
            </label>
          </div>
        </div>
      </div>
    );
  }

  // Card variant (inline on dashboard)
  if (variant === 'card') {
    return (
      <div className="relative bg-gradient-to-br from-[#F0544F] to-[#E04440] rounded-2xl p-6 text-white shadow-xl overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }} />
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="relative">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Try Our AI Creative Studio</h3>
              <p className="text-white/90 text-sm mb-4">
                Generate professional marketing images in seconds. Perfect for social media, hiring, and promotions.
              </p>
            </div>
          </div>

          {/* Quick features */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium backdrop-blur-sm">
              🍕 Menu Drops
            </span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium backdrop-blur-sm">
              ⭐ Review Showcases
            </span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium backdrop-blur-sm">
              👨‍🍳 Hiring Flyers
            </span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium backdrop-blur-sm">
              🎉 Event Promos
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleViewExample}
              className="flex-1 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg font-semibold hover:bg-white/30 transition-colors text-sm"
            >
              View Examples
            </button>
            {showDemoButton && (
              <button
                onClick={handleTryDemo}
                className="flex-1 px-4 py-2 bg-white text-[#F0544F] rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm shadow-lg"
              >
                Try Demo
              </button>
            )}
          </div>

          {/* Don't show again */}
          <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer hover:text-white mt-4">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded border-white/30 bg-white/20 text-white focus:ring-white/50"
            />
            Don't show this again
          </label>
        </div>
      </div>
    );
  }

  // Banner variant (top of page)
  if (variant === 'banner') {
    return (
      <div className="relative bg-gradient-to-r from-[#F0544F] to-[#E04440] text-white px-6 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <Sparkles className="w-6 h-6 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">
                🎨 New: AI Creative Studio - Generate professional marketing images in seconds
              </p>
              <p className="text-sm text-white/90">
                Try our themed templates for menu drops, review showcases, and hiring flyers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleTryDemo}
              className="px-4 py-2 bg-white text-[#F0544F] rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm whitespace-nowrap"
            >
              Try Demo
            </button>
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Don't show again (bottom right) */}
        <label className="absolute bottom-2 right-6 flex items-center gap-2 text-xs text-white/80 cursor-pointer hover:text-white">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="rounded border-white/30 bg-white/20 text-white focus:ring-white/50"
          />
          Don't show this again
        </label>
      </div>
    );
  }

  return null;
};
