/**
 * UI Components - Centralized exports
 */

// Icon system
export { Icon, IconButton, IconWithBadge, StatusIcon } from './Icon';
export type { IconSize, IconVariant } from './Icon';
export * from './icons';

// Re-export existing UI components
export { Button } from './button';
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './card';
export { Badge } from './badge';

// Enhanced UI components (professional polish)
export { TabGroup, TabGroupList, TabGroupTrigger, TabGroupContent } from './tab-group';
export { ContentCard } from './content-card';
export type { ContentCardProps } from './content-card';
export { CategoryBadge, getCategoryVariant } from './category-badge';
export type { CategoryBadgeProps } from './category-badge';
export { ListContainer, EmptyState } from './list-container';
export type { ListContainerProps, EmptyStateProps } from './list-container';
export { SectionHeader } from './section-header';
export type { SectionHeaderProps } from './section-header';
export { ActionBar } from './action-bar';
export type { ActionBarProps } from './action-bar';
