from datetime import datetime, timedelta, timezone
import logging
import os
import secrets
from decimal import Decimal, ROUND_HALF_UP
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field, EmailStr

from api.middleware.auth import AuthenticatedUser, get_current_membership
from database.supabase_client import get_supabase_service_client
from services.account_service import AccountService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/accounts", tags=["Accounts"])


class ModuleToggleRequest(BaseModel):
    module_slug: str = Field(..., description="Module slug to update")
    can_access: bool = Field(..., description="Whether the module should be enabled")


class InviteMemberRequest(BaseModel):
    email: EmailStr
    role: str = Field("member", pattern="^(owner|admin|member)$")
    expires_in_days: int = Field(7, ge=1, le=30)
    send_email: bool = Field(True, description="Whether to send Supabase invite email")


class CompensationRequest(BaseModel):
    user_id: str = Field(..., description="User to assign compensation to")
    rate: Decimal = Field(..., description="Rate amount in account currency (supports decimals)")
    currency: str = Field("USD", min_length=3, max_length=3)
    rate_type: str = Field("hourly", pattern="^(hourly|salary|contract)$")
    effective_at: Optional[datetime] = None
    notes: Optional[str] = None


class ClockPinRequest(BaseModel):
    pin: str = Field(..., min_length=4, max_length=4, pattern=r"^\d{4}$")


class MemberModuleAccessRequest(BaseModel):
    user_id: str = Field(..., description="User to update module access for")
    module_slug: str = Field(..., description="Module slug to update")
    can_access: bool = Field(..., description="Whether the member can access this module")
    notes: Optional[str] = Field(None, description="Optional reason for the change")


class BulkMemberModuleAccessRequest(BaseModel):
    user_id: str = Field(..., description="User to update module access for")
    modules: list[dict] = Field(..., description="List of {module_slug, can_access} objects")


@router.get("/current")
async def get_current_account_summary(
    auth: AuthenticatedUser = Depends(get_current_membership)
):
    service_client = get_supabase_service_client()
    account_id = auth.account_id

    try:
        account_response = service_client.table("accounts").select(
            "id, name, plan, trial_ends_at, created_at, updated_at, clock_location_code"
        ).eq("id", account_id).limit(1).execute()

        if not account_response.data:
            raise HTTPException(status_code=404, detail="Account not found")

        account = account_response.data[0]
        
        # Get the owner's subscription_tier as the effective plan
        # This is what Stripe sets when a user subscribes
        owner_tier_response = service_client.table("account_members").select(
            "user_id"
        ).eq("account_id", account_id).eq("role", "owner").limit(1).execute()
        
        if owner_tier_response.data:
            owner_id = owner_tier_response.data[0]["user_id"]
            owner_profile = service_client.table("users").select(
                "subscription_tier"
            ).eq("id", owner_id).limit(1).execute()
            
            if owner_profile.data and owner_profile.data[0].get("subscription_tier"):
                account["plan"] = owner_profile.data[0]["subscription_tier"]

        modules_response = service_client.table("account_module_access").select(
            "module_slug, can_access, granted_at, granted_by, revoked_at"
        ).eq("account_id", account_id).order("module_slug").execute()
        modules = modules_response.data or []

        members_response = service_client.table("account_members").select(
            "user_id, role, status, invited_by, invited_at, joined_at"
        ).eq("account_id", account_id).order("joined_at", desc=True).execute()
        members = members_response.data or []

        # Hydrate member profiles
        member_ids = [member["user_id"] for member in members]
        profiles = {}
        if member_ids:
            profile_response = service_client.table("users").select(
                "id, first_name, last_name, subscription_tier, clock_pin_updated_at"
            ).in_("id", member_ids).execute()
            for profile in profile_response.data or []:
                profiles[profile["id"]] = profile

        for member in members:
            profile = profiles.get(member["user_id"], {})
            member["profile"] = profile
            # Add clock_pin status for each member
            member["clock_pin"] = {
                "is_set": bool(profile.get("clock_pin_updated_at")),
                "updated_at": profile.get("clock_pin_updated_at"),
            }

        invites_response = service_client.table("account_invitations").select(
            "id, email, role, status, token, invited_by, invited_at, expires_at, accepted_at"
        ).eq("account_id", account_id).order("invited_at", desc=True).execute()
        invitations = invites_response.data or []

        compensation_response = service_client.table("account_member_compensation").select(
            "user_id, effective_at, ends_at, rate_cents, currency, rate_type, notes, set_by"
        ).eq("account_id", account_id).order("user_id, effective_at", desc=True).execute()
        compensation = compensation_response.data or []

        return {
            "account": account,
            "modules": modules,
            "members": members,
            "invitations": invitations,
            "compensation": compensation
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Failed to load account summary for %s: %s", account_id, exc, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to load account summary")


