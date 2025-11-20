import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Zap, Crown, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TierSelectorProps {
  value: 'free' | 'premium';
  onChange: (tier: 'free' | 'premium') => void;
  userTier: 'free' | 'premium' | 'enterprise';
}

export function TierSelector({
  value,
  onChange,
  userTier,
}: TierSelectorProps) {
  const navigate = useNavigate();
  const tiers = [
    {
      id: 'free' as const,
      name: 'Free Analysis',
      competitors: 2,
      description: 'Analyze 2 closest competitors',
      available: true,
      badge: 'Free',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      icon: Sparkles,
      borderColor: 'border-emerald-500/50',
    },
    {
      id: 'premium' as const,
      name: 'Premium Analysis',
      competitors: 5,
      description: 'Analyze 5 competitors with detailed insights',
      available: userTier !== 'free',
      badge: userTier === 'free' ? 'Upgrade Required' : 'Premium',
      badgeColor:
        userTier === 'free'
          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      icon: userTier === 'free' ? Crown : Zap,
      borderColor: 'border-cyan-500/50',
    },
  ];

  return (
    <div className="space-y-3">
      {tiers.map((tier) => {
        const Icon = tier.icon;
        return (
          <Card
            key={tier.id}
            className={cn(
              'cursor-pointer transition-all duration-200 bg-obsidian/50 border-white/10',
              value === tier.id &&
                `ring-2 ${tier.borderColor} ring-offset-0 bg-obsidian/80`,
              tier.available && 'hover:border-white/20',
              !tier.available && 'opacity-60 cursor-not-allowed'
            )}
            onClick={() => tier.available && onChange(tier.id)}
            data-testid={`tier-${tier.id}`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={cn(
                        'p-1.5 rounded-lg',
                        tier.id === 'free'
                          ? 'bg-emerald-500/10'
                          : 'bg-cyan-500/10'
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-4 w-4',
                          tier.id === 'free'
                            ? 'text-emerald-400'
                            : 'text-cyan-400'
                        )}
                      />
                    </div>
                    <h3 className="font-semibold text-base text-white">
                      {tier.name}
                    </h3>
                    <Badge className={`${tier.badgeColor} border font-medium`}>
                      {tier.badge}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-400 mb-3 ml-10">
                    {tier.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm ml-10">
                    <span className="font-medium text-white">
                      {tier.competitors} competitors
                    </span>
                    {tier.id === 'premium' && (
                      <span className="text-slate-400">
                        + Detailed insights
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  {tier.available ? (
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full border-2 transition-colors flex items-center justify-center',
                        value === tier.id
                          ? tier.id === 'free'
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'bg-cyan-500 border-cyan-500'
                          : 'border-slate-500'
                      )}
                    >
                      {value === tier.id && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
                      onClick={(e) => {
                        e.stopPropagation();
                      navigate('/pricing');
                      }}
                    >
                      <Crown className="h-3 w-3 mr-1" />
                      Upgrade
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}