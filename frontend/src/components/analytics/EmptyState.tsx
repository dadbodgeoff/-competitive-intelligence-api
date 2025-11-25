/**
 * Empty State Component with Animated Illustration
 * Professional empty states for analytics module
 */

import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Package, 
  TrendingUp, 
  Building2, 
  Search,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type EmptyStateVariant = 
  | 'no-data' 
  | 'no-items' 
  | 'no-vendors' 
  | 'no-trends' 
  | 'no-results' 
  | 'no-history'
  | 'error';

interface EmptyStateProps {
  variant: EmptyStateVariant;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const variants = {
  'no-data': {
    icon: BarChart3,
    title: 'No Analytics Data Yet',
    description: 'Upload invoices to start tracking prices and discover savings opportunities.',
    color: 'text-primary-400',
    bgColor: 'bg-primary-500/10',
  },
  'no-items': {
    icon: Package,
    title: 'No Items Found',
    description: 'No inventory items match your current filters. Try adjusting your search.',
    color: 'text-accent-400',
    bgColor: 'bg-accent-500/10',
  },
  'no-vendors': {
    icon: Building2,
    title: 'No Vendors Found',
    description: 'No vendors match your search criteria. Try a different search term.',
    color: 'text-success-400',
    bgColor: 'bg-success-500/10',
  },
  'no-trends': {
    icon: TrendingUp,
    title: 'No Trend Data Available',
    description: 'Not enough purchase history to show trends. Keep uploading invoices!',
    color: 'text-primary-400',
    bgColor: 'bg-primary-500/10',
  },
  'no-results': {
    icon: Search,
    title: 'No Results Found',
    description: 'Your search didn\'t match any items. Try different keywords.',
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/10',
  },
  'no-history': {
    icon: FileText,
    title: 'No Purchase History',
    description: 'No purchase records found for this item yet.',
    color: 'text-accent-400',
    bgColor: 'bg-accent-500/10',
  },
  'error': {
    icon: AlertCircle,
    title: 'Something Went Wrong',
    description: 'We couldn\'t load the data. Please try again.',
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
  },
};

export function EmptyState({ variant, title, description, action }: EmptyStateProps) {
  const config = variants[variant];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      {/* Animated Icon Container */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className={`relative mb-6`}
      >
        {/* Pulsing background rings */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className={`absolute inset-0 rounded-full ${config.bgColor} blur-xl`}
          style={{ width: 120, height: 120, left: -20, top: -20 }}
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.05, 0.2] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className={`absolute inset-0 rounded-full ${config.bgColor} blur-2xl`}
          style={{ width: 160, height: 160, left: -40, top: -40 }}
        />
        
        {/* Icon circle */}
        <div className={`relative w-20 h-20 rounded-2xl ${config.bgColor} flex items-center justify-center border border-white/10`}>
          <Icon className={`h-10 w-10 ${config.color}`} />
        </div>
      </motion.div>

      {/* Text content */}
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-xl font-semibold text-white mb-2 text-center"
      >
        {title || config.title}
      </motion.h3>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-slate-400 text-center max-w-md mb-6"
      >
        {description || config.description}
      </motion.p>

      {/* Action button */}
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={action.onClick}
            className="bg-primary-500 hover:bg-primary-600 text-white"
          >
            {action.label}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