@router.post("/modules/toggle")
async def toggle_module_access(
    payload: ModuleToggleRequest,
    auth: AuthenticatedUser = Depends(get_current_membership)
):
    if auth.role != "owner":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only owners can manage modules")

    service_client = get_supabase_service_client()
    timestamp = datetime.now(timezone.utc).isoformat()

    try:
        module_exists = service_client.table("modules").select("slug").eq("slug", payload.module_slug).limit(1).execute()
        if not module_exists.data:
            raise HTTPException(status_code=404, detail="Module not found")

        upsert_payload = {
            "account_id": auth.account_id,
            "module_slug": payload.module_slug,
            "can_access": payload.can_access,
            "granted_by": auth.id,
            "granted_at": timestamp,
            "revoked_at": timestamp if not payload.can_access else None
        }

        service_client.table("account_module_access").upsert(upsert_payload).execute()

        return {"success": True, "module_slug": payload.module_slug, "can_access": payload.can_access}
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Failed to toggle module %s for account %s: %s", payload.module_slug, auth.account_id, exc, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to update module access")


@router.post("/invitations")
async def invite_member(
    payload: InviteMemberRequest,
    auth: AuthenticatedUser = Depends(get_current_membership)
):
    if auth.role != "owner":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only owners can invite members")

    service_client = get_supabase_service_client()
    token = secrets.token_urlsafe(32)
    invited_at = datetime.now(timezone.utc)
    expires_at = invited_at + timedelta(days=payload.expires_in_days)
    normalized_email = payload.email.strip().lower()

    try:
        service_client.table("account_invitations").insert({
            "account_id": auth.account_id,
            "email": normalized_email,
            "role": payload.role,
            "token": token,
            "expires_at": expires_at.isoformat(),
            "status": "pending",
            "invited_by": auth.id,
            "invited_at": invited_at.isoformat()
        }).execute()
    except Exception as exc:
        logger.error("Failed to record invitation for %s: %s", payload.email, exc, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to create invitation")

    if payload.send_email:
        try:
            redirect_url = os.getenv("APP_INVITE_REDIRECT_URL", "https://restaurantiq.us/accept-invite")
            full_redirect = f"{redirect_url}?token={token}"
            service_client.auth.admin.invite_user_by_email(
                normalized_email,
                {
                    "data": {
                        "account_id": auth.account_id,
                        "account_role": payload.role,
                        "account_invite_token": token
                    },
                    "redirect_to": full_redirect
                }
            )
        except Exception as exc:
            logger.warning("Invite email send failed for %s: %s", payload.email, exc)

    return {
        "success": True,
        "token": token,
        "expires_at": expires_at.isoformat()
    }


@router.get("/invitations/validate")
async def validate_invitation(token: str = Query(..., description="Invitation token to validate")):
    service = AccountService()
    invitation = service.get_invitation_by_token(token)
    if not invitation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invitation not found")

    response = {
        "token": token,
        "account_id": invitation.get("account_id"),
        "account_name": invitation.get("account_name"),
        "account_plan": invitation.get("account_plan"),
        "email": invitation.get("email"),
        "role": invitation.get("role"),
        "status": invitation.get("status"),
        "expires_at": invitation.get("expires_at"),
        "accepted_at": invitation.get("accepted_at"),
    }

    try:
        service.ensure_invitation_is_pending(invitation)
        response["is_expired"] = False
    except ValueError as exc:
        response["is_expired"] = True
        response["error"] = str(exc)
    finally:
        response["is_valid"] = response.get("status") == "pending" and not response.get("is_expired", False)

    return response


@router.post("/members/compensation")
async def assign_compensation(
    payload: CompensationRequest,
    auth: AuthenticatedUser = Depends(get_current_membership)
):
    if auth.role != "owner":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only owners can manage compensation")

    service_client = get_supabase_service_client()

    try:
        member_lookup = service_client.table("account_members").select(
            "status"
        ).eq("account_id", auth.account_id).eq("user_id", payload.user_id).limit(1).execute()

        if not member_lookup.data or member_lookup.data[0].get("status") != "active":
            raise HTTPException(status_code=404, detail="Member not found or inactive")

        rate_decimal = payload.rate.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        rate_cents = int(rate_decimal * 100)
        effective_at = payload.effective_at or datetime.now(timezone.utc)

        # Close any existing active compensation
        service_client.table("account_member_compensation").update({
            "ends_at": effective_at.isoformat(),
            "set_by": auth.id
        }).eq("account_id", auth.account_id).eq("user_id", payload.user_id).is_("ends_at", None).execute()

        service_client.table("account_member_compensation").insert({
            "account_id": auth.account_id,
            "user_id": payload.user_id,
            "effective_at": effective_at.isoformat(),
            "rate_cents": rate_cents,
            "currency": payload.currency,
            "rate_type": payload.rate_type,
            "notes": payload.notes,
            "set_by": auth.id
        }).execute()

        return {"success": True}
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Failed to assign compensation for %s: %s", payload.user_id, exc, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to assign compensation")


