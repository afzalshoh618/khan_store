from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.order import Order, OrderItem, OrderStatus
from app.models.product import Product
from app.models.user import User
from app.models.brand import Brand
from app.models.category import Category
from app.schemas.order import OrderResponse, OrderStatusUpdate
from app.api.deps import get_current_admin

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/dashboard-stats")
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    total_products_res = await db.execute(select(func.count(Product.id)))
    total_products = total_products_res.scalar() or 0

    total_orders_res = await db.execute(select(func.count(Order.id)))
    total_orders = total_orders_res.scalar() or 0

    revenue_res = await db.execute(select(func.sum(Order.total_amount)).where(Order.status != OrderStatus.CANCELLED))
    total_revenue = revenue_res.scalar() or 0.0

    total_users_res = await db.execute(select(func.count(User.id)))
    total_users = total_users_res.scalar() or 0

    pending_orders_res = await db.execute(select(func.count(Order.id)).where(Order.status == OrderStatus.PENDING))
    pending_orders = pending_orders_res.scalar() or 0

    return {
        "total_products": total_products,
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "total_users": total_users,
        "pending_orders": pending_orders,
    }


@router.get("/orders", response_model=List[OrderResponse])
async def list_all_orders(
    db: AsyncSession = Depends(get_db),
    status_filter: Optional[OrderStatus] = Query(None),
    admin: User = Depends(get_current_admin),
):
    query = (
        select(Order)
        .options(
            selectinload(Order.items).selectinload(OrderItem.product).selectinload(Product.brand),
            selectinload(Order.items).selectinload(OrderItem.product).selectinload(Product.category),
            selectinload(Order.items).selectinload(OrderItem.product).selectinload(Product.images),
            selectinload(Order.items).selectinload(OrderItem.product).selectinload(Product.attributes),
        )
        .order_by(Order.created_at.desc())
    )

    if status_filter:
        query = query.where(Order.status == status_filter)

    result = await db.execute(query)
    orders = result.scalars().all()
    return [OrderResponse.model_validate(o) for o in orders]


@router.put("/orders/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: int,
    status_in: OrderStatusUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Buyurtma topilmadi.")

    order.status = status_in.status
    if status_in.is_paid is not None:
        order.is_paid = status_in.is_paid

    await db.commit()

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
    return OrderResponse.model_validate(res.scalar_one())
