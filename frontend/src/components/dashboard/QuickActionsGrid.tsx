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
    icon: 'text-primary-500 bg-primary-500/10',
    button: 'bg-gradient-to-r bg-primary-500 hover:bg-primary-400',
    border: 'hover:border-primary-500/50',
  },
  cyan: {
    icon: 'text-accent-400 bg-accent-500/10',
    button: 'bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700',
    border: 'hover:border-accent-500/50',
  },
  orange: {
    icon: 'text-primary-500 bg-primary-500/10',
    button: 'bg-gradient-to-r from-primary-600 to-primary-600 hover:from-primary-500 hover:to-primary-600',
    border: 'hover:border-primary-600/50',
  },
  purple: {
    icon: 'text-accent-400 bg-accent-500/10',
    button: 'bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700',
    border: 'hover:border-accent-500/50',
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
