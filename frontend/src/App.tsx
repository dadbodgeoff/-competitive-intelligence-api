import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleAnalytics } from './components/GoogleAnalytics';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { featureFlags } from './config/featureFlags';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OfflineBanner } from './components/common/OfflineBanner';
import { Toaster } from './components/ui/toaster';
import { PageLoader } from './components/common/PageLoader';
import './App.css';

// ============================================================================
// LAZY LOADED PAGES - Code splitting for better initial load performance
// ============================================================================

// Public pages (load immediately for landing experience)
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Lazy load everything else
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage').then(m => ({ default: m.VerifyEmailPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const AcceptInvitePage = lazy(() => import('./pages/AcceptInvitePage').then(m => ({ default: m.AcceptInvitePage })));
const TimeClockPage = lazy(() => import('./pages/TimeClockPage').then(m => ({ default: m.TimeClockPage })));

// Dashboard
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const DashboardPageNew = lazy(() => import('./pages/DashboardPageNew').then(m => ({ default: m.DashboardPageNew })));

// Analysis
const ReviewAnalysisDashboard = lazy(() => import('./pages/ReviewAnalysisDashboard').then(m => ({ default: m.ReviewAnalysisDashboard })));
const NewAnalysisPage = lazy(() => import('./pages/NewAnalysisPage').then(m => ({ default: m.NewAnalysisPage })));
const AnalysisProgressPage = lazy(() => import('./pages/AnalysisProgressPage').then(m => ({ default: m.AnalysisProgressPage })));
const AnalysisResultsPage = lazy(() => import('./pages/AnalysisResultsPage').then(m => ({ default: m.AnalysisResultsPage })));
// SavedAnalysesPage deprecated - redirects to ReviewAnalysisDashboard

// Invoices
const InvoiceListPage = lazy(() => import('./pages/InvoiceListPage').then(m => ({ default: m.InvoiceListPage })));
const InvoiceUploadPage = lazy(() => import('./pages/InvoiceUploadPage').then(m => ({ default: m.InvoiceUploadPage })));
const InvoiceDetailPage = lazy(() => import('./pages/InvoiceDetailPage').then(m => ({ default: m.InvoiceDetailPage })));
const InvoiceDashboardPage = lazy(() => import('./pages/InvoiceDashboardPage').then(m => ({ default: m.InvoiceDashboardPage })));
const InvoicesByVendorPage = lazy(() => import('./pages/InvoicesByVendorPage').then(m => ({ default: m.InvoicesByVendorPage })));

// Menu
const MenuUploadPage = lazy(() => import('./pages/MenuUploadPage').then(m => ({ default: m.MenuUploadPage })));
const MenuDashboard = lazy(() => import('./pages/MenuDashboardNew').then(m => ({ default: m.MenuDashboard })));
const MenuItemRecipePage = lazy(() => import('./pages/MenuItemRecipePage').then(m => ({ default: m.MenuItemRecipePage })));

// COGS (Cost of Goods Sold)
const COGSDashboardPage = lazy(() => import('./pages/COGSDashboardPage').then(m => ({ default: m.COGSDashboardPage })));
const DailySalesPage = lazy(() => import('./pages/DailySalesPage').then(m => ({ default: m.DailySalesPage })));

// Menu Comparison
const MenuComparisonDashboard = lazy(() => import('./pages/MenuComparisonDashboard').then(m => ({ default: m.MenuComparisonDashboard })));
const MenuComparisonPage = lazy(() => import('./pages/MenuComparisonPage').then(m => ({ default: m.MenuComparisonPage })));
const CompetitorSelectionPage = lazy(() => import('./pages/CompetitorSelectionPage').then(m => ({ default: m.CompetitorSelectionPage })));
const MenuParsingProgressPage = lazy(() => import('./pages/MenuParsingProgressPage').then(m => ({ default: m.MenuParsingProgressPage })));
const MenuComparisonResultsPage = lazy(() => import('./pages/MenuComparisonResultsPage').then(m => ({ default: m.MenuComparisonResultsPage })));

// Analytics
const PriceAnalyticsDashboard = lazy(() => import('./pages/PriceAnalyticsDashboard').then(m => ({ default: m.PriceAnalyticsDashboard })));
const PriceAlertsPage = lazy(() => import('./pages/PriceAlertsPage').then(m => ({ default: m.PriceAlertsPage })));
const SavingsOpportunitiesPage = lazy(() => import('./pages/SavingsOpportunitiesPage').then(m => ({ default: m.SavingsOpportunitiesPage })));
const ItemDetailPage = lazy(() => import('./pages/ItemDetailPage').then(m => ({ default: m.ItemDetailPage })));
const VendorAnalyticsPage = lazy(() => import('./pages/VendorAnalyticsPage').then(m => ({ default: m.VendorAnalyticsPage })));
const PriceTrendsPage = lazy(() => import('./pages/PriceTrendsPage').then(m => ({ default: m.PriceTrendsPage })));
const AlertSettingsPage = lazy(() => import('./pages/AlertSettingsPage').then(m => ({ default: m.AlertSettingsPage })));

