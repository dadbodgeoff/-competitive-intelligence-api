"""
Account service helpers.

Provides convenience methods for resolving a user's primary account and checking
membership/roles when performing account-scoped operations.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple

from database.supabase_client import get_supabase_service_client

logger = logging.getLogger(__name__)


class AccountService:
    """Helper for account and membership lookups."""

    def __init__(self) -> None:
        self.client = get_supabase_service_client()

    def get_primary_account_id(self, user_id: str) -> str:
        """Return the user's primary account id or raise if none found."""
        result = (
            self.client.table("users")
            .select("primary_account_id")
            .eq("id", user_id)
            .limit(1)
            .execute()
        )

        if not result.data:
            raise ValueError(f"User {user_id} has no profile record")

        account_id = result.data[0].get("primary_account_id")
        if account_id:
            return account_id

        membership = (
            self.client.table("account_members")
            .select("account_id")
            .eq("user_id", user_id)
            .eq("status", "active")
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )

        if membership.data:
            account_id = membership.data[0]["account_id"]
            logger.warning(
                "User %s missing primary_account_id; defaulting to membership %s",
                user_id,
                account_id,
            )
            return account_id

        raise ValueError(f"User {user_id} is not associated with an account")

    def ensure_active_member(self, account_id: str, user_id: str) -> bool:
        """Return True if the user is an active member of the account."""
        membership = (
            self.client.table("account_members")
            .select("role")
            .eq("account_id", account_id)
            .eq("user_id", user_id)
            .eq("status", "active")
            .limit(1)
            .execute()
        )
        return bool(membership.data)

    def get_member_role(self, account_id: str, user_id: str) -> Optional[str]:
        """Return the member's role for the account."""
        membership = (
            self.client.table("account_members")
            .select("role")
            .eq("account_id", account_id)
            .eq("user_id", user_id)
            .eq("status", "active")
            .limit(1)
            .execute()
        )
        if membership.data:
            return membership.data[0]["role"]
        return None

    def list_members_with_compensation(self, account_id: str) -> List[Dict]:
        """Return active members and their current compensation."""
        members_result = (
            self.client.table("account_members")
            .select("user_id, role, status")
            .eq("account_id", account_id)
            .eq("status", "active")
            .execute()
        )
        members = members_result.data or []
        user_ids = [member["user_id"] for member in members]
        public_profiles: Dict[str, Dict] = {}
        auth_profiles: Dict[str, Dict] = {}
        if user_ids:
            public_result = (
                self.client.table("users")
                .select("id, first_name, last_name, subscription_tier")
                .in_("id", user_ids)
                .execute()
            )
            for profile in public_result.data or []:
                public_profiles[profile["id"]] = {
                    "first_name": profile.get("first_name"),
                    "last_name": profile.get("last_name"),
                    "subscription_tier": profile.get("subscription_tier"),
                }

            auth_result = (
                self.client.schema("auth")
                .table("users")
                .select("id, email, raw_user_meta_data")
                .in_("id", user_ids)
                .execute()
            )
            for record in auth_result.data or []:
                auth_profiles[record["id"]] = {
                    "id": record.get("id"),
                    "email": record.get("email"),
                    "raw_user_meta_data": record.get("raw_user_meta_data"),
                }

        compensation_result = (
            self.client.table("account_member_compensation")
            .select("user_id, rate_cents, currency, rate_type, effective_at, ends_at")
            .eq("account_id", account_id)
            .is_("ends_at", None)
            .execute()
        )
        comp_by_user = {
            row["user_id"]: row for row in (compensation_result.data or [])
        }
        for member in members:
            user_id = member["user_id"]
            auth_entry = auth_profiles.get(user_id, {})
            public_entry = public_profiles.get(user_id, {})
            raw_meta = auth_entry.get("raw_user_meta_data") or {}
            member["auth_users"] = {
                "id": auth_entry.get("id"),
                "email": auth_entry.get("email"),
                "raw_user_meta_data": raw_meta,
                "first_name": public_entry.get("first_name") or raw_meta.get("first_name"),
                "last_name": public_entry.get("last_name") or raw_meta.get("last_name"),
            }
            member["profile"] = public_entry
            member["compensation"] = comp_by_user.get(member["user_id"])
        return members

    # ------------------------------------------------------------------#
    # Invitation helpers
    # ------------------------------------------------------------------#
    @staticmethod
    def _normalize_email(email: Optional[str]) -> Optional[str]:
        if email is None:
            return None
        return email.strip().lower()

    @staticmethod
    def _parse_timestamp(value: Optional[str]) -> Optional[datetime]:
        if not value:
            return None
        try:
            return datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError:
            return None

    def get_invitation_by_token(self, token: str) -> Optional[Dict]:
        if not token:
            return None

        result = (
            self.client.table("account_invitations")
            .select(
                "id, account_id, email, role, status, expires_at, invited_by, invited_at, "
                "accepted_by, accepted_at, accounts(name, plan)"
            )
            .eq("token", token)
            .limit(1)
            .execute()
        )
        invitations = result.data or []
        if not invitations:
            return None

        invitation = invitations[0]
        account = invitation.get("accounts") or {}
        invitation["account_name"] = account.get("name")
        invitation["account_plan"] = account.get("plan")
        return invitation

    def ensure_invitation_is_pending(self, invitation: Dict) -> None:
        status = invitation.get("status")
        if status != "pending":
            raise ValueError("Invitation is no longer available")

        expires_at = self._parse_timestamp(invitation.get("expires_at"))
        if expires_at and expires_at < datetime.now(timezone.utc):
            raise ValueError("Invitation has expired")

    def activate_invitation(self, invitation: Dict, user_id: str) -> Tuple[str, str]:
        account_id = invitation["account_id"]
        role = invitation.get("role", "member")
        now = datetime.now(timezone.utc).isoformat()

        # Upsert account membership
        self.client.table("account_members").upsert(
            {
                "account_id": account_id,
                "user_id": user_id,
                "role": role,
                "status": "active",
                "invited_by": invitation.get("invited_by"),
                "invited_at": invitation.get("invited_at"),
                "joined_at": now,
            }
        ).execute()

        # Update invitation status
        self.client.table("account_invitations").update(
            {
                "status": "accepted",
                "accepted_by": user_id,
                "accepted_at": now,
            }
        ).eq("id", invitation["id"]).execute()

        # Update user profile with account context
        self.client.table("users").update(
            {
                "primary_account_id": account_id,
                "default_account_role": role,
            }
        ).eq("id", user_id).execute()

        return account_id, role

    def activate_invitation_by_token(self, token: str, *, user_id: str, email: str) -> Tuple[str, str]:
        invitation = self.get_invitation_by_token(token)
        if not invitation:
            raise ValueError("Invitation not found")

        self.ensure_invitation_is_pending(invitation)

        invite_email = self._normalize_email(invitation.get("email"))
        user_email = self._normalize_email(email)
        if invite_email != user_email:
            raise ValueError("Invitation email does not match the account email")

        return self.activate_invitation(invitation, user_id)

    def activate_pending_invitation_by_email(self, email: str, user_id: str) -> Optional[Tuple[str, str]]:
        normalized = self._normalize_email(email)
        if not normalized:
            return None

        def _fetch_by_email(value: str):
            return (
                self.client.table("account_invitations")
                .select(
                    "id, account_id, email, role, status, expires_at, invited_by, invited_at"
                )
                .eq("email", value)
                .eq("status", "pending")
                .order("invited_at", desc=True)
                .limit(1)
                .execute()
            )

        result = _fetch_by_email(normalized)
        invitations = result.data or []
        if not invitations and normalized != email:
            result = _fetch_by_email(email)
            invitations = result.data or []

        if not invitations:
            return None

        invitation = invitations[0]
        self.ensure_invitation_is_pending(invitation)
        return self.activate_invitation(invitation, user_id)

    def get_account_module_access(self, account_id: str) -> List[Dict]:
        result = (
            self.client.table("account_module_access")
            .select("module_slug, can_access")
            .eq("account_id", account_id)
            .execute()
        )
        return result.data or []


