/**
 * Export Button Component
 * Download data as CSV
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileSpreadsheet, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ExportButtonProps {
  data: Record<string, any>[];
  filename: string;
  columns?: { key: string; header: string }[];
}

export function ExportButton({ data, filename, columns }: ExportButtonProps) {
  const [exported, setExported] = useState(false);

  const exportToCSV = () => {
    if (!data || data.length === 0) return;

    // Determine columns
    const cols = columns || Object.keys(data[0]).map(key => ({ key, header: key }));
    
    // Create CSV content
    const headers = cols.map(c => c.header).join(',');
    const rows = data.map(item => 
      cols.map(col => {
        const value = item[col.key];
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    );
    
    const csv = [headers, ...rows].join('\n');
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    // Show success state
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-white/10 text-white hover:bg-white/5"
          disabled={!data || data.length === 0}
        >
          <AnimatePresence mode="wait">
            {exported ? (
              <motion.div
                key="check"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="flex items-center gap-2"
              >
                <Check className="h-4 w-4 text-success-400" />
                <span className="text-success-400">Exported!</span>
              </motion.div>
            ) : (
              <motion.div
                key="download"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-obsidian border-white/10">
        <DropdownMenuItem 
          onClick={exportToCSV}
          className="text-white hover:bg-white/10 cursor-pointer"
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
