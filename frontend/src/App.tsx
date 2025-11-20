import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AcceptInvitePage } from './pages/AcceptInvitePage';
import { TimeClockPage } from './pages/TimeClockPage';
import { DashboardPage } from './pages/DashboardPage';
import { DashboardPageNew } from './pages/DashboardPageNew';
import { NewAnalysisPage } from './pages/NewAnalysisPage';
import { AnalysisProgressPage } from './pages/AnalysisProgressPage';
import { AnalysisResultsPage } from './pages/AnalysisResultsPage';
import { SavedAnalysesPage } from './pages/SavedAnalysesPage';
import { InvoiceListPage } from './pages/InvoiceListPage';
import { InvoiceUploadPage } from './pages/InvoiceUploadPage';
import { InvoiceDetailPage } from './pages/InvoiceDetailPage';
import { MenuUploadPage } from './pages/MenuUploadPage';
import { MenuDashboard } from './pages/MenuDashboard';
import { MenuItemRecipePage } from './pages/MenuItemRecipePage';
import { COGSDashboardPage } from './pages/COGSDashboardPage';
import { MenuComparisonPage } from './pages/MenuComparisonPage';
import { CompetitorSelectionPage } from './pages/CompetitorSelectionPage';
import { MenuParsingProgressPage } from './pages/MenuParsingProgressPage';
import { MenuComparisonResultsPage } from './pages/MenuComparisonResultsPage';
import { SavedComparisonsPage } from './pages/SavedComparisonsPage';
import { PriceAnalyticsDashboard } from './pages/PriceAnalyticsDashboard';
import { PriceAlertsPage } from './pages/PriceAlertsPage';
import { SavingsOpportunitiesPage } from './pages/SavingsOpportunitiesPage';
import { AlertSettingsPage } from './pages/AlertSettingsPage';
import { OrderingPredictionsPage } from './pages/OrderingPredictionsPage';
import { TeamSettingsPage } from './pages/TeamSettingsPage';
import { SchedulingDashboardPage } from './pages/SchedulingDashboardPage';
import { PrepDashboardPage } from './pages/PrepDashboardPage';
import { PrepTemplatesPage } from './pages/PrepTemplatesPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Toaster } from './components/ui/toaster';
import './App.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  // Don't check auth on app load - it causes infinite loops with expired cookies
  // Auth will be checked when user tries to access protected routes
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/accept-invite" element={<AcceptInvitePage />} />
          <Route path="/time" element={<TimeClockPage />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPageNew />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/old"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analysis/new"
            element={
              <ProtectedRoute>
                <NewAnalysisPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analysis/:analysisId/progress"
            element={
              <ProtectedRoute>
                <AnalysisProgressPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analysis/:analysisId/results"
            element={
              <ProtectedRoute>
                <AnalysisResultsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analysis/saved"
            element={
              <ProtectedRoute>
                <SavedAnalysesPage />
              </ProtectedRoute>
            }
          />

          {/* Invoice routes */}
          <Route
            path="/invoices"
            element={
              <ProtectedRoute>
                <InvoiceListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoices/upload"
            element={
              <ProtectedRoute>
                <InvoiceUploadPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoices/:invoiceId"
            element={
              <ProtectedRoute>
                <InvoiceDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Menu routes */}
          <Route
            path="/menu/upload"
            element={
              <ProtectedRoute>
                <MenuUploadPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu/dashboard"
            element={
              <ProtectedRoute>
                <MenuDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu/items/:menuItemId/recipe"
            element={
              <ProtectedRoute>
                <MenuItemRecipePage />
              </ProtectedRoute>
            }
          />

          {/* COGS Tracker */}
          <Route
            path="/cogs"
            element={
              <ProtectedRoute>
                <COGSDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Analytics routes */}
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <PriceAnalyticsDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics/alerts"
            element={
              <ProtectedRoute>
                <PriceAlertsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics/opportunities"
            element={
              <ProtectedRoute>
                <SavingsOpportunitiesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ordering"
            element={
              <ProtectedRoute>
                <OrderingPredictionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/team"
            element={
              <ProtectedRoute>
                <TeamSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scheduling"
            element={
              <ProtectedRoute>
                <SchedulingDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/prep"
            element={
              <ProtectedRoute>
                <PrepDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/prep/templates"
            element={
              <ProtectedRoute>
                <PrepTemplatesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/alerts"
            element={
              <ProtectedRoute>
                <AlertSettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Inventory routes removed - cleaned up */}

          {/* Menu Comparison routes */}
          <Route
            path="/menu-comparison"
            element={
              <ProtectedRoute>
                <MenuComparisonPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu-comparison/:analysisId/select"
            element={
              <ProtectedRoute>
                <CompetitorSelectionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu-comparison/:analysisId/parse"
            element={
              <ProtectedRoute>
                <MenuParsingProgressPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu-comparison/:analysisId/results"
            element={
              <ProtectedRoute>
                <MenuComparisonResultsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu-comparison/saved"
            element={
              <ProtectedRoute>
                <SavedComparisonsPage />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;