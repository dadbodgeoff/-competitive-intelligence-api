import { useQuery } from '@tanstack/react-query';
import { fetchBrandProfiles } from '../api/nanoBananaClient';
import type { BrandProfileSummary } from '../api/types';

export function useBrandProfiles() {
  return useQuery<BrandProfileSummary[]>({
    queryKey: ['nano-brand-profiles'],
    queryFn: fetchBrandProfiles,
    staleTime: 1000 * 60 * 5,
  });
}


