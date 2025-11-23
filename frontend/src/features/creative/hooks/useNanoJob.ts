import { useQuery } from '@tanstack/react-query';
import { getJob } from '../api/nanoBananaClient';
import type { CreativeJobDetail } from '../api/types';

export function useNanoJob(jobId?: string) {
  return useQuery<CreativeJobDetail>({
    queryKey: ['nano-job', jobId],
    queryFn: () => {
      if (!jobId) {
        return Promise.reject(new Error('Missing job id'));
      }
      return getJob(jobId);
    },
    enabled: Boolean(jobId),
    refetchInterval: 60_000,
  });
}


