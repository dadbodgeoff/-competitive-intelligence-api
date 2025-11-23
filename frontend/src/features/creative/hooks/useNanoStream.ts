import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { openNanoStream } from '../api/streaming';
import { getJob } from '../api/nanoBananaClient';
import type { CreativeJobDetail } from '../api/types';

export interface StreamState {
  isOpen: boolean;
  lastEvent?: string;
  error?: string;
}

export function useNanoStream(jobId?: string) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<StreamState>({ isOpen: false });
  const connectionRef = useRef<ReturnType<typeof openNanoStream>>();

  const close = useCallback(() => {
    connectionRef.current?.stop();
    connectionRef.current = undefined;
  }, []);

  useEffect(() => {
    if (!jobId) {
      return undefined;
    }

    connectionRef.current = openNanoStream(jobId, {
      onOpen: () => setState({ isOpen: true }),
      onClose: () => setState((prev) => ({ ...prev, isOpen: false })),
      onError: (error) =>
        setState((prev) => ({
          ...prev,
          error: error.message,
        })),
      onEvent: (event) => {
        setState((prev) => ({ ...prev, lastEvent: event.type }));

        if (event.type === 'job_complete' || event.type === 'job_failed') {
          // Refresh cached job detail and list
          queryClient.invalidateQueries({ queryKey: ['nano-job', jobId] });
          queryClient.invalidateQueries({ queryKey: ['nano-jobs'] });
          close();
        } else if (event.type === 'status') {
          // optimistic update of job cache
          queryClient.setQueryData<CreativeJobDetail | undefined>(
            ['nano-job', jobId],
            (previous) =>
              previous
                ? {
                    ...previous,
                    status: (event.data as any).status ?? previous.status,
                    progress: (event.data as any).progress ?? previous.progress,
                  }
                : previous,
          );
        }
      },
    });

    return () => {
      close();
    };
  }, [jobId, queryClient, close]);

  const refreshJob = useCallback(async () => {
    if (!jobId) return;
    const data = await getJob(jobId);
    queryClient.setQueryData(['nano-job', jobId], data);
  }, [jobId, queryClient]);

  return useMemo(
    () => ({
      ...state,
      close,
      refreshJob,
    }),
    [state, close, refreshJob],
  );
}


