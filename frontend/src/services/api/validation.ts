import { z } from 'zod';
import type { ApiResponse } from './client';

export function ensureResponseSuccess<T>(result: ApiResponse<T>, fallbackMessage: string): T {
  if (!result.success || result.data === undefined) {
    throw new Error(result.error?.message ?? fallbackMessage);
  }
  return result.data;
}

export function parseResponse<T>(
  result: ApiResponse<unknown>,
  schema: z.ZodType<T>,
  fallbackMessage: string
): T {
  if (!result.success) {
    throw new Error(result.error?.message ?? fallbackMessage);
  }

  const parsed = schema.safeParse(result.data);
  if (!parsed.success) {
    if (import.meta.env.DEV) {
      console.error('[API Validation Error]', parsed.error.flatten());
    }
    throw new Error(`${fallbackMessage}: ${parsed.error.message}`);
  }

  return parsed.data;
}
