import { useQuery } from '@tanstack/react-query';
import { fetchThemes } from '../api/nanoBananaClient';
import type { ThemeSummary } from '../api/types';

export function useNanoThemes() {
  return useQuery<ThemeSummary[]>({
    queryKey: ['nano-themes'],
    queryFn: fetchThemes,
    staleTime: 1000 * 60 * 10,
  });
}


