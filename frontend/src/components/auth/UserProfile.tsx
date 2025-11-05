import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { Badge } from '@/components/ui/badge';
import { User, Crown, Zap, LogOut } from 'lucide-react';

export function UserProfile() {
  const { user, logout } = useAuthStore();

  if (!user) return null;

  const getTierConfig = (tier: string) => {
    switch (tier) {
      case 'premium':
        return {
          color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
          icon: Crown,
        };
      case 'enterprise':
        return {
          color: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
          icon: Zap,
        };
      default:
        return {
          color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          icon: User,
        };
    }
  };

  const tierConfig = getTierConfig(user.subscription_tier);
  const TierIcon = tierConfig.icon;

  return (
    <Card className="bg-card-dark border-white/10">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-500/10 text-slate-400">
            <User className="h-5 w-5" />
          </div>
          <CardTitle className="text-white">Profile</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Name
          </label>
          <p className="text-base text-white mt-1">
            {user.first_name} {user.last_name}
          </p>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Email
          </label>
          <p className="text-sm text-slate-300 mt-1">{user.email}</p>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Subscription
          </label>
          <div className="mt-2">
            <Badge
              className={`${tierConfig.color} border font-semibold px-3 py-1`}
            >
              <TierIcon className="h-3 w-3 mr-1.5" />
              {user.subscription_tier.charAt(0).toUpperCase() +
                user.subscription_tier.slice(1)}
            </Badge>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Member Since
          </label>
          <p className="text-sm text-slate-300 mt-1">
            {new Date(user.created_at).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>

        <div className="pt-2 border-t border-white/10">
          <Button
            variant="outline"
            onClick={logout}
            className="w-full border-white/10 text-slate-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}