/**
 * ModuleShowcaseV2 - Animated Module Demos
 * Replaces static feature cards with interactive demos matching HeroShowcase quality
 * 9 modules, each with auto-looping animated sequences
 */

import React, { useState, useEffect, useCallback } from 'react';

type ModuleId = 
  | 'invoice' 
  | 'analytics' 
  | 'cogs' 
  | 'creative' 
  | 'scheduling' 
  | 'prep' 
  | 'ordering' 
  | 'menu-comparison' 
  | 'reviews';

interface Module {
  id: ModuleId;
  name: string;
  tagline: string;
}

const modules: Module[] = [
  { id: 'invoice', name: 'Invoice', tagline: 'Catch every price hike' },
  { id: 'analytics', name: 'Analytics', tagline: 'See trends before they hurt' },
  { id: 'cogs', name: 'COGS', tagline: 'Protect your margins' },
  { id: 'creative', name: 'Creative', tagline: 'AI-powered visuals in seconds' },
  { id: 'scheduling', name: 'Schedule', tagline: 'Optimize labor costs' },
  { id: 'prep', name: 'Prep', tagline: 'Never over-prep again' },
  { id: 'ordering', name: 'Ordering', tagline: 'Smart forecasts' },
  { id: 'menu-comparison', name: 'Menus', tagline: 'Know your competition' },
  { id: 'reviews', name: 'Reviews', tagline: 'Turn feedback into action' },
];

// Shared phase transition wrapper
const PhaseContainer: React.FC<{ children: React.ReactNode; isActive: boolean }> = ({ children, isActive }) => (
  <div className={`transition-all duration-300 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95 absolute inset-0'}`}>
    {children}
  </div>
);

// Progress bar component
const ProgressBar: React.FC<{ progress: number; label?: string }> = ({ progress, label }) => (
  <div className="space-y-2">
    {label && (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-[#B08968]" />
            <div className="absolute inset-0 w-2 h-2 rounded-full animate-ping bg-[#B08968]" />
          </div>
          <span className="text-xs font-medium text-[#B08968]">{label}</span>
        </div>
        <span className="text-xs font-bold text-[#B08968]">{Math.round(progress)}%</span>
      </div>
    )}
    <div className="h-1.5 rounded-full overflow-hidden bg-white/5">
      <div
        className="h-full rounded-full transition-all duration-100"
        style={{
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #B08968 0%, #D4A574 100%)',
          boxShadow: '0 0 15px rgba(176, 137, 104, 0.5)',
        }}
      />
    </div>
  </div>
);

// Success badge
const SuccessBadge: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex items-center gap-2">
    <div className="w-5 h-5 rounded-full flex items-center justify-center bg-emerald-500/20">
      <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    </div>
    <span className="text-xs font-semibold text-emerald-400">{text}</span>
  </div>
);

// Alert badge
const AlertBadge: React.FC<{ text: string; variant?: 'warning' | 'info' }> = ({ text, variant = 'warning' }) => {
  const colors = variant === 'warning' 
    ? 'bg-orange-500/20 text-orange-400' 
    : 'bg-blue-500/20 text-blue-400';
  return (
    <div className="flex items-center gap-2">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${colors}`}>
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <span className={`text-xs font-semibold ${variant === 'warning' ? 'text-orange-400' : 'text-blue-400'}`}>{text}</span>
    </div>
  );
};

// Data row component
const DataRow: React.FC<{ 
  label: string; 
  value: string; 
  subValue?: string;
  highlight?: boolean;
  delay?: number;
}> = ({ label, value, subValue, highlight, delay = 0 }) => (
  <div
    className={`flex items-center justify-between p-2.5 rounded-lg border transition-all duration-300 hover:scale-[1.01] ${
      highlight ? 'border-[#B08968]/30' : 'border-white/10'
    }`}
    style={{
      background: highlight 
        ? 'linear-gradient(135deg, rgba(176, 137, 104, 0.1) 0%, rgba(30, 30, 30, 0.4) 100%)'
        : 'rgba(255, 255, 255, 0.02)',
      animation: `slideInLeft 0.4s ease-out ${delay}ms both`,
    }}
  >
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <div
        className="w-0.5 h-6 rounded-full"
        style={{ background: highlight ? 'linear-gradient(180deg, #B08968 0%, rgba(176, 137, 104, 0) 100%)' : 'rgba(255,255,255,0.1)' }}
      />
      <span className="text-[11px] text-white/80 truncate">{label}</span>
    </div>
    <div className="text-right flex-shrink-0">
      <p className={`text-[11px] font-semibold ${highlight ? 'text-[#B08968]' : 'text-white'}`}>{value}</p>
      {subValue && <p className="text-[9px] text-white/40">{subValue}</p>}
    </div>
  </div>
);


// ============================================
// INVOICE INTELLIGENCE DEMO
// ============================================
const InvoiceDemo: React.FC = () => {
  const [phase, setPhase] = useState<'upload' | 'scanning' | 'extracted' | 'alerts'>('upload');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const runDemo = () => {
      setPhase('upload');
      setProgress(0);
      
      // Upload -> Scanning
      const t1 = setTimeout(() => setPhase('scanning'), 800);
      
      // Scanning progress
      const progressInterval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return p + 4;
        });
      }, 50);
      
      // Scanning -> Extracted
      const t2 = setTimeout(() => setPhase('extracted'), 2200);
      
      // Extracted -> Alerts
      const t3 = setTimeout(() => setPhase('alerts'), 4500);
      
      // Loop
      const t4 = setTimeout(() => runDemo(), 7500);
      
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
        clearInterval(progressInterval);
      };
    };
    
    const cleanup = runDemo();
    return cleanup;
  }, []);

  return (
    <div className="space-y-3 min-h-[280px] relative">
      {/* Upload Phase */}
      <PhaseContainer isActive={phase === 'upload'}>
        <div className="text-center py-8">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center bg-white/5 border border-white/10 border-dashed">
            <svg className="w-6 h-6 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="text-sm text-white/60 mb-1">Drop invoice to scan</p>
          <p className="text-[10px] text-white/30">PDF, PNG, or photo</p>
        </div>
      </PhaseContainer>

      {/* Scanning Phase */}
      <PhaseContainer isActive={phase === 'scanning'}>
        <div className="space-y-4 p-1">
          <ProgressBar progress={progress} label="Scanning invoice..." />
          <div className="space-y-2 mt-4">
            {[
              { text: 'Reading document...', show: progress > 15 },
              { text: 'Extracting line items...', show: progress > 40 },
              { text: 'Matching to inventory...', show: progress > 70 },
              { text: 'Checking price history...', show: progress > 90 },
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-2 text-[11px] transition-all duration-300 ${item.show ? 'opacity-100' : 'opacity-0'}`}>
                <svg className="w-3 h-3 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-white/60">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </PhaseContainer>

      {/* Extracted Phase */}
      <PhaseContainer isActive={phase === 'extracted'}>
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-3">
            <SuccessBadge text="5 Items Extracted" />
            <span className="text-[9px] text-white/40">Sysco • Nov 27</span>
          </div>
          <div className="space-y-1.5">
            {[
              { name: 'Chicken Breast 10lb', price: '$42.50', change: '+8.2%' },
              { name: 'Extra Virgin Olive Oil', price: '$28.75', change: '+3.1%' },
              { name: 'Roma Tomatoes', price: '$18.50', change: '-2.4%' },
              { name: 'Mozzarella Cheese', price: '$35.25', change: '+5.7%' },
            ].map((item, i) => (
              <DataRow 
                key={i} 
                label={item.name} 
                value={item.price} 
                subValue={item.change}
                highlight={item.change.startsWith('+')}
                delay={i * 80}
              />
            ))}
          </div>
        </div>
      </PhaseContainer>

      {/* Alerts Phase */}
      <PhaseContainer isActive={phase === 'alerts'}>
        <div className="space-y-3">
          <AlertBadge text="2 Price Alerts Triggered" />
          <div className="space-y-2">
            <div className="rounded-lg p-3" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-white">Chicken Breast</span>
                <span className="text-[10px] font-bold text-red-400">+8.2% vs last week</span>
              </div>
              <p className="text-[10px] text-white/50">$39.25 → $42.50 • Sysco</p>
            </div>
            <div className="rounded-lg p-3" style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-white">Mozzarella Cheese</span>
                <span className="text-[10px] font-bold text-yellow-400">+5.7% vs last week</span>
              </div>
              <p className="text-[10px] text-white/50">$33.35 → $35.25 • Sysco</p>
            </div>
          </div>
          <div className="rounded-lg p-2.5 mt-2" style={{ background: 'rgba(176, 137, 104, 0.1)', border: '1px solid rgba(176, 137, 104, 0.3)' }}>
            <p className="text-[10px] text-[#D4A574]">
              <span className="font-bold">Action:</span> Review vendor alternatives for chicken
            </p>
          </div>
        </div>
      </PhaseContainer>
    </div>
  );
};


