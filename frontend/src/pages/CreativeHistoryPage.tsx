import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { ModulePageHeader } from '@/components/layout/ModulePageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, History } from 'lucide-react';
import { CreativeHistoryTable } from '@/features/creative/components/CreativeHistoryTable';
import { CreativeJobDetailPanel } from '@/features/creative/components/CreativeJobDetailPanel';
import { JobFilters } from '@/features/creative/components/JobFilters';
import { useNanoJobs } from '@/features/creative/hooks/useNanoJobs';
import { useNanoJob } from '@/features/creative/hooks/useNanoJob';
import type { CreativeJobDetail } from '@/features/creative/api/types';

export function CreativeHistoryPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [selectedJobId, setSelectedJobId] = useState<string | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const jobsQuery = useNanoJobs({ page, perPage });
  const jobDetailQuery = useNanoJob(selectedJobId);

  const handleSelectJob = (jobId: string) => {
    setSelectedJobId(jobId);
  };

  const handleCloseDetail = () => {
    setSelectedJobId(undefined);
  };

  // Filter jobs based on search and status
  const filteredJobs = (jobsQuery.data?.data || []).filter((job: any) => {
    const matchesSearch =
      searchTerm === '' ||
      job.template_slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <AppShell maxWidth="wide">
      <div className="space-y-6">
        {/* Header */}
        <ModulePageHeader
          icon={History}
          title="Generation History"
          description="View and manage your creative asset generations"
          actions={
            <Button
              onClick={() => navigate('/creative')}
              size="sm"
              className="bg-primary-500 hover:bg-primary-600 h-8 text-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Create New
            </Button>
          }
        />

        {/* Filters */}
        <Card className="bg-card-dark border-white/10">
          <CardContent className="p-4">
            <JobFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
            />
          </CardContent>
        </Card>

        {/* Jobs Table */}
        <Card className="bg-card-dark border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Your Generations</CardTitle>
          </CardHeader>
          <CardContent>
            <CreativeHistoryTable
              jobs={filteredJobs}
              isLoading={jobsQuery.isLoading}
              error={jobsQuery.error instanceof Error ? jobsQuery.error.message : undefined}
              onSelectJob={(job: any) => handleSelectJob(job.id)}
            />

            {/* Pagination */}
            {jobsQuery.data && jobsQuery.data.total_count > perPage && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-slate-400">
                  Showing {(page - 1) * perPage + 1} to{' '}
                  {Math.min(page * perPage, jobsQuery.data.total_count)} of{' '}
                  {jobsQuery.data.total_count} generations
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p: number) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="border-white/10 text-slate-300 hover:bg-white/5"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p: number) => p + 1)}
                    disabled={page * perPage >= jobsQuery.data.total_count}
                    className="border-white/10 text-slate-300 hover:bg-white/5"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Job Detail Panel */}
        <CreativeJobDetailPanel
          job={jobDetailQuery.data as CreativeJobDetail | undefined}
          isLoading={jobDetailQuery.isLoading && Boolean(selectedJobId)}
          error={jobDetailQuery.error instanceof Error ? jobDetailQuery.error.message : undefined}
          onClose={handleCloseDetail}
        />
      </div>
    </AppShell>
  );
}
