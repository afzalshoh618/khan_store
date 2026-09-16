from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.category import Category
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from app.api.deps import get_current_admin

from app.utils.slug import generate_unique_slug

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("", response_model=List[CategoryResponse])
async def get_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category).order_by(Category.display_order, Category.name))
    categories = result.scalars().all()
    return categories


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_in: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    base_target = category_in.slug if (category_in.slug and category_in.slug.strip()) else category_in.name
    unique_slug = await generate_unique_slug(db, base_target, Category)

    cat_dict = category_in.model_dump()
    cat_dict["slug"] = unique_slug
    category = Category(**cat_dict)
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return category


@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: int,
    category_in: CategoryUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    result = await db.execute(select(Category).where(Category.id == category_id))
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=404, detail="Kategoriya topilmadi.")

    update_data = category_in.model_dump(exclude_unset=True)
    if "slug" in update_data and update_data["slug"]:
        update_data["slug"] = await generate_unique_slug(db, update_data["slug"], Category, current_id=category_id)

    for field, value in update_data.items():
        setattr(category, field, value)

    await db.commit()
    await db.refresh(category)
    return category


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    result = await db.execute(select(Category).where(Category.id == category_id))
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=404, detail="Kategoriya topilmadi.")
    
    await db.delete(category)
    await db.commit()
