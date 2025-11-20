from fastapi import APIRouter

from .templates import router as template_router
from .days import router as day_router

router = APIRouter(prefix="/api/v1/prep", tags=["Daily Prep"])

router.include_router(template_router)
router.include_router(day_router)

__all__ = ["router"]