@router.get("/members-with-comp")
async def list_members_with_comp(
    auth: AuthenticatedUser = Depends(get_current_membership)
):
    service = AccountService()
    try:
        members = service.list_members_with_compensation(auth.account_id)
        return {"members": members}
    except Exception as exc:  # pragma: no cover - best effort
        logger.exception("Failed to load members with compensation: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to load members")


@router.get("/clock-pin")
async def get_clock_pin_status(
    auth: AuthenticatedUser = Depends(get_current_membership),
):
    service_client = get_supabase_service_client()
    record = (
        service_client.table("users")
        .select("clock_pin_updated_at")
        .eq("id", auth.id)
        .limit(1)
        .execute()
    ).data
    updated_at = record[0].get("clock_pin_updated_at") if record else None
    return {"has_pin": bool(updated_at), "updated_at": updated_at}


@router.put("/clock-pin")
async def set_clock_pin(
    payload: ClockPinRequest,
    auth: AuthenticatedUser = Depends(get_current_membership),
):
    service = AccountService()
    try:
        updated_at = service.set_clock_pin(auth.id, payload.pin)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return {"has_pin": True, "updated_at": updated_at}


@router.delete("/clock-pin")
async def clear_clock_pin(
    auth: AuthenticatedUser = Depends(get_current_membership),
):
    service = AccountService()
    service.clear_clock_pin(auth.id)
    return {"has_pin": False, "updated_at": None}



# ============================================================================
# MEMBER MODULE ACCESS & PERMISSIONS ENDPOINTS
# ============================================================================

