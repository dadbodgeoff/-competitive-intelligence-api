"""
Restaurant-specific food quality analysis.
Checks for appetizing colors, freshness indicators, and presentation.
"""
from __future__ import annotations

import logging
from typing import List, Tuple

import numpy as np
from PIL import Image

logger = logging.getLogger(__name__)


class FoodQualityAnalyzer:
    """Analyzes food-specific quality indicators."""

    # Unappetizing color ranges (HSV)
    UNAPPETIZING_COLORS = {
        "green_meat": {"h": (60, 180), "s": (30, 100), "v": (20, 80)},
        "gray_food": {"h": (0, 360), "s": (0, 20), "v": (30, 70)},
        "blue_tint": {"h": (180, 240), "s": (30, 100), "v": (30, 100)},
        "purple_tint": {"h": (270, 330), "s": (30, 100), "v": (30, 100)},
    }

    # Appetizing color ranges (warm tones for food)
    APPETIZING_COLORS = {
        "golden_brown": {"h": (20, 45), "s": (40, 100), "v": (40, 100)},
        "red_tones": {"h": (0, 20), "s": (40, 100), "v": (40, 100)},
        "warm_yellow": {"h": (45, 60), "s": (40, 100), "v": (60, 100)},
        "rich_brown": {"h": (10, 30), "s": (30, 80), "v": (20, 60)},
    }

    def analyze_food_quality(self, image: Image.Image) -> Tuple[float, List[str]]:
        """
        Analyze food-specific quality indicators.

        Returns:
            (score, issues)
        """
        issues = []
        scores = []

        # Check 1: Color palette (appetizing vs unappetizing)
        color_score, color_issues = self._check_color_palette(image)
        scores.append(color_score)
        issues.extend(color_issues)

        # Check 2: Freshness indicators (texture entropy)
        freshness_score, freshness_issues = self._check_freshness(image)
        scores.append(freshness_score)
        issues.extend(freshness_issues)

        # Check 3: Lighting warmth (food needs warm lighting)
        lighting_score, lighting_issues = self._check_lighting_warmth(image)
        scores.append(lighting_score)
        issues.extend(lighting_issues)

        # Check 4: Portion appearance
        portion_score, portion_issues = self._check_portion_appearance(image)
        scores.append(portion_score)
        issues.extend(portion_issues)

        overall_score = sum(scores) / len(scores) if scores else 50.0
        return overall_score, issues

    def _check_color_palette(self, image: Image.Image) -> Tuple[float, List[str]]:
        """Check for appetizing vs unappetizing colors."""
        issues = []

        try:
            # Convert to HSV for better color analysis
            hsv_image = image.convert("HSV")
            hsv_array = np.array(hsv_image)

            h = hsv_array[:, :, 0]
            s = hsv_array[:, :, 1]
            v = hsv_array[:, :, 2]

            total_pixels = h.size

            # Check for unappetizing colors
            unappetizing_pixel_count = 0

            for color_name, ranges in self.UNAPPETIZING_COLORS.items():
                h_min, h_max = ranges["h"]
                s_min, s_max = ranges["s"]
                v_min, v_max = ranges["v"]

                mask = (
                    (h >= h_min)
                    & (h <= h_max)
                    & (s >= s_min)
                    & (s <= s_max)
                    & (v >= v_min)
                    & (v <= v_max)
                )

                count = int(np.sum(mask))
                if count > total_pixels * 0.1:  # More than 10% of image
                    issues.append(f"unappetizing_color_{color_name}")
                    unappetizing_pixel_count += count

            # Check for appetizing colors
            appetizing_pixel_count = 0

            for color_name, ranges in self.APPETIZING_COLORS.items():
                h_min, h_max = ranges["h"]
                s_min, s_max = ranges["s"]
                v_min, v_max = ranges["v"]

                mask = (
                    (h >= h_min)
                    & (h <= h_max)
                    & (s >= s_min)
                    & (s <= s_max)
                    & (v >= v_min)
                    & (v <= v_max)
                )

                appetizing_pixel_count += int(np.sum(mask))

            # Calculate score
            unappetizing_ratio = unappetizing_pixel_count / total_pixels
            appetizing_ratio = appetizing_pixel_count / total_pixels

            if unappetizing_ratio > 0.2:
                score = 30.0
            elif unappetizing_ratio > 0.1:
                score = 60.0
            elif appetizing_ratio > 0.3:
                score = 100.0
            elif appetizing_ratio > 0.2:
                score = 80.0
            else:
                score = 70.0

            return score, issues

        except Exception as e:
            logger.warning(f"Color palette check failed: {e}")
            return 70.0, []

    def _check_freshness(self, image: Image.Image) -> Tuple[float, List[str]]:
        """Check freshness indicators using texture entropy."""
        issues = []

        try:
            # Convert to grayscale
            gray = np.array(image.convert("L"))

            # Calculate local variance (fresh food has high texture detail)
            from scipy.ndimage import generic_filter

            def local_variance(values):
                """Calculate variance of local region."""
                return float(np.var(values))

            variance_map = generic_filter(gray, local_variance, size=20)
            avg_variance = float(np.mean(variance_map))

            # High variance = lots of texture detail = looks fresh
            if avg_variance > 500:
                score = 100.0
            elif avg_variance > 300:
                score = 80.0
            elif avg_variance > 150:
                score = 60.0
            else:
                score = 40.0
                issues.append("low_texture_detail")

            return score, issues

        except ImportError:
            # Fallback if scipy not available - use simple variance
            try:
                gray = np.array(image.convert("L"))
                variance = float(np.var(gray))

                if variance > 2000:
                    score = 100.0
                elif variance > 1000:
                    score = 80.0
                elif variance > 500:
                    score = 60.0
                else:
                    score = 40.0
                    issues.append("low_texture_detail")

                return score, issues
            except Exception as e:
                logger.warning(f"Freshness check failed: {e}")
                return 70.0, []
        except Exception as e:
            logger.warning(f"Freshness check failed: {e}")
            return 70.0, []

    def _check_lighting_warmth(self, image: Image.Image) -> Tuple[float, List[str]]:
        """Check if lighting has warm tones (important for food)."""
        issues = []

        try:
            # Convert to RGB
            rgb_array = np.array(image.convert("RGB"))

            # Calculate average color temperature
            r = float(rgb_array[:, :, 0].mean())
            g = float(rgb_array[:, :, 1].mean())
            b = float(rgb_array[:, :, 2].mean())

            # Warm lighting: more red/yellow, less blue
            warmth_ratio = (r + g) / (2 * b + 1)

            if warmth_ratio > 1.3:
                score = 100.0
            elif warmth_ratio > 1.1:
                score = 80.0
            elif warmth_ratio > 0.9:
                score = 60.0
            else:
                score = 40.0
                issues.append("cold_lighting")

            return score, issues

        except Exception as e:
            logger.warning(f"Lighting warmth check failed: {e}")
            return 70.0, []

    def _check_portion_appearance(self, image: Image.Image) -> Tuple[float, List[str]]:
        """Check if portion size looks appropriate."""
        issues = []

        try:
            width, height = image.size
            gray = np.array(image.convert("L"))

            # Find food region (assume it's brighter than background)
            threshold = float(np.percentile(gray, 60))
            food_mask = gray > threshold

            food_pixels = int(np.sum(food_mask))
            total_pixels = gray.size
            food_ratio = food_pixels / total_pixels

            # Ideal: food occupies 40-60% of frame
            if 0.4 <= food_ratio <= 0.6:
                score = 100.0
            elif 0.3 <= food_ratio <= 0.7:
                score = 80.0
            elif 0.2 <= food_ratio <= 0.8:
                score = 60.0
            else:
                score = 40.0
                if food_ratio < 0.2:
                    issues.append("portion_too_small")
                else:
                    issues.append("portion_too_large")

            return score, issues

        except Exception as e:
            logger.warning(f"Portion appearance check failed: {e}")
            return 70.0, []
