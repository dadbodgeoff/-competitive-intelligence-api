/**
 * API Client Tests
 * Tests safe error handling wrapper
 */

import { describe, it, expect, vi } from 'vitest';
import { safeRequest, getErrorMessage } from '../client';

describe('safeRequest', () => {
  it('returns data on success', async () => {
    const mockFn = vi.fn().mockResolvedValue({ data: { id: 1, name: 'Test' } });
    
    const result = await safeRequest(mockFn);
    
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ id: 1, name: 'Test' });
    expect(result.error).toBeUndefined();
  });

  it('returns error on failure', async () => {
    const mockFn = vi.fn().mockRejectedValue({
      response: {
        status: 404,
        data: { detail: 'Not found' }
      }
    });
    
    const result = await safeRequest(mockFn);
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error?.status).toBe(404);
    expect(result.error?.message).toBe('Not found');
  });

  it('uses custom error message', async () => {
    const mockFn = vi.fn().mockRejectedValue(new Error('Network error'));
    
    const result = await safeRequest(mockFn, {
      errorMessage: 'Custom error message'
    });
    
    expect(result.error?.message).toBe('Custom error message');
  });

  it('calls onError callback', async () => {
    const mockFn = vi.fn().mockRejectedValue({
      response: { status: 500 }
    });
    const onError = vi.fn();
    
    await safeRequest(mockFn, { onError });
    
    expect(onError).toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ status: 500 })
    );
  });
});

describe('getErrorMessage', () => {
  it('returns correct message for 401', () => {
    expect(getErrorMessage(401)).toContain('log in');
  });

  it('returns correct message for 404', () => {
    expect(getErrorMessage(404)).toContain('not found');
  });

  it('returns correct message for 500', () => {
    expect(getErrorMessage(500)).toContain('Server error');
  });

  it('returns default message for unknown status', () => {
    expect(getErrorMessage(999)).toContain('Something went wrong');
  });

  it('uses custom default message', () => {
    expect(getErrorMessage(999, 'Custom default')).toBe('Custom default');
  });
});
