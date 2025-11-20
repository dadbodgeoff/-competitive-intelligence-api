from fastapi import APIRouter

from .settings import router as settings_router
from .weeks import router as weeks_router
from .shifts import router as shifts_router
from .timekeeping import router as timekeeping_router
from .grid import router as grid_router

router = APIRouter(prefix="/api/v1/scheduling", tags=["Scheduling"])

router.include_router(settings_router)
router.include_router(weeks_router)
router.include_router(shifts_router)
router.include_router(timekeeping_router)
router.include_router(grid_router)

__all__ = ["router"]

