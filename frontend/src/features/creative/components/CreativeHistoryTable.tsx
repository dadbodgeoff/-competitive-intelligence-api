import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { CreativeJobSummary } from '../api/types';

interface CreativeHistoryTableProps {
  jobs?: CreativeJobSummary[];
  isLoading: boolean;
  error?: string;
  onSelectJob: (job: CreativeJobSummary) => void;
}

const STATUS_VARIANT: Record<string, 'secondary' | 'default' | 'destructive' | 'outline'> = {
  completed: 'default',
  dispatching: 'secondary',
  assembling_prompt: 'secondary',
  failed: 'destructive',
};

export function CreativeHistoryTable({
  jobs,
  isLoading,
  error,
  onSelectJob,
}: CreativeHistoryTableProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Recent jobs</h2>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Unable to load jobs</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full bg-white/10" />
          ))}
        </div>
      )}

      {!isLoading && (!jobs || jobs.length === 0) && (
        <Alert variant="secondary" className="bg-white/5 text-slate-200">
          <AlertTitle>No creative jobs yet</AlertTitle>
          <AlertDescription>
            Generate your first asset to populate history. Completed jobs appear here with quick
            access to download links.
          </AlertDescription>
        </Alert>
      )}

      {jobs && jobs.length > 0 && (
        <Table>
          <TableCaption className="text-slate-400">
            Completed jobs are retained for quick reuse and auditing.
          </TableCaption>
          <TableHeader>
            <TableRow className="border-white/10 text-slate-300">
              <TableHead>Template</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Completed</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id} className="border-white/10 text-slate-200">
                <TableCell className="font-medium">{job.template_slug}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[job.status] ?? 'outline'} className="capitalize">
                    {job.status.replace(/_/g, ' ')}
                  </Badge>
                </TableCell>
                <TableCell>{job.progress}%</TableCell>
                <TableCell>{new Date(job.created_at).toLocaleString()}</TableCell>
                <TableCell>
                  {job.completed_at ? new Date(job.completed_at).toLocaleString() : '—'}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => onSelectJob(job)}>
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}