// ============================================
// PRICE ANALYTICS DEMO
// ============================================
const AnalyticsDemo: React.FC = () => {
  const [phase, setPhase] = useState<'chart' | 'variance' | 'savings'>('chart');
  const [chartProgress, setChartProgress] = useState(0);

  useEffect(() => {
    const runDemo = () => {
      setPhase('chart');
      setChartProgress(0);
      
      // Animate chart bars
      const chartInterval = setInterval(() => {
        setChartProgress(p => p >= 100 ? 100 : p + 5);
      }, 40);
      
      const t1 = setTimeout(() => {
        clearInterval(chartInterval);
        setPhase('variance');
      }, 2500);
      
      const t2 = setTimeout(() => setPhase('savings'), 5000);
      const t3 = setTimeout(() => runDemo(), 8000);
      
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearInterval(chartInterval);
      };
    };
    
    return runDemo();
  }, []);

  const chartData = [
    { week: 'W1', height: 35, price: '$38.50' },
    { week: 'W2', height: 50, price: '$39.20' },
    { week: 'W3', height: 75, price: '$40.80' },
    { week: 'W4', height: 100, price: '$42.50' },
  ];

  return (
    <div className="space-y-3 min-h-[280px] relative">
      {/* Chart Phase */}
      <PhaseContainer isActive={phase === 'chart'}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white">Chicken Breast — 4 Week Trend</span>
            <span className="text-[10px] font-bold text-red-400">↑ 10.4%</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-end justify-between h-28 gap-3 pb-6 relative">
              {chartData.map((point, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <span className="text-[9px] text-white/50 mb-1">{point.price}</span>
                  <div
                    className="w-full rounded-t transition-all duration-500"
                    style={{
                      height: `${(point.height * chartProgress) / 100}%`,
                      minHeight: chartProgress > 0 ? '8px' : '0',
                      background: i === 3 
                        ? 'linear-gradient(180deg, #EF4444 0%, #B91C1C 100%)' 
                        : 'linear-gradient(180deg, #D4A574 0%, #B08968 100%)',
                      boxShadow: i === 3 ? '0 0 10px rgba(239, 68, 68, 0.3)' : '0 0 10px rgba(176, 137, 104, 0.3)',
                    }}
                  />
                  <span className="text-[9px] text-white/40 absolute bottom-0" style={{ left: `${i * 25 + 12.5}%`, transform: 'translateX(-50%)' }}>
                    {point.week}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PhaseContainer>

      {/* Variance Phase */}
      <PhaseContainer isActive={phase === 'variance'}>
        <div className="space-y-3">
          <AlertBadge text="Budget Variance Detected" variant="info" />
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
              <p className="text-[10px] text-white/50 mb-1">Budgeted</p>
              <p className="text-lg font-bold text-white">$38.00</p>
              <p className="text-[9px] text-white/40">per case</p>
            </div>
            <div className="rounded-lg p-3" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <p className="text-[10px] text-red-300 mb-1">Actual</p>
              <p className="text-lg font-bold text-red-400">$42.50</p>
              <p className="text-[9px] text-red-300/60">+$4.50 over</p>
            </div>
          </div>
          <div className="space-y-1.5">
            {[
              { item: 'Chicken Breast', variance: '+11.8%', impact: '-$180/mo' },
              { item: 'Olive Oil', variance: '+7.2%', impact: '-$45/mo' },
              { item: 'Cheese', variance: '+5.7%', impact: '-$92/mo' },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between text-[10px] p-2 rounded bg-white/5">
                <span className="text-white/70">{row.item}</span>
                <span className="text-red-400 font-medium">{row.variance}</span>
                <span className="text-white/40">{row.impact}</span>
              </div>
            ))}
          </div>
        </div>
      </PhaseContainer>

      {/* Savings Phase */}
      <PhaseContainer isActive={phase === 'savings'}>
        <div className="space-y-3">
          <SuccessBadge text="Savings Opportunities Found" />
          <div className="space-y-2">
            {[
              { action: 'Switch chicken to US Foods', savings: '$127/mo', confidence: '94%' },
              { action: 'Negotiate Sysco olive oil', savings: '$45/mo', confidence: '87%' },
              { action: 'Bundle cheese orders', savings: '$38/mo', confidence: '82%' },
            ].map((opp, i) => (
              <div 
                key={i} 
                className="rounded-lg p-3"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(30, 30, 30, 0.4) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  animation: `fadeIn 0.3s ease-out ${i * 100}ms both`,
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-white">{opp.action}</span>
                  <span className="text-[9px] text-emerald-400/70">{opp.confidence} match</span>
                </div>
                <p className="text-sm font-bold text-emerald-400">{opp.savings}</p>
              </div>
            ))}
          </div>
          <div className="rounded-lg p-2.5" style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <p className="text-[11px] text-emerald-300 font-medium text-center">
              Total Potential: $210/month • $2,520/year
            </p>
          </div>
        </div>
      </PhaseContainer>
    </div>
  );
};


// ============================================
// COST OF GOODS DEMO
// ============================================
const COGSDemo: React.FC = () => {
  const [phase, setPhase] = useState<'recipe' | 'update' | 'margin'>('recipe');
  const [costValue, setCostValue] = useState(8.45);
  const [marginValue, setMarginValue] = useState(72);

  useEffect(() => {
    const runDemo = () => {
      setPhase('recipe');
      setCostValue(8.45);
      setMarginValue(72);
      
      const t1 = setTimeout(() => {
        setPhase('update');
        // Animate cost increase
        let cost = 8.45;
        const costInterval = setInterval(() => {
          cost += 0.15;
          if (cost >= 9.85) {
            clearInterval(costInterval);
            setCostValue(9.85);
          } else {
            setCostValue(cost);
          }
        }, 50);
      }, 2500);
      
      const t2 = setTimeout(() => {
        setPhase('margin');
        // Animate margin decrease
        let margin = 72;
        const marginInterval = setInterval(() => {
          margin -= 1;
          if (margin <= 67) {
            clearInterval(marginInterval);
            setMarginValue(67);
          } else {
            setMarginValue(margin);
          }
        }, 80);
      }, 5000);
      
      const t3 = setTimeout(() => runDemo(), 8500);
      
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    };
    
    return runDemo();
  }, []);

  return (
    <div className="space-y-3 min-h-[280px] relative">
      {/* Recipe Phase */}
      <PhaseContainer isActive={phase === 'recipe'}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white">Chicken Parmesan</span>
            <span className="text-[10px] text-white/40">Menu Price: $24.99</span>
          </div>
          <div className="space-y-1.5">
            {[
              { ingredient: 'Chicken Breast (8oz)', cost: '$3.40' },
              { ingredient: 'Mozzarella (3oz)', cost: '$1.85' },
              { ingredient: 'Marinara (4oz)', cost: '$0.95' },
              { ingredient: 'Pasta (6oz)', cost: '$0.75' },
              { ingredient: 'Parmesan (1oz)', cost: '$0.65' },
              { ingredient: 'Herbs & Oil', cost: '$0.85' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between text-[10px] p-2 rounded bg-white/5">
                <span className="text-white/70">{item.ingredient}</span>
                <span className="text-white font-medium">{item.cost}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(176, 137, 104, 0.1)', border: '1px solid rgba(176, 137, 104, 0.3)' }}>
            <span className="text-xs font-medium text-[#D4A574]">Total Food Cost</span>
            <span className="text-lg font-bold text-white">${costValue.toFixed(2)}</span>
          </div>
        </div>
      </PhaseContainer>

      {/* Update Phase */}
      <PhaseContainer isActive={phase === 'update'}>
        <div className="space-y-3">
          <AlertBadge text="Ingredient Price Changed" />
          <div className="rounded-lg p-3" style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-white">Chicken Breast</span>
              <span className="text-[10px] font-bold text-yellow-400">+8.2%</span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-white/50">$3.40</span>
              <svg className="w-3 h-3 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <span className="text-yellow-400 font-medium">$3.68</span>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] text-white/50">Recipe cost auto-updating...</p>
            <div className="flex items-center justify-between p-3 rounded-lg transition-all" style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
              <span className="text-xs font-medium text-yellow-300">New Food Cost</span>
              <span className="text-lg font-bold text-yellow-400">${costValue.toFixed(2)}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="bg-white/5 border border-white/10 rounded-lg p-2 text-center">
              <p className="text-[9px] text-white/40">Old Margin</p>
              <p className="text-sm font-bold text-white">72%</p>
            </div>
            <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
              <p className="text-[9px] text-yellow-300/70">New Margin</p>
              <p className="text-sm font-bold text-yellow-400">{marginValue}%</p>
            </div>
          </div>
        </div>
      </PhaseContainer>

      {/* Margin Phase */}
      <PhaseContainer isActive={phase === 'margin'}>
        <div className="space-y-3">
          <AlertBadge text="Margin Below Target (70%)" />
          <div className="rounded-lg p-4" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-white">Chicken Parmesan</span>
              <span className="text-xs font-bold text-red-400">67% margin</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-400" style={{ width: '67%' }} />
            </div>
            <div className="flex justify-between mt-1 text-[9px] text-white/40">
              <span>0%</span>
              <span className="text-red-400">Target: 70%</span>
              <span>100%</span>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] text-white/50 font-medium">Recommended Actions:</p>
            <div className="rounded-lg p-2.5" style={{ background: 'rgba(176, 137, 104, 0.1)', border: '1px solid rgba(176, 137, 104, 0.3)' }}>
              <p className="text-[10px] text-[#D4A574]">• Increase menu price to $25.99 (+$1.00)</p>
            </div>
            <div className="rounded-lg p-2.5" style={{ background: 'rgba(176, 137, 104, 0.1)', border: '1px solid rgba(176, 137, 104, 0.3)' }}>
              <p className="text-[10px] text-[#D4A574]">• Reduce portion to 7oz (saves $0.42)</p>
            </div>
          </div>
        </div>
      </PhaseContainer>
    </div>
  );
};


// ============================================
// CREATIVE MARKETING DEMO
// ============================================
const CreativeDemo: React.FC = () => {
  const [phase, setPhase] = useState<'template' | 'generating' | 'complete'>('template');
  const [progress, setProgress] = useState(0);
  const [typedText, setTypedText] = useState('');
  const fullPrompt = 'Taco Tuesday — $2 Street Tacos All Night';

  useEffect(() => {
    const runDemo = () => {
      setPhase('template');
      setProgress(0);
      setTypedText('');
      
      // Type the prompt
      let charIndex = 0;
      const typeInterval = setInterval(() => {
        if (charIndex < fullPrompt.length) {
          setTypedText(fullPrompt.slice(0, charIndex + 1));
          charIndex++;
        } else {
          clearInterval(typeInterval);
        }
      }, 35);
      
      const t1 = setTimeout(() => {
        setPhase('generating');
        const progressInterval = setInterval(() => {
          setProgress(p => {
            if (p >= 100) {
              clearInterval(progressInterval);
              return 100;
            }
            return p + 3;
          });
        }, 30);
      }, 2200);
      
      const t2 = setTimeout(() => setPhase('complete'), 4500);
      const t3 = setTimeout(() => runDemo(), 8000);
      
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearInterval(typeInterval);
      };
    };
    
    return runDemo();
  }, []);

  return (
    <div className="space-y-3 min-h-[280px] relative">
      {/* Template Phase */}
      <PhaseContainer isActive={phase === 'template'}>
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(176, 137, 104, 0.2)' }}>
              <svg className="w-3.5 h-3.5 text-[#B08968]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <span className="text-[10px] text-white/50 uppercase tracking-wider font-medium">Your Special</span>
          </div>
          <div className="rounded-xl p-4" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <p className="text-sm text-white/90 font-medium min-h-[24px]">
              {typedText}
              {phase === 'template' && <span className="inline-block w-0.5 h-4 ml-0.5 animate-pulse bg-[#B08968]" />}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {['🌮 Taco Tuesday', '🍺 Happy Hour', '🎄 Holiday'].map((template, i) => (
              <div 
                key={i}
                className={`p-2 rounded-lg text-center text-[9px] transition-all ${i === 0 ? 'bg-[#B08968]/20 border border-[#B08968]/40 text-[#D4A574]' : 'bg-white/5 border border-white/10 text-white/50'}`}
              >
                {template}
              </div>
            ))}
          </div>
        </div>
      </PhaseContainer>

      {/* Generating Phase */}
      <PhaseContainer isActive={phase === 'generating'}>
        <div className="space-y-4">
          <ProgressBar progress={progress} label="Creating with AI..." />
          <div 
            className="h-40 rounded-lg flex items-center justify-center overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(176, 137, 104, 0.2) 0%, rgba(74, 101, 114, 0.2) 100%)',
              filter: `blur(${Math.max(0, 8 - progress / 12)}px)`,
              opacity: 0.3 + progress / 150,
            }}
          >
            <div className="text-center">
              <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center bg-white/10">
                <svg className="w-6 h-6 text-[#B08968] animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <span className="text-white/50 text-xs">Generating...</span>
            </div>
          </div>
        </div>
      </PhaseContainer>

      {/* Complete Phase */}
      <PhaseContainer isActive={phase === 'complete'}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <SuccessBadge text="Ready to Post" />
            <div className="px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ background: 'rgba(176, 137, 104, 0.2)', color: '#B08968' }}>
              8s to create
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg h-44 w-full">
            <img 
              src="/examples/creative-example-1.jpg" 
              alt="Taco Tuesday" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-5 h-5 rounded bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z" />
              </svg>
            </div>
            <div className="absolute bottom-2 left-2">
              <p className="text-xs font-bold text-white drop-shadow-lg">TACO TUESDAY</p>
              <p className="text-[9px] text-white/80">Instagram • 1080x1080</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {['Instagram', 'Facebook', 'Print'].map((format, i) => (
              <div key={i} className="p-2 rounded-lg bg-white/5 border border-white/10 text-center">
                <p className="text-[9px] text-white/50">{format}</p>
                <p className="text-[10px] text-emerald-400">✓ Ready</p>
              </div>
            ))}
          </div>
        </div>
      </PhaseContainer>
    </div>
  );
};


