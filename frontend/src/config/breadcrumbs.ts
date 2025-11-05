/**
 * Breadcrumb Configuration
 * Auto-generates breadcrumbs based on route paths
 */

import { Home, Search, FileText, UtensilsCrossed, Menu, BarChart3, Settings, DollarSign } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface BreadcrumbConfig {
  label: string;
  parent?: string;
  icon?: LucideIcon;
  dynamic?: boolean;
  getDynamicLabel?: (params: Record<string, string>) => string;
}

export const breadcrumbConfig: Record<string, BreadcrumbConfig> = {
  '/dashboard': { 
    label: 'Dashboard', 
    icon: Home 
  },
  
  // COGS Tracker Module
  '/cogs': {
    label: 'COGS Tracker',
    parent: '/dashboard',
    icon: DollarSign
  },
  
  // Review Analysis Module
  '/analysis/new': { 
    label: 'New Analysis', 
    parent: '/dashboard',
    icon: Search
  },
  '/analysis/:analysisId/progress': { 
    label: 'Analysis Progress', 
    parent: '/analysis/new' 
  },
  '/analysis/:analysisId/results': { 
    label: 'Results', 
    parent: '/analysis/new' 
  },
  '/analysis/saved': { 
    label: 'Saved Analyses', 
    parent: '/dashboard',
    icon: Search
  },
  
  // Invoice Management Module
  '/invoices': { 
    label: 'Invoices', 
    parent: '/dashboard',
    icon: FileText
  },
  '/invoices/upload': { 
    label: 'Upload Invoice', 
    parent: '/invoices' 
  },
  '/invoices/:invoiceId': { 
    label: 'Invoice Detail', 
    parent: '/invoices',
    dynamic: true
  },
  
  // Menu Management Module
  '/menu/dashboard': { 
    label: 'Menu Management', 
    parent: '/dashboard',
    icon: UtensilsCrossed
  },
  '/menu/upload': { 
    label: 'Upload Menu', 
    parent: '/menu/dashboard' 
  },
  '/menu/items/:menuItemId/recipe': { 
    label: 'Recipe Builder', 
    parent: '/menu/dashboard',
    dynamic: true
  },
  
  // Menu Comparison Module
  '/menu-comparison': { 
    label: 'Menu Comparison', 
    parent: '/dashboard',
    icon: Menu
  },
  '/menu-comparison/:analysisId/select': { 
    label: 'Select Competitors', 
    parent: '/menu-comparison' 
  },
  '/menu-comparison/:analysisId/parse': { 
    label: 'Parsing Menus', 
    parent: '/menu-comparison' 
  },
  '/menu-comparison/:analysisId/results': { 
    label: 'Results', 
    parent: '/menu-comparison' 
  },
  '/menu-comparison/saved': { 
    label: 'Saved Comparisons', 
    parent: '/dashboard',
    icon: Menu
  },
  
  // Price Analytics Module
  '/analytics': { 
    label: 'Price Analytics', 
    parent: '/dashboard',
    icon: BarChart3
  },
  '/analytics/alerts': { 
    label: 'Price Alerts', 
    parent: '/analytics' 
  },
  '/analytics/opportunities': { 
    label: 'Savings Opportunities', 
    parent: '/analytics' 
  },
  '/settings/alerts': { 
    label: 'Alert Settings', 
    parent: '/analytics',
    icon: Settings
  },
};