// Operations
// Modernized Ordering Dashboard (2025 standards)
const OrderingDashboard = lazy(() => import('./features/ordering').then(m => ({ default: m.OrderingDashboard })));
// Legacy ordering page (kept for reference)
const OrderingPredictionsPageLegacy = lazy(() => import('./pages/OrderingPredictionsPage').then(m => ({ default: m.OrderingPredictionsPage })));
// Modernized Schedule Dashboard (2025 standards)
const ScheduleDashboard = lazy(() => import('./features/scheduling').then(m => ({ default: m.ScheduleDashboard })));
// Legacy schedule page (kept for reference)
const SchedulingDashboardPageLegacy = lazy(() => import('./pages/SchedulingDashboardPage').then(m => ({ default: m.SchedulingDashboardPage })));
const PrepDashboardPage = lazy(() => import('./pages/PrepDashboardPage').then(m => ({ default: m.PrepDashboardPage })));
const PrepTemplatesPage = lazy(() => import('./pages/PrepTemplatesPage').then(m => ({ default: m.PrepTemplatesPage })));

// Creative Studio
const CreativeStudioPage = lazy(() => import('./pages/CreativeStudioPage').then(m => ({ default: m.CreativeStudioPage })));
const CreativeGeneratePage = lazy(() => import('./pages/CreativeGeneratePage').then(m => ({ default: m.CreativeGeneratePage })));
const CreativeCustomizePage = lazy(() => import('./pages/CreativeCustomizePage').then(m => ({ default: m.CreativeCustomizePage })));
const CreativeHistoryPage = lazy(() => import('./pages/CreativeHistoryPage').then(m => ({ default: m.CreativeHistoryPage })));
const CreativeBrandProfilesPage = lazy(() => import('./pages/CreativeBrandProfilesPage').then(m => ({ default: m.CreativeBrandProfilesPage })));
const CreativeCustomPage = lazy(() => import('./pages/CreativeCustomPage').then(m => ({ default: m.CreativeCustomPage })));

// Settings
const TeamSettingsPage = lazy(() => import('./pages/TeamSettingsPageNew').then(m => ({ default: m.TeamSettingsPage })));
const BillingSettingsPage = lazy(() => import('./pages/BillingSettingsPage').then(m => ({ default: m.BillingSettingsPage })));
const BillingSuccessPage = lazy(() => import('./pages/BillingSuccessPage').then(m => ({ default: m.BillingSuccessPage })));