@router.get("/members/{user_id}/modules")
async def get_member_module_access(
    user_id: str,
    auth: AuthenticatedUser = Depends(get_current_membership)
):
    """Get effective module access for a specific member."""
    service_client = get_supabase_service_client()
    
    try:
        # Verify the target user is a member of the account
        member_check = service_client.table("account_members").select(
            "role, status"
        ).eq("account_id", auth.account_id).eq("user_id", user_id).limit(1).execute()
        
        if not member_check.data or member_check.data[0].get("status") != "active":
            raise HTTPException(status_code=404, detail="Member not found or inactive")
        
        # Get all modules
        modules_response = service_client.table("modules").select(
            "slug, name, description"
        ).order("name").execute()
        modules = modules_response.data or []
        
        # Get account-level access
        account_access_response = service_client.table("account_module_access").select(
            "module_slug, can_access"
        ).eq("account_id", auth.account_id).execute()
        account_access = {row["module_slug"]: row["can_access"] for row in (account_access_response.data or [])}
        
        # Get member-level overrides
        member_access_response = service_client.table("member_module_access").select(
            "module_slug, can_access, granted_by, granted_at, notes"
        ).eq("account_id", auth.account_id).eq("user_id", user_id).execute()
        member_access = {row["module_slug"]: row for row in (member_access_response.data or [])}
        
        # Build effective access list
        result = []
        for module in modules:
            slug = module["slug"]
            member_override = member_access.get(slug)
            
            if member_override:
                effective_access = member_override["can_access"]
                access_source = "member"
            else:
                effective_access = account_access.get(slug, False)
                access_source = "account"
            
            result.append({
                "module_slug": slug,
                "module_name": module["name"],
                "module_description": module.get("description"),
                "can_access": effective_access,
                "access_source": access_source,
                "account_level_access": account_access.get(slug, False),
                "has_override": member_override is not None,
            })
        
        return {"user_id": user_id, "modules": result}
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Failed to get member module access for %s: %s", user_id, exc, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to get member module access")


@router.post("/members/modules")
async def set_member_module_access(
    payload: MemberModuleAccessRequest,
    auth: AuthenticatedUser = Depends(get_current_membership)
):
    """Set module access for a specific member (owner/admin only)."""
    if auth.role not in ("owner", "admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only owners and admins can manage member access")
    
    service_client = get_supabase_service_client()
    timestamp = datetime.now(timezone.utc).isoformat()
    
    try:
        # Verify target user is a member
        member_check = service_client.table("account_members").select(
            "role, status"
        ).eq("account_id", auth.account_id).eq("user_id", payload.user_id).limit(1).execute()
        
        if not member_check.data or member_check.data[0].get("status") != "active":
            raise HTTPException(status_code=404, detail="Member not found or inactive")
        
        # Verify module exists
        module_check = service_client.table("modules").select("slug").eq("slug", payload.module_slug).limit(1).execute()
        if not module_check.data:
            raise HTTPException(status_code=404, detail="Module not found")
        
        # Upsert member module access
        upsert_payload = {
            "account_id": auth.account_id,
            "user_id": payload.user_id,
            "module_slug": payload.module_slug,
            "can_access": payload.can_access,
            "granted_by": auth.id,
            "granted_at": timestamp,
            "revoked_at": timestamp if not payload.can_access else None,
            "notes": payload.notes,
        }
        
        service_client.table("member_module_access").upsert(upsert_payload).execute()
        
        return {"success": True, "user_id": payload.user_id, "module_slug": payload.module_slug, "can_access": payload.can_access}
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Failed to set member module access: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to update member module access")


@router.delete("/members/{user_id}/modules/{module_slug}")
async def clear_member_module_override(
    user_id: str,
    module_slug: str,
    auth: AuthenticatedUser = Depends(get_current_membership)
):
    """Remove a member-level module override, reverting to account-level access."""
    if auth.role not in ("owner", "admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only owners and admins can manage member access")
    
    service_client = get_supabase_service_client()
    
    try:
        service_client.table("member_module_access").delete().eq(
            "account_id", auth.account_id
        ).eq("user_id", user_id).eq("module_slug", module_slug).execute()
        
        return {"success": True, "message": "Override removed"}
    except Exception as exc:
        logger.error("Failed to clear member module override: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to clear override")


