from __future__ import annotations

from datetime import datetime
from typing import Dict, Optional

from services.prep.day_service import PrepDayService


class PrepAssignmentService:
    """Handle user assignment and completion workflow for prep day items."""

    def __init__(self, *, account_id: str) -> None:
        self.day_service = PrepDayService(account_id=account_id)

    def assign_item(self, item_id: str, *, assigned_user_id: str, assigned_by: Optional[str]) -> Dict:
        return self.day_service.assign_item(item_id, assigned_user_id=assigned_user_id, assigned_by=assigned_by)

    def complete_item(
        self,
        item_id: str,
        *,
        completed_by: str,
        completion_note: Optional[str] = None,
        completed_at: Optional[datetime] = None,
    ) -> Dict:
        return self.day_service.mark_complete(
            item_id,
            completed_by=completed_by,
            completion_note=completion_note,
            completed_at=completed_at,
        )

    def reopen_item(self, item_id: str, *, reopened_by: str) -> Dict:
        return self.day_service.reopen_item(item_id, reopened_by=reopened_by)

