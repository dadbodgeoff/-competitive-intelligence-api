import React, { useEffect, useState } from 'react';

type Mode = 'creative' | 'invoice';

interface CreativeItem {
  restaurantType: string;
  prompt: string;
  title: string;
  image: string;
}

const creativeItems: CreativeItem[] = [
  {
    restaurantType: 'Taco Tuesday',
    prompt: 'Taco Tuesday — $2 Street Tacos All Night',
    title: 'TACO TUESDAY',
    image: '/examples/creative-example-1.jpg',
  },
  {
    restaurantType: 'Live Music Event',
    prompt: 'Live Music Tonight — 9PM • No Cover',
    title: 'LIVE MUSIC',
    image: '/examples/creative-example-2.jpg',
  },
  {
    restaurantType: 'Fresh Seafood',
    prompt: 'Fresh Sashimi Special — Limited Availability',
    title: 'FRESH SASHIMI',
    image: '/examples/creative-example-3.jpg',
  },
];

// Phase transition wrapper
const PhaseContainer: React.FC<{ children: React.ReactNode; isTransitioning: boolean }> = ({
  children,
  isTransitioning,
}) => (
  <div
    className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
  >
    {children}
  </div>
);

interface HeroShowcaseProps {
  isLoaded: boolean;
}

export const HeroShowcase: React.FC<HeroShowcaseProps> = ({ isLoaded }) => {
  const [mode, setMode] = useState<Mode>('invoice');
  const [creativeIndex, setCreativeIndex] = useState(0);

  const [scanProgress, setScanProgress] = useState(0);
  const [invoicePhase, setInvoicePhase] = useState<
    'upload' | 'scanning' | 'extracted' | 'analytics' | 'gaps' | 'recommendations'
  >('upload');

  const [typedText, setTypedText] = useState('');
  const [generateProgress, setGenerateProgress] = useState(0);
  const [creativePhase, setCreativePhase] = useState<'typing' | 'generating' | 'complete'>('typing');
  const [phaseTransition, setPhaseTransition] = useState(false);

  const currentCreative = creativeItems[creativeIndex];

  // Trigger animation on phase change
  useEffect(() => {
    setPhaseTransition(true);
    const timer = setTimeout(() => setPhaseTransition(false), 300);
    return () => clearTimeout(timer);
  }, [invoicePhase, creativePhase]);

  // Mode switching - after invoice recommendations, switch to creative
  useEffect(() => {
    if (!isLoaded) return;
    if (mode === 'invoice' && invoicePhase === 'recommendations') {
      const timer = setTimeout(() => {
        setMode('creative');
        setCreativePhase('typing');
        setTypedText('');
        setGenerateProgress(0);
      }, 3000);
      return () => clearTimeout(timer);
    }
    if (mode === 'creative' && creativePhase === 'complete') {
      const timer = setTimeout(() => {
        setMode('invoice');
        setInvoicePhase('upload');
        setScanProgress(0);
        setCreativeIndex((prev) => (prev + 1) % creativeItems.length);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, mode, invoicePhase, creativePhase]);

  // Invoice phase progression
  useEffect(() => {
    if (!isLoaded || mode !== 'invoice') return;

    if (invoicePhase === 'upload') {
      const timer = setTimeout(() => setInvoicePhase('scanning'), 1000);
      return () => clearTimeout(timer);
    }

    if (invoicePhase === 'scanning') {
      if (scanProgress < 100) {
        const timer = setTimeout(() => setScanProgress((prev) => Math.min(prev + 2.5, 100)), 30);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => setInvoicePhase('extracted'), 500);
        return () => clearTimeout(timer);
      }
    }

    if (invoicePhase === 'extracted') {
      const timer = setTimeout(() => setInvoicePhase('analytics'), 2000);
      return () => clearTimeout(timer);
    }

    if (invoicePhase === 'analytics') {
      const timer = setTimeout(() => setInvoicePhase('gaps'), 3000);
      return () => clearTimeout(timer);
    }

    if (invoicePhase === 'gaps') {
      const timer = setTimeout(() => setInvoicePhase('recommendations'), 2500);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, mode, invoicePhase, scanProgress]);

  // Creative typing animation
  useEffect(() => {
    if (mode !== 'creative' || creativePhase !== 'typing') return;
    const fullText = currentCreative.prompt;
    if (typedText.length < fullText.length) {
      const timer = setTimeout(() => {
        setTypedText(fullText.slice(0, typedText.length + 1));
      }, 30);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setCreativePhase('generating'), 300);
      return () => clearTimeout(timer);
    }
  }, [mode, creativePhase, typedText, currentCreative.prompt]);

  // Creative generation progress
  useEffect(() => {
    if (mode !== 'creative' || creativePhase !== 'generating') return;
    if (generateProgress < 100) {
      const timer = setTimeout(() => {
        setGenerateProgress((prev) => Math.min(prev + 3, 100));
      }, 25);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setCreativePhase('complete'), 200);
      return () => clearTimeout(timer);
    }
  }, [mode, creativePhase, generateProgress]);

  return (
    <div className="relative w-full max-w-md mx-auto lg:max-w-lg">
      {/* Enhanced depth layers behind demo */}
      {/* Outer glow ring */}
      <div
        className="absolute -inset-16 rounded-[40px] blur-[120px] opacity-30 pointer-events-none animate-pulse"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(176, 137, 104, 0.3) 0%, transparent 70%)',
          animationDuration: '4s',
        }}
      />
      {/* Primary glow */}
      <div
        className="absolute -inset-10 rounded-3xl blur-[100px] opacity-40 pointer-events-none transition-all duration-1000"
        style={{
          background: 'radial-gradient(circle at 30% 50%, rgba(176, 137, 104, 0.35) 0%, transparent 50%)',
        }}
      />
      {/* Secondary accent glow */}
      <div
        className="absolute -inset-8 rounded-3xl blur-[80px] opacity-25 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 70% 70%, rgba(74, 101, 114, 0.3) 0%, transparent 60%)',
        }}
      />
      {/* Inner highlight */}
      <div
        className="absolute -inset-4 rounded-2xl blur-[40px] opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 30%, rgba(212, 165, 116, 0.4) 0%, transparent 50%)',
        }}
      />

      <div
        className={`relative rounded-2xl overflow-hidden transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        style={{
          background: 'linear-gradient(165deg, rgba(18, 18, 18, 0.95) 0%, rgba(10, 10, 10, 0.98) 100%)',
          border: '1px solid rgba(176, 137, 104, 0.15)',
          boxShadow:
            '0 50px 100px -30px rgba(0, 0, 0, 0.8), 0 0 80px rgba(176, 137, 104, 0.2), inset 0 1px 0 rgba(176, 137, 104, 0.1)',
        }}
      >

        {/* Header bar with mode toggle */}
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{
            borderBottom: '1px solid rgba(176, 137, 104, 0.1)',
            background: 'linear-gradient(90deg, rgba(176, 137, 104, 0.03) 0%, rgba(10, 10, 10, 0.5) 100%)',
          }}
        >
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#28CA41]" />
            </div>
            <span className="text-[10px] font-medium text-white/30 ml-2">RestaurantIQ</span>
          </div>
          <div
            className="flex items-center gap-1 p-0.5 rounded-lg"
            style={{ background: 'rgba(176, 137, 104, 0.08)', border: '1px solid rgba(176, 137, 104, 0.15)' }}
          >
            <button
              onClick={() => {
                setMode('invoice');
                setScanProgress(0);
                setInvoicePhase('upload');
              }}
              className={`px-2 py-1 rounded text-[9px] font-medium transition-all ${mode === 'invoice' ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
              style={{
                background: mode === 'invoice' ? 'rgba(176, 137, 104, 0.2)' : 'transparent',
                border: mode === 'invoice' ? '1px solid rgba(176, 137, 104, 0.3)' : 'none',
              }}
            >
              Invoice AI
            </button>
            <button
              onClick={() => {
                setMode('creative');
                setCreativePhase('typing');
                setTypedText('');
                setGenerateProgress(0);
              }}
              className={`px-2 py-1 rounded text-[9px] font-medium transition-all ${mode === 'creative' ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
              style={{
                background: mode === 'creative' ? 'rgba(176, 137, 104, 0.2)' : 'transparent',
                border: mode === 'creative' ? '1px solid rgba(176, 137, 104, 0.3)' : 'none',
              }}
            >
              Creative AI
            </button>
          </div>
        </div>

        {/* Main content area */}
        <div className="p-5 min-h-[320px]">
          {/* INVOICE MODE */}
          {mode === 'invoice' && (
            <div className="space-y-4">
              {/* Upload phase */}
              {invoicePhase === 'upload' && (
                <PhaseContainer isTransitioning={phaseTransition}>
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-white/5 border border-white/10">
                      <svg className="w-8 h-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <p className="text-sm text-white/60 mb-2">Drop invoice or click to upload</p>
                    <p className="text-xs text-white/40">PDF, PNG, or JPG • Max 10MB</p>
                  </div>
                </PhaseContainer>
              )}

              {/* Scanning phase */}
              {invoicePhase === 'scanning' && (
                <PhaseContainer isTransitioning={phaseTransition}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <div className="w-2 h-2 rounded-full bg-[#B08968]" />
                          <div className="absolute inset-0 w-2 h-2 rounded-full animate-ping bg-[#B08968]" />
                        </div>
                        <span className="text-xs font-medium text-[#B08968]">Scanning invoice...</span>
                      </div>
                      <span className="text-xs font-bold text-[#B08968]">{Math.round(scanProgress)}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden bg-white/5">
                      <div
                        className="h-full rounded-full transition-all duration-100"
                        style={{
                          width: `${scanProgress}%`,
                          background: 'linear-gradient(90deg, #B08968 0%, #D4A574 100%)',
                          boxShadow: '0 0 15px rgba(176, 137, 104, 0.5)',
                        }}
                      />
                    </div>
                    <div className="space-y-2 mt-4">
                      {[
                        { text: 'Reading document...', show: scanProgress > 20 },
                        { text: 'Extracting line items...', show: scanProgress > 50 },
                        { text: 'Matching to inventory...', show: scanProgress > 80 },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className={`flex items-center gap-2 text-[11px] transition-all ${item.show ? 'opacity-100' : 'opacity-0'}`}
                        >
                          <svg className="w-3 h-3 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-white/60">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </PhaseContainer>
              )}


              {/* Extracted phase */}
              {invoicePhase === 'extracted' && (
                <PhaseContainer isTransitioning={phaseTransition}>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center bg-emerald-500/20">
                          <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span className="text-xs font-semibold text-emerald-400">Invoice Extracted</span>
                      </div>
                      <span className="text-[10px] text-white/40">5 of 5 items</span>
                    </div>
                    <div className="space-y-1.5">
                      {[
                        { name: 'Chicken Breast 10lb', qty: 2, unit: 'case', price: 42.5, total: 85.0 },
                        { name: 'Extra Virgin Olive Oil', qty: 1, unit: 'case', price: 28.75, total: 28.75 },
                        { name: 'Roma Tomatoes', qty: 3, unit: 'case', price: 18.5, total: 55.5 },
                        { name: 'Mozzarella Cheese', qty: 2, unit: 'case', price: 35.25, total: 70.5 },
                        { name: 'Pasta Penne', qty: 1, unit: 'case', price: 12.0, total: 12.0 },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2 rounded-lg border transition-all duration-300 hover:scale-[1.02] group"
                          style={{
                            background: 'linear-gradient(135deg, rgba(176, 137, 104, 0.05) 0%, rgba(30, 30, 30, 0.4) 100%)',
                            border: '1px solid rgba(176, 137, 104, 0.15)',
                            animation: `slideInLeft 0.4s ease-out ${i * 50}ms both`,
                          }}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div
                              className="w-0.5 h-8 rounded-full"
                              style={{ background: 'linear-gradient(180deg, #B08968 0%, rgba(176, 137, 104, 0) 100%)' }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] text-white font-medium truncate">{item.name}</p>
                              <p className="text-[9px] text-white/40">
                                {item.qty} {item.unit}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-[11px] text-white font-semibold">${item.price.toFixed(2)}</p>
                            <p className="text-[9px] text-white/40">${item.total.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </PhaseContainer>
              )}

              {/* Analytics phase */}
              {invoicePhase === 'analytics' && (
                <PhaseContainer isTransitioning={phaseTransition}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center bg-blue-500/20">
                          <svg className="w-3 h-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 7h8m0 0v8m0-8L5.257 19.393A2 2 0 005 18.46V5a2 2 0 012-2h10a2 2 0 012 2z"
                            />
                          </svg>
                        </div>
                        <span className="text-xs font-semibold text-blue-400">Price Trends</span>
                      </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                      <div className="flex items-end justify-between h-24 gap-2 pb-6 relative">
                        {[
                          { week: 'W1', price: 38.5, height: 35 },
                          { week: 'W2', price: 39.2, height: 50 },
                          { week: 'W3', price: 40.1, height: 75 },
                          { week: 'W4', price: 42.5, height: 100 },
                        ].map((point, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                            <div
                              className="w-full rounded-t transition-all duration-500"
                              style={{
                                height: `${point.height}%`,
                                minHeight: '12px',
                                background: 'linear-gradient(180deg, #D4A574 0%, #B08968 100%)',
                                boxShadow: '0 0 10px rgba(176, 137, 104, 0.3)',
                              }}
                            />
                            <span
                              className="text-[9px] text-white/50 absolute bottom-0"
                              style={{ left: `${i * 25 + 12.5}%`, transform: 'translateX(-50%)' }}
                            >
                              {point.week}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white/5 border border-white/10 rounded-lg p-2.5">
                        <p className="text-[10px] text-white/50 mb-1">Current Price</p>
                        <p className="text-sm font-bold text-white">$42.50</p>
                      </div>
                      <div
                        className="rounded-lg p-2.5"
                        style={{ background: 'rgba(176, 137, 104, 0.1)', border: '1px solid rgba(176, 137, 104, 0.3)' }}
                      >
                        <p className="text-[10px] mb-1 text-[#D4A574]">4-Week Change</p>
                        <p className="text-sm font-bold text-[#B08968]">+10.4%</p>
                      </div>
                    </div>
                  </div>
                </PhaseContainer>
              )}


              {/* Gaps phase */}
              {invoicePhase === 'gaps' && (
                <PhaseContainer isTransitioning={phaseTransition}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center bg-orange-500/20">
                          <svg className="w-3 h-3 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                          </svg>
                        </div>
                        <span className="text-xs font-semibold text-orange-400">Price Gaps Detected</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {[
                        { item: 'Chicken Breast', current: 42.5, competitor: 39.75, gap: 6.9 },
                        { item: 'Olive Oil', current: 28.75, competitor: 27.5, gap: 4.5 },
                        { item: 'Roma Tomatoes', current: 18.5, competitor: 17.8, gap: 3.9 },
                      ].map((gap, i) => (
                        <div
                          key={i}
                          className="rounded-lg p-2.5"
                          style={{
                            background: 'rgba(176, 137, 104, 0.1)',
                            border: '1px solid rgba(176, 137, 104, 0.3)',
                            animation: `fadeIn 0.3s ease-out ${i * 100}ms both`,
                          }}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="text-xs font-medium text-white">{gap.item}</p>
                            <span className="text-[10px] font-bold text-[#B08968]">+{gap.gap}%</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-white/60">Sysco: ${gap.current.toFixed(2)}</span>
                            <span className="text-emerald-400">vs ${gap.competitor.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </PhaseContainer>
              )}

              {/* Recommendations phase */}
              {invoicePhase === 'recommendations' && (
                <PhaseContainer isTransitioning={phaseTransition}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center bg-blue-500/20">
                          <svg className="w-3 h-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <span className="text-xs font-semibold text-blue-400">Action Items</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {[
                        { action: 'Negotiate with Sysco', savings: '$127/month', priority: 'High' },
                        { action: 'Switch chicken to US Foods', savings: '$89/month', priority: 'High' },
                        { action: 'Bundle tomatoes with local supplier', savings: '$42/month', priority: 'Medium' },
                      ].map((rec, i) => (
                        <div
                          key={i}
                          className="rounded-lg p-2.5"
                          style={{
                            background: 'rgba(176, 137, 104, 0.1)',
                            border: '1px solid rgba(176, 137, 104, 0.3)',
                            animation: `fadeIn 0.3s ease-out ${i * 100}ms both`,
                          }}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="text-xs font-medium text-white">{rec.action}</p>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${rec.priority === 'High' ? 'bg-red-500/20 text-red-300' : 'bg-yellow-500/20 text-yellow-300'}`}
                            >
                              {rec.priority}
                            </span>
                          </div>
                          <p className="text-[10px] font-semibold text-emerald-400">{rec.savings} potential savings</p>
                        </div>
                      ))}
                    </div>
                    <div
                      className="rounded-lg p-2.5 mt-3"
                      style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}
                    >
                      <p className="text-[10px] text-emerald-300">
                        <span className="font-bold">Total Monthly Savings:</span> $258 (~$3,096/year)
                      </p>
                    </div>
                  </div>
                </PhaseContainer>
              )}
            </div>
          )}


          {/* CREATIVE MODE */}
          {mode === 'creative' && (
            <div className="space-y-4 transition-all duration-300">
              {/* Prompt input area */}
              <div
                className="rounded-xl p-4"
                style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(176, 137, 104, 0.2)' }}>
                    <svg className="w-3.5 h-3.5 text-[#B08968]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </div>
                  <span className="text-[10px] text-white/50 uppercase tracking-wider font-medium">Your Special</span>
                  <span className="text-[9px] text-white/30 ml-auto">{currentCreative.restaurantType}</span>
                </div>
                <div className="min-h-[28px] flex items-center">
                  <p className="text-sm text-white/90 font-medium">
                    {typedText}
                    {creativePhase === 'typing' && (
                      <span className="inline-block w-0.5 h-4 ml-0.5 animate-pulse bg-[#B08968]" />
                    )}
                  </p>
                </div>
              </div>

              {/* Generation preview area */}
              <div
                className="rounded-xl overflow-hidden transition-all duration-500"
                style={{
                  background:
                    creativePhase === 'complete'
                      ? 'linear-gradient(135deg, rgba(176, 137, 104, 0.1) 0%, rgba(30, 30, 30, 0.8) 100%)'
                      : 'rgba(255, 255, 255, 0.02)',
                  border:
                    creativePhase === 'complete' ? '1px solid rgba(176, 137, 104, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                {/* Typing phase */}
                {creativePhase === 'typing' && (
                  <PhaseContainer isTransitioning={phaseTransition}>
                    <div className="p-4 flex items-center justify-center h-36">
                      <div className="text-center">
                        <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center bg-white/5">
                          <svg className="w-5 h-5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <p className="text-[10px] text-white/30">Type your special to generate...</p>
                      </div>
                    </div>
                  </PhaseContainer>
                )}

                {/* Generating phase */}
                {creativePhase === 'generating' && (
                  <PhaseContainer isTransitioning={phaseTransition}>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <div className="w-2 h-2 rounded-full bg-[#B08968]" />
                            <div className="absolute inset-0 w-2 h-2 rounded-full animate-ping bg-[#B08968]" />
                          </div>
                          <span className="text-xs font-medium text-[#B08968]">Creating with AI...</span>
                        </div>
                        <span className="text-xs font-bold tabular-nums text-[#B08968]">{generateProgress}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden bg-white/5 mb-4">
                        <div
                          className="h-full rounded-full transition-all duration-100"
                          style={{
                            width: `${generateProgress}%`,
                            background: 'linear-gradient(90deg, #B08968 0%, #D4A574 100%)',
                            boxShadow: '0 0 15px rgba(176, 137, 104, 0.5)',
                          }}
                        />
                      </div>
                      <div
                        className="h-24 rounded-lg flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, rgba(176, 137, 104, 0.2) 0%, rgba(74, 101, 114, 0.2) 100%)',
                          filter: `blur(${Math.max(0, 8 - generateProgress / 12)}px)`,
                          opacity: 0.3 + generateProgress / 150,
                        }}
                      >
                        <span className="text-white/50 text-xs font-medium">Generating...</span>
                      </div>
                    </div>
                  </PhaseContainer>
                )}

                {/* Complete phase */}
                {creativePhase === 'complete' && (
                  <PhaseContainer isTransitioning={phaseTransition}>
                    <div className="space-y-3 p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center bg-emerald-500/20">
                            <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <span className="text-xs font-semibold text-emerald-400">Ready to Post</span>
                        </div>
                        <div
                          className="px-2 py-0.5 rounded-full text-[9px] font-bold"
                          style={{ background: 'rgba(176, 137, 104, 0.2)', color: '#B08968' }}
                        >
                          12s to create
                        </div>
                      </div>
                      <div className="relative overflow-hidden rounded-lg h-44 w-full">
                        <img src={currentCreative.image} alt={currentCreative.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute bottom-2 right-2 w-5 h-5 rounded bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z" />
                          </svg>
                        </div>
                        <div className="absolute bottom-2 left-2">
                          <p className="text-xs font-bold text-white drop-shadow-lg">{currentCreative.title}</p>
                          <p className="text-[9px] text-white/80 drop-shadow">Instagram • 1080x1080</p>
                        </div>
                      </div>
                    </div>
                  </PhaseContainer>
                )}
              </div>
            </div>
          )}
        </div>


        {/* Footer with mode indicator */}
        <div className="px-5 pb-4 flex items-center justify-between border-t border-white/5 pt-3">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full transition-all ${mode === 'invoice' ? 'bg-[#B08968] scale-125' : 'bg-white/30'}`} />
            <div className={`w-1.5 h-1.5 rounded-full transition-all ${mode === 'creative' ? 'bg-[#B08968] scale-125' : 'bg-white/30'}`} />
          </div>
          <span className="text-[9px] text-white/30">
            {mode === 'invoice' ? 'Catching price hikes...' : 'Creating marketing...'}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-8px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};
