from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum

class UserRegister(BaseModel):
    email: str = Field(..., description="User email address")
    password: str = Field(..., description="User password")
    first_name: Optional[str] = Field(None, description="First name")
    last_name: Optional[str] = Field(None, description="Last name")
    invite_token: Optional[str] = Field(
        None, description="Optional invitation token when joining an existing account"
    )
    terms_accepted: bool = Field(..., description="User agreed to the Terms of Service")
    terms_version: str = Field(..., description="Version of the Terms of Service accepted")
    terms_accepted_at: datetime = Field(..., description="Timestamp when terms were accepted")
    privacy_accepted: bool = Field(..., description="User agreed to the Privacy Policy")
    privacy_version: str = Field(..., description="Version of the Privacy Policy accepted")
    privacy_accepted_at: datetime = Field(..., description="Timestamp when privacy policy was accepted")

    model_config = {
        "json_schema_extra": {
            "example": {
                "email": "user@example.com",
                "password": "password123",
                "first_name": "John",
                "last_name": "Doe",
                "terms_accepted": True,
                "terms_version": "2025-11-20",
                "terms_accepted_at": "2025-11-22T15:30:00Z",
                "privacy_accepted": True,
                "privacy_version": "2025-11-20",
                "privacy_accepted_at": "2025-11-22T15:30:00Z",
            }
        }
    }

class UserLogin(BaseModel):
    email: str = Field(..., description="User email address")
    password: str = Field(..., description="User password")
    invite_token: Optional[str] = Field(
        None, description="Optional invitation token to activate an account invite"
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "email": "user@example.com",
                "password": "password123"
            }
        }
    }

class ModuleAccess(BaseModel):
    module_slug: str
    can_access: bool


class UserResponse(BaseModel):
    id: str = Field(..., description="User ID")
    email: str = Field(..., description="User email")
    first_name: Optional[str] = Field(None, description="First name")
    last_name: Optional[str] = Field(None, description="Last name")
    subscription_tier: str = Field("free", description="Subscription tier")
    created_at: str = Field(..., description="Creation timestamp")
    account_id: str = Field(..., description="Primary account ID")
    account_role: str = Field(..., description="Role within the account")
    module_access: List[ModuleAccess] = Field(default_factory=list, description="Module access flags")

class TokenResponse(BaseModel):
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field("bearer", description="Token type")
    expires_in: int = Field(86400, description="Token expiration in seconds")

class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(..., description="Refresh token")
