/**
 * AppBreadcrumbs Component
 * Displays auto-generated breadcrumbs
 */

import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs';

export function AppBreadcrumbs() {
  const breadcrumbs = useBreadcrumbs();
  
  if (breadcrumbs.length === 0) {
    return null;
  }
  
  return (
    <nav className="flex items-center gap-2 text-sm">
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        const Icon = crumb.icon;
        
        return (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-slate-600" />
            )}
            
            {crumb.href && !isLast ? (
              <Link
                to={crumb.href}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span>{crumb.label}</span>
              </Link>
            ) : (
              <div className="flex items-center gap-2 text-white font-medium">
                {Icon && <Icon className="h-4 w-4" />}
                <span>{crumb.label}</span>
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
