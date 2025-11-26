/**
 * First Login Welcome Experience
 * 
 * Shows a comprehensive welcome modal on first login with:
 * - Platform overview
 * - Quick tour option
 * - Creative Module spotlight
 */
import React, { useState } from 'react';
import { X, ChevronRight, Sparkles, FileText, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FirstLoginWelcomeProps {
  userName: string;
  onClose: () => void;
}

export const FirstLoginWelcome: React.FC<FirstLoginWelcomeProps> = ({
  userName,
  onClose,
}) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: `Welcome, ${userName}! 👋`,
      description: 'We\'ve set you up with demo data',
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-500 text-white rounded-xl flex items-center justify-center text-2xl">
                📊
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-blue-900 mb-2">Your Dashboard is Ready!</h3>
                <p className="text-blue-800">
                  So you can explore immediately, we've added realistic sample data from "Demo Bistro"
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-blue-200">
                <div className="font-semibold text-blue-900 mb-1">✅ 3 Sample Invoices</div>
                <p className="text-sm text-blue-700">From Sysco & Performance Foodservice</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-blue-200">
                <div className="font-semibold text-blue-900 mb-1">✅ 1 Sample Menu</div>
                <p className="text-sm text-blue-700">With 3 signature items & recipes</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-blue-200">
                <div className="font-semibold text-blue-900 mb-1">✅ Full COGS Calculations</div>
                <p className="text-sm text-blue-700">See exactly what each dish costs</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-blue-200">
                <div className="font-semibold text-blue-900 mb-1">✅ Price Tracking & Alerts</div>
                <p className="text-sm text-blue-700">Ground beef price spiked 23%!</p>
              </div>
            </div>

            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔄</span>
                <div>
                  <h4 className="font-bold text-green-900 mb-1">Auto-Cleanup Feature</h4>
                  <p className="text-sm text-green-800">
                    When you upload your first real invoice or menu, this demo data <strong>automatically disappears</strong>. 
                    No cleanup needed—just upload and go!
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-900">
              <strong>💡 Pro Tip:</strong> Explore the dashboard, check price alerts, and view COGS breakdown 
              to see what the platform can do. Then upload your real data to get started!
            </p>
          </div>
        </div>
      ),
    },
    {
      title: `Now let's create something fun! 🎨`,
      description: 'Let\'s start with something fun',
      content: (
        <div className="space-y-6">
          <p className="text-lg text-gray-700">
            Before we dive into the numbers, let's create something awesome for your restaurant.
          </p>

          {/* Hero Creative Module */}
          <div className="bg-gradient-to-br from-[#F0544F] to-[#E04440] rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 bg-white/20 rounded-bl-xl text-sm font-bold backdrop-blur-sm">
              START HERE
            </div>
            <div className="relative z-10">
              <Sparkles className="w-12 h-12 mb-4" />
              <h3 className="text-2xl font-bold mb-3">AI Creative Studio</h3>
              <p className="text-white/95 text-lg mb-4">
                Generate professional marketing images in seconds. No design skills needed.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                  🍕 Menu Drops
                </span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                  ⭐ Review Showcases
                </span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                  👨‍🍳 Hiring Flyers
                </span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                  🎉 Event Promos
                </span>
              </div>
            </div>
          </div>

          {/* Then the money-makers */}
          <div>
            <p className="text-sm text-gray-600 mb-3 font-medium">Then unlock the money-makers:</p>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-start gap-3 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-green-900 mb-1">Invoice Upload + Price Analytics</h4>
                  <p className="text-sm text-green-800">Upload invoices, track prices, get alerts when costs spike. Save thousands.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 mb-1">Cost of Goods Tracker</h4>
                  <p className="text-sm text-blue-800">Know exactly what each dish costs. Optimize your menu for profit.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '🎨 Create Your First Marketing Image',
      description: 'Takes less than 60 seconds (no data upload needed!)',
      content: (
        <div className="space-y-6">
          <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl flex items-center justify-center border-2 border-gray-200 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#F0544F]/5 to-[#E04440]/5" />
            <div className="text-center relative z-10">
              <Sparkles className="w-16 h-16 text-[#F0544F] mx-auto mb-3 animate-pulse" />
              <p className="text-lg font-semibold text-gray-700 mb-1">Ready to create?</p>
              <p className="text-sm text-gray-500">Choose a template, fill in details, generate</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-5">
              <h3 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                <span className="text-2xl">🚀</span>
                Why start here?
              </h3>
              <ul className="space-y-2 text-sm text-purple-800">
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 font-bold">•</span>
                  <span><strong>Instant results</strong> - See the platform's power immediately</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 font-bold">•</span>
                  <span><strong>No data needed</strong> - Just your restaurant name and a headline</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 font-bold">•</span>
                  <span><strong>Share today</strong> - Download and post to social media right away</span>
                </li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-900">
                <strong>💡 Pro Tip:</strong> Most restaurants create 3-5 images in their first session. 
                Our AI learns your brand voice and makes each one better.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '📤 Upload Features Explained',
      description: 'AI-powered with 95%+ accuracy',
      content: (
        <div className="space-y-6">
          <p className="text-gray-700">
            Our AI automatically processes your invoices and menus with industry-leading accuracy. 
            Human verification is available for edge cases.
          </p>

          {/* Invoice Upload */}
          <div className="border-2 border-gray-200 rounded-xl p-5 bg-gradient-to-br from-gray-50 to-white">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-8 h-8 text-[#F0544F]" />
              <div>
                <h3 className="font-bold text-lg">Invoice Upload</h3>
                <p className="text-sm text-gray-600">Upload PDF or image, AI does the rest</p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <div className="flex-1">
                  <p className="text-sm"><strong>Upload:</strong> Drag & drop PDF or image (max 10MB)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <div className="flex-1">
                  <p className="text-sm"><strong>AI Parsing:</strong> Extracts vendor, date, line items, prices (30-60 sec)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <div className="flex-1">
                  <p className="text-sm"><strong>Auto-Matching:</strong> Links items to inventory (fuzzy matching)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  4
                </div>
                <div className="flex-1">
                  <p className="text-sm"><strong>Price Tracking:</strong> Detects spikes, generates alerts</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-900">
                <strong>✅ 95%+ Accuracy</strong> on line items, 98%+ on totals. 
                Review screen lets you verify before processing.
              </p>
            </div>
          </div>

          {/* Menu Upload */}
          <div className="border-2 border-gray-200 rounded-xl p-5 bg-gradient-to-br from-gray-50 to-white">
            <div className="flex items-center gap-3 mb-4">
              <Menu className="w-8 h-8 text-[#F0544F]" />
              <div>
                <h3 className="font-bold text-lg">Menu Upload</h3>
                <p className="text-sm text-gray-600">Parse menus, calculate COGS automatically</p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <div className="flex-1">
                  <p className="text-sm"><strong>Upload:</strong> PDF or image of your menu</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <div className="flex-1">
                  <p className="text-sm"><strong>AI Parsing:</strong> Extracts categories, items, prices, descriptions (45-90 sec)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <div className="flex-1">
                  <p className="text-sm"><strong>Recipe Builder:</strong> Link ingredients from invoices to menu items</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  4
                </div>
                <div className="flex-1">
                  <p className="text-sm"><strong>COGS Calculation:</strong> Automatic cost tracking per dish</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900">
                <strong>✅ 95%+ Accuracy</strong> on items, 90%+ on prices. 
                Handles multi-size items (Small/Large) automatically.
              </p>
            </div>
          </div>

          {/* Human Verification */}
          <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
            <h4 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
              <span className="text-xl">👤</span>
              When Human Verification Helps
            </h4>
            <ul className="space-y-1 text-sm text-purple-800">
              <li className="flex items-start gap-2">
                <span className="text-purple-500">•</span>
                <span>Fuzzy matches with &lt;80% confidence</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500">•</span>
                <span>Unusual pack sizes or handwritten invoices</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500">•</span>
                <span>Price spikes &gt;50% (double-check for errors)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500">•</span>
                <span>First-time items (verify category and unit)</span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      // Go to Creative Studio
      navigate('/creative');
      onClose();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Progress indicator */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200">
          <div
            className="h-full bg-[#F0544F] transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-8 pt-12">
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2">{currentStepData.title}</h2>
            <p className="text-gray-600">{currentStepData.description}</p>
          </div>

          <div className="mb-8">
            {currentStepData.content}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Skip for now
            </button>

            <div className="flex items-center gap-3">
              {/* Step indicator */}
              <div className="flex gap-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentStep ? 'bg-[#F0544F]' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="px-6 py-3 bg-[#F0544F] text-white rounded-lg font-semibold hover:bg-[#E04440] transition-colors shadow-lg shadow-[#F0544F]/20 flex items-center gap-2"
              >
                {isLastStep ? 'Try Creative Studio' : 'Next'}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
