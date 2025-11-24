import { Link } from 'react-router-dom';
import { TrendingUp, ChevronRight, Home, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  breadcrumbs: Breadcrumb[];
  showBackToDashboard?: boolean;
  showBackButton?: boolean;
  backButtonLabel?: string;
  backButtonHref?: string;
}

export function PageHeader({
  breadcrumbs,
  showBackToDashboard = true,
  showBackButton = false,
  backButtonLabel = 'Back',
  backButtonHref,
}: PageHeaderProps) {
  const { user } = useAuthStore();

  return (
    <div className="relative border-b border-white/10 bg-card-dark/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-6">
        {/* Top row: Brand + Breadcrumbs + User */}
        <div className="flex items-center justify-between mb-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-white hover:text-primary-500 transition-colors"
          >
            <TrendingUp className="h-6 w-6 text-primary-500" />
            <span className="text-xl font-bold">RestaurantIQ</span>
          </Link>

          {/* Breadcrumbs */}
          <div className="hidden md:flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-2">
                {index > 0 && <ChevronRight className="h-4 w-4 text-slate-500" />}
                {crumb.href ? (
                  <Link
                    to={crumb.href}
                    className="text-slate-400 hover:text-primary-500 transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-white font-medium">{crumb.label}</span>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">{user?.email}</span>
          </div>
        </div>

        {/* Quick actions row */}
        {(showBackToDashboard || showBackButton) && (
          <div className="flex items-center gap-3">
            {showBackToDashboard && (
              <Link to="/dashboard">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/10 text-slate-400 hover:bg-white/5 hover:text-white"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            )}
            {showBackButton && backButtonHref && (
              <Link to={backButtonHref}>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/10 text-slate-400 hover:bg-white/5 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {backButtonLabel}
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
