from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, validator


class DesiredOutputs(BaseModel):
    """Desired output settings for Nano Banana generation."""

    variants: int = Field(1, ge=1, le=10, description="Number of creative variants")
    dimensions: str = Field("1024x1024", description="Pixel dimensions, e.g. 1024x1024")
    format: str = Field("png", description="Output file format")
    aspect_ratio: Optional[str] = Field(
        None, description="Optional aspect ratio override, e.g. 4:5"
    )
    background: Optional[str] = Field(
        None, description="Background type such as transparent or brand_color"
    )


class ThemeSummary(BaseModel):
    id: str
    theme_slug: str
    name: str
    description: Optional[str]
    restaurant_vertical: str
    default_palette: Dict[str, Any] = Field(default_factory=dict)
    default_fonts: Dict[str, Any] = Field(default_factory=dict)
    default_hashtags: List[str] = Field(default_factory=list)
    category: Optional[str] = Field(default="campaigns")


class TemplateSummary(BaseModel):
    id: str
    slug: str
    display_name: Optional[str]
    variation_tags: List[str] = Field(default_factory=list)
    input_schema: Dict[str, Any] = Field(default_factory=dict)
    prompt_version: Optional[str]


class StartGenerationRequest(BaseModel):
    """Payload to initiate a creative generation job."""

    theme_id: str = Field(..., description="Creative theme UUID")
    template_id: str = Field(..., description="Creative template UUID")
    user_inputs: Dict[str, Any] = Field(
        default_factory=dict, description="Values injected into the prompt"
    )
    brand_profile_id: Optional[str] = Field(
        None, description="Optional brand profile UUID"
    )
    brand_overrides: Dict[str, Any] = Field(
        default_factory=dict, description="Brand-specific overrides (palette, name)"
    )
    style_preferences: Dict[str, Any] = Field(
        default_factory=dict, description="Optional hints to nudge variation engine"
    )
    desired_outputs: DesiredOutputs = Field(
        default_factory=DesiredOutputs, description="Output configuration"
    )
    generation_metadata: Dict[str, Any] = Field(
        default_factory=dict, description="Additional metadata forwarded to Nano Banana"
    )
    cost_estimate: Optional[float] = Field(
        None, ge=0.0, description="Optional client-side cost estimate"
    )


class VariationSummary(BaseModel):
    style_seed: Optional[str]
    noise_level: Optional[float]
    style_notes: List[str] = Field(default_factory=list)
    texture: Optional[str]
    palette: Dict[str, Any] = Field(default_factory=dict)
    style_suffix: Optional[str]


class StartGenerationResponse(BaseModel):
    """Response after dispatching a creative job."""

    job_id: str = Field(..., description="Internal job UUID")
    nano_job_id: str = Field(..., description="Nano Banana job identifier")
    status: str = Field(..., description="Current job status")
    progress: int = Field(..., ge=0, le=100, description="Progress percentage")
    created_at: datetime = Field(..., description="Creation timestamp")
    variation_summary: VariationSummary


class TemplatePreviewRequest(BaseModel):
    template_id: str
    user_inputs: Dict[str, Any] = Field(default_factory=dict)
    style_preferences: Dict[str, Any] = Field(default_factory=dict)


class TemplatePreviewResponse(BaseModel):
    sections: Dict[str, str]
    variation_summary: Optional[VariationSummary]


class CreativeJobSummary(BaseModel):
    id: str
    status: str
    progress: int
    template_slug: str
    template_version: Optional[str]
    template_id: Optional[str]
    theme_id: Optional[str]
    created_at: datetime
    completed_at: Optional[datetime]
    error_message: Optional[str]
    nano_job_id: Optional[str]


class JobListResponse(BaseModel):
    data: List[CreativeJobSummary]
    total_count: int = Field(..., alias="count")

    class Config:
        populate_by_name = True


class CreativeAsset(BaseModel):
    id: Optional[str]
    variant_label: Optional[str]
    asset_url: str
    preview_url: Optional[str]
    width: Optional[int]
    height: Optional[int]
    file_size_bytes: Optional[int]
    metadata: Dict[str, Any] = Field(default_factory=dict)
    source_asset_url: Optional[str]
    source_preview_url: Optional[str]
    storage_path: Optional[str]


class CreativeJobEvent(BaseModel):
    id: Optional[str]
    event_type: str
    progress: Optional[int]
    payload: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime


class CreativeJobDetail(BaseModel):
    id: str
    status: str
    progress: int
    template_slug: str
    template_version: Optional[str]
    template_id: Optional[str]
    theme_id: Optional[str]
    nano_job_id: Optional[str]
    desired_outputs: Dict[str, Any] = Field(default_factory=dict)
    prompt_sections: Dict[str, str] = Field(default_factory=dict)
    variation_summary: Optional[VariationSummary] = None
    created_at: datetime
    completed_at: Optional[datetime]
    error_message: Optional[str]
    assets: List[CreativeAsset] = Field(default_factory=list)
    events: List[CreativeJobEvent] = Field(default_factory=list)

    @validator("assets", pre=True)
    def _coerce_assets(cls, value: Any) -> Any:
        return value or []

    @validator("events", pre=True)
    def _coerce_events(cls, value: Any) -> Any:
        return value or []


class BrandProfileSummary(BaseModel):
    id: str
    brand_name: str
    palette: Dict[str, Any] = Field(default_factory=dict)
    typography: Dict[str, Any] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    is_default: bool
    updated_at: Optional[datetime]
    # Phase 1 fields
    brand_voice: Optional[str] = None
    brand_tone: Optional[str] = None
    voice_description: Optional[str] = None
    visual_styles: List[str] = Field(default_factory=list)
    cuisine_type: Optional[str] = None
    cuisine_specialties: List[str] = Field(default_factory=list)
    atmosphere_tags: List[str] = Field(default_factory=list)
    target_demographic: Optional[str] = None
    # Phase 2 fields
    logo_url: Optional[str] = None
    logo_placement: Optional[str] = Field(default="top_left")
    logo_watermark_style: Optional[str] = Field(default="subtle")
    prohibited_elements: List[str] = Field(default_factory=list)
    allergen_warnings: List[str] = Field(default_factory=list)
    cultural_sensitivities: List[str] = Field(default_factory=list)
    primary_social_platforms: List[str] = Field(default_factory=list)
    preferred_aspect_ratios: List[str] = Field(default_factory=list)
    brand_hashtags: List[str] = Field(default_factory=list)
    social_media_handle: Optional[str] = None
    # Phase 3 fields
    active_seasons: List[str] = Field(default_factory=list)
    holiday_participation: List[str] = Field(default_factory=list)
    seasonal_menu_rotation: bool = False
    location_type: Optional[str] = None
    regional_style: Optional[str] = None
    local_landmarks: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = Field(default="USA")
    price_range: Optional[str] = None
    value_proposition: Optional[str] = None
    average_check_size: Optional[float] = None
    positioning_statement: Optional[str] = None


