import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { KPICard } from '@/components/dashboard/KPICard';
import { AlertKPICard } from '@/components/dashboard/AlertKPICard';
import { RecentlyOrderedTable } from '@/components/dashboard/RecentlyOrderedTable';
import { FinancialIntelligenceSection } from '@/components/dashboard/FinancialIntelligenceSection';
import { VendorScorecardCard } from '@/components/dashboard/VendorScorecardCard';
import {
  FileText,
  UtensilsCrossed,
  TrendingDown,
  AlertTriangle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { dashboardApi, DashboardKPIData } from '@/services/api/dashboardApi';

export function DashboardPageNew() {
  const [kpiData, setKpiData] = useState<DashboardKPIData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load KPI data in parallel
      const kpiDataResponse = await dashboardApi.getKPIData();
      setKpiData(kpiDataResponse);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell maxWidth="wide">
      <DashboardHeader />
      
      <div className="space-y-6">
              {/* KPI Cards - 2x2 Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <AlertKPICard
                  title="Negative Alerts"
                  count={kpiData?.negativeAlerts || 0}
                  icon={AlertTriangle}
                  type="negative"
                  loading={loading}
                  linkTo="/analytics/alerts"
                  subtitle="Items requiring attention"
                />
                <AlertKPICard
                  title="Positive Alerts"
                  count={kpiData?.positiveAlerts || 0}
                  icon={TrendingDown}
                  type="positive"
                  loading={loading}
                  linkTo="/analytics/opportunities"
                  subtitle="Savings opportunities"
                />
                <Link to="/invoices" className="block">
                  <KPICard
                    title="Recent Invoices"
                    value={kpiData?.recentInvoicesCount || 0}
                    icon={FileText}
                    loading={loading}
                    className="bg-card-dark border-white/10 hover:border-accent-500/50 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer h-full"
                  />
                </Link>
                <Link to="/menu/dashboard" className="block">
                  <KPICard
                    title="Menu Items"
                    value={kpiData?.menuItemsCount || 0}
                    icon={UtensilsCrossed}
                    loading={loading}
                    className="bg-card-dark border-white/10 hover:border-primary-600/50 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer h-full"
                  />
                </Link>
              </div>

              {/* Financial Intelligence Row - Collapsible */}
              <FinancialIntelligenceSection />

              {/* Vendor Scorecard */}
              <VendorScorecardCard />

              {/* Recently Ordered Items Table */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">
                  Recently Ordered Items
                </h2>
                <RecentlyOrderedTable />
              </div>
      </div>
    </AppShell>
  );
}
