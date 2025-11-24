import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface JobFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
}

export function JobFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
}: JobFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <Input
          placeholder="Search by template or job ID..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-obsidian/50 border-white/10 text-white"
        />
      </div>
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full md:w-48 bg-obsidian/50 border-white/10 text-white">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent className="bg-card-dark border-white/10">
          <SelectItem value="all" className="text-white hover:bg-white/5">
            All Status
          </SelectItem>
          <SelectItem value="completed" className="text-white hover:bg-white/5">
            Completed
          </SelectItem>
          <SelectItem value="processing" className="text-white hover:bg-white/5">
            Processing
          </SelectItem>
          <SelectItem value="failed" className="text-white hover:bg-white/5">
            Failed
          </SelectItem>
          <SelectItem value="queued" className="text-white hover:bg-white/5">
            Queued
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
