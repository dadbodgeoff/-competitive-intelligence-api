import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ReviewAnalysisResponse } from '@/types/analysis';
import { analytics } from '@/lib/monitoring';
import { Download } from 'lucide-react';

interface ExportButtonProps {
  analysis: ReviewAnalysisResponse;
}

export function ExportButton({ analysis }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = async () => {
    setIsExporting(true);
    
    try {
      // Track export action
      analytics.csvExported({
        analysis_id: analysis.analysis_id,
        competitor_count: analysis.competitors.length,
      });
      
      // Create CSV content
      const csvContent = generateCSV(analysis);
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${analysis.restaurant_name}_analysis_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      analytics.errorOccurred('CSV Export Failed', {
        analysis_id: analysis.analysis_id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const generateCSV = (analysis: ReviewAnalysisResponse): string => {
    const headers = [
      'Restaurant Name',
      'Location', 
      'Category',
      'Analysis Date',
      'Competitor Name',
      'Competitor Rating',
      'Competitor Reviews',
      'Distance (miles)',
      'Insight Type',
      'Insight Title',
      'Insight Description',
      'Confidence',
      'Evidence Quote',
      'Mention Count'
    ];

    const rows: string[][] = [];
    
    // Add header row
    rows.push(headers);

    // Add data rows - one per insight with competitor info
    analysis.insights.forEach(insight => {
      const competitor = analysis.competitors.find(c => c.name === insight.competitor_name);
      
      rows.push([
        analysis.restaurant_name,
        analysis.location,
        analysis.category,
        new Date(analysis.completed_at).toLocaleDateString(),
        insight.competitor_name || 'Multiple Sources',
        competitor?.rating?.toString() || 'N/A',
        competitor?.review_count?.toString() || 'N/A',
        competitor?.distance_miles?.toString() || 'N/A',
        insight.type || insight.category,
        insight.title,
        insight.description,
        insight.confidence,
        insight.proof_quote,
        insight.mention_count.toString()
      ]);
    });

    // Convert to CSV string
    return rows.map(row => 
      row.map(cell => `"${cell.replace(/"/g, '""')}"`)
         .join(',')
    ).join('\n');
  };

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="hidden sm:inline-flex">
        {analysis.competitors.length} competitors • {analysis.insights.length} insights
      </Badge>
      <Button 
        onClick={exportToCSV}
        disabled={isExporting}
        className="gap-2"
        variant="outline"
      >
        <Download className="h-4 w-4" />
        {isExporting ? 'Exporting...' : 'Export CSV'}
      </Button>
    </div>
  );
}