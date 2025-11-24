import { ReactNode } from 'react';
import { PageHeader } from './PageHeader';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageLayoutProps {
  children: ReactNode;
  breadcrumbs: Breadcrumb[];
  showBackToDashboard?: boolean;
  showBackButton?: boolean;
  backButtonLabel?: string;
  backButtonHref?: string;
}

export function PageLayout({
  children,
  breadcrumbs,
  showBackToDashboard = true,
  showBackButton = false,
  backButtonLabel,
  backButtonHref,
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-obsidian">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-accent-500/5 pointer-events-none" />

      {/* Header */}
      <PageHeader
        breadcrumbs={breadcrumbs}
        showBackToDashboard={showBackToDashboard}
        showBackButton={showBackButton}
        backButtonLabel={backButtonLabel}
        backButtonHref={backButtonHref}
      />

      {/* Main content */}
      <div className="relative container mx-auto px-4 py-12">{children}</div>
    </div>
  );
}
