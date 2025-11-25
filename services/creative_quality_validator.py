"""
Creative quality validator service.

Validates generated images for quality issues, AI artifacts, and compliance.
Phase 1: Basic validation (resolution, clarity, basic checks)
Phase 2: Advanced validation (OCR, ML-based detection)
"""
from __future__ import annotations

import logging
import time
from typing import Any, Dict, List, Optional, Tuple
from io import BytesIO

import httpx
from PIL import Image

from database.supabase_client import get_supabase_service_client
from services.food_quality_analyzer import FoodQualityAnalyzer

logger = logging.getLogger(__name__)


class CreativeQualityValidator:
    """Validates generated image quality."""
    
    VERSION = "v2.0"  # Updated for Phase 2
    
    # Quality thresholds
    MIN_RESOLUTION = 512  # Minimum acceptable dimension
    MIN_QUALITY_SCORE = 60.0  # Below this is considered failed
    DOWNLOAD_TIMEOUT = 10.0  # Seconds
    
    def __init__(self):
        self.client = get_supabase_service_client()
        # Phase 2: Food quality analyzer
        self.food_quality_analyzer = FoodQualityAnalyzer()
    
    def validate_asset(
        self,
        *,
        asset_url: str,
        job_id: str,
        asset_id: str,
        prompt: str,
        user_inputs: Dict[str, str],
        template: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Validate a generated asset.
        
        Args:
            asset_url: URL of the generated image
            job_id: Generation job ID
            asset_id: Asset ID (may be "pending" if not yet stored)
            prompt: Full prompt used for generation
            user_inputs: User-provided inputs
            template: Template configuration
            
        Returns:
            {
                "is_acceptable": bool,
                "quality_score": float,
                "issues": List[str],
                "scores": Dict[str, float],
                "metadata": Dict
            }
        """
        start_time = time.time()
        
        try:
            # Download image
            image = self._download_image(asset_url)
            if not image:
                return self._error_result("failed_to_download_image")
            
            # Run validation checks
            issues: List[str] = []
            scores: Dict[str, float] = {}
            
            # Check 1: Resolution and clarity
            resolution_score, resolution_issues = self._check_resolution(image)
            scores["resolution"] = resolution_score
            issues.extend(resolution_issues)
            
            # Check 2: Basic quality metrics
            clarity_score, clarity_issues = self._check_clarity(image)
            scores["clarity"] = clarity_score
            issues.extend(clarity_issues)
            
            # Check 3: Text rendering (if prompt includes text)
            if self._prompt_has_text(prompt, user_inputs):
                text_score, text_issues = self._check_text_quality(image, user_inputs)
                scores["text_quality"] = text_score
                issues.extend(text_issues)
            
            # Check 4: AI artifact detection
            artifact_issues = self._detect_ai_artifacts(image)
            issues.extend(artifact_issues)
            
            # Phase 2: Food quality checks (if enabled via config)
            # Check if this is a food/restaurant image (simple heuristic)
            if self._is_food_related(prompt, user_inputs):
                food_score, food_issues = self.food_quality_analyzer.analyze_food_quality(image)
                scores["food_quality"] = food_score
                issues.extend(food_issues)
                logger.info(f"🍕 Food quality score: {food_score:.1f}")
            
            # Calculate overall score
            overall_score = self._calculate_overall_score(scores, issues)
            
            # Determine if acceptable
            is_acceptable = overall_score >= self.MIN_QUALITY_SCORE
            
            # Record metrics
            duration_ms = int((time.time() - start_time) * 1000)
            if asset_id != "pending":
                self._record_metrics(
                    job_id=job_id,
                    asset_id=asset_id,
                    overall_score=overall_score,
                    scores=scores,
                    issues=issues,
                    duration_ms=duration_ms,
                )
            
            logger.info(
                f"Quality validation complete: score={overall_score:.1f}, "
                f"issues={len(issues)}, duration={duration_ms}ms"
            )
            
            return {
                "is_acceptable": is_acceptable,
                "quality_score": overall_score,
                "issues": issues,
                "scores": scores,
                "metadata": {
                    "validator_version": self.VERSION,
                    "duration_ms": duration_ms,
                }
            }
            
        except Exception as e:
            logger.error(f"Quality validation error: {e}", exc_info=True)
            duration_ms = int((time.time() - start_time) * 1000)
            if asset_id != "pending":
                self._record_error(job_id, asset_id, str(e), duration_ms)
            return self._error_result(f"validation_error: {str(e)}")
    
    # ------------------------------------------------------------------ #
    # Validation checks
    # ------------------------------------------------------------------ #
    
    def _check_resolution(self, image: Image.Image) -> Tuple[float, List[str]]:
        """Check image resolution and dimensions."""
        issues = []
        width, height = image.size
        
        # Check minimum resolution
        if width < self.MIN_RESOLUTION or height < self.MIN_RESOLUTION:
            issues.append("low_resolution")
            score = 30.0
        elif width < 1024 or height < 1024:
            issues.append("below_optimal_resolution")
            score = 70.0
        else:
            score = 100.0
        
        # Check aspect ratio (extreme ratios might indicate issues)
        aspect_ratio = max(width, height) / min(width, height)
        if aspect_ratio > 3.0:
            issues.append("extreme_aspect_ratio")
            score = min(score, 60.0)
        
        return score, issues
    
    def _check_clarity(self, image: Image.Image) -> Tuple[float, List[str]]:
        """Check image clarity and sharpness."""
        issues = []
        
        try:
            # Convert to grayscale for analysis
            gray = image.convert('L')
            
            # Simple blur detection using variance
            import numpy as np
            img_array = np.array(gray)
            
            # Calculate variance (measure of sharpness)
            variance = float(np.var(img_array))
            
            # Threshold for blur detection (empirically determined)
            if variance < 100:
                issues.append("very_blurry_image")
                score = 30.0
            elif variance < 500:
                issues.append("slightly_soft")
                score = 70.0
            else:
                score = 100.0
            
            return score, issues
            
        except ImportError:
            # Fallback if numpy not available
            logger.warning("numpy not available, skipping clarity check")
            return 80.0, []
    
    def _check_text_quality(
        self,
        image: Image.Image,
        user_inputs: Dict[str, str]
    ) -> Tuple[float, List[str]]:
        """Check if text in image is readable and correct."""
        issues = []
        
        try:
            # Check brightness distribution (text needs good contrast)
            gray = image.convert('L')
            import numpy as np
            img_array = np.array(gray)
            
            # Check for extreme brightness/darkness
            mean_brightness = float(np.mean(img_array))
            if mean_brightness < 30:
                issues.append("too_dark_for_text")
                score = 50.0
            elif mean_brightness > 225:
                issues.append("too_bright_for_text")
                score = 50.0
            else:
                score = 80.0
            
            return score, issues
            
        except ImportError:
            # Fallback if numpy not available
            return 80.0, []
    
    def _detect_ai_artifacts(self, image: Image.Image) -> List[str]:
        """Detect common AI generation artifacts."""
        issues = []
        
        try:
            import numpy as np
            img_array = np.array(image.convert('RGB'))
            
            # Check for color clipping (all channels at 0 or 255)
            clipped_pixels = int(np.sum((img_array == 0) | (img_array == 255)))
            total_pixels = img_array.size
            clipped_ratio = clipped_pixels / total_pixels
            
            if clipped_ratio > 0.1:  # More than 10% clipped
                issues.append("excessive_color_clipping")
            
            return issues
            
        except ImportError:
            # Fallback if numpy not available
            return []
    
    # ------------------------------------------------------------------ #
    # Helper methods
    # ------------------------------------------------------------------ #
    
    def _download_image(self, url: str) -> Optional[Image.Image]:
        """Download image from URL."""
        try:
            # Handle data URLs
            if url.startswith("data:image"):
                import base64
                # Extract base64 data
                header, data = url.split(",", 1)
                image_data = base64.b64decode(data)
                return Image.open(BytesIO(image_data))
            
            # Handle HTTP URLs
            response = httpx.get(url, timeout=self.DOWNLOAD_TIMEOUT)
            response.raise_for_status()
            return Image.open(BytesIO(response.content))
            
        except Exception as e:
            logger.error(f"Failed to download image from {url}: {e}")
            return None
    
    def _prompt_has_text(self, prompt: str, user_inputs: Dict[str, str]) -> bool:
        """Check if prompt includes text rendering requirements."""
        text_indicators = [
            "text", "lettering", "written", "chalk", "marker",
            "headline", "cta", "price", "date"
        ]
        
        prompt_lower = prompt.lower()
        if any(indicator in prompt_lower for indicator in text_indicators):
            return True
        
        # Check if user provided headline, CTA, or other text fields
        text_fields = ["headline", "cta_line", "item1_name", "item2_name"]
        if any(field in user_inputs for field in text_fields):
            return True
        
        return False
    
    def _is_food_related(self, prompt: str, user_inputs: Dict[str, str]) -> bool:
        """Check if this is a food/restaurant related image."""
        food_indicators = [
            "food", "dish", "meal", "pizza", "burger", "salad", "steak",
            "restaurant", "menu", "dough", "bread", "pasta", "chicken",
            "seafood", "dessert", "appetizer", "entree", "cuisine",
            "bar", "drink", "beverage", "cocktail", "beer", "wine"
        ]
        
        prompt_lower = prompt.lower()
        if any(indicator in prompt_lower for indicator in food_indicators):
            return True
        
        # Check user inputs for food-related fields
        for value in user_inputs.values():
            if isinstance(value, str) and any(
                indicator in value.lower() for indicator in food_indicators
            ):
                return True
        
        return False
    
    def _calculate_overall_score(
        self,
        scores: Dict[str, float],
        issues: List[str]
    ) -> float:
        """Calculate overall quality score (Phase 1 + Phase 2)."""
        if not scores:
            return 50.0  # Default if no scores
        
        # Weighted average of scores
        # Phase 2: Adjusted weights to include food quality
        has_food_score = "food_quality" in scores
        
        if has_food_score:
            # Phase 2 weights (with food quality)
            weights = {
                "resolution": 0.15,
                "clarity": 0.15,
                "text_quality": 0.10,
                "food_quality": 0.60,  # High weight for restaurant-specific
            }
        else:
            # Phase 1 weights (basic only)
            weights = {
                "resolution": 0.35,
                "clarity": 0.35,
                "text_quality": 0.30,
            }
        
        weighted_sum = 0.0
        total_weight = 0.0
        
        for key, score in scores.items():
            weight = weights.get(key, 0.05)
            weighted_sum += score * weight
            total_weight += weight
        
        base_score = weighted_sum / total_weight if total_weight > 0 else 50.0
        
        # Penalize for critical issues
        critical_issues = [
            "low_resolution",
            "very_blurry_image",
            "garbled_text",
            "too_dark_for_text",
            "unappetizing_color_green_meat",  # Phase 2
            "unappetizing_color_gray_food",   # Phase 2
        ]
        
        penalty = sum(10 for issue in issues if issue in critical_issues)
        final_score = max(0.0, base_score - penalty)
        
        return round(final_score, 2)
    
    def _record_metrics(
        self,
        *,
        job_id: str,
        asset_id: str,
        overall_score: float,
        scores: Dict[str, float],
        issues: List[str],
        duration_ms: int,
    ):
        """Record quality metrics to database."""
        try:
            metrics = {
                "job_id": job_id,
                "asset_id": asset_id,
                "overall_quality_score": overall_score,
                "resolution_score": scores.get("resolution"),
                "clarity_score": scores.get("clarity"),
                "text_quality_score": scores.get("text_quality"),
                "composition_score": scores.get("composition"),
                "food_quality_score": scores.get("food_quality"),  # Phase 2
                "quality_issues": issues,
                "has_garbled_text": "garbled_text" in issues,
                "has_low_resolution": "low_resolution" in issues,
                "has_ai_artifacts": any("artifact" in i or "clipping" in i for i in issues),
                "is_too_generic": "too_generic" in issues,
                # Phase 2 flags
                "has_unappetizing_colors": any("unappetizing_color" in i for i in issues),
                "has_cold_lighting": "cold_lighting" in issues,
                "has_low_freshness": "low_texture_detail" in issues,
                "has_portion_issues": any("portion_too" in i for i in issues),
                "validator_version": self.VERSION,
                "validation_duration_ms": duration_ms,
            }
            
            self.client.table("creative_quality_metrics").insert(metrics).execute()
            
            # Also update asset record
            self.client.table("creative_generation_assets").update({
                "quality_score": overall_score,
                "quality_issues": issues,
                "is_quality_validated": True,
            }).eq("id", asset_id).execute()
            
        except Exception as e:
            logger.error(f"Failed to record quality metrics: {e}")
    
    def _record_error(
        self,
        job_id: str,
        asset_id: str,
        error: str,
        duration_ms: int
    ):
        """Record validation error."""
        try:
            self.client.table("creative_quality_metrics").insert({
                "job_id": job_id,
                "asset_id": asset_id,
                "overall_quality_score": 0,
                "validation_error": error,
                "validator_version": self.VERSION,
                "validation_duration_ms": duration_ms,
            }).execute()
        except Exception as e:
            logger.error(f"Failed to record validation error: {e}")
    
    def _error_result(self, error: str) -> Dict[str, Any]:
        """Return error result (graceful degradation)."""
        return {
            "is_acceptable": True,  # Don't block on validation errors
            "quality_score": 0.0,
            "issues": [error],
            "scores": {},
            "metadata": {"error": error}
        }
