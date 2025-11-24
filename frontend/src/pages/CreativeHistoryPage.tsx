import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Sparkles } from 'lucide-react';
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/creative')}
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Studio
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <Sparkles className="h-8 w-8 text-emerald-500" />
                Generation History
              </h1>
              <p className="text-slate-400 mt-1">
                View and manage your creative asset generations
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/creative/generate')}
            className="bg-emerald-500 hover:bg-emerald-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Generate New
          </Button>
        </div>

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
