from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum

class AnalysisStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class ReviewSource(str, Enum):
    GOOGLE = "google"
    YELP = "yelp"

class ConfidenceLevel(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class InsightCategory(str, Enum):
    THREAT = "threat"
    OPPORTUNITY = "opportunity"
    WATCH = "watch"

class AnalysisTier(str, Enum):
    FREE = "free"
    PREMIUM = "premium"

class AnalysisRequest(BaseModel):
    restaurant_name: str = Field(..., description="Name of the restaurant to analyze")
    location: str = Field(..., description="Location as 'latitude,longitude' or 'city, state'")
    category: Optional[str] = Field("restaurant", description="Restaurant category")
    tier: AnalysisTier = Field(AnalysisTier.FREE, description="Analysis tier: 'free' (3 competitors, basic insights) or 'premium' (5 competitors, strategic analysis)")
    review_sources: List[str] = Field(default=["google", "yelp"], description="Sources to fetch reviews from")
    time_range: str = Field("6_months", description="Time range for analysis")
    competitor_count: Optional[int] = Field(None, description="Number of competitors to analyze (overridden by tier limits)")
    exclude_seen: bool = Field(True, description="Exclude previously seen competitors")

    model_config = {
        "json_schema_extra": {
            "example": {
                "restaurant_name": "Mario's Pizza Palace",
                "location": "40.7128,-74.0060",
                "category": "pizza",
                "tier": "free",
                "review_sources": ["google", "yelp"],
                "time_range": "6_months",
                "competitor_count": 3,
                "exclude_seen": True
            }
        }
    }

class CompetitorInfo(BaseModel):
    id: str = Field(..., description="Competitor ID")
    name: str = Field(..., description="Competitor name")
    address: Optional[str] = Field(None, description="Competitor address")
    rating: Optional[float] = Field(None, description="Average rating")
    review_count: Optional[int] = Field(None, description="Number of reviews")
    distance_miles: Optional[float] = Field(None, description="Distance in miles")

class Insight(BaseModel):
    id: str = Field(..., description="Insight ID")
    category: str = Field(..., description="Insight category")
    title: str = Field(..., description="Insight title")
    description: str = Field(..., description="Insight description")
    confidence: str = Field(..., description="Confidence level")
    mention_count: int = Field(..., description="Number of mentions")
    significance: float = Field(..., description="Significance percentage")
    competitor_id: Optional[str] = Field(None, description="Related competitor ID")
    proof_quote: Optional[str] = Field(None, description="Supporting quote")

class AnalysisResponse(BaseModel):
    analysis_id: str = Field(..., description="Analysis ID")
    status: str = Field(..., description="Analysis status")
    restaurant_name: str = Field(..., description="Restaurant name")
    location: str = Field(..., description="Location")
    category: str = Field(..., description="Restaurant category")
    tier: str = Field(..., description="Analysis tier used")
    competitors: List[Dict[str, Any]] = Field(..., description="Competitor information")
    insights: List[Dict[str, Any]] = Field(..., description="Analysis insights")
    metadata: Dict[str, Any] = Field(..., description="Analysis metadata including cost and features")
    created_at: str = Field(..., description="Creation timestamp")
    completed_at: Optional[str] = Field(None, description="Completion timestamp")
    processing_time_seconds: Optional[int] = Field(None, description="Processing time")

class AnalysisStatusResponse(BaseModel):
    analysis_id: str = Field(..., description="Analysis ID")
    status: str = Field(..., description="Analysis status")
    progress_percentage: int = Field(..., description="Progress percentage")
    current_step: Optional[str] = Field(None, description="Current processing step")
    estimated_time_remaining_seconds: Optional[int] = Field(None, description="Estimated time remaining")
    error_message: Optional[str] = Field(None, description="Error message if failed")
