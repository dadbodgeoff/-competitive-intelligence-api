from __future__ import annotations

import logging
from datetime import date, datetime
from typing import Dict, Iterable, List, Optional

from database.supabase_client import get_supabase_service_client
from services.prep.template_service import PrepTemplateService

logger = logging.getLogger(__name__)


class PrepDayService:
    """Manage daily prep sheets."""

    def __init__(self, *, account_id: str) -> None:
        self.account_id = account_id
        self.client = get_supabase_service_client()
        self.template_service = PrepTemplateService(account_id=account_id)

    # ------------------------------------------------------------------#
    # Days
    # ------------------------------------------------------------------#
    def list_days(self, *, start: Optional[date] = None, end: Optional[date] = None, status: Optional[str] = None) -> List[Dict]:
        query = (
            self.client.table("prep_days")
            .select("*")
            .eq("account_id", self.account_id)
            .order("prep_date", desc=True)
        )
        if start:
            query = query.gte("prep_date", start.isoformat())
        if end:
            query = query.lte("prep_date", end.isoformat())
        if status:
            query = query.eq("status", status)
        result = query.execute()
        return result.data or []

    def get_day(self, prep_day_id: str, *, include_items: bool = True) -> Optional[Dict]:
        day_result = (
            self.client.table("prep_days")
            .select("*")
            .eq("account_id", self.account_id)
            .eq("id", prep_day_id)
            .limit(1)
            .execute()
        )
        if not day_result.data:
            return None
        day = day_result.data[0]
        if include_items:
            day["items"] = self.list_day_items(prep_day_id)
        return day

    def get_day_by_date(self, prep_date: date) -> Optional[Dict]:
        result = (
            self.client.table("prep_days")
            .select("*")
            .eq("account_id", self.account_id)
            .eq("prep_date", prep_date.isoformat())
            .limit(1)
            .execute()
        )
        return result.data[0] if result.data else None

    def create_day(
        self,
        *,
        prep_date: date,
        created_by: Optional[str],
        template_id: Optional[str] = None,
        status: str = "draft",
    ) -> Dict:
        existing = self.get_day_by_date(prep_date)
        if existing:
            logger.info("Prep day already exists for date=%s account=%s", prep_date, self.account_id)
            return existing

        payload = {
            "account_id": self.account_id,
            "prep_date": prep_date.isoformat(),
            "status": status,
            "template_id": template_id,
            "created_by": created_by,
            "locked_by": None,
            "locked_at": None,
        }
        result = self.client.table("prep_days").insert(payload).execute()
        day = result.data[0]

        if template_id:
            template_items = self.template_service.list_template_items(template_id)
            if template_items:
                self._seed_day_from_template(day["id"], template_items, created_by)

        return self.get_day(day["id"]) or day

    def update_day(
        self,
        prep_day_id: str,
        *,
        status: Optional[str] = None,
        notes: Optional[str] = None,
        locked_by: Optional[str] = None,
        locked_at: Optional[datetime] = None,
    ) -> Dict:
        payload: Dict[str, object] = {"updated_at": datetime.utcnow().isoformat()}
        if status is not None:
            payload["status"] = status
        if notes is not None:
            payload["notes"] = notes
        if locked_by is not None:
            payload["locked_by"] = locked_by
            payload["locked_at"] = locked_at.isoformat() if locked_at else datetime.utcnow().isoformat()
        result = (
            self.client.table("prep_days")
            .update(payload)
            .eq("account_id", self.account_id)
            .eq("id", prep_day_id)
            .execute()
        )
        if not result.data:
            raise ValueError("Prep day not found")
        return result.data[0]

    # ------------------------------------------------------------------#
    # Day items
    # ------------------------------------------------------------------#
    def list_day_items(self, prep_day_id: str) -> List[Dict]:
        result = (
            self.client.table("prep_day_items")
            .select("*")
            .eq("account_id", self.account_id)
            .eq("prep_day_id", prep_day_id)
            .order("display_order")
            .execute()
        )
        return result.data or []

    def add_day_item(
        self,
        prep_day_id: str,
        *,
        name: str,
        par_amount: float,
        on_hand_amount: float,
        created_by: Optional[str],
        template_item_id: Optional[str] = None,
        menu_item_id: Optional[str] = None,
        unit: Optional[str] = None,
        notes: Optional[str] = None,
        display_order: Optional[int] = None,
    ) -> Dict:
        payload = {
            "account_id": self.account_id,
            "prep_day_id": prep_day_id,
            "template_item_id": template_item_id,
            "name": name,
            "menu_item_id": menu_item_id,
            "par_amount": par_amount,
            "on_hand_amount": on_hand_amount,
            "unit": unit,
            "notes": notes,
            "display_order": display_order if display_order is not None else 0,
            "created_by": created_by,
        }
        result = self.client.table("prep_day_items").insert(payload).execute()
        item = result.data[0]
        self._log_item_action(
            prep_day_id=prep_day_id,
            prep_day_item_id=item["id"],
            action="created",
            changed_by=created_by,
            change_detail={"par_amount": par_amount, "on_hand_amount": on_hand_amount},
        )
        return item

    def update_day_item(
        self,
        item_id: str,
        *,
        par_amount: Optional[float] = None,
        on_hand_amount: Optional[float] = None,
        unit: Optional[str] = None,
        notes: Optional[str] = None,
        display_order: Optional[int] = None,
        assigned_user_id: Optional[str] = None,
    ) -> Dict:
        payload: Dict[str, object] = {"updated_at": datetime.utcnow().isoformat()}
        if par_amount is not None:
            payload["par_amount"] = par_amount
        if on_hand_amount is not None:
            payload["on_hand_amount"] = on_hand_amount
        if unit is not None:
            payload["unit"] = unit
        if notes is not None:
            payload["notes"] = notes
        if display_order is not None:
            payload["display_order"] = display_order
        if assigned_user_id is not None:
            payload["assigned_user_id"] = assigned_user_id

        result = (
            self.client.table("prep_day_items")
            .update(payload)
            .eq("account_id", self.account_id)
            .eq("id", item_id)
            .execute()
        )
        if not result.data:
            raise ValueError("Prep day item not found")
        return result.data[0]

    def remove_day_item(self, item_id: str, *, removed_by: Optional[str]) -> None:
        item = self._get_day_item(item_id)
        if not item:
            return
        self.client.table("prep_day_items").delete().eq("account_id", self.account_id).eq("id", item_id).execute()
        self._log_item_action(
            prep_day_id=item["prep_day_id"],
            prep_day_item_id=item_id,
            action="deleted",
            changed_by=removed_by,
            change_detail=None,
        )

    # ------------------------------------------------------------------#
    # Completion / assignment
    # ------------------------------------------------------------------#
    def assign_item(self, item_id: str, *, assigned_user_id: str, assigned_by: Optional[str]) -> Dict:
        item = self.update_day_item(item_id, assigned_user_id=assigned_user_id)
        self._log_item_action(
            prep_day_id=item["prep_day_id"],
            prep_day_item_id=item_id,
            action="updated",
            changed_by=assigned_by,
            change_detail={"assigned_user_id": assigned_user_id},
        )
        return item

    def mark_complete(
        self,
        item_id: str,
        *,
        completed_by: str,
        completion_note: Optional[str] = None,
        completed_at: Optional[datetime] = None,
    ) -> Dict:
        completed_at_iso = (completed_at or datetime.utcnow()).isoformat()
        result = (
            self.client.table("prep_day_items")
            .update({"completed_at": completed_at_iso, "completion_note": completion_note})
            .eq("account_id", self.account_id)
            .eq("id", item_id)
            .execute()
        )
        if not result.data:
            raise ValueError("Prep day item not found")
        item = result.data[0]
        self._log_item_action(
            prep_day_id=item["prep_day_id"],
            prep_day_item_id=item_id,
            action="completed",
            changed_by=completed_by,
            change_detail={"completion_note": completion_note},
        )
        return item

    def reopen_item(self, item_id: str, *, reopened_by: str) -> Dict:
        result = (
            self.client.table("prep_day_items")
            .update({"completed_at": None, "completion_note": None})
            .eq("account_id", self.account_id)
            .eq("id", item_id)
            .execute()
        )
        if not result.data:
            raise ValueError("Prep day item not found")
        item = result.data[0]
        self._log_item_action(
            prep_day_id=item["prep_day_id"],
            prep_day_item_id=item_id,
            action="reopened",
            changed_by=reopened_by,
            change_detail=None,
        )
        return item

    # ------------------------------------------------------------------#
    # Helpers
    # ------------------------------------------------------------------#
    def _seed_day_from_template(self, prep_day_id: str, template_items: List[Dict], created_by: Optional[str]) -> None:
        if not template_items:
            return
        payloads = []
        for index, tpl_item in enumerate(template_items):
            payloads.append(
                {
                    "account_id": self.account_id,
                    "prep_day_id": prep_day_id,
                    "template_item_id": tpl_item["id"],
                    "name": tpl_item["name"],
                    "menu_item_id": tpl_item.get("menu_item_id"),
                    "par_amount": tpl_item.get("default_par") or 0,
                    "on_hand_amount": tpl_item.get("default_on_hand") or 0,
                    "unit": None,
                    "notes": tpl_item.get("notes"),
                    "display_order": tpl_item.get("display_order") or index,
                    "created_by": created_by,
                }
            )
        if payloads:
            self.client.table("prep_day_items").insert(payloads).execute()

    def _log_item_action(
        self,
        *,
        prep_day_id: str,
        prep_day_item_id: str,
        action: str,
        changed_by: Optional[str],
        change_detail: Optional[Dict],
    ) -> None:
        payload = {
            "account_id": self.account_id,
            "prep_day_id": prep_day_id,
            "prep_day_item_id": prep_day_item_id,
            "action": action,
            "changed_by": changed_by,
            "change_detail": change_detail,
        }
        self.client.table("prep_day_item_logs").insert(payload).execute()

    def _get_day_item(self, item_id: str) -> Optional[Dict]:
        result = (
            self.client.table("prep_day_items")
            .select("*")
            .eq("account_id", self.account_id)
            .eq("id", item_id)
            .limit(1)
            .execute()
        )
        return result.data[0] if result.data else None

