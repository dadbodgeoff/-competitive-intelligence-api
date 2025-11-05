/**
 * Class Merger Utility
 * Enhanced cn() utility with additional features
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge class names with Tailwind CSS conflict resolution
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Conditionally merge classes based on a condition
 */
export function cnIf(condition: boolean, trueClasses: ClassValue, falseClasses?: ClassValue) {
  return cn(condition ? trueClasses : falseClasses)
}

/**
 * Merge classes with a base class
 */
export function cnWith(baseClass: string, ...additionalClasses: ClassValue[]) {
  return cn(baseClass, ...additionalClasses)
}
