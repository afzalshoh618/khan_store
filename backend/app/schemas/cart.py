from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.product import ProductResponse


class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = 1


class CartItemUpdate(BaseModel):
    quantity: int


class CartItemResponse(BaseModel):
    id: int
    user_id: int
    product_id: int
    quantity: int
    created_at: datetime
    product: Optional[ProductResponse] = None

    class Config:
        from_attributes = True
