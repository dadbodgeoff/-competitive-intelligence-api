"""
Menu Comparison API Schemas
Pydantic models for request/response validation
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import datetime


class ComparisonStatus(str, Enum):
    """Analysis status states"""
    DISCOVERING = "discovering"
    SELECTING = "selecting"
    ANALYZING = "analyzing"
    COMPLETED = "completed"
    FAILED = "failed"


class MenuSource(str, Enum):
    """Where competitor menu was obtained"""
    GOOGLE_PLACES = "google_places"
    WEBSITE_SCRAPE = "website_scrape"
    MANUAL_UPLOAD = "manual_upload"


class InsightType(str, Enum):
    """Types of pricing insights"""
    PRICING_GAP = "pricing_gap"
    MISSING_ITEM = "missing_item"
    OVERPRICED_ITEM = "overpriced_item"
    UNDERPRICED_ITEM = "underpriced_item"
    CATEGORY_GAP = "category_gap"
    OPPORTUNITY = "opportunity"


class ConfidenceLevel(str, Enum):
    """Confidence in insight accuracy"""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


# ============================================================================
# REQUEST MODELS
# ============================================================================

class StartComparisonRequest(BaseModel):
    """Request to start competitor discovery"""
    restaurant_name: str = Field(..., description="User's restaurant name")
    location: str = Field(..., description="Location (e.g., 'Woonsocket, RI')")
    category: Optional[str] = Field("restaurant", description="Restaurant category (e.g., 'pizza', 'italian')")
    radius_miles: Optional[float] = Field(3.0, description="Search radius in miles")

    model_config = {
        "json_schema_extra": {
            "example": {
                "restaurant_name": "Park Ave Pizza",
                "location": "Woonsocket, RI",
                "category": "pizza",
                "radius_miles": 3.0
            }
        }
    }


class SelectCompetitorsRequest(BaseModel):
    """Request to select 2 competitors for analysis"""
    analysis_id: str = Field(..., description="Analysis session ID")
    competitor_ids: List[str] = Field(..., min_length=2, max_length=2, description="Exactly 2 competitor IDs to analyze")

    model_config = {
        "json_schema_extra": {
            "example": {
                "analysis_id": "550e8400-e29b-41d4-a716-446655440000",
                "competitor_ids": [
                    "ChIJKR8Y...",
                    "ChIJMX9Z..."
                ]
            }
        }
    }


class SaveComparisonRequest(BaseModel):
    """Request to save analysis for later review"""
    analysis_id: str = Field(..., description="Analysis session ID")
    report_name: Optional[str] = Field(None, description="Custom name for saved report")
    notes: Optional[str] = Field(None, description="User notes about this comparison")


# ============================================================================
# RESPONSE MODELS
# ============================================================================

class CompetitorBusinessInfo(BaseModel):
    """Competitor business information"""
    id: str = Field(..., description="Competitor ID (Google Place ID)")
    business_name: str = Field(..., description="Business name")
    address: Optional[str] = Field(None, description="Full address")
    latitude: Optional[float] = Field(None, description="Latitude")
    longitude: Optional[float] = Field(None, description="Longitude")
    rating: Optional[float] = Field(None, description="Google rating (1-5)")
    review_count: Optional[int] = Field(None, description="Number of reviews")
    price_level: Optional[int] = Field(None, description="Price level (1-4)")
    distance_miles: Optional[float] = Field(None, description="Distance from user's restaurant")
    phone: Optional[str] = Field(None, description="Phone number")
    website: Optional[str] = Field(None, description="Website URL")
    menu_url: Optional[str] = Field(None, description="Menu URL if available")
    is_selected: bool = Field(False, description="Whether user selected this competitor")
    menu_items: Optional[List['CompetitorMenuItem']] = Field(None, description="Parsed menu items for this competitor")


class MenuItemPrice(BaseModel):
    """Menu item price with size variant"""
    size: Optional[str] = Field(None, description="Size label (e.g., 'Small', 'Large')")
    price: float = Field(..., description="Price in dollars")


class CompetitorMenuItem(BaseModel):
    """Parsed menu item from competitor"""
    id: str = Field(..., description="Item ID")
    category_name: Optional[str] = Field(None, description="Menu category")
    item_name: str = Field(..., description="Item name")
    description: Optional[str] = Field(None, description="Item description")
    base_price: Optional[float] = Field(None, description="Base/lowest price")
    price_range_low: Optional[float] = Field(None, description="Lowest price if range")
    price_range_high: Optional[float] = Field(None, description="Highest price if range")
    size_variants: Optional[List[MenuItemPrice]] = Field(None, description="All size/price variants")
    notes: Optional[str] = Field(None, description="Special notes")


class ComparisonInsight(BaseModel):
    """LLM-generated pricing insight"""
    id: str = Field(..., description="Insight ID")
    insight_type: str = Field(..., description="Type of insight")
    category: Optional[str] = Field(None, description="Menu category")
    title: str = Field(..., description="Insight title")
    description: str = Field(..., description="Detailed description")
    user_item_name: Optional[str] = Field(None, description="User's menu item name")
    user_item_price: Optional[float] = Field(None, description="User's item price")
    competitor_item_name: Optional[str] = Field(None, description="Competitor's item name")
    competitor_item_price: Optional[float] = Field(None, description="Competitor's item price")
    competitor_business_name: Optional[str] = Field(None, description="Which competitor")
    price_difference: Optional[float] = Field(None, description="Price difference in dollars")
    price_difference_percent: Optional[float] = Field(None, description="Price difference as percentage")
    confidence: str = Field(..., description="Confidence level")
    priority: int = Field(0, description="Priority score (0-100)")
    evidence: Optional[Dict[str, Any]] = Field(None, description="Supporting evidence")


class DiscoveryResponse(BaseModel):
    """Response after competitor discovery"""
    success: bool = Field(..., description="Whether discovery succeeded")
    analysis_id: str = Field(..., description="Analysis session ID")
    competitors_found: int = Field(..., description="Number of competitors found")
    competitors: List[CompetitorBusinessInfo] = Field(..., description="List of discovered competitors")
    selected_competitors: List[str] = Field(default_factory=list, description="IDs of auto-selected competitors")
    message: str = Field(..., description="Status message")


class AnalysisStatusResponse(BaseModel):
    """Current status of analysis"""
    analysis_id: str = Field(..., description="Analysis session ID")
    status: str = Field(..., description="Current status")
    current_step: Optional[str] = Field(None, description="Current processing step")
    competitors_found: int = Field(0, description="Number of competitors found")
    competitors_selected: int = Field(0, description="Number of competitors selected")
    error_message: Optional[str] = Field(None, description="Error message if failed")
    created_at: str = Field(..., description="Creation timestamp")
    updated_at: str = Field(..., description="Last update timestamp")
    completed_at: Optional[str] = Field(None, description="Completion timestamp")


class ComparisonResultsResponse(BaseModel):
    """Complete comparison analysis results"""
    success: bool = Field(..., description="Whether analysis succeeded")
    analysis_id: str = Field(..., description="Analysis session ID")
    restaurant_name: str = Field(..., description="User's restaurant name")
    location: str = Field(..., description="Location")
    status: str = Field(..., description="Analysis status")
    competitors: List[CompetitorBusinessInfo] = Field(..., description="Selected competitors")
    insights: List[ComparisonInsight] = Field(..., description="Pricing insights")
    total_insights: int = Field(..., description="Total number of insights")
    high_priority_insights: int = Field(..., description="Number of high-priority insights")
    metadata: Dict[str, Any] = Field(..., description="Analysis metadata")
    created_at: str = Field(..., description="Creation timestamp")
    completed_at: Optional[str] = Field(None, description="Completion timestamp")


class SavedComparisonSummary(BaseModel):
    """Summary of saved comparison"""
    id: str = Field(..., description="Saved comparison ID")
    analysis_id: str = Field(..., description="Analysis session ID")
    report_name: Optional[str] = Field(None, description="Report name")
    restaurant_name: str = Field(..., description="Restaurant name")
    location: str = Field(..., description="Location")
    competitors_count: int = Field(..., description="Number of competitors analyzed")
    insights_count: int = Field(..., description="Number of insights generated")
    is_archived: bool = Field(False, description="Whether archived")
    created_at: str = Field(..., description="Creation timestamp")
    updated_at: str = Field(..., description="Last update timestamp")


class SavedComparisonsListResponse(BaseModel):
    """List of saved comparisons"""
    success: bool = Field(..., description="Whether request succeeded")
    comparisons: List[SavedComparisonSummary] = Field(..., description="List of saved comparisons")
    total_count: int = Field(..., description="Total number of saved comparisons")
    has_more: bool = Field(..., description="Whether more results available")
    limit: int = Field(..., description="Results per page")
    offset: int = Field(..., description="Pagination offset")
