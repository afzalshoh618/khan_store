import random
import string
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.order import Order, OrderItem, OrderStatus
from app.models.product import Product
from app.models.cart import CartItem
from app.models.user import User
from app.schemas.order import OrderCreate, OrderResponse
from app.api.deps import get_current_user_optional, get_current_user
from app.services.telegram import send_telegram_order_notification

router = APIRouter(prefix="/orders", tags=["Orders"])


def generate_order_number() -> str:
    digits = "".join(random.choices(string.digits, k=6))
    return f"KHAN-{digits}"


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_in: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    if not order_in.items:
        raise HTTPException(status_code=400, detail="Buyurtmada mahsulotlar mavjud emas.")

    total_amount = 0.0
    order_items_to_create = []

    for item_data in order_in.items:
        res = await db.execute(select(Product).where(Product.id == item_data.product_id))
        product = res.scalar_one_or_none()

        if not product or not product.is_active:
            raise HTTPException(
                status_code=400,
                detail=f"Mahsulot ID {item_data.product_id} topilmadi yoki sotuvda yo'q.",
            )

        item_total = product.price * item_data.quantity
        total_amount += item_total

        order_items_to_create.append(
            OrderItem(
                product_id=product.id,
                unit_price=product.price,
                quantity=item_data.quantity,
            )
        )

    order_number = generate_order_number()
    # Unique check for order_number
    num_check = await db.execute(select(Order).where(Order.order_number == order_number))
    while num_check.scalar_one_or_none():
        order_number = generate_order_number()
        num_check = await db.execute(select(Order).where(Order.order_number == order_number))

    order = Order(
        order_number=order_number,
        user_id=current_user.id if current_user else None,
        customer_name=order_in.customer_name,
        customer_phone=order_in.customer_phone,
        shipping_address=order_in.shipping_address,
        city=order_in.city,
        notes=order_in.notes,
        payment_method=order_in.payment_method,
        total_amount=total_amount,
        status=OrderStatus.PENDING,
        items=order_items_to_create,
    )

    db.add(order)

    # Clear user's cart if authenticated
    if current_user:
        cart_items_res = await db.execute(select(CartItem).where(CartItem.user_id == current_user.id))
        cart_items = cart_items_res.scalars().all()
        for ci in cart_items:
            await db.delete(ci)

    await db.commit()

    # Load complete order with relationships
    res = await db.execute(
        select(Order)
        .options(
            selectinload(Order.items).selectinload(OrderItem.product).selectinload(Product.brand),
            selectinload(Order.items).selectinload(OrderItem.product).selectinload(Product.category),
            selectinload(Order.items).selectinload(OrderItem.product).selectinload(Product.images),
            selectinload(Order.items).selectinload(OrderItem.product).selectinload(Product.attributes),
        )
        .where(Order.id == order.id)
    )
    full_order = res.scalar_one()

    # Trigger Telegram Notification (safe error handling)
    try:
        order_dict = {
            "order_number": full_order.order_number,
            "customer_name": full_order.customer_name,
            "customer_phone": full_order.customer_phone,
            "shipping_address": full_order.shipping_address,
            "city": full_order.city,
            "notes": full_order.notes,
            "payment_method": full_order.payment_method,
            "total_amount": full_order.total_amount,
        }
        await send_telegram_order_notification(order_dict, full_order.items)
    except Exception as e:
        pass

    return OrderResponse.model_validate(full_order)


@router.get("/my-orders", response_model=List[OrderResponse])
async def get_user_orders(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Order)
        .options(
            selectinload(Order.items).selectinload(OrderItem.product).selectinload(Product.brand),
            selectinload(Order.items).selectinload(OrderItem.product).selectinload(Product.category),
            selectinload(Order.items).selectinload(OrderItem.product).selectinload(Product.images),
            selectinload(Order.items).selectinload(OrderItem.product).selectinload(Product.attributes),
        )
        .where(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
    )
    orders = result.scalars().all()
    return [OrderResponse.model_validate(o) for o in orders]


@router.get("/{order_number}", response_model=OrderResponse)
async def get_order_by_number(
    order_number: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Order)
        .options(
            selectinload(Order.items).selectinload(OrderItem.product).selectinload(Product.brand),
            selectinload(Order.items).selectinload(OrderItem.product).selectinload(Product.category),
            selectinload(Order.items).selectinload(OrderItem.product).selectinload(Product.images),
            selectinload(Order.items).selectinload(OrderItem.product).selectinload(Product.attributes),
        )
        .where(Order.order_number == order_number)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Buyurtma topilmadi.")

    return OrderResponse.model_validate(order)
