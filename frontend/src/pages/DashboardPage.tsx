import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@/components/auth/UserProfile';
import { useAuthStore } from '@/stores/authStore';
import { Link } from 'react-router-dom';

export function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.first_name}!</h1>
          <p className="text-muted-foreground">
            Analyze your competition and discover new opportunities
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Start New Analysis</CardTitle>
            <CardDescription>
              Analyze competitor reviews and discover insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/analysis/new">
              <Button className="w-full">
                Analyze Competitors
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Analyses</CardTitle>
            <CardDescription>
              View your previous competitive analyses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        <UserProfile />
      </div>
    </div>
  );
}