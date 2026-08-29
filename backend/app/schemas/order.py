from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.order import OrderStatus, PaymentMethod
from app.schemas.product import ProductResponse


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    unit_price: float
    quantity: int
    product: Optional[ProductResponse] = None

    class Config:
        from_attributes = True


from pydantic import BaseModel, Field

class OrderCreate(BaseModel):
    customer_name: str = Field(..., min_length=2, max_length=100)
    customer_phone: str = Field(..., min_length=7, max_length=30)
    shipping_address: str = Field(..., min_length=3, max_length=500)
    city: str = Field("Toshkent", min_length=2, max_length=100)
    notes: Optional[str] = Field(None, max_length=1000)
    payment_method: PaymentMethod = PaymentMethod.CASH
    items: List[OrderItemCreate]


class OrderStatusUpdate(BaseModel):
    status: OrderStatus
    is_paid: Optional[bool] = None


class OrderResponse(BaseModel):
    id: int
    order_number: str
    user_id: Optional[int] = None
    customer_name: str
    customer_phone: str
    shipping_address: str
    city: str
    notes: Optional[str] = None
    total_amount: float
    status: OrderStatus
    payment_method: PaymentMethod
    is_paid: bool
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True
