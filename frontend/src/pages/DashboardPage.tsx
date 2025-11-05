import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserProfile } from '@/components/auth/UserProfile';
import { useAuthStore } from '@/stores/authStore';
import { Link } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import {
  Search,
  Clock,
  Sparkles,
  FileText,
  BarChart3,
  UtensilsCrossed,
  Menu,
  Crown,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useUsageSummary } from '@/hooks/useUsageLimits';

export function DashboardPage() {
  const { user } = useAuthStore();
  const { summary, loading, isPremium, isUnlimited } = useUsageSummary();

  return (
    <AppShell maxWidth="wide">
        {/* Welcome section */}
        <div className="mb-8 md:mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Welcome back, {user?.first_name || 'there'}! 👋
          </h1>
          <p className="text-base md:text-lg text-slate-400">
            Your command center for competitive intelligence and operational insights
          </p>
        </div>

        {/* ZONE 1: HERO - Weekly Pulse & Upgrade CTA */}
        <section className="mb-10 md:mb-12">
          <WeeklyPulse
            summary={summary}
            loading={loading}
            isPremium={isPremium}
            isUnlimited={isUnlimited}
          />
        </section>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-10 md:mb-12" />

        {/* ZONE 2: ACTION - Primary Features */}
        <section className="mb-10 md:mb-12">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Start Analysis */}
            <ActionCard
              icon={<Search className="h-6 w-6" />}
              title="Start New Analysis"
              description="Analyze competitor reviews and discover insights"
              buttonText="Analyze Competitors"
              buttonIcon={<Sparkles className="h-4 w-4 mr-2" />}
              linkTo="/analysis/new"
              colorClass="emerald"
            />

            {/* Invoice Management */}
            <ActionCard
              icon={<FileText className="h-6 w-6" />}
              title="Invoice Management"
              description="Upload and manage your food service invoices"
              buttonText="Manage Invoices"
              buttonIcon={<FileText className="h-4 w-4 mr-2" />}
              linkTo="/invoices"
              colorClass="cyan"
            />

            {/* Menu Management */}
            <ActionCard
              icon={<UtensilsCrossed className="h-6 w-6" />}
              title="Menu Management"
              description="Upload and manage your restaurant menu"
              buttonText="View Menu"
              buttonIcon={<UtensilsCrossed className="h-4 w-4 mr-2" />}
              linkTo="/menu/dashboard"
              colorClass="orange"
            />

            {/* Price Analytics */}
            <ActionCard
              icon={<BarChart3 className="h-6 w-6" />}
              title="Price Analytics"
              description="View price trends and savings opportunities"
              buttonText="View Analytics"
              buttonIcon={<BarChart3 className="h-4 w-4 mr-2" />}
              linkTo="/analytics"
              colorClass="purple"
            />
          </div>
        </section>

        {/* ZONE 3: INSIGHTS - Secondary Features & Profile */}
        <section>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-6">
            Reports & Account
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Menu Comparison */}
            <Card className="bg-card-dark border-white/10 hover:border-violet-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/10">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
                    <Menu className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-white text-lg">
                    Menu Comparison
                  </CardTitle>
                </div>
                <CardDescription className="text-slate-400 text-sm">
                  Compare competitor menus and pricing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to="/menu-comparison">
                  <Button className="w-full bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white">
                    <Menu className="h-4 w-4 mr-2" />
                    Compare Menus
                  </Button>
                </Link>
                <Link to="/menu-comparison/saved">
                  <Button
                    variant="outline"
                    className="w-full border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Saved Reports
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Saved Analyses */}
            <Card className="bg-card-dark border-white/10 hover:border-slate-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-slate-500/10">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-slate-500/10 text-slate-400">
                    <Clock className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-white text-lg">
                    Saved Analyses
                  </CardTitle>
                </div>
                <CardDescription className="text-slate-400 text-sm">
                  View your previous competitive analyses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/analysis/saved">
                  <Button className="w-full bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white">
                    <Clock className="h-4 w-4 mr-2" />
                    View History
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* User Profile */}
            <div className="md:col-span-2 lg:col-span-1">
              <UserProfile />
            </div>
          </div>
        </section>
    </AppShell>
  );
}

