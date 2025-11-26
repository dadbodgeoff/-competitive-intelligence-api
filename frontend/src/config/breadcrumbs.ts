/**
 * Breadcrumb Configuration
 * Auto-generates breadcrumbs based on route paths
 */

import { Home, Search, FileText, UtensilsCrossed, Menu, BarChart3, Settings, DollarSign, Truck, Calendar, ClipboardList, Palette } from 'lucide-react';
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
  '/cogs/sales': {
    label: 'Daily Sales',
    parent: '/cogs',
  },
  '/cogs/items/:menuItemId': {
    label: 'Recipe Builder',
    parent: '/cogs',
    dynamic: true
  },
  
  // Review Analysis Module
  '/analysis': {
    label: 'Review Analysis',
    parent: '/dashboard',
    icon: Search
  },
  '/analysis/new': { 
    label: 'New Analysis', 
    parent: '/analysis',
    icon: Search
  },
  '/analysis/:analysisId/progress': { 
    label: 'Analysis Progress', 
    parent: '/analysis' 
  },
  '/analysis/:analysisId/results': { 
    label: 'Results', 
    parent: '/analysis' 
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
  
  // Predictive Ordering Module
  '/ordering': {
    label: 'Predictive Ordering',
    parent: '/dashboard',
    icon: Truck,
  },
  
  // Scheduling Module
  '/scheduling': {
    label: 'Scheduling',
    parent: '/dashboard',
    icon: Calendar,
  },

  // Prep Module
  '/prep': {
    label: 'Daily Prep',
    parent: '/dashboard',
    icon: ClipboardList,
  },
  '/prep/templates': {
    label: 'Prep Templates',
    parent: '/prep',
    icon: ClipboardList,
  },
  '/settings/team': {
    label: 'Team & Modules',
    parent: '/dashboard',
    icon: Settings,
  },
  '/creative': {
    label: 'Creative Studio',
    parent: '/dashboard',
    icon: Palette,
  },
};
