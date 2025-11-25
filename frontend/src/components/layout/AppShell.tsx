/**
 * AppShell Component
 * Unified layout wrapper for all authenticated pages
 * Provides consistent sidebar, breadcrumbs, and page structure
 */

import { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';
import { AppBreadcrumbs } from './AppBreadcrumbs';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

interface AppShellProps {
  children: ReactNode;
  maxWidth?: 'default' | 'wide' | 'full';
}

export function AppShell({ 
  children, 
  maxWidth = 'default',
}: AppShellProps) {
  // BRAND STANDARD: 32px horizontal padding on desktop, 16px on mobile
  const containerClass = 
    maxWidth === 'full' 
      ? 'w-full px-4 md:px-8' 
      : maxWidth === 'wide'
      ? 'container mx-auto px-4 md:px-8 max-w-[1600px]'
      : 'container mx-auto px-4 md:px-8 max-w-[1200px]';
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full" style={{ backgroundColor: '#121212' }}>
        {/* Sidebar - BRAND STANDARD: 240-280px width */}
        <AppSidebar />
        
        {/* Main Content Area - BRAND STANDARD: 32px gap from sidebar on desktop, none on mobile */}
        <div className="flex-1 flex flex-col min-w-0 ml-0 md:ml-8">
          {/* Header with Breadcrumbs - BRAND STANDARD: 64px height */}
          <div className="sticky top-0 z-10 border-b border-white/10 backdrop-blur-sm" style={{ height: '64px', backgroundColor: '#1E1E1E' }}>
            <div className={containerClass}>
              <div className="flex items-center gap-6 h-16">
                <SidebarTrigger className="hover:text-white" style={{ color: '#A8B1B9' }} />
                <AppBreadcrumbs />
              </div>
            </div>
          </div>
          
          {/* Page Content - BRAND STANDARD: 24px top/bottom, 32px horizontal */}
          <div className="flex-1 overflow-auto">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-accent-500/5 pointer-events-none" />
            
            {/* Content */}
            <div className="relative">
              <div className={`${containerClass} pt-6 pb-8`}>
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
