import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { Badge } from '@/components/ui/badge';

export function UserProfile() {
  const { user, logout } = useAuthStore();

  if (!user) return null;

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'premium':
        return 'bg-blue-100 text-blue-800';
      case 'enterprise':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Name</label>
          <p className="text-base">{user.first_name} {user.last_name}</p>
        </div>
        
        <div>
          <label className="text-sm font-medium text-muted-foreground">Email</label>
          <p className="text-base">{user.email}</p>
        </div>
        
        <div>
          <label className="text-sm font-medium text-muted-foreground">Subscription</label>
          <div className="mt-1">
            <Badge className={getTierColor(user.subscription_tier)}>
              {user.subscription_tier.charAt(0).toUpperCase() + user.subscription_tier.slice(1)}
            </Badge>
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium text-muted-foreground">Member Since</label>
          <p className="text-base">
            {new Date(user.created_at).toLocaleDateString()}
          </p>
        </div>

        <Button 
          variant="outline" 
          onClick={logout}
          className="w-full"
        >
          Sign Out
        </Button>
      </CardContent>
    </Card>
  );
}