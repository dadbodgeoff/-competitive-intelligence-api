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

    model_config = {
        "json_schema_extra": {
            "example": {
                "email": "user@example.com",
                "password": "password123",
                "first_name": "John",
                "last_name": "Doe"
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
