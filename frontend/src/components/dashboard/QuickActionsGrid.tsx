import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface QuickAction {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: 'emerald' | 'cyan' | 'orange' | 'purple';
}

interface QuickActionsGridProps {
  actions: QuickAction[];
}

const colorClasses = {
  emerald: {
    icon: 'text-emerald-400 bg-emerald-500/10',
    button: 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700',
    border: 'hover:border-emerald-500/50',
  },
  cyan: {
    icon: 'text-cyan-400 bg-cyan-500/10',
    button: 'bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700',
    border: 'hover:border-cyan-500/50',
  },
  orange: {
    icon: 'text-orange-400 bg-orange-500/10',
    button: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
    border: 'hover:border-orange-500/50',
  },
  purple: {
    icon: 'text-purple-400 bg-purple-500/10',
    button: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    border: 'hover:border-purple-500/50',
  },
};

export function QuickActionsGrid({ actions }: QuickActionsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action) => {
        const Icon = action.icon;
        const colors = colorClasses[action.color];

        return (
          <Card
            key={action.href}
            className={`bg-card-dark border-white/10 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${colors.border}`}
          >
            <CardHeader>
              <div className={`w-12 h-12 rounded-lg ${colors.icon} flex items-center justify-center mb-3`}>
                <Icon className="h-6 w-6" />
              </div>
              <CardTitle className="text-white text-lg">{action.title}</CardTitle>
              <CardDescription className="text-slate-400 text-sm">
                {action.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to={action.href}>
                <Button className={`w-full ${colors.button} text-white font-semibold`}>
                  Get Started
                </Button>
              </Link>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
