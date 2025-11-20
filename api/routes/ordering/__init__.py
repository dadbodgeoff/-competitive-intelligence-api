"""
Ordering API package.

Currently exposes the predictions endpoint that surfaces forecast data for
predictive ordering. Additional endpoints (e.g., accuracy, configuration) will
be added here in future iterations.
"""

from fastapi import APIRouter

from . import patterns, predictions

router = APIRouter()
router.include_router(predictions.router)
router.include_router(patterns.router)

__all__ = ["router"]