// Weekly Pulse Component
interface WeeklyPulseProps {
  summary: any;
  loading: boolean;
  isPremium: boolean;
  isUnlimited: boolean;
}

function WeeklyPulse({
  summary,
  loading,
  isPremium,
  isUnlimited,
}: WeeklyPulseProps) {
  if (loading) {
    return (
      <Card className="bg-card-dark border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading Usage...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (isUnlimited) {
    return (
      <Card className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-emerald-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 text-xl">
            <Crown className="h-6 w-6 text-emerald-400" />
            Premium Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-emerald-400 mb-2">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-semibold text-lg">Unlimited Access</span>
          </div>
          <p className="text-sm text-slate-400">
            You have unlimited access to all features
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!summary?.weekly) {
    return (
      <Card className="bg-card-dark border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            Usage Limits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 text-sm">Unable to load usage data</p>
        </CardContent>
      </Card>
    );
  }

  const features = [
    {
      name: 'Invoice Uploads',
      used: summary.weekly.invoice_uploads.used,
      limit: summary.weekly.invoice_uploads.limit,
      color: 'emerald',
    },
    {
      name: 'Menu Uploads',
      used: summary.weekly.menu_uploads.used,
      limit: summary.weekly.menu_uploads.limit,
      color: 'cyan',
    },
    {
      name: 'Free Analyses',
      used: summary.weekly.free_analyses.used,
      limit: summary.weekly.free_analyses.limit,
      color: 'blue',
    },
    {
      name: 'Menu Comparisons',
      used: summary.weekly.menu_comparisons.used,
      limit: summary.weekly.menu_comparisons.limit,
      color: 'purple',
    },
  ];

  const resetDate = new Date(
    summary.weekly.invoice_uploads.reset_date
  ).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <Card className="bg-card-dark border-white/10">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-white text-xl">Weekly Pulse</CardTitle>
          <Badge
            variant="outline"
            className="text-xs text-slate-400 border-slate-600 w-fit"
          >
            Resets {resetDate}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bars */}
        <div className="space-y-4">
          {features.map((feature, index) => {
            const percentage = (feature.used / feature.limit) * 100;
            const remaining = feature.limit - feature.used;
            const isAtLimit = remaining === 0;

            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-300">
                    {feature.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">
                      {feature.used} / {feature.limit}
                    </span>
                    {isAtLimit && (
                      <Badge
                        variant="outline"
                        className="text-xs text-red-400 border-red-500/30 bg-red-500/10"
                      >
                        Limit Reached
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      isAtLimit
                        ? 'bg-red-500'
                        : feature.color === 'emerald'
                        ? 'bg-emerald-400'
                        : feature.color === 'cyan'
                        ? 'bg-cyan-400'
                        : feature.color === 'blue'
                        ? 'bg-blue-400'
                        : 'bg-purple-400'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Upgrade CTA */}
        {!isPremium && (
          <div className="pt-4 mt-4 border-t border-white/10">
            <Link to="/pricing" className="block">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-90 text-white font-semibold shadow-lg shadow-emerald-500/25"
              >
                <Crown className="h-4 w-4 mr-2" />
                Upgrade for Unlimited Access
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Action Card Component
interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  buttonIcon: React.ReactNode;
  linkTo: string;
  colorClass: string;
}

function ActionCard({
  icon,
  title,
  description,
  buttonText,
  buttonIcon,
  linkTo,
  colorClass,
}: ActionCardProps) {
  // Color classes are applied directly in className strings below

  return (
    <Card
      className={`bg-card-dark border-white/10 hover:border-${colorClass}-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-${colorClass}-500/10 hover:-translate-y-1`}
    >
      <CardHeader>
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`p-3 rounded-lg bg-${colorClass}-500/10 text-${colorClass}-400`}
          >
            {icon}
          </div>
          <CardTitle className="text-white text-lg">{title}</CardTitle>
        </div>
        <CardDescription className="text-slate-400 text-sm">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link to={linkTo}>
          <Button
            size="lg"
            className={`w-full bg-gradient-to-r from-${colorClass}-500 to-${colorClass}-600 hover:from-${colorClass}-600 hover:to-${colorClass}-700 text-white shadow-lg shadow-${colorClass}-500/25 font-semibold`}
          >
            {buttonIcon}
            {buttonText}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
