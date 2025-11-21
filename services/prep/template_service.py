from __future__ import annotations

import logging
from typing import Dict, Iterable, List, Optional

from database.supabase_client import get_supabase_service_client

logger = logging.getLogger(__name__)


class PrepTemplateService:
    """Manage prep templates and default items."""

    def __init__(self, *, account_id: str) -> None:
        self.account_id = account_id
        self.client = get_supabase_service_client()

    # ------------------------------------------------------------------#
    # Templates
    # ------------------------------------------------------------------#
    def list_templates(self) -> List[Dict]:
        result = (
            self.client.table("prep_templates")
            .select("*")
            .eq("account_id", self.account_id)
            .order("created_at", desc=True)
            .execute()
        )
        return result.data or []

    def get_template(self, template_id: str, *, include_items: bool = True) -> Optional[Dict]:
        template_result = (
            self.client.table("prep_templates")
            .select("*")
            .eq("account_id", self.account_id)
            .eq("id", template_id)
            .limit(1)
            .execute()
        )
        if not template_result.data:
            return None

        template = template_result.data[0]
        if include_items:
            template["items"] = self.list_template_items(template_id)
        return template

    def create_template(self, *, name: str, description: Optional[str], created_by: Optional[str]) -> Dict:
        payload = {
            "account_id": self.account_id,
            "name": name,
            "description": description,
            "created_by": created_by,
            "updated_by": created_by,
        }
        result = self.client.table("prep_templates").insert(payload).execute()
        logger.info("Prep template created: account=%s template=%s", self.account_id, result.data[0]["id"])
        return result.data[0]

    def update_template(
        self,
        template_id: str,
        *,
        name: Optional[str] = None,
        description: Optional[str] = None,
        updated_by: Optional[str] = None,
    ) -> Dict:
        update_payload: Dict[str, object] = {}
        if name is not None:
            update_payload["name"] = name
        if description is not None:
            update_payload["description"] = description
        if updated_by is not None:
            update_payload["updated_by"] = updated_by
        if not update_payload:
            return self.get_template(template_id) or {}
        result = (
            self.client.table("prep_templates")
            .update(update_payload)
            .eq("account_id", self.account_id)
            .eq("id", template_id)
            .execute()
        )
        if not result.data:
            raise ValueError("Template not found")
        return result.data[0]

    def delete_template(self, template_id: str) -> None:
        self.client.table("prep_templates").delete().eq("account_id", self.account_id).eq("id", template_id).execute()

    # ------------------------------------------------------------------#
    # Template items
    # ------------------------------------------------------------------#
    def list_template_items(self, template_id: str) -> List[Dict]:
        result = (
            self.client.table("prep_template_items")
            .select("*")
            .eq("account_id", self.account_id)
            .eq("template_id", template_id)
            .order("display_order")
            .execute()
        )
        return result.data or []

    def add_template_item(
        self,
        template_id: str,
        *,
        name: str,
        menu_item_id: Optional[str] = None,
        default_par: Optional[float] = None,
        default_on_hand: Optional[float] = None,
        notes: Optional[str] = None,
        display_order: Optional[int] = None,
    ) -> Dict:
        payload = {
            "account_id": self.account_id,
            "template_id": template_id,
            "name": name,
            "menu_item_id": menu_item_id,
            "default_par": default_par if default_par is not None else 0,
            "default_on_hand": default_on_hand if default_on_hand is not None else 0,
            "notes": notes,
            "display_order": display_order if display_order is not None else 0,
        }
        result = self.client.table("prep_template_items").insert(payload).execute()
        return result.data[0]

    def update_template_item(
        self,
        item_id: str,
        *,
        name: Optional[str] = None,
        menu_item_id: Optional[str] = None,
        default_par: Optional[float] = None,
        default_on_hand: Optional[float] = None,
        notes: Optional[str] = None,
        display_order: Optional[int] = None,
    ) -> Dict:
        payload: Dict[str, object] = {}
        if name is not None:
            payload["name"] = name
        if menu_item_id is not None:
            payload["menu_item_id"] = menu_item_id
        if default_par is not None:
            payload["default_par"] = default_par
        if default_on_hand is not None:
            payload["default_on_hand"] = default_on_hand
        if notes is not None:
            payload["notes"] = notes
        if display_order is not None:
            payload["display_order"] = display_order
        if not payload:
            return self._get_template_item(item_id) or {}

        result = (
            self.client.table("prep_template_items")
            .update(payload)
            .eq("account_id", self.account_id)
            .eq("id", item_id)
            .execute()
        )
        if not result.data:
            raise ValueError("Template item not found")
        return result.data[0]

    def delete_template_item(self, item_id: str) -> None:
        self.client.table("prep_template_items").delete().eq("account_id", self.account_id).eq("id", item_id).execute()

    # ------------------------------------------------------------------#
    # Menu auto-import
    # ------------------------------------------------------------------#
    def import_menu_items(self, template_id: str, menu_item_ids: Iterable[str], *, created_by: Optional[str]) -> List[Dict]:
        """Import menu items into the template as prep template items."""
        ids = list(menu_item_ids)
        if not ids:
            return []

        menu_items = (
            self.client.table("menu_items")
            .select("id, item_name")
            .eq("user_id", self.account_id)
            .in_("id", ids)
            .execute()
        )
        if not menu_items.data:
            return []

        existing_items = self.list_template_items(template_id)
        existing_menu_ids = {item.get("menu_item_id") for item in existing_items}

        payloads = []
        order_offset = len(existing_items)
        for index, menu_item in enumerate(menu_items.data):
            if menu_item["id"] in existing_menu_ids:
                continue
            payloads.append(
                {
                    "account_id": self.account_id,
                    "template_id": template_id,
                    "name": menu_item["item_name"],
                    "menu_item_id": menu_item["id"],
                    "default_par": 0,
                    "default_on_hand": 0,
                    "display_order": order_offset + index,
                }
            )

        if not payloads:
            return []

        result = self.client.table("prep_template_items").insert(payloads).execute()
        logger.info(
            "Imported %s menu items into prep template %s (account=%s)",
            len(result.data or []),
            template_id,
            self.account_id,
        )
        return result.data or []

    # ------------------------------------------------------------------#
    # Private helpers
    # ------------------------------------------------------------------#
    def _get_template_item(self, item_id: str) -> Optional[Dict]:
        result = (
            self.client.table("prep_template_items")
            .select("*")
            .eq("account_id", self.account_id)
            .eq("id", item_id)
            .limit(1)
            .execute()
        )
        return result.data[0] if result.data else None

