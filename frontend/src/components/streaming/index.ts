/**
 * Streaming Components
 * 
 * Professional progress and celebration components for SSE-based operations.
 * Uses the Icon system for consistent branding.
 */

import {
  FileText,
  Search,
  ClipboardList,
  DollarSign,
  CheckCircle2,
  PartyPopper,
  Rocket,
  UtensilsCrossed,
  Sandwich,
  BarChart3,
  Lightbulb,
  Star,
  Brain,
  TrendingUp,
} from 'lucide-react';
import type { IconVariant } from '@/components/ui/Icon';

export { StreamingProgress } from './StreamingProgress';
export type { StreamingProgressProps, Milestone } from './StreamingProgress';

export { SuccessAnimation } from './SuccessAnimation';
export type { SuccessAnimationProps } from './SuccessAnimation';

// Pre-defined milestone configurations for each module with Lucide icons
export const INVOICE_MILESTONES = [
  { progress: 0, label: 'Uploading document', icon: FileText, variant: 'primary' as IconVariant },
  { progress: 20, label: 'Extracting text', icon: Search, variant: 'accent' as IconVariant },
  { progress: 40, label: 'Identifying line items', icon: ClipboardList, variant: 'primary' as IconVariant },
  { progress: 60, label: 'Parsing prices', icon: DollarSign, variant: 'accent' as IconVariant },
  { progress: 80, label: 'Validating totals', icon: CheckCircle2, variant: 'success' as IconVariant },
  { progress: 100, label: 'Ready for review', icon: PartyPopper, variant: 'success' as IconVariant },
];

export const INVOICE_CONTEXT_STEPS = [
  'Reading document structure and layout',
  'Identifying vendor information and invoice number',
  'Extracting line item descriptions and quantities',
  'Parsing unit prices and calculating totals',
];

export const MENU_MILESTONES = [
  { progress: 0, label: 'Initializing', icon: Rocket, variant: 'primary' as IconVariant },
  { progress: 25, label: 'Fetching competitor 1', icon: UtensilsCrossed, variant: 'accent' as IconVariant },
  { progress: 50, label: 'Fetching competitor 2', icon: Sandwich, variant: 'primary' as IconVariant },
  { progress: 75, label: 'Analyzing differences', icon: BarChart3, variant: 'accent' as IconVariant },
  { progress: 100, label: 'Insights ready', icon: Lightbulb, variant: 'success' as IconVariant },
];

export const MENU_CONTEXT_STEPS = [
  'Accessing competitor website and menu pages',
  'Extracting menu items, descriptions, and pricing',
  'Organizing data by categories and sizes',
  'Generating comparison insights',
];

export const REVIEW_MILESTONES = [
  { progress: 0, label: 'Finding competitors', icon: Search, variant: 'primary' as IconVariant },
  { progress: 25, label: 'Collecting reviews', icon: Star, variant: 'accent' as IconVariant },
  { progress: 50, label: 'Analyzing sentiment', icon: Brain, variant: 'primary' as IconVariant },
  { progress: 75, label: 'Generating insights', icon: Lightbulb, variant: 'accent' as IconVariant },
  { progress: 100, label: 'Report ready', icon: TrendingUp, variant: 'success' as IconVariant },
];

export const REVIEW_CONTEXT_STEPS = [
  'Searching for competitor review sources',
  'Collecting and aggregating customer reviews',
  'Analyzing sentiment and common themes',
  'Generating actionable insights and recommendations',
];
