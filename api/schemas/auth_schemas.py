from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum

class UserRegister(BaseModel):
    email: str = Field(..., description="User email address")
    password: str = Field(..., description="User password")
    first_name: Optional[str] = Field(None, description="First name")
    last_name: Optional[str] = Field(None, description="Last name")

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

    model_config = {
        "json_schema_extra": {
            "example": {
                "email": "user@example.com",
                "password": "password123"
            }
        }
    }

class UserResponse(BaseModel):
    id: str = Field(..., description="User ID")
    email: str = Field(..., description="User email")
    first_name: Optional[str] = Field(None, description="First name")
    last_name: Optional[str] = Field(None, description="Last name")
    subscription_tier: str = Field("free", description="Subscription tier")
    created_at: str = Field(..., description="Creation timestamp")

class TokenResponse(BaseModel):
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field("bearer", description="Token type")
    expires_in: int = Field(86400, description="Token expiration in seconds")

class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(..., description="Refresh token")
