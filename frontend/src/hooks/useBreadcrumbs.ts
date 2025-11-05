/**
 * useBreadcrumbs Hook
 * Auto-generates breadcrumbs from current route
 */

import { useLocation, useParams } from 'react-router-dom';
import { breadcrumbConfig } from '@/config/breadcrumbs';

export interface Breadcrumb {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export function useBreadcrumbs(): Breadcrumb[] {
  const location = useLocation();
  const params = useParams();
  
  // Replace dynamic segments with :paramName
  let currentPath = location.pathname;
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value) {
      currentPath = currentPath.replace(value, `:${key}`);
    }
  });
  
  // Build breadcrumb trail by walking up the parent chain
  const breadcrumbs: Breadcrumb[] = [];
  let config = breadcrumbConfig[currentPath];
  let path = location.pathname;
  
  while (config) {
    breadcrumbs.unshift({
      label: config.label,
      href: config.parent ? path : undefined,
      icon: config.icon
    });
    
    if (config.parent) {
      // Move to parent
      const parentConfig = breadcrumbConfig[config.parent];
      if (parentConfig) {
        // Calculate parent path
        const parentSegments = config.parent.split('/').filter(Boolean);
        const currentSegments = location.pathname.split('/').filter(Boolean);
        path = '/' + currentSegments.slice(0, parentSegments.length).join('/');
        
        config = parentConfig;
      } else {
        break;
      }
    } else {
      break;
    }
  }
  
  return breadcrumbs;
}
