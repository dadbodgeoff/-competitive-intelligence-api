import { useQuery } from '@tanstack/react-query';
import { fetchTemplates } from '../api/nanoBananaClient';
import type { TemplateSummary } from '../api/types';

export function useNanoTemplates(themeId?: string) {
  return useQuery<TemplateSummary[]>({
    queryKey: ['nano-templates', themeId],
    queryFn: () => {
      if (!themeId) {
        return Promise.resolve([]);
      }
      return fetchTemplates(themeId);
    },
    enabled: Boolean(themeId),
    staleTime: 1000 * 60 * 5,
  });
}