@router.get("/permissions/catalog")
async def get_permissions_catalog(
    auth: AuthenticatedUser = Depends(get_current_membership)
):
    """Get all available feature permissions grouped by module."""
    service_client = get_supabase_service_client()
    
    try:
        permissions_response = service_client.table("feature_permissions").select(
            "slug, module_slug, name, description, category, is_sensitive, default_for_owner, default_for_admin, default_for_member, sort_order"
        ).order("module_slug, sort_order").execute()
        
        # Group by module
        by_module = {}
        for perm in (permissions_response.data or []):
            module = perm["module_slug"] or "general"
            if module not in by_module:
                by_module[module] = []
            by_module[module].append(perm)
        
        return {"permissions": permissions_response.data or [], "by_module": by_module}
    except Exception as exc:
        logger.error("Failed to get permissions catalog: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to get permissions")


@router.get("/members/{user_id}/permissions")
async def get_member_permissions(
    user_id: str,
    auth: AuthenticatedUser = Depends(get_current_membership)
):
    """Get effective permissions for a specific member."""
    service_client = get_supabase_service_client()
    
    try:
        # Verify the target user is a member
        member_check = service_client.table("account_members").select(
            "role, status"
        ).eq("account_id", auth.account_id).eq("user_id", user_id).limit(1).execute()
        
        if not member_check.data or member_check.data[0].get("status") != "active":
            raise HTTPException(status_code=404, detail="Member not found or inactive")
        
        member_role = member_check.data[0]["role"]
        
        # Get all permissions
        permissions_response = service_client.table("feature_permissions").select(
            "slug, module_slug, name, description, category, is_sensitive, default_for_owner, default_for_admin, default_for_member, sort_order"
        ).order("module_slug, sort_order").execute()
        
        # Get member overrides
        overrides_response = service_client.table("member_feature_permissions").select(
            "permission_slug, is_granted, granted_by, granted_at, notes"
        ).eq("account_id", auth.account_id).eq("user_id", user_id).execute()
        overrides = {row["permission_slug"]: row for row in (overrides_response.data or [])}
        
        # Build effective permissions
        result = []
        for perm in (permissions_response.data or []):
            override = overrides.get(perm["slug"])
            
            # Determine default based on role
            if member_role == "owner":
                default_value = perm["default_for_owner"]
            elif member_role == "admin":
                default_value = perm["default_for_admin"]
            else:
                default_value = perm["default_for_member"]
            
            if override:
                effective_value = override["is_granted"]
                source = "override"
            else:
                effective_value = default_value
                source = "default"
            
            result.append({
                "permission_slug": perm["slug"],
                "permission_name": perm["name"],
                "description": perm["description"],
                "module_slug": perm["module_slug"],
                "category": perm["category"],
                "is_sensitive": perm["is_sensitive"],
                "is_granted": effective_value,
                "default_value": default_value,
                "has_override": override is not None,
                "source": source,
            })
        
        return {"user_id": user_id, "role": member_role, "permissions": result}
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Failed to get member permissions: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to get permissions")


class FeaturePermissionRequest(BaseModel):
    user_id: str = Field(..., description="User to update permission for")
    permission_slug: str = Field(..., description="Permission slug to update")
    is_granted: bool = Field(..., description="Whether to grant or deny the permission")
    notes: Optional[str] = Field(None, description="Optional reason for the change")


