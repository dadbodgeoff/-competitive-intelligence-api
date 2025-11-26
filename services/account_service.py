"""
Account service helpers.

Provides convenience methods for resolving a user's primary account and checking
membership/roles when performing account-scoped operations.
"""
from __future__ import annotations

import hashlib
import hmac
import logging
import os
import secrets
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple

from database.supabase_client import get_supabase_service_client

logger = logging.getLogger(__name__)


class AccountService:
    """Helper for account and membership lookups."""

    PIN_LENGTH = 4
    PIN_HASH_ITERATIONS = 390_000
    PIN_SALT_BYTES = 16
    PIN_DEFAULT_PEPPER = "restiq-clock-pin-pepper"

    def __init__(self) -> None:
        self.client = get_supabase_service_client()
        self._pin_pepper = os.getenv("CLOCK_PIN_PEPPER", self.PIN_DEFAULT_PEPPER)
        self.auth_admin = self._get_auth_admin()

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
                .select("id, first_name, last_name, subscription_tier, clock_pin_updated_at")
                .in_("id", user_ids)
                .execute()
            )
            for profile in public_result.data or []:
                public_profiles[profile["id"]] = {
                    "first_name": profile.get("first_name"),
                    "last_name": profile.get("last_name"),
                    "subscription_tier": profile.get("subscription_tier"),
                    "clock_pin_updated_at": profile.get("clock_pin_updated_at"),
                }

            auth_profiles = self._fetch_auth_profiles(user_ids)

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
            member["clock_pin"] = {
                "is_set": bool(public_entry.get("clock_pin_updated_at")),
                "updated_at": public_entry.get("clock_pin_updated_at"),
            }
        return members

    # ------------------------------------------------------------------#
    # Clock-in PIN helpers
    # ------------------------------------------------------------------#
    def set_clock_pin(self, user_id: str, pin: str) -> str:
        normalized = self._normalize_pin(pin)
        pin_hash, salt_hex = self._derive_pin_hash(normalized)
        lookup_hash = self._build_lookup_hash(normalized)
        timestamp = datetime.now(timezone.utc).isoformat()
        self.client.table("users").update(
            {
                "clock_pin_hash": pin_hash,
                "clock_pin_salt": salt_hex,
                "clock_pin_lookup": lookup_hash,
                "clock_pin_updated_at": timestamp,
                "clock_pin_failed_attempts": 0,
            }
        ).eq("id", user_id).execute()
        return timestamp

    def clear_clock_pin(self, user_id: str) -> None:
        self.client.table("users").update(
            {
                "clock_pin_hash": None,
                "clock_pin_salt": None,
                "clock_pin_lookup": None,
                "clock_pin_updated_at": None,
                "clock_pin_failed_attempts": 0,
            }
        ).eq("id", user_id).execute()

    def lookup_user_by_pin(self, pin: str) -> Optional[Dict]:
        """Global PIN lookup (legacy - may have collisions across accounts)."""
        normalized = self._normalize_pin(pin)
        lookup_hash = self._build_lookup_hash(normalized)
        result = (
            self.client.table("users")
            .select(
                "id, primary_account_id, default_account_role, first_name, last_name, clock_pin_hash, clock_pin_salt, clock_pin_updated_at"
            )
            .eq("clock_pin_lookup", lookup_hash)
            .execute()
        )

        for row in result.data or []:
            if self._verify_pin_hash(normalized, row.get("clock_pin_hash"), row.get("clock_pin_salt")):
                self.client.table("users").update({"clock_pin_failed_attempts": 0}).eq("id", row["id"]).execute()
                row.pop("clock_pin_hash", None)
                row.pop("clock_pin_salt", None)
                return row
        return None

    def lookup_user_by_pin_in_account(self, pin: str, account_id: str) -> Optional[Dict]:
        """Look up user by PIN, scoped to a specific account (no collisions)."""
        normalized = self._normalize_pin(pin)
        lookup_hash = self._build_lookup_hash(normalized)
        
        # Get all members of this account
        members_result = (
            self.client.table("account_members")
            .select("user_id")
            .eq("account_id", account_id)
            .eq("status", "active")
            .execute()
        )
        member_user_ids = [m["user_id"] for m in (members_result.data or [])]
        
        if not member_user_ids:
            return None
        
        # Look up users with matching PIN hash who are members of this account
        result = (
            self.client.table("users")
            .select(
                "id, primary_account_id, default_account_role, first_name, last_name, clock_pin_hash, clock_pin_salt, clock_pin_updated_at"
            )
            .eq("clock_pin_lookup", lookup_hash)
            .in_("id", member_user_ids)
            .execute()
        )
        
        for row in result.data or []:
            if self._verify_pin_hash(normalized, row.get("clock_pin_hash"), row.get("clock_pin_salt")):
                self.client.table("users").update({"clock_pin_failed_attempts": 0}).eq("id", row["id"]).execute()
                row.pop("clock_pin_hash", None)
                row.pop("clock_pin_salt", None)
                return row
        return None

    def get_account_by_location_code(self, location_code: str) -> Optional[Dict]:
        """Look up an account by its 4-digit location code."""
        if not location_code or len(location_code) != 4 or not location_code.isdigit():
            return None
        
        result = (
            self.client.table("accounts")
            .select("id, name, plan, clock_location_code")
            .eq("clock_location_code", location_code)
            .limit(1)
            .execute()
        )
        
        return result.data[0] if result.data else None

    def get_account_location_code(self, account_id: str) -> Optional[str]:
        """Get the location code for an account."""
        result = (
            self.client.table("accounts")
            .select("clock_location_code")
            .eq("id", account_id)
            .limit(1)
            .execute()
        )
        
        if result.data:
            return result.data[0].get("clock_location_code")
        return None

    def _normalize_pin(self, pin: Optional[str]) -> str:
        if not pin:
            raise ValueError("Clock PIN is required")
        cleaned = pin.strip()
        if len(cleaned) != self.PIN_LENGTH or not cleaned.isdigit():
            raise ValueError(f"Clock PIN must be exactly {self.PIN_LENGTH} digits")
        return cleaned

    def _build_lookup_hash(self, pin: str) -> str:
        payload = f"{pin}:{self._pin_pepper}".encode("utf-8")
        return hashlib.sha256(payload).hexdigest()

    def _derive_pin_hash(self, pin: str, *, salt_hex: Optional[str] = None) -> Tuple[str, str]:
        payload = f"{pin}:{self._pin_pepper}".encode("utf-8")
        if salt_hex:
            salt_bytes = bytes.fromhex(salt_hex)
        else:
            salt_bytes = secrets.token_bytes(self.PIN_SALT_BYTES)
        digest = hashlib.pbkdf2_hmac("sha256", payload, salt_bytes, self.PIN_HASH_ITERATIONS)
        return digest.hex(), salt_bytes.hex()

    def _verify_pin_hash(self, pin: str, expected_hash: Optional[str], salt_hex: Optional[str]) -> bool:
        if not expected_hash or not salt_hex:
            return False
        computed, _ = self._derive_pin_hash(pin, salt_hex=salt_hex)
        return hmac.compare_digest(computed, expected_hash)

    def _fetch_auth_profiles(self, user_ids: List[str]) -> Dict[str, Dict]:
        """Fetch auth profile details via admin API without mutating table schema."""
        profiles: Dict[str, Dict] = {}
        if not self.auth_admin:
            logger.warning("Auth admin client unavailable; skipping auth profile fetch")
            return profiles

        for user_id in user_ids:
            try:
                response = self.auth_admin.get_user_by_id(user_id)
            except Exception as exc:
                logger.warning("Failed to fetch auth profile for %s: %s", user_id, exc)
                continue

            user = getattr(response, "user", None)
            if not user:
                continue

            profiles[user_id] = {
                "id": getattr(user, "id", user_id),
                "email": getattr(user, "email", None),
                "raw_user_meta_data": getattr(user, "user_metadata", {}) or {},
            }
        return profiles

    def _get_auth_admin(self):
        """Return the Supabase auth admin helper, handling mock clients."""
        admin_attr = getattr(self.client.auth, "admin", None)
        if callable(admin_attr):
            try:
                return admin_attr()
            except TypeError:
                # Supabase python client exposes admin as property; fall back to attribute access
                pass
        return admin_attr

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


