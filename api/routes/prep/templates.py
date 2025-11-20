from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from api.middleware.auth import get_current_user
from services.account_service import AccountService
from services.prep import PrepTemplateService

router = APIRouter()


class TemplateCreateRequest(BaseModel):
    name: str = Field(..., min_length=1)
    description: Optional[str] = None


class TemplateUpdateRequest(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1)
    description: Optional[str] = None


class TemplateItemCreateRequest(BaseModel):
    name: str = Field(..., min_length=1)
    menu_item_id: Optional[str] = None
    default_par: Optional[float] = Field(default=0, ge=0)
    default_on_hand: Optional[float] = Field(default=0, ge=0)
    notes: Optional[str] = None
    display_order: Optional[int] = None


class TemplateItemUpdateRequest(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1)
    menu_item_id: Optional[str] = None
    default_par: Optional[float] = Field(default=None, ge=0)
    default_on_hand: Optional[float] = Field(default=None, ge=0)
    notes: Optional[str] = None
    display_order: Optional[int] = None


class MenuImportRequest(BaseModel):
    menu_item_ids: List[str] = Field(..., min_items=1)


def _get_template_service(current_user: str) -> PrepTemplateService:
    account_service = AccountService()
    try:
        account_id = account_service.get_primary_account_id(current_user)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return PrepTemplateService(account_id=account_id)


@router.get("/templates")
async def list_templates(current_user: str = Depends(get_current_user)):
    service = _get_template_service(current_user)
    templates = service.list_templates()
    return {"templates": templates}


@router.get("/templates/{template_id}")
async def get_template(template_id: str, current_user: str = Depends(get_current_user)):
    service = _get_template_service(current_user)
    template = service.get_template(template_id, include_items=True)
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    return {"template": template}


@router.post("/templates", status_code=status.HTTP_201_CREATED)
async def create_template(payload: TemplateCreateRequest, current_user: str = Depends(get_current_user)):
    service = _get_template_service(current_user)
    template = service.create_template(
        name=payload.name,
        description=payload.description,
        created_by=current_user,
    )
    return {"template": template}


@router.put("/templates/{template_id}")
async def update_template(template_id: str, payload: TemplateUpdateRequest, current_user: str = Depends(get_current_user)):
    service = _get_template_service(current_user)
    template = service.update_template(
        template_id,
        name=payload.name,
        description=payload.description,
        updated_by=current_user,
    )
    return {"template": template}


@router.delete("/templates/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_template(template_id: str, current_user: str = Depends(get_current_user)):
    service = _get_template_service(current_user)
    service.delete_template(template_id)
    return {}


@router.post("/templates/{template_id}/items", status_code=status.HTTP_201_CREATED)
async def add_template_item(template_id: str, payload: TemplateItemCreateRequest, current_user: str = Depends(get_current_user)):
    service = _get_template_service(current_user)
    template = service.get_template(template_id, include_items=False)
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    item = service.add_template_item(
        template_id=template_id,
        name=payload.name,
        menu_item_id=payload.menu_item_id,
        default_par=payload.default_par,
        default_on_hand=payload.default_on_hand,
        notes=payload.notes,
        display_order=payload.display_order,
    )
    return {"item": item}


@router.put("/template-items/{item_id}")
async def update_template_item(item_id: str, payload: TemplateItemUpdateRequest, current_user: str = Depends(get_current_user)):
    service = _get_template_service(current_user)
    item = service.update_template_item(
        item_id,
        name=payload.name,
        menu_item_id=payload.menu_item_id,
        default_par=payload.default_par,
        default_on_hand=payload.default_on_hand,
        notes=payload.notes,
        display_order=payload.display_order,
    )
    return {"item": item}


@router.delete("/template-items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_template_item(item_id: str, current_user: str = Depends(get_current_user)):
    service = _get_template_service(current_user)
    service.delete_template_item(item_id)
    return {}


@router.post("/templates/{template_id}/import-menu-items")
async def import_menu_items(template_id: str, payload: MenuImportRequest, current_user: str = Depends(get_current_user)):
    service = _get_template_service(current_user)
    template = service.get_template(template_id, include_items=False)
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    items = service.import_menu_items(template_id, payload.menu_item_ids, created_by=current_user)
    return {"items": items}

