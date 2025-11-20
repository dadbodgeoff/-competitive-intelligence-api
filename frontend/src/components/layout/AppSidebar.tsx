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
} from 'lucide-react';
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
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    module: 'dashboard',
  },
  {
    title: 'Review Analysis',
    href: '/analysis/new',
    icon: Search,
  },
  {
    title: 'Invoices',
    href: '/invoices',
    icon: FileText,
    module: 'invoices',
  },
  {
    title: 'Menu Management',
    href: '/menu/dashboard',
    icon: UtensilsCrossed,
    module: 'menu_management',
  },
  {
    title: 'COGS Tracker',
    href: '/cogs',
    icon: DollarSign,
    module: 'dashboard',
  },
  {
    title: 'Predictive Ordering',
    href: '/ordering',
    icon: Truck,
    badge: 'NEW',
    module: 'ordering_predictions',
  },
  {
    title: 'Scheduling',
    href: '/scheduling',
    icon: Calendar,
    module: 'scheduling',
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
    title: 'Menu Comparison',
    href: '/menu-comparison',
    icon: Menu,
    module: 'menu_comparison',
  },
  {
    title: 'Price Analytics',
    href: '/analytics',
    icon: BarChart3,
    module: 'pricing_analytics',
  },
];

const reportsNavItems: NavItem[] = [
  {
    title: 'Saved Analyses',
    href: '/analysis/saved',
    icon: Search,
    module: 'dashboard',
  },
  {
    title: 'Saved Comparisons',
    href: '/menu-comparison/saved',
    icon: Menu,
    module: 'menu_comparison',
  },
];

const accountNavItems: NavItem[] = [
  {
    title: 'Team & Modules',
    href: '/settings/team',
    icon: Users,
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
      <SidebarHeader className="border-b border-white/10 p-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-emerald-500" />
          <span className="text-xl font-bold text-white">RestaurantIQ</span>
        </Link>
        {isPremium && (
          <Badge className="mt-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border-0">
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
        
        {/* Reports */}
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
      
      <SidebarFooter className="border-t border-white/10 p-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
            <User className="h-4 w-4" />
            <span className="truncate">{user?.email}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="w-full border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