// ============================================================================
// QUERY CLIENT
// ============================================================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// ============================================================================
// APP COMPONENT
// ============================================================================

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GoogleAnalytics measurementId={import.meta.env.VITE_GA_MEASUREMENT_ID} />
        <OfflineBanner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public routes - loaded eagerly for fast landing */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Public routes - lazy loaded */}
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/legal/terms" element={<TermsPage />} />
              <Route path="/legal/privacy" element={<PrivacyPage />} />
              <Route path="/accept-invite" element={<AcceptInvitePage />} />
              <Route path="/time" element={<TimeClockPage />} />

              {/* Dashboard */}
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPageNew /></ProtectedRoute>} />
              <Route path="/dashboard/old" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

              {/* Analysis */}
              <Route path="/analysis" element={<ProtectedRoute><ReviewAnalysisDashboard /></ProtectedRoute>} />
              <Route path="/analysis/new" element={<ProtectedRoute><NewAnalysisPage /></ProtectedRoute>} />
              <Route path="/analysis/:analysisId/progress" element={<ProtectedRoute><AnalysisProgressPage /></ProtectedRoute>} />
              <Route path="/analysis/:analysisId/results" element={<ProtectedRoute><AnalysisResultsPage /></ProtectedRoute>} />
              <Route path="/analysis/saved" element={<ProtectedRoute><ReviewAnalysisDashboard /></ProtectedRoute>} /> {/* Redirect to dashboard */}

              {/* Invoices */}
              <Route path="/invoices" element={<ProtectedRoute><InvoiceListPage /></ProtectedRoute>} />
              <Route path="/invoices/dashboard" element={<ProtectedRoute><InvoiceDashboardPage /></ProtectedRoute>} />
              <Route path="/invoices/vendors" element={<ProtectedRoute><InvoicesByVendorPage /></ProtectedRoute>} />
              <Route path="/invoices/upload" element={<ProtectedRoute><InvoiceUploadPage /></ProtectedRoute>} />
              <Route path="/invoices/:invoiceId" element={<ProtectedRoute><InvoiceDetailPage /></ProtectedRoute>} />

              {/* Menu Management */}
              <Route path="/menu/upload" element={<ProtectedRoute><MenuUploadPage /></ProtectedRoute>} />
              <Route path="/menu/dashboard" element={<ProtectedRoute><MenuDashboard /></ProtectedRoute>} />

              {/* COGS (Cost of Goods Sold) */}
              <Route path="/cogs" element={<ProtectedRoute><COGSDashboardPage /></ProtectedRoute>} />
              <Route path="/cogs/sales" element={<ProtectedRoute><DailySalesPage /></ProtectedRoute>} />
              <Route path="/cogs/items/:menuItemId" element={<ProtectedRoute><MenuItemRecipePage /></ProtectedRoute>} />
              {/* Legacy route - redirect to new COGS path */}
              <Route path="/menu/items/:menuItemId/recipe" element={<ProtectedRoute><MenuItemRecipePage /></ProtectedRoute>} />

              {/* Analytics */}
              <Route path="/analytics" element={<ProtectedRoute><PriceAnalyticsDashboard /></ProtectedRoute>} />
              <Route path="/analytics/alerts" element={<ProtectedRoute><PriceAlertsPage /></ProtectedRoute>} />
              <Route path="/analytics/opportunities" element={<ProtectedRoute><SavingsOpportunitiesPage /></ProtectedRoute>} />
              <Route path="/analytics/items/:itemDescription" element={<ProtectedRoute><ItemDetailPage /></ProtectedRoute>} />
              <Route path="/analytics/vendors" element={<ProtectedRoute><VendorAnalyticsPage /></ProtectedRoute>} />
              <Route path="/analytics/trends" element={<ProtectedRoute><PriceTrendsPage /></ProtectedRoute>} />

              {/* Operations */}
              <Route path="/ordering" element={<ProtectedRoute><OrderingDashboard /></ProtectedRoute>} />
              <Route path="/ordering/legacy" element={<ProtectedRoute><OrderingPredictionsPageLegacy /></ProtectedRoute>} />
              <Route path="/scheduling" element={<ProtectedRoute><ScheduleDashboard /></ProtectedRoute>} />
              <Route path="/scheduling/legacy" element={<ProtectedRoute><SchedulingDashboardPageLegacy /></ProtectedRoute>} />
              <Route path="/prep" element={<ProtectedRoute><PrepDashboardPage /></ProtectedRoute>} />
              <Route path="/prep/templates" element={<ProtectedRoute><PrepTemplatesPage /></ProtectedRoute>} />

              {/* Creative Studio */}
              <Route path="/creative" element={<ProtectedRoute><CreativeStudioPage /></ProtectedRoute>} />
              <Route path="/creative/generate" element={<ProtectedRoute><CreativeGeneratePage /></ProtectedRoute>} />
              <Route path="/creative/customize" element={<ProtectedRoute><CreativeCustomizePage /></ProtectedRoute>} />
              <Route path="/creative/history" element={<ProtectedRoute><CreativeHistoryPage /></ProtectedRoute>} />
              <Route path="/creative/brands" element={<ProtectedRoute><CreativeBrandProfilesPage /></ProtectedRoute>} />
              <Route path="/creative/custom" element={<ProtectedRoute><CreativeCustomPage /></ProtectedRoute>} />

              {/* Settings */}
              <Route path="/settings/team" element={<ProtectedRoute><TeamSettingsPage /></ProtectedRoute>} />
              <Route path="/settings/alerts" element={<ProtectedRoute><AlertSettingsPage /></ProtectedRoute>} />

              {/* Menu Comparison - Unified Dashboard */}
              <Route path="/menu-comparison" element={<ProtectedRoute><MenuComparisonDashboard /></ProtectedRoute>} />
              <Route path="/menu-comparison/new" element={<ProtectedRoute><MenuComparisonPage /></ProtectedRoute>} />
              <Route path="/menu-comparison/:analysisId/select" element={<ProtectedRoute><CompetitorSelectionPage /></ProtectedRoute>} />
              <Route path="/menu-comparison/:analysisId/parse" element={<ProtectedRoute><MenuParsingProgressPage /></ProtectedRoute>} />
              <Route path="/menu-comparison/:analysisId/results" element={<ProtectedRoute><MenuComparisonResultsPage /></ProtectedRoute>} />
              {/* Legacy route - redirect to dashboard */}
              <Route path="/menu-comparison/saved" element={<Navigate to="/menu-comparison" replace />} />

              {/* Billing - feature flagged */}
              {featureFlags.BILLING_ENABLED && (
                <>
                  <Route path="/settings/billing" element={<ProtectedRoute><BillingSettingsPage /></ProtectedRoute>} />
                  <Route path="/settings/billing/success" element={<ProtectedRoute><BillingSuccessPage /></ProtectedRoute>} />
                </>
              )}

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          <Toaster />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
