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
  const containerClass = 
    maxWidth === 'full' 
      ? 'w-full px-4' 
      : maxWidth === 'wide'
      ? 'container mx-auto px-4 max-w-[1600px]'
      : 'container mx-auto px-4 max-w-7xl';
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-obsidian">
        {/* Sidebar */}
        <AppSidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header with Breadcrumbs */}
          <div className="sticky top-0 z-10 border-b border-white/10 bg-card-dark/50 backdrop-blur-sm">
            <div className={containerClass}>
              <div className="flex items-center gap-4 py-4">
                <SidebarTrigger className="text-slate-400 hover:text-white" />
                <AppBreadcrumbs />
              </div>
            </div>
          </div>
          
          {/* Page Content */}
          <div className="flex-1 overflow-auto">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
            
            {/* Content */}
            <div className="relative">
              <div className={`${containerClass} py-8`}>
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
