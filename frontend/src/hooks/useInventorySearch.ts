/**
 * Inventory Search Hook
 * Debounced search for inventory items
 */

import { useState, useEffect, useCallback } from 'react';
import { menuRecipeApi } from '@/services/api/menuRecipeApi';
import type { InventoryItemSearchResult } from '@/types/menuRecipe';

export function useInventorySearch(initialQuery = '') {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<InventoryItemSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await menuRecipeApi.searchInventory(query);
        setResults(response.results);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
  }, []);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    clearSearch,
  };
}
