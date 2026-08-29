from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class PromoCodeBase(BaseModel):
    code: str = Field(..., min_length=2, max_length=50)
    discount_amount: float = Field(..., gt=0, description="Chegirma summasi (UZS so'm)")
    is_active: Optional[bool] = True


class PromoCodeCreate(PromoCodeBase):
    pass


class PromoCodeResponse(PromoCodeBase):
    id: int
    used_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class PromoCodeValidateRequest(BaseModel):
    code: str


class PromoCodeValidateResponse(BaseModel):
    valid: bool
    code: str
    discount_amount: float
    message: str
