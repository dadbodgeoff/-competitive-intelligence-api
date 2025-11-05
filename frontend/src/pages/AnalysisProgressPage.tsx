import { useParams, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { AnalysisProgressTracker } from '@/components/analysis/AnalysisProgressTracker';

export function AnalysisProgressPage() {
  const { analysisId } = useParams<{ analysisId: string }>();

  // Validate analysisId parameter
  if (!analysisId) {
    return <Navigate to="/dashboard" replace />;
  }

  // Basic UUID validation (optional but good practice)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(analysisId)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AppShell>
      <AnalysisProgressTracker analysisId={analysisId} />
    </AppShell>
  );
}