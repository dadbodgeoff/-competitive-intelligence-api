/**
 * AppSidebar Component
 * Unified sidebar navigation for all authenticated pages
 * Extends DashboardSidebar with module awareness
 */

import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Search,
  FileText,
  UtensilsCrossed,
  Menu,
  BarChart3,
  TrendingUp,
  LogOut,
  Crown,
  User,
  Users,
  DollarSign,
  Truck,
  Calendar,
  ClipboardList,
  Palette,
  CreditCard,
  Sparkles,
} from 'lucide-react';
import { SidebarClockIn } from './SidebarClockIn';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  module?: string;
}

const mainNavItems: NavItem[] = [
  // 🎨 HIGHEST VALUE - Revenue Generation
  {
    title: 'Creative Studio',
    href: '/creative',
    icon: Palette,
    module: 'dashboard',
    badge: 'NEW',
  },
  
  // 📊 Core Operations - High Value
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    module: 'dashboard',
  },
  {
    title: 'Menu Management',
    href: '/menu/dashboard',
    icon: UtensilsCrossed,
    module: 'menu_management',
  },
  {
    title: 'Invoices',
    href: '/invoices/dashboard',
    icon: FileText,
    module: 'invoices',
  },
  
  // 💰 Financial Intelligence
  {
    title: 'Cost of Goods',
    href: '/cogs',
    icon: DollarSign,
    module: 'dashboard',
  },
  {
    title: 'Daily Sales',
    href: '/cogs/sales',
    icon: TrendingUp,
    module: 'dashboard',
  },
  {
    title: 'Price Analytics',
    href: '/analytics',
    icon: BarChart3,
    module: 'pricing_analytics',
  },
  
  // 🔍 Competitive Intelligence
  {
    title: 'Review Analysis',
    href: '/analysis',
    icon: Search,
  },
  {
    title: 'Menu Comparison',
    href: '/menu-comparison',
    icon: Menu,
    module: 'menu_comparison',
  },
  
  // 📦 Operations Management
  {
    title: 'Predictive Ordering',
    href: '/ordering',
    icon: Truck,
    badge: 'NEW',
    module: 'ordering_predictions',
  },
  {
    title: 'Daily Prep',
    href: '/prep',
    icon: ClipboardList,
    module: 'prep',
  },
  {
    title: 'Prep Templates',
    href: '/prep/templates',
    icon: ClipboardList,
    module: 'prep',
  },
  {
    title: 'Scheduling',
    href: '/scheduling',
    icon: Calendar,
    module: 'scheduling',
  },
];

// Reports section removed - Saved Comparisons now integrated into Menu Comparison dashboard
const reportsNavItems: NavItem[] = [];

const accountNavItems: NavItem[] = [
  {
    title: 'Team & Modules',
    href: '/settings/team',
    icon: Users,
    module: 'dashboard',
  },
  {
    title: 'Billing',
    href: '/settings/billing',
    icon: CreditCard,
    module: 'dashboard',
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  
  const hasModule = (moduleSlug?: string) => {
    if (!moduleSlug) return true;
    if (!user?.module_access) return false;
    return user.module_access.some(
      (mod) => mod.module_slug === moduleSlug && mod.can_access
    );
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };
  
  const isPremium = user?.subscription_tier === 'premium';
  
  return (
    <Sidebar>
      <SidebarHeader className="border-b p-6" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
        <Link to="/dashboard" className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6" style={{ color: '#B08968' }} />
          <span className="text-xl font-bold" style={{ color: '#E0E0E0' }}>RestaurantIQ</span>
        </Link>
        {isPremium && (
          <Badge className="mt-2 text-white border-0 bg-primary-500">
            <Crown className="h-3 w-3 mr-1" />
            Premium
          </Badge>
        )}
      </SidebarHeader>
      
      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems
                .filter((item) => hasModule(item.module))
                .map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link to={item.href}>
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Reports - Only show if there are items */}
        {reportsNavItems.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel>Reports</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {reportsNavItems
                .filter((item) => hasModule(item.module))
                .map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link to={item.href}>
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        )}

        {/* Account */}
        {hasModule('dashboard') && user?.account_role === 'owner' && (
          <SidebarGroup>
            <SidebarGroupLabel>Account</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {accountNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={active}>
                        <Link to={item.href}>
                          <Icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      
      <SidebarFooter className="border-t p-4" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
        <div className="space-y-3">
          {/* Upgrade CTA for free users */}
          {!isPremium && (
            <Link to="/settings/billing" className="block">
              <div className="p-3 rounded-lg bg-gradient-to-r from-primary-500/20 to-green-500/20 border border-primary-500/30 hover:border-primary-500/50 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-4 w-4 text-primary-400" />
                  <span className="text-sm font-semibold text-white">Upgrade to Premium</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs text-slate-500 line-through">$199</span>
                  <span className="text-sm font-bold text-white">$99/mo</span>
                  <span className="text-xs text-green-400">50% off</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Launch special — lock in this rate</p>
              </div>
            </Link>
          )}
          
          {/* Clock In/Out Widget */}
          <SidebarClockIn />
          
          <div className="border-t pt-3" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            <div className="flex items-center gap-2 text-sm mb-2 px-3" style={{ color: '#A8B1B9' }}>
              <User className="h-4 w-4" />
              <span className="truncate">{user?.email}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="w-full"
              style={{ borderColor: 'rgba(255, 255, 255, 0.1)', color: '#A8B1B9' }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
