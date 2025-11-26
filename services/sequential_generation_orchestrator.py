"""
Sequential Image Generation Orchestrator.

Handles multi-prompt generation where each prompt generates one image,
streaming results back to the user as each completes.

This is cleaner for the user because:
1. They see images appear one by one (feels faster)
2. Each image can have a different prompt
3. If one fails, others still complete
"""
from __future__ import annotations

import asyncio
import logging
import uuid
from typing import Any, AsyncGenerator, Dict, List, Optional

from services.nano_banana_orchestrator import NanoBananaImageOrchestrator

logger = logging.getLogger(__name__)


class SequentialGenerationOrchestrator:
    """
    Orchestrates multi-prompt generation with progressive streaming.
    
    Instead of sending all prompts at once, this generates images sequentially
    and streams each result back as it completes.
    """
    
    def __init__(self) -> None:
        self.base_orchestrator = NanoBananaImageOrchestrator()
    
    async def generate_sequential(
        self,
        *,
        user_id: str,
        prompts: List[Dict[str, Any]],
        shared_config: Dict[str, Any],
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Generate images sequentially, yielding each result as it completes.
        
        Args:
            user_id: The user requesting generation
            prompts: List of prompt configurations, each with:
                - template_id: Template to use
                - user_inputs: Variables for this specific image
                - label: Optional label for this image (e.g., "Image 1 of 4")
            shared_config: Config shared across all generations:
                - theme_id: Theme ID
                - brand_profile_id: Brand profile to use
                - style_preferences: Shared style settings
                - desired_outputs: Output format (dimensions, format)
        
        Yields:
            Progress events:
                - {"type": "started", "data": {"total": N, "current": 0}}
                - {"type": "generating", "data": {"current": 1, "label": "..."}}
                - {"type": "image_ready", "data": {"current": 1, "asset": {...}}}
                - {"type": "image_failed", "data": {"current": 1, "error": "..."}}
                - {"type": "completed", "data": {"total": N, "successful": M, "assets": [...]}}
        """
        total = len(prompts)
        successful = 0
        all_assets: List[Dict[str, Any]] = []
        
        # Create a parent job to track the batch
        batch_id = str(uuid.uuid4())
        
        yield {
            "type": "started",
            "data": {
                "batch_id": batch_id,
                "total": total,
                "current": 0,
                "message": f"Starting generation of {total} images..."
            }
        }
        
        for idx, prompt_config in enumerate(prompts, start=1):
            label = prompt_config.get("label", f"Image {idx} of {total}")
            
            yield {
                "type": "generating",
                "data": {
                    "batch_id": batch_id,
                    "current": idx,
                    "total": total,
                    "label": label,
                    "message": f"Generating {label}..."
                }
            }
            
            try:
                # Build the request for this specific image
                request = {
                    "template_id": prompt_config.get("template_id") or shared_config.get("template_id"),
                    "theme_id": shared_config.get("theme_id"),
                    "user_inputs": prompt_config.get("user_inputs", {}),
                    "brand_profile_id": shared_config.get("brand_profile_id"),
                    "style_preferences": {
                        **shared_config.get("style_preferences", {}),
                        **prompt_config.get("style_preferences", {}),
                    },
                    "desired_outputs": {
                        **shared_config.get("desired_outputs", {"variants": 1, "dimensions": "1024x1024"}),
                        "variants": 1,  # Force single variant per prompt
                    },
                }
                
                # Generate this single image
                job_result = await self.base_orchestrator.start_generation(
                    user_id=user_id,
                    request=request,
                )
                
                # Extract the asset from the completed job
                job_id = job_result.get("id")
                if job_result.get("status") == "completed":
                    # Fetch the full job with assets
                    full_job = self.base_orchestrator.get_job(
                        job_id=job_id,
                        user_id=user_id,
                    )
                    assets = full_job.get("assets", []) if full_job else []
                    
                    if assets:
                        asset = assets[0]
                        asset["label"] = label
                        asset["sequence_index"] = idx
                        all_assets.append(asset)
                        successful += 1
                        
                        yield {
                            "type": "image_ready",
                            "data": {
                                "batch_id": batch_id,
                                "current": idx,
                                "total": total,
                                "label": label,
                                "asset": asset,
                                "job_id": job_id,
                                "message": f"✓ {label} complete"
                            }
                        }
                    else:
                        yield {
                            "type": "image_failed",
                            "data": {
                                "batch_id": batch_id,
                                "current": idx,
                                "total": total,
                                "label": label,
                                "error": "No assets returned",
                                "message": f"✗ {label} failed - no image generated"
                            }
                        }
                else:
                    # Job didn't complete synchronously - this shouldn't happen with Gemini
                    yield {
                        "type": "image_failed",
                        "data": {
                            "batch_id": batch_id,
                            "current": idx,
                            "total": total,
                            "label": label,
                            "error": f"Job status: {job_result.get('status')}",
                            "message": f"✗ {label} - unexpected status"
                        }
                    }
                    
            except Exception as e:
                logger.error(f"Sequential generation failed for image {idx}: {e}", exc_info=True)
                yield {
                    "type": "image_failed",
                    "data": {
                        "batch_id": batch_id,
                        "current": idx,
                        "total": total,
                        "label": label,
                        "error": str(e),
                        "message": f"✗ {label} failed"
                    }
                }
            
            # Small delay between generations to be nice to the API
            if idx < total:
                await asyncio.sleep(0.5)
        
        # Final completion event
        yield {
            "type": "completed",
            "data": {
                "batch_id": batch_id,
                "total": total,
                "successful": successful,
                "failed": total - successful,
                "assets": all_assets,
                "message": f"Completed: {successful}/{total} images generated"
            }
        }
