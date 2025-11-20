"""
Menu Sales Routes
Expose endpoints for recording and reporting daily menu item sales.
"""
from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator

from api.middleware.auth import get_current_user
from services.menu_sales_service import MenuSalesService

router = APIRouter(prefix="/api/v1/menu", tags=["menu-sales"])

sales_service = MenuSalesService()


class DailySalesEntry(BaseModel):
    menu_item_id: str = Field(..., description="Menu item identifier")
    menu_item_price_id: Optional[str] = Field(
        None, description="Optional menu item price variant identifier"
    )
    quantity_sold: float = Field(..., gt=0, description="Quantity sold for the day")
    metadata: Optional[dict] = Field(
        None, description="Optional metadata captured alongside the entry"
    )

    @validator("menu_item_id", "menu_item_price_id")
    def validate_uuid(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        if len(value) < 10:
            raise ValueError("Identifier must be a valid UUID")
        return value


class RecordDailySalesRequest(BaseModel):
    sale_date: date = Field(..., description="Calendar date for the sales entries")
    entries: List[DailySalesEntry] = Field(..., min_items=1)


@router.post("/sales/daily")
async def record_daily_sales(
    request: RecordDailySalesRequest,
    current_user: str = Depends(get_current_user),
):
    """
    Record or update quantities sold for menu items on a specific day.
    """
    try:
        result = await sales_service.upsert_daily_sales(
            user_id=current_user,
            sale_date=request.sale_date,
            entries=[entry.dict() for entry in request.entries],
        )
        return JSONResponse(
            {
                "success": True,
                "records": result["records"],
                "summary": result["summary"],
            }
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover - defensive logging
        raise HTTPException(status_code=500, detail="Failed to record daily sales") from exc


@router.get("/sales/daily")
async def get_daily_sales(
    sale_date: date = Query(..., description="Calendar date to retrieve entries for"),
    current_user: str = Depends(get_current_user),
):
    """
    Retrieve all sales entries for a given date.
    """
    try:
        result = await sales_service.get_daily_sales(
            user_id=current_user,
            sale_date=sale_date,
        )
        return JSONResponse({"success": True, **result})
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail="Failed to load daily sales") from exc


@router.get("/sales/summary")
async def get_sales_summary(
    start_date: Optional[date] = Query(
        None,
        description="Start of the reporting window (defaults to 14 days before end_date)",
    ),
    end_date: Optional[date] = Query(
        None,
        description="End of the reporting window (defaults to today)",
    ),
    current_user: str = Depends(get_current_user),
):
    """
    Summary of spend for a date range (defaults to trailing 14 days).
    """
    try:
        result = await sales_service.get_summary(
            user_id=current_user,
            start_date=start_date,
            end_date=end_date,
        )
        return JSONResponse({"success": True, **result})
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail="Failed to load sales summary") from exc


