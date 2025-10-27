import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TierSelectorProps {
  value: 'free' | 'premium';
  onChange: (tier: 'free' | 'premium') => void;
  userTier: 'free' | 'premium' | 'enterprise';
}

export function TierSelector({ value, onChange, userTier }: TierSelectorProps) {
  const tiers = [
    {
      id: 'free' as const,
      name: 'Free Analysis',
      competitors: 2,
      description: 'Analyze 2 closest competitors',
      available: true,
      badge: 'Free',
      badgeColor: 'bg-gray-100 text-gray-800',
    },
    {
      id: 'premium' as const,
      name: 'Premium Analysis',
      competitors: 5,
      description: 'Analyze 5 competitors with detailed insights',
      available: userTier !== 'free',
      badge: userTier === 'free' ? 'Upgrade Required' : 'Premium',
      badgeColor: userTier === 'free' 
        ? 'bg-orange-100 text-orange-800' 
        : 'bg-blue-100 text-blue-800',
    },
  ];

  return (
    <div className="space-y-3">
      {tiers.map((tier) => (
        <Card
          key={tier.id}
          className={cn(
            "cursor-pointer transition-all duration-200 hover:shadow-md",
            value === tier.id && "ring-2 ring-primary ring-offset-2",
            !tier.available && "opacity-60 cursor-not-allowed"
          )}
          onClick={() => tier.available && onChange(tier.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-base">{tier.name}</h3>
                  <Badge className={tier.badgeColor}>
                    {tier.badge}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {tier.description}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-medium">
                    {tier.competitors} competitors
                  </span>
                  {tier.id === 'premium' && (
                    <span className="text-muted-foreground">
                      + Detailed insights
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center">
                {tier.available ? (
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border-2 transition-colors",
                      value === tier.id
                        ? "bg-primary border-primary"
                        : "border-muted-foreground"
                    )}
                  >
                    {value === tier.id && (
                      <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                    )}
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Navigate to upgrade page
                      console.log('Navigate to upgrade');
                    }}
                  >
                    Upgrade
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}