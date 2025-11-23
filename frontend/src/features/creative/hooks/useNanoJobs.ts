import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { listJobs } from '../api/nanoBananaClient';
import type { JobListResponse } from '../api/types';

export interface UseNanoJobsOptions {
  page?: number;
  perPage?: number;
}

export function useNanoJobs(options: UseNanoJobsOptions = {}) {
  const { page = 1, perPage = 20 } = options;
  return useQuery<JobListResponse>({
    queryKey: ['nano-jobs', page, perPage],
    queryFn: () => listJobs({ page, per_page: perPage }),
    placeholderData: keepPreviousData,
    refetchInterval: 60_000,
  });
}


