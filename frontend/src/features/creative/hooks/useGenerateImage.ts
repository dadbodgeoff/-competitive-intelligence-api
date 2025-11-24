import { useMutation, useQueryClient } from '@tanstack/react-query';
import { startGeneration } from '../api/nanoBananaClient';
import type { StartGenerationRequest, StartGenerationResponse } from '../api/types';

export function useGenerateImage() {
  const queryClient = useQueryClient();

  return useMutation<StartGenerationResponse, Error, StartGenerationRequest>({
    mutationFn: startGeneration,
    onSuccess: () => {
      // Invalidate jobs list to show new job
      queryClient.invalidateQueries({ queryKey: ['nano-jobs'] });
    },
  });
}
