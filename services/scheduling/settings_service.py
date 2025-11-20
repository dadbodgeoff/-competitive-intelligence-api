from __future__ import annotations

import logging
from datetime import datetime
from typing import Any, Dict, Optional

from database.supabase_client import get_supabase_service_client

logger = logging.getLogger(__name__)


class SchedulingSettingsService:
    """Manage scheduling settings for an account."""

    def __init__(self, account_id: str) -> None:
        self.account_id = account_id
        self.client = get_supabase_service_client()

    def get_settings(self) -> Dict[str, Any]:
        """Fetch settings, creating defaults if none exist."""
        result = (
            self.client.table("scheduling_settings")
            .select("*")
            .eq("account_id", self.account_id)
            .limit(1)
            .execute()
        )

        if result.data:
            return result.data[0]

        logger.info("[Scheduling] Creating default settings for account %s", self.account_id)
        defaults = {
            "account_id": self.account_id,
            "week_start_day": 0,
            "timezone": "UTC",
            "auto_publish": False,
            "default_shift_length_minutes": 480,
        }
        self.client.table("scheduling_settings").insert(defaults).execute()
        return defaults

    def update_settings(
        self,
        *,
        week_start_day: Optional[int] = None,
        timezone: Optional[str] = None,
        auto_publish: Optional[bool] = None,
        default_shift_length_minutes: Optional[int] = None,
    ) -> Dict[str, Any]:
        """Update scheduling settings for the account."""
        payload: Dict[str, Any] = {}
        if week_start_day is not None:
            if week_start_day < 0 or week_start_day > 6:
                raise ValueError("week_start_day must be between 0 (Monday) and 6 (Sunday)")
            payload["week_start_day"] = week_start_day
        if timezone is not None:
            payload["timezone"] = timezone
        if auto_publish is not None:
            payload["auto_publish"] = auto_publish
        if default_shift_length_minutes is not None:
            if default_shift_length_minutes <= 0:
                raise ValueError("default_shift_length_minutes must be positive")
            payload["default_shift_length_minutes"] = default_shift_length_minutes

        if not payload:
            return self.get_settings()

        payload["updated_at"] = datetime.utcnow().isoformat()

        self.client.table("scheduling_settings").upsert(
            {
                "account_id": self.account_id,
                **payload,
            }
        ).execute()

        return self.get_settings()