// ============================================
// SCHEDULING DEMO
// ============================================
const SchedulingDemo: React.FC = () => {
  const [phase, setPhase] = useState<'grid' | 'labor' | 'clockin'>('grid');
  const [laborPercent, setLaborPercent] = useState(0);

  useEffect(() => {
    const runDemo = () => {
      setPhase('grid');
      setLaborPercent(0);
      
      const t1 = setTimeout(() => {
        setPhase('labor');
        const laborInterval = setInterval(() => {
          setLaborPercent(p => {
            if (p >= 28) {
              clearInterval(laborInterval);
              return 28;
            }
            return p + 1;
          });
        }, 60);
      }, 2500);
      
      const t2 = setTimeout(() => setPhase('clockin'), 5500);
      const t3 = setTimeout(() => runDemo(), 8500);
      
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    };
    
    return runDemo();
  }, []);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const shifts = [
    { name: 'Maria S.', shifts: [1, 1, 0, 1, 1, 1, 0] },
    { name: 'James K.', shifts: [0, 1, 1, 1, 0, 1, 1] },
    { name: 'Alex T.', shifts: [1, 0, 1, 0, 1, 1, 1] },
  ];

  return (
    <div className="space-y-3 min-h-[280px] relative">
      {/* Grid Phase */}
      <PhaseContainer isActive={phase === 'grid'}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white">Week of Nov 25</span>
            <span className="text-[10px] text-white/40">3 team members</span>
          </div>
          <div className="rounded-lg overflow-hidden border border-white/10">
            <div className="grid grid-cols-8 bg-white/5">
              <div className="p-2 text-[9px] text-white/40"></div>
              {days.map(day => (
                <div key={day} className="p-2 text-[9px] text-white/50 text-center font-medium">{day}</div>
              ))}
            </div>
            {shifts.map((member, i) => (
              <div key={i} className="grid grid-cols-8 border-t border-white/5" style={{ animation: `fadeIn 0.3s ease-out ${i * 100}ms both` }}>
                <div className="p-2 text-[10px] text-white/70 truncate">{member.name}</div>
                {member.shifts.map((hasShift, j) => (
                  <div key={j} className="p-1.5 flex items-center justify-center">
                    {hasShift ? (
                      <div 
                        className="w-full h-6 rounded text-[8px] flex items-center justify-center font-medium"
                        style={{ 
                          background: 'linear-gradient(135deg, rgba(176, 137, 104, 0.3) 0%, rgba(176, 137, 104, 0.1) 100%)',
                          border: '1px solid rgba(176, 137, 104, 0.3)',
                          color: '#D4A574',
                        }}
                      >
                        9-5
                      </div>
                    ) : (
                      <div className="w-full h-6 rounded bg-white/5"></div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </PhaseContainer>

      {/* Labor Phase */}
      <PhaseContainer isActive={phase === 'labor'}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white">Labor Cost Analysis</span>
            <span className={`text-[10px] font-bold ${laborPercent > 25 ? 'text-yellow-400' : 'text-emerald-400'}`}>
              {laborPercent}% of revenue
            </span>
          </div>
          <div className="rounded-lg p-4" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div className="h-3 rounded-full bg-white/10 overflow-hidden mb-2">
              <div 
                className="h-full rounded-full transition-all duration-300"
                style={{ 
                  width: `${laborPercent}%`,
                  background: laborPercent > 25 
                    ? 'linear-gradient(90deg, #FBBF24 0%, #F59E0B 100%)' 
                    : 'linear-gradient(90deg, #10B981 0%, #059669 100%)',
                }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-white/40">
              <span>0%</span>
              <span className="text-emerald-400">Target: 25%</span>
              <span>40%</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/5 border border-white/10 rounded-lg p-2 text-center">
              <p className="text-[9px] text-white/40">Scheduled</p>
              <p className="text-sm font-bold text-white">142 hrs</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-2 text-center">
              <p className="text-[9px] text-white/40">Labor Cost</p>
              <p className="text-sm font-bold text-white">$2,840</p>
            </div>
            <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
              <p className="text-[9px] text-yellow-300/70">Over Budget</p>
              <p className="text-sm font-bold text-yellow-400">+$340</p>
            </div>
          </div>
          <div className="rounded-lg p-2.5" style={{ background: 'rgba(176, 137, 104, 0.1)', border: '1px solid rgba(176, 137, 104, 0.3)' }}>
            <p className="text-[10px] text-[#D4A574]">💡 Cut 4 hours on Tuesday to hit target</p>
          </div>
        </div>
      </PhaseContainer>

      {/* Clock-in Phase */}
      <PhaseContainer isActive={phase === 'clockin'}>
        <div className="space-y-3">
          <SuccessBadge text="Clock-In Recorded" />
          <div className="rounded-lg p-4" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(30, 30, 30, 0.4) 100%)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <span className="text-lg">👤</span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">Maria Santos</p>
                <p className="text-[10px] text-emerald-400">Clocked in at 9:02 AM</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/5 rounded p-2">
                <p className="text-[9px] text-white/40">Shift</p>
                <p className="text-[11px] text-white font-medium">9:00 AM - 5:00 PM</p>
              </div>
              <div className="bg-white/5 rounded p-2">
                <p className="text-[9px] text-white/40">Location</p>
                <p className="text-[11px] text-white font-medium">Main Kitchen</p>
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-[10px] text-white/50">Today's Team Status</p>
            {[
              { name: 'Maria S.', status: 'Clocked In', time: '9:02 AM' },
              { name: 'James K.', status: 'Scheduled', time: '11:00 AM' },
              { name: 'Alex T.', status: 'Off Today', time: '—' },
            ].map((member, i) => (
              <div key={i} className="flex items-center justify-between text-[10px] p-2 rounded bg-white/5">
                <span className="text-white/70">{member.name}</span>
                <span className={member.status === 'Clocked In' ? 'text-emerald-400' : 'text-white/40'}>{member.status}</span>
                <span className="text-white/40">{member.time}</span>
              </div>
            ))}
          </div>
        </div>
      </PhaseContainer>
    </div>
  );
};


// ============================================
// DAILY PREP DEMO
// ============================================
const PrepDemo: React.FC = () => {
  const [phase, setPhase] = useState<'forecast' | 'list' | 'complete'>('forecast');
  const [completedItems, setCompletedItems] = useState(0);

  useEffect(() => {
    const runDemo = () => {
      setPhase('forecast');
      setCompletedItems(0);
      
      const t1 = setTimeout(() => setPhase('list'), 2500);
      
      const t2 = setTimeout(() => {
        setPhase('complete');
        const completeInterval = setInterval(() => {
          setCompletedItems(c => {
            if (c >= 4) {
              clearInterval(completeInterval);
              return 4;
            }
            return c + 1;
          });
        }, 400);
      }, 5000);
      
      const t3 = setTimeout(() => runDemo(), 8500);
      
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    };
    
    return runDemo();
  }, []);

  const prepItems = [
    { name: 'Chicken Breast', qty: '15 lbs', assigned: 'Maria' },
    { name: 'Diced Tomatoes', qty: '8 lbs', assigned: 'James' },
    { name: 'Shredded Cheese', qty: '6 lbs', assigned: 'Maria' },
    { name: 'Prep Salsa', qty: '4 qts', assigned: 'Alex' },
  ];

  return (
    <div className="space-y-3 min-h-[280px] relative">
      {/* Forecast Phase */}
      <PhaseContainer isActive={phase === 'forecast'}>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(176, 137, 104, 0.2)' }}>
              <svg className="w-3.5 h-3.5 text-[#B08968]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-white">Forecast → Prep List</span>
          </div>
          <div className="rounded-lg p-3" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <p className="text-[10px] text-white/50 mb-2">Thursday Forecast</p>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="text-center">
                <p className="text-lg font-bold text-white">142</p>
                <p className="text-[9px] text-white/40">Covers</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-emerald-400">+18%</p>
                <p className="text-[9px] text-white/40">vs Last Thu</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-[#B08968]">High</p>
                <p className="text-[9px] text-white/40">Demand</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-white/50">
              <svg className="w-3 h-3 text-[#B08968]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Generating optimized prep list...</span>
            </div>
          </div>
        </div>
      </PhaseContainer>

      {/* List Phase */}
      <PhaseContainer isActive={phase === 'list'}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white">Thursday Prep List</span>
            <span className="text-[10px] text-white/40">4 items • 3 team</span>
          </div>
          <div className="space-y-1.5">
            {prepItems.map((item, i) => (
              <div 
                key={i}
                className="flex items-center justify-between p-2.5 rounded-lg border border-white/10 bg-white/5"
                style={{ animation: `slideInLeft 0.3s ease-out ${i * 80}ms both` }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded border border-white/20 flex items-center justify-center">
                    <span className="text-[10px] text-white/30">○</span>
                  </div>
                  <div>
                    <p className="text-[11px] text-white font-medium">{item.name}</p>
                    <p className="text-[9px] text-white/40">{item.assigned}</p>
                  </div>
                </div>
                <span className="text-[11px] text-[#B08968] font-medium">{item.qty}</span>
              </div>
            ))}
          </div>
        </div>
      </PhaseContainer>

      {/* Complete Phase */}
      <PhaseContainer isActive={phase === 'complete'}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <SuccessBadge text="Prep Progress" />
            <span className="text-[10px] font-bold text-emerald-400">{completedItems}/4 Complete</span>
          </div>
          <div className="space-y-1.5">
            {prepItems.map((item, i) => {
              const isComplete = i < completedItems;
              return (
                <div 
                  key={i}
                  className={`flex items-center justify-between p-2.5 rounded-lg border transition-all duration-300 ${
                    isComplete 
                      ? 'border-emerald-500/30 bg-emerald-500/10' 
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
                      isComplete ? 'bg-emerald-500' : 'border border-white/20'
                    }`}>
                      {isComplete ? (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className="text-[10px] text-white/30">○</span>
                      )}
                    </div>
                    <div>
                      <p className={`text-[11px] font-medium ${isComplete ? 'text-emerald-400 line-through' : 'text-white'}`}>{item.name}</p>
                      <p className="text-[9px] text-white/40">{item.assigned}</p>
                    </div>
                  </div>
                  <span className={`text-[11px] font-medium ${isComplete ? 'text-emerald-400' : 'text-[#B08968]'}`}>{item.qty}</span>
                </div>
              );
            })}
          </div>
          <div className="rounded-lg p-2.5" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <p className="text-[10px] text-emerald-300">
              <span className="font-bold">On Track:</span> Prep completion 15 min ahead of schedule
            </p>
          </div>
        </div>
      </PhaseContainer>
    </div>
  );
};


// ============================================
// ORDERING PREDICTIONS DEMO
// ============================================
const OrderingDemo: React.FC = () => {
  const [phase, setPhase] = useState<'history' | 'forecast' | 'order'>('history');
  const [forecastProgress, setForecastProgress] = useState(0);

  useEffect(() => {
    const runDemo = () => {
      setPhase('history');
      setForecastProgress(0);
      
      const t1 = setTimeout(() => {
        setPhase('forecast');
        const progressInterval = setInterval(() => {
          setForecastProgress(p => {
            if (p >= 100) {
              clearInterval(progressInterval);
              return 100;
            }
            return p + 5;
          });
        }, 40);
      }, 2500);
      
      const t2 = setTimeout(() => setPhase('order'), 5000);
      const t3 = setTimeout(() => runDemo(), 8500);
      
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    };
    
    return runDemo();
  }, []);

  return (
    <div className="space-y-3 min-h-[280px] relative">
      {/* History Phase */}
      <PhaseContainer isActive={phase === 'history'}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white">Usage History — Chicken Breast</span>
            <span className="text-[10px] text-white/40">Last 4 weeks</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <div className="flex items-end justify-between h-20 gap-2 pb-4 relative">
              {[
                { week: 'W1', usage: 42, height: 60 },
                { week: 'W2', usage: 48, height: 70 },
                { week: 'W3', usage: 45, height: 65 },
                { week: 'W4', usage: 52, height: 80 },
              ].map((point, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <span className="text-[8px] text-white/40">{point.usage}lb</span>
                  <div
                    className="w-full rounded-t transition-all duration-500"
                    style={{
                      height: `${point.height}%`,
                      background: 'linear-gradient(180deg, #D4A574 0%, #B08968 100%)',
                      animation: `growUp 0.5s ease-out ${i * 100}ms both`,
                    }}
                  />
                  <span className="text-[8px] text-white/40 absolute bottom-0" style={{ left: `${i * 25 + 12.5}%`, transform: 'translateX(-50%)' }}>
                    {point.week}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/5 border border-white/10 rounded-lg p-2 text-center">
              <p className="text-[9px] text-white/40">Avg Weekly</p>
              <p className="text-sm font-bold text-white">46.8 lbs</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-2 text-center">
              <p className="text-[9px] text-white/40">Trend</p>
              <p className="text-sm font-bold text-emerald-400">↑ 8%</p>
            </div>
          </div>
        </div>
      </PhaseContainer>

      {/* Forecast Phase */}
      <PhaseContainer isActive={phase === 'forecast'}>
        <div className="space-y-3">
          <ProgressBar progress={forecastProgress} label="Analyzing patterns..." />
          <div className="space-y-2 mt-3">
            {[
              { text: 'Analyzing usage history...', show: forecastProgress > 15 },
              { text: 'Checking delivery schedule...', show: forecastProgress > 35 },
              { text: 'Factoring seasonal trends...', show: forecastProgress > 55 },
              { text: 'Calculating optimal order...', show: forecastProgress > 75 },
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-2 text-[11px] transition-all duration-300 ${item.show ? 'opacity-100' : 'opacity-0'}`}>
                <svg className="w-3 h-3 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-white/60">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </PhaseContainer>

      {/* Order Phase */}
      <PhaseContainer isActive={phase === 'order'}>
        <div className="space-y-3">
          <SuccessBadge text="Order Recommendations Ready" />
          <div className="space-y-2">
            {[
              { item: 'Chicken Breast 10lb', qty: '6 cases', vendor: 'Sysco', delivery: 'Tue' },
              { item: 'Olive Oil 1gal', qty: '2 cases', vendor: 'US Foods', delivery: 'Wed' },
              { item: 'Roma Tomatoes', qty: '4 cases', vendor: 'Local Farm', delivery: 'Mon' },
            ].map((order, i) => (
              <div 
                key={i}
                className="rounded-lg p-3"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(176, 137, 104, 0.1) 0%, rgba(30, 30, 30, 0.4) 100%)',
                  border: '1px solid rgba(176, 137, 104, 0.2)',
                  animation: `slideInLeft 0.3s ease-out ${i * 80}ms both`,
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-medium text-white">{order.item}</span>
                  <span className="text-[11px] font-bold text-[#B08968]">{order.qty}</span>
                </div>
                <div className="flex items-center justify-between text-[9px] text-white/40">
                  <span>{order.vendor}</span>
                  <span>Delivery: {order.delivery}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="flex-1 rounded-lg p-2.5 text-center" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <p className="text-[10px] text-emerald-300 font-medium">Estimated Total: $847</p>
            </div>
            <div className="rounded-lg p-2.5 px-4" style={{ background: 'rgba(176, 137, 104, 0.2)', border: '1px solid rgba(176, 137, 104, 0.4)' }}>
              <p className="text-[10px] text-[#D4A574] font-bold">Order Now →</p>
            </div>
          </div>
        </div>
      </PhaseContainer>
    </div>
  );
};


// ============================================
// MENU COMPARISON DEMO
// ============================================
const MenuComparisonDemo: React.FC = () => {
  const [phase, setPhase] = useState<'upload' | 'parsing' | 'comparison'>('upload');
  const [parseProgress, setParseProgress] = useState(0);

  useEffect(() => {
    const runDemo = () => {
      setPhase('upload');
      setParseProgress(0);
      
      const t1 = setTimeout(() => {
        setPhase('parsing');
        const progressInterval = setInterval(() => {
          setParseProgress(p => {
            if (p >= 100) {
              clearInterval(progressInterval);
              return 100;
            }
            return p + 4;
          });
        }, 40);
      }, 1500);
      
      const t2 = setTimeout(() => setPhase('comparison'), 4500);
      const t3 = setTimeout(() => runDemo(), 9000);
      
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    };
    
    return runDemo();
  }, []);

  return (
    <div className="space-y-3 min-h-[280px] relative">
      {/* Upload Phase */}
      <PhaseContainer isActive={phase === 'upload'}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white">Competitor Menu Analysis</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg p-4 text-center border-2 border-dashed border-white/20 bg-white/5">
              <p className="text-[10px] text-white/50 mb-1">Your Menu</p>
              <p className="text-xs text-emerald-400">✓ Loaded</p>
            </div>
            <div className="rounded-lg p-4 text-center border-2 border-dashed border-[#B08968]/40 bg-[#B08968]/10 animate-pulse">
              <p className="text-[10px] text-[#D4A574] mb-1">Competitor</p>
              <p className="text-xs text-white/40">Drop menu...</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-[10px] text-white/50">Recent Competitors</p>
            {['Mario\'s Italian', 'The Pasta House', 'Bella Cucina'].map((name, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded bg-white/5 text-[10px]">
                <span className="text-white/70">{name}</span>
                <span className="text-white/40">Analyzed 3d ago</span>
              </div>
            ))}
          </div>
        </div>
      </PhaseContainer>

      {/* Parsing Phase */}
      <PhaseContainer isActive={phase === 'parsing'}>
        <div className="space-y-3">
          <ProgressBar progress={parseProgress} label="Parsing competitor menu..." />
          <div className="rounded-lg p-3" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <p className="text-[10px] text-white/50 mb-2">Extracting from: Mario's Italian</p>
            <div className="space-y-1.5">
              {[
                { text: 'Reading menu structure...', show: parseProgress > 15 },
                { text: 'Extracting 24 items...', show: parseProgress > 35 },
                { text: 'Identifying prices...', show: parseProgress > 55 },
                { text: 'Categorizing dishes...', show: parseProgress > 75 },
              ].map((item, i) => (
                <div key={i} className={`flex items-center gap-2 text-[11px] transition-all duration-300 ${item.show ? 'opacity-100' : 'opacity-0'}`}>
                  <svg className="w-3 h-3 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white/60">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PhaseContainer>

      {/* Comparison Phase */}
      <PhaseContainer isActive={phase === 'comparison'}>
        <div className="space-y-3">
          <SuccessBadge text="Price Comparison Ready" />
          <div className="rounded-lg overflow-hidden border border-white/10">
            <div className="grid grid-cols-4 bg-white/5 p-2 text-[9px] text-white/50">
              <span>Item</span>
              <span className="text-center">You</span>
              <span className="text-center">Mario's</span>
              <span className="text-right">Gap</span>
            </div>
            {[
              { item: 'Chicken Parm', you: '$24.99', them: '$22.99', gap: '+8.7%', color: 'text-red-400' },
              { item: 'Spaghetti', you: '$16.99', them: '$18.99', gap: '-10.5%', color: 'text-emerald-400' },
              { item: 'Caesar Salad', you: '$12.99', them: '$12.99', gap: '0%', color: 'text-white/40' },
              { item: 'Tiramisu', you: '$9.99', them: '$8.99', gap: '+11.1%', color: 'text-red-400' },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-4 p-2 text-[10px] border-t border-white/5" style={{ animation: `fadeIn 0.3s ease-out ${i * 80}ms both` }}>
                <span className="text-white/70 truncate">{row.item}</span>
                <span className="text-center text-white">{row.you}</span>
                <span className="text-center text-white/60">{row.them}</span>
                <span className={`text-right font-medium ${row.color}`}>{row.gap}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg p-2.5" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <p className="text-[9px] text-red-300/70">Priced Higher</p>
              <p className="text-sm font-bold text-red-400">8 items</p>
            </div>
            <div className="rounded-lg p-2.5" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <p className="text-[9px] text-emerald-300/70">Priced Lower</p>
              <p className="text-sm font-bold text-emerald-400">6 items</p>
            </div>
          </div>
        </div>
      </PhaseContainer>
    </div>
  );
};


// ============================================
// REVIEW ANALYSIS DEMO
// ============================================
const ReviewsDemo: React.FC = () => {
  const [phase, setPhase] = useState<'scanning' | 'sentiment' | 'insights'>('scanning');
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    const runDemo = () => {
      setPhase('scanning');
      setReviewCount(0);
      
      // Count up reviews
      const countInterval = setInterval(() => {
        setReviewCount(c => {
          if (c >= 847) {
            clearInterval(countInterval);
            return 847;
          }
          return c + 17;
        });
      }, 30);
      
      const t1 = setTimeout(() => setPhase('sentiment'), 2500);
      const t2 = setTimeout(() => setPhase('insights'), 5500);
      const t3 = setTimeout(() => runDemo(), 9000);
      
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearInterval(countInterval);
      };
    };
    
    return runDemo();
  }, []);

  return (
    <div className="space-y-3 min-h-[280px] relative">
      {/* Scanning Phase */}
      <PhaseContainer isActive={phase === 'scanning'}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white">Analyzing Reviews</span>
            <span className="text-[10px] text-[#B08968] font-bold">{reviewCount} reviews</span>
          </div>
          <div className="rounded-lg p-4" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex -space-x-1">
                {['G', 'Y', 'T'].map((letter, i) => (
                  <div key={i} className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[9px] text-white/50 border border-white/20">
                    {letter}
                  </div>
                ))}
              </div>
              <span className="text-[10px] text-white/50">Google, Yelp, TripAdvisor</span>
            </div>
            <div className="space-y-2">
              {[
                { source: 'Google Reviews', count: 412, rating: '4.3' },
                { source: 'Yelp', count: 287, rating: '4.1' },
                { source: 'TripAdvisor', count: 148, rating: '4.4' },
              ].map((src, i) => (
                <div key={i} className="flex items-center justify-between text-[10px] p-2 rounded bg-white/5" style={{ animation: `slideInLeft 0.3s ease-out ${i * 100}ms both` }}>
                  <span className="text-white/70">{src.source}</span>
                  <span className="text-white/40">{src.count} reviews</span>
                  <span className="text-yellow-400">★ {src.rating}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PhaseContainer>

      {/* Sentiment Phase */}
      <PhaseContainer isActive={phase === 'sentiment'}>
        <div className="space-y-3">
          <SuccessBadge text="Sentiment Analysis Complete" />
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg p-3 text-center" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <p className="text-lg font-bold text-emerald-400">72%</p>
              <p className="text-[9px] text-emerald-300/70">Positive</p>
            </div>
            <div className="rounded-lg p-3 text-center" style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
              <p className="text-lg font-bold text-yellow-400">18%</p>
              <p className="text-[9px] text-yellow-300/70">Neutral</p>
            </div>
            <div className="rounded-lg p-3 text-center" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <p className="text-lg font-bold text-red-400">10%</p>
              <p className="text-[9px] text-red-300/70">Negative</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] text-white/50">Topic Breakdown</p>
            {[
              { topic: 'Food Quality', score: 4.5, bar: 90 },
              { topic: 'Service', score: 4.2, bar: 84 },
              { topic: 'Ambiance', score: 4.0, bar: 80 },
              { topic: 'Value', score: 3.8, bar: 76 },
            ].map((topic, i) => (
              <div key={i} className="space-y-1" style={{ animation: `fadeIn 0.3s ease-out ${i * 100}ms both` }}>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-white/70">{topic.topic}</span>
                  <span className="text-yellow-400">★ {topic.score}</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${topic.bar}%`,
                      background: topic.bar >= 85 ? 'linear-gradient(90deg, #10B981 0%, #059669 100%)' : 'linear-gradient(90deg, #FBBF24 0%, #F59E0B 100%)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </PhaseContainer>

      {/* Insights Phase */}
      <PhaseContainer isActive={phase === 'insights'}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <SuccessBadge text="Actionable Insights" />
            <span className="text-[9px] text-white/40">vs 3 competitors</span>
          </div>
          <div className="space-y-2">
            {[
              { insight: '"Chicken Parmesan" mentioned 47 times — mostly positive', type: 'strength' },
              { insight: '"Wait time" complaints up 23% this month', type: 'issue' },
              { insight: 'Competitors rated higher on "value for money"', type: 'opportunity' },
            ].map((item, i) => (
              <div 
                key={i}
                className="rounded-lg p-3"
                style={{ 
                  background: item.type === 'strength' 
                    ? 'rgba(16, 185, 129, 0.1)' 
                    : item.type === 'issue' 
                      ? 'rgba(239, 68, 68, 0.1)' 
                      : 'rgba(176, 137, 104, 0.1)',
                  border: `1px solid ${item.type === 'strength' ? 'rgba(16, 185, 129, 0.2)' : item.type === 'issue' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(176, 137, 104, 0.2)'}`,
                  animation: `fadeIn 0.3s ease-out ${i * 100}ms both`,
                }}
              >
                <div className="flex items-start gap-2">
                  <span className="text-sm">{item.type === 'strength' ? '💪' : item.type === 'issue' ? '⚠️' : '💡'}</span>
                  <p className="text-[10px] text-white/80">{item.insight}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-lg p-2.5" style={{ background: 'rgba(176, 137, 104, 0.1)', border: '1px solid rgba(176, 137, 104, 0.3)' }}>
            <p className="text-[10px] text-[#D4A574]">
              <span className="font-bold">Top Action:</span> Address wait times during Friday dinner rush
            </p>
          </div>
        </div>
      </PhaseContainer>
    </div>
  );
};


// ============================================
// DEMO SELECTOR - Maps module ID to component
// ============================================
const DemoComponent: React.FC<{ moduleId: ModuleId }> = ({ moduleId }) => {
  switch (moduleId) {
    case 'invoice': return <InvoiceDemo />;
    case 'analytics': return <AnalyticsDemo />;
    case 'cogs': return <COGSDemo />;
    case 'creative': return <CreativeDemo />;
    case 'scheduling': return <SchedulingDemo />;
    case 'prep': return <PrepDemo />;
    case 'ordering': return <OrderingDemo />;
    case 'menu-comparison': return <MenuComparisonDemo />;
    case 'reviews': return <ReviewsDemo />;
    default: return null;
  }
};

// ============================================
// MAIN COMPONENT
// ============================================
export const ModuleShowcaseV2: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleId>('invoice');
  const [isPaused, setIsPaused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auto-rotate modules every 10 seconds (unless paused)
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setActiveModule(current => {
        const currentIndex = modules.findIndex(m => m.id === current);
        const nextIndex = (currentIndex + 1) % modules.length;
        return modules[nextIndex].id;
      });
    }, 10000);
    
    return () => clearInterval(interval);
  }, [isPaused]);

  const currentModule = modules.find(m => m.id === activeModule) || modules[0];

  const handleModuleClick = useCallback((id: ModuleId) => {
    setActiveModule(id);
    setMobileMenuOpen(false);
    // Pause auto-rotation for 15 seconds after manual selection
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 15000);
  }, []);

  return (
    <section id="demos" className="relative py-16 md:py-24 px-4 overflow-hidden">
      {/* Enhanced background depth for demo section */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Floating particles */}
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              background: i % 3 === 0 ? 'rgba(176, 137, 104, 0.3)' : 'rgba(74, 101, 114, 0.25)',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `floatParticle ${12 + Math.random() * 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 8}s`,
            }}
          />
        ))}
        
        {/* Top gradient glow */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full blur-[180px] opacity-[0.12]"
          style={{ background: 'radial-gradient(ellipse, rgba(176, 137, 104, 0.5) 0%, transparent 70%)' }}
        />
        
        {/* Side accent glows */}
        <div 
          className="absolute top-1/3 -left-40 w-[400px] h-[400px] rounded-full blur-[120px] opacity-[0.08]"
          style={{ background: 'radial-gradient(circle, rgba(74, 101, 114, 0.6) 0%, transparent 70%)' }}
        />
        <div 
          className="absolute bottom-1/4 -right-40 w-[400px] h-[400px] rounded-full blur-[120px] opacity-[0.08]"
          style={{ background: 'radial-gradient(circle, rgba(176, 137, 104, 0.4) 0%, transparent 70%)' }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 tracking-tight">
            One Dashboard. <span style={{ color: '#B08968' }}>Complete Control.</span>
          </h2>
          <p className="text-base md:text-lg max-w-2xl mx-auto" style={{ color: '#A8B1B9' }}>
            Everything you need to run smarter ops — from invoice intelligence to AI marketing.
          </p>
        </div>

        {/* Mobile Dropdown */}
        <div className="md:hidden mb-6 relative">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-[#1E1E1E] border border-white/10 rounded-xl text-white font-medium"
          >
            <span>{currentModule.name}</span>
            <svg 
              className={`w-4 h-4 text-white/50 transition-transform duration-200 ${mobileMenuOpen ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {mobileMenuOpen && (
            <div className="absolute z-20 top-full left-0 right-0 mt-2 bg-[#1E1E1E] border border-white/10 rounded-xl overflow-hidden shadow-xl">
              {modules.map((module) => (
                <button
                  key={module.id}
                  onClick={() => handleModuleClick(module.id)}
                  className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                    activeModule === module.id
                      ? 'bg-[#B08968]/20 text-[#D4A574]'
                      : 'text-[#A8B1B9] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {module.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Tab Navigation */}
        <div className="hidden md:block mb-8">
          <div className="flex justify-center gap-1 p-1.5 bg-white/5 rounded-xl max-w-fit mx-auto flex-wrap">
            {modules.map((module) => (
              <button
                key={module.id}
                onClick={() => handleModuleClick(module.id)}
                className={`px-3 lg:px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 whitespace-nowrap ${
                  activeModule === module.id
                    ? 'bg-[#B08968] text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                style={{
                  boxShadow: activeModule === module.id ? '0 4px 15px rgba(176, 137, 104, 0.3)' : 'none',
                }}
              >
                {module.name}
              </button>
            ))}
          </div>
        </div>

        {/* Demo Panel with enhanced depth */}
        <div 
          className="max-w-lg mx-auto relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Glow layers behind demo card */}
          <div 
            className="absolute -inset-12 rounded-[40px] blur-[100px] opacity-25 pointer-events-none"
            style={{ 
              background: 'radial-gradient(ellipse at center, rgba(176, 137, 104, 0.4) 0%, transparent 70%)',
              animation: 'pulse 4s ease-in-out infinite',
            }}
          />
          <div 
            className="absolute -inset-8 rounded-3xl blur-[60px] opacity-20 pointer-events-none"
            style={{ background: 'radial-gradient(circle at 30% 70%, rgba(74, 101, 114, 0.4) 0%, transparent 60%)' }}
          />
          <div 
            className="absolute -inset-4 rounded-2xl blur-[30px] opacity-15 pointer-events-none"
            style={{ background: 'radial-gradient(circle at 70% 30%, rgba(212, 165, 116, 0.5) 0%, transparent 50%)' }}
          />
          
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(165deg, rgba(18, 18, 18, 0.95) 0%, rgba(10, 10, 10, 0.98) 100%)',
              border: '1px solid rgba(176, 137, 104, 0.2)',
              boxShadow: '0 50px 100px -30px rgba(0, 0, 0, 0.8), 0 0 100px rgba(176, 137, 104, 0.2), 0 0 40px rgba(176, 137, 104, 0.1), inset 0 1px 0 rgba(176, 137, 104, 0.15)',
            }}
          >
            {/* Header bar */}
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
              <span className="text-[10px] text-white/40">{currentModule.tagline}</span>
            </div>

            {/* Demo content */}
            <div className="p-5">
              <DemoComponent moduleId={activeModule} />
            </div>

            {/* Footer with module indicators */}
            <div className="px-5 pb-4 flex items-center justify-between border-t border-white/5 pt-3">
              <div className="flex items-center gap-1">
                {modules.map((module) => (
                  <button
                    key={module.id}
                    onClick={() => handleModuleClick(module.id)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      activeModule === module.id ? 'bg-[#B08968] scale-125' : 'bg-white/20 hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[9px] text-white/30">
                {isPaused ? 'Paused' : 'Auto-rotating'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Animation keyframes */}
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
        @keyframes growUp {
          from {
            height: 0;
          }
          to {
            height: var(--target-height);
          }
        }
        @keyframes floatParticle {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          50% { transform: translateY(-20px) translateX(10px); opacity: 0.6; }
        }
      `}</style>
    </section>
  );
};

export default ModuleShowcaseV2;
