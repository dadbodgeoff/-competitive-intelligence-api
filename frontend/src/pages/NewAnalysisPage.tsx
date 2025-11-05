import { AppShell } from '@/components/layout/AppShell';
import { ReviewAnalysisForm } from '@/components/analysis/ReviewAnalysisForm';

export function NewAnalysisPage() {
  return (
    <AppShell>
      <ReviewAnalysisForm />
    </AppShell>
  );
}