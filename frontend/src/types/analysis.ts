export interface ReviewAnalysisRequest {
  restaurant_name: string;
  location: string;
  category: string;
  tier: 'free' | 'premium';
  competitor_count?: number;
  analysis_type: 'review';
}

export interface AnalysisStatus {
  analysis_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress_percentage: number;
  current_step: string;
  estimated_time_remaining_seconds?: number;
  error_message?: string;
}

export interface Competitor {
  // Backend returns these fields
  competitor_id?: string;
  competitor_name?: string;
  rating: number;
  review_count: number;
  distance_miles: number;
  
  // Frontend expects these fields (for compatibility)
  name?: string;
  place_id?: string;
  address?: string;
  
  // Additional backend fields
  id?: string;
  analysis_id?: string;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  confidence: 'high' | 'medium' | 'low';
  type?: 'threat' | 'opportunity' | 'watch';
  category: 'threat' | 'opportunity' | 'watch';
  proof_quote: string;
  mention_count: number;
  competitor_name?: string | null;
  competitor_id?: string;
  significance?: number;
}

export interface ReviewAnalysisResponse {
  analysis_id: string;
  restaurant_name: string;
  location: string;
  category: string;
  tier: string;
  status: string;
  competitors: Competitor[];
  insights: Insight[];
  processing_time_seconds: number;
  created_at: string;
  completed_at: string;
}

export interface AnalysisResponse {
  analysis_id: string;
  status: string;
  message: string;
}