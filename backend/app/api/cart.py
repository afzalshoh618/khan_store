from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.cart import CartItem
from app.models.product import Product
from app.models.user import User
from app.schemas.cart import CartItemCreate, CartItemUpdate, CartItemResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/cart", tags=["Cart"])


@router.get("", response_model=List[CartItemResponse])
async def get_cart(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(CartItem)
        .options(
            selectinload(CartItem.product).selectinload(Product.brand),
            selectinload(CartItem.product).selectinload(Product.images),
        )
        .where(CartItem.user_id == current_user.id)
    )
    items = result.scalars().all()
    return [CartItemResponse.model_validate(item) for item in items]


@router.post("", response_model=CartItemResponse, status_code=status.HTTP_201_CREATED)
async def add_to_cart(
    item_in: CartItemCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Verify product exists
    prod_res = await db.execute(select(Product).where(Product.id == item_in.product_id))
    if not prod_res.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Mahsulot topilmadi.")

    # Check if item already in cart
    existing_res = await db.execute(
        select(CartItem).where(
            CartItem.user_id == current_user.id,
            CartItem.product_id == item_in.product_id,
        )
    )
    existing_item = existing_res.scalar_one_or_none()

    if existing_item:
        existing_item.quantity += item_in.quantity
        await db.commit()
        await db.refresh(existing_item)
        target_item = existing_item
    else:
        new_item = CartItem(
            user_id=current_user.id,
            product_id=item_in.product_id,
            quantity=item_in.quantity,
        )
        db.add(new_item)
        await db.commit()
        await db.refresh(new_item)
        target_item = new_item

    # Load relationship
    res = await db.execute(
        select(CartItem)
        .options(
            selectinload(CartItem.product).selectinload(Product.brand),
            selectinload(CartItem.product).selectinload(Product.images),
        )
        .where(CartItem.id == target_item.id)
    )
    return CartItemResponse.model_validate(res.scalar_one())


@router.put("/{item_id}", response_model=CartItemResponse)
async def update_cart_item(
    item_id: int,
    item_in: CartItemUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(CartItem).where(CartItem.id == item_id, CartItem.user_id == current_user.id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Savatdagi mahsulot topilmadi.")

    if item_in.quantity <= 0:
        await db.delete(item)
        await db.commit()
        raise HTTPException(status_code=200, detail="Mahsulot savatdan o'chirildi.")

    item.quantity = item_in.quantity
    await db.commit()

    res = await db.execute(
        select(CartItem)
        .options(
            selectinload(CartItem.product).selectinload(Product.brand),
            selectinload(CartItem.product).selectinload(Product.images),
        )
        .where(CartItem.id == item.id)
    )
    return CartItemResponse.model_validate(res.scalar_one())


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_cart_item(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(CartItem).where(CartItem.id == item_id, CartItem.user_id == current_user.id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Savatdagi mahsulot topilmadi.")

    await db.delete(item)
    await db.commit()


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def clear_cart(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items_res = await db.execute(select(CartItem).where(CartItem.user_id == current_user.id))
    items = items_res.scalars().all()
    for item in items:
        await db.delete(item)
    await db.commit()
