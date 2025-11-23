import { AppShell } from '@/components/layout/AppShell';
import { CreativeDashboard } from '@/features/creative/components/CreativeDashboard';

export function CreativeStudioPage() {
  return (
    <AppShell maxWidth="wide">
      <CreativeDashboard />
    </AppShell>
  );
}


