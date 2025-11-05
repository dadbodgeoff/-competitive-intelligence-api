/**
 * Design System - Class Name Utilities
 * Restaurant Competitive Intelligence Platform
 * 
 * Utility functions for conditional class names
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names with Tailwind CSS conflict resolution
 * This is the standard `cn` utility used throughout the app
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Conditionally apply classes based on a condition
 */
export function conditionalClass(condition: boolean, trueClass: string, falseClass?: string): string {
  return condition ? trueClass : (falseClass || '');
}

/**
 * Apply variant classes based on a variant key
 */
export function variantClass<T extends string>(
  variant: T,
  variantMap: Record<T, string>,
  baseClass?: string
): string {
  const variantClasses = variantMap[variant] || '';
  return baseClass ? `${baseClass} ${variantClasses}` : variantClasses;
}
