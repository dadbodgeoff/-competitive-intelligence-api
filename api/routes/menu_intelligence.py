"""
Menu Intelligence API Routes - Week 2 Day 3
RESTful API endpoints for menu analysis
Follows patterns from api/routes/tier_analysis.py
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
import logging
from datetime import datetime

# Import existing dependencies (reuse patterns)
from api.middleware.auth import get_current_user
from database.supabase_client import get_supabase_client

# Import our orchestrator
from services.menu_intelligence_orchestrator import MenuIntelligenceOrchestrator

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/menu-intelligence", tags=["menu-intelligence"])

# Request/Response Models
class MenuItem(BaseModel):
    """Individual menu item model"""
    name: str = Field(..., description="Item name")
    price: float = Field(..., gt=0, description="Item price")
    description: Optional[str] = Field(None, description="Item description")
    category: Optional[str] = Field("Other", description="Item category")
    size: Optional[str] = Field(None, description="Item size/portion")

class MenuAnalysisRequest(BaseModel):
    """Request model for menu analysis"""
    restaurant_id: str = Field(..., description="Unique restaurant identifier")
    restaurant_name: str = Field(..., description="Restaurant name")
    location: str = Field(..., description="Restaurant location (address or coordinates)")
    category: str = Field("restaurant", description="Restaurant category (pizza, burger, etc.)")
    menu_items: List[MenuItem] = Field(..., min_items=1, description="List of menu items")
    tier: str = Field("free", description="Analysis tier (free or premium)")

class MenuAnalysisResponse(BaseModel):
    """Response model for menu analysis"""
    analysis_id: str
    success: bool
    tier: str
    processing_time: float
    estimated_cost: Optional[float] = None
    timestamp: str
    menu_analysis: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class AnalysisHistoryResponse(BaseModel):
    """Response model for analysis history"""
    analyses: List[Dict[str, Any]]
    total_count: int
    timestamp: str

class TierInfoResponse(BaseModel):
    """Response model for tier information"""
    tiers: Dict[str, Any]
    timestamp: str

class HealthCheckResponse(BaseModel):
    """Response model for health check"""
    status: str
    services: Dict[str, str]
    feature_flags: Dict[str, bool]
    timestamp: str

@router.post("/analyze", response_model=MenuAnalysisResponse)
async def run_menu_analysis(
    request: MenuAnalysisRequest,
    current_user: str = Depends(get_current_user),
    supabase = Depends(get_supabase_client)
):
    """
    Run complete menu intelligence analysis
    
    Analyzes user's menu against competitors to provide:
    - Price comparison insights
    - Menu gap identification  
    - Strategic recommendations
    - Market positioning analysis
    """
    
    try:
        logger.info(f"Menu analysis request from user {current_user} for restaurant {request.restaurant_id}")
        
        # Validate tier
        if request.tier not in ["free", "premium"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid tier. Must be 'free' or 'premium'"
            )
        
        # Convert request to internal format
        user_menu = {
            "restaurant_name": request.restaurant_name,
            "items": [
                {
                    "name": item.name,
                    "price": item.price,
                    "description": item.description,
                    "category": item.category,
                    "size": item.size
                }
                for item in request.menu_items
            ]
        }
        
        # Initialize orchestrator
        orchestrator = MenuIntelligenceOrchestrator(supabase_client=supabase)
        
        # Run analysis
        result = await orchestrator.run_menu_analysis(
            restaurant_id=request.restaurant_id,
            user_menu=user_menu,
            location=request.location,
            category=request.category,
            tier=request.tier,
            user_id=current_user
        )
        
        # Return formatted response
        return MenuAnalysisResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Menu analysis failed for user {current_user}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Menu analysis failed: {str(e)}"
        )

@router.get("/history", response_model=AnalysisHistoryResponse)
async def get_analysis_history(
    restaurant_id: Optional[str] = None,
    limit: int = 10,
    current_user: str = Depends(get_current_user),
    supabase = Depends(get_supabase_client)
):
    """
    Get user's menu analysis history
    
    Returns previous menu analyses with optional filtering by restaurant
    """
    
    try:
        logger.info(f"Analysis history request from user {current_user}")
        
        # Validate limit
        if limit < 1 or limit > 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Limit must be between 1 and 100"
            )
        
        # Initialize orchestrator
        orchestrator = MenuIntelligenceOrchestrator(supabase_client=supabase)
        
        # Get history
        analyses = await orchestrator.get_analysis_history(
            user_id=current_user,
            restaurant_id=restaurant_id,
            limit=limit
        )
        
        return AnalysisHistoryResponse(
            analyses=analyses,
            total_count=len(analyses),
            timestamp=datetime.now().isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get analysis history for user {current_user}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get analysis history: {str(e)}"
        )

@router.get("/tiers", response_model=TierInfoResponse)
async def get_tier_information():
    """
    Get information about available analysis tiers
    
    Returns details about free and premium tier features, costs, and capabilities
    """
    
    try:
        # Initialize orchestrator
        orchestrator = MenuIntelligenceOrchestrator()
        
        # Get tier information
        tiers = orchestrator.get_supported_tiers()
        
        return TierInfoResponse(
            tiers=tiers,
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Failed to get tier information: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get tier information: {str(e)}"
        )

@router.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """
    Health check for menu intelligence system
    
    Returns status of all menu intelligence services and feature flags
    """
    
    try:
        # Initialize orchestrator
        orchestrator = MenuIntelligenceOrchestrator()
        
        # Run health check
        health_status = await orchestrator.health_check()
        
        return HealthCheckResponse(**health_status)
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return HealthCheckResponse(
            status="unhealthy",
            services={"error": str(e)},
            feature_flags={},
            timestamp=datetime.now().isoformat()
        )

@router.post("/validate-menu")
async def validate_menu_data(
    menu_items: List[MenuItem],
    current_user: str = Depends(get_current_user)
):
    """
    Validate menu data structure and content
    
    Checks menu items for completeness and validity before analysis
    """
    
    try:
        logger.info(f"Menu validation request from user {current_user}")
        
        validation_results = {
            "valid": True,
            "total_items": len(menu_items),
            "valid_items": 0,
            "issues": [],
            "recommendations": []
        }
        
        # Validate each item
        for i, item in enumerate(menu_items):
            item_issues = []
            
            # Check required fields
            if not item.name or len(item.name.strip()) == 0:
                item_issues.append("Missing or empty name")
            
            if item.price <= 0:
                item_issues.append("Price must be greater than 0")
            
            if item.price > 1000:
                item_issues.append("Price seems unusually high (>$1000)")
            
            # Check optional but recommended fields
            if not item.category:
                validation_results["recommendations"].append(f"Item '{item.name}' missing category")
            
            if not item.description:
                validation_results["recommendations"].append(f"Item '{item.name}' missing description")
            
            if item_issues:
                validation_results["issues"].append({
                    "item_index": i,
                    "item_name": item.name,
                    "issues": item_issues
                })
                validation_results["valid"] = False
            else:
                validation_results["valid_items"] += 1
        
        # Overall validation
        if validation_results["valid_items"] == 0:
            validation_results["valid"] = False
            validation_results["issues"].append({
                "general": "No valid menu items found"
            })
        
        # Add general recommendations
        if validation_results["valid_items"] < 3:
            validation_results["recommendations"].append("Consider adding more menu items for better analysis")
        
        categories = set(item.category for item in menu_items if item.category)
        if len(categories) < 2:
            validation_results["recommendations"].append("Consider organizing items into categories for better insights")
        
        return {
            "validation": validation_results,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Menu validation failed for user {current_user}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Menu validation failed: {str(e)}"
        )

# Error handlers
@router.exception_handler(ValueError)
async def value_error_handler(request, exc):
    """Handle validation errors"""
    return HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=str(exc)
    )

@router.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle general exceptions"""
    logger.error(f"Unhandled exception in menu intelligence API: {str(exc)}")
    return HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="An unexpected error occurred"
    )