@router.post("/members/permissions")
async def set_member_permission(
    payload: FeaturePermissionRequest,
    auth: AuthenticatedUser = Depends(get_current_membership)
):
    """Set a feature permission for a specific member."""
    if auth.role not in ("owner", "admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only owners and admins can manage permissions")
    
    service_client = get_supabase_service_client()
    timestamp = datetime.now(timezone.utc).isoformat()
    
    try:
        # Verify target user is a member
        member_check = service_client.table("account_members").select(
            "role, status"
        ).eq("account_id", auth.account_id).eq("user_id", payload.user_id).limit(1).execute()
        
        if not member_check.data or member_check.data[0].get("status") != "active":
            raise HTTPException(status_code=404, detail="Member not found or inactive")
        
        # Verify permission exists
        perm_check = service_client.table("feature_permissions").select("slug").eq("slug", payload.permission_slug).limit(1).execute()
        if not perm_check.data:
            raise HTTPException(status_code=404, detail="Permission not found")
        
        # Upsert permission
        upsert_payload = {
            "account_id": auth.account_id,
            "user_id": payload.user_id,
            "permission_slug": payload.permission_slug,
            "is_granted": payload.is_granted,
            "granted_by": auth.id,
            "granted_at": timestamp,
            "notes": payload.notes,
        }
        
        service_client.table("member_feature_permissions").upsert(upsert_payload).execute()
        
        return {"success": True, "user_id": payload.user_id, "permission_slug": payload.permission_slug, "is_granted": payload.is_granted}
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Failed to set member permission: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to update permission")


@router.delete("/members/{user_id}/permissions/{permission_slug}")
async def clear_member_permission_override(
    user_id: str,
    permission_slug: str,
    auth: AuthenticatedUser = Depends(get_current_membership)
):
    """Remove a permission override, reverting to role-based default."""
    if auth.role not in ("owner", "admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only owners and admins can manage permissions")
    
    service_client = get_supabase_service_client()
    
    try:
        service_client.table("member_feature_permissions").delete().eq(
            "account_id", auth.account_id
        ).eq("user_id", user_id).eq("permission_slug", permission_slug).execute()
        
        return {"success": True, "message": "Override removed, using role default"}
    except Exception as exc:
        logger.error("Failed to clear permission override: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to clear override")


@router.get("/members/permissions/summary")
async def get_all_members_permissions_summary(
    auth: AuthenticatedUser = Depends(get_current_membership)
):
    """Get permissions summary for all members (for the settings grid view)."""
    service_client = get_supabase_service_client()
    
    try:
        # Get all active members
        members_response = service_client.table("account_members").select(
            "user_id, role, status"
        ).eq("account_id", auth.account_id).eq("status", "active").execute()
        members = members_response.data or []
        
        # Get all permissions
        permissions_response = service_client.table("feature_permissions").select(
            "slug, module_slug, name, category, is_sensitive, default_for_owner, default_for_admin, default_for_member"
        ).order("module_slug, sort_order").execute()
        permissions = permissions_response.data or []
        
        # Get all member overrides
        overrides_response = service_client.table("member_feature_permissions").select(
            "user_id, permission_slug, is_granted"
        ).eq("account_id", auth.account_id).execute()
        
        # Build lookup: user_id -> permission_slug -> is_granted
        overrides_by_user = {}
        for row in (overrides_response.data or []):
            user_id = row["user_id"]
            if user_id not in overrides_by_user:
                overrides_by_user[user_id] = {}
            overrides_by_user[user_id][row["permission_slug"]] = row["is_granted"]
        
        # Build summary for each member
        member_summaries = []
        for member in members:
            user_id = member["user_id"]
            role = member["role"]
            user_overrides = overrides_by_user.get(user_id, {})
            
            perm_summary = {}
            for perm in permissions:
                slug = perm["slug"]
                
                # Get default based on role
                if role == "owner":
                    default_val = perm["default_for_owner"]
                elif role == "admin":
                    default_val = perm["default_for_admin"]
                else:
                    default_val = perm["default_for_member"]
                
                if slug in user_overrides:
                    perm_summary[slug] = {
                        "is_granted": user_overrides[slug],
                        "source": "override"
                    }
                else:
                    perm_summary[slug] = {
                        "is_granted": default_val,
                        "source": "default"
                    }
            
            member_summaries.append({
                "user_id": user_id,
                "role": role,
                "permissions": perm_summary
            })
        
        return {
            "permissions": permissions,
            "members": member_summaries
        }
    except Exception as exc:
        logger.error("Failed to get permissions summary: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to get summary")
