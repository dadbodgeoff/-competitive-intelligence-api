import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Search,
  FileText,
  UtensilsCrossed,
  BarChart3,
  Menu,
  Clock,
  TrendingUp,
  Crown,
  AlertTriangle,
  TrendingDown,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { useAuthStore } from '@/stores/authStore';

const mainNavItems = [
  {
    title: 'Dashboard',
    icon: Home,
    href: '/dashboard',
  },
  {
    title: 'New Analysis',
    icon: Search,
    href: '/analysis/new',
  },
];

const featuresNavItems = [
  {
    title: 'Invoices',
    icon: FileText,
    href: '/invoices',
  },
  {
    title: 'Menu',
    icon: UtensilsCrossed,
    href: '/menu/dashboard',
  },
  {
    title: 'Menu Comparison',
    icon: Menu,
    href: '/menu-comparison',
  },
  {
    title: 'Price Analytics',
    icon: BarChart3,
    href: '/analytics',
  },
  {
    title: 'Price Alerts',
    icon: AlertTriangle,
    href: '/analytics/alerts',
  },
  {
    title: 'Savings Opportunities',
    icon: TrendingDown,
    href: '/analytics/opportunities',
  },
];

const reportsNavItems = [
  {
    title: 'Saved Analyses',
    icon: Clock,
    href: '/analysis/saved',
  },
  {
    title: 'Saved Comparisons',
    icon: Menu,
    href: '/menu-comparison/saved',
  },
];

export function DashboardSidebar() {
  const location = useLocation();
  const { user } = useAuthStore();
  const isPremium = user?.subscription_tier === 'premium';

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-white/10 p-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-emerald-500" />
          <span className="text-lg font-bold text-white">RestaurantIQ</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.href}
                  >
                    <Link to={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Features */}
        <SidebarGroup>
          <SidebarGroupLabel>Features</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {featuresNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname.startsWith(item.href)}
                  >
                    <Link to={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Reports */}
        <SidebarGroup>
          <SidebarGroupLabel>Reports</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {reportsNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.href}
                  >
                    <Link to={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-white/10 p-4">
        {isPremium ? (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3">
            <Crown className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">
              Premium
            </span>
          </div>
        ) : (
          <Link to="/pricing">
            <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 p-3 hover:from-emerald-500/20 hover:to-cyan-500/20 transition-colors">
              <Crown className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-medium text-white">
                Upgrade to Premium
              </span>
            </div>
          </Link>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
