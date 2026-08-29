from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, and_
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.product import Product, ProductImage, ProductAttribute
from app.models.brand import Brand
from app.models.category import Category
from app.models.user import User
from app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductListResponse,
)
from app.api.deps import get_current_admin

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("", response_model=ProductListResponse)
async def list_products(
    db: AsyncSession = Depends(get_db),
    search: Optional[str] = Query(None, description="Qidiruv so'zi"),
    category_id: Optional[int] = Query(None),
    category_slug: Optional[str] = Query(None),
    brand_id: Optional[int] = Query(None),
    brand_slug: Optional[str] = Query(None),
    gender: Optional[str] = Query(None),
    mechanism: Optional[str] = Query(None),
    case_material: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    is_featured: Optional[bool] = Query(None),
    is_new: Optional[bool] = Query(None),
    sort: Optional[str] = Query("newest", description="price_asc, price_desc, newest, popular"),
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=100),
):
    query = (
        select(Product)
        .join(Product.brand, isouter=True)
        .join(Product.category, isouter=True)
        .options(
            selectinload(Product.brand),
            selectinload(Product.category),
            selectinload(Product.images),
            selectinload(Product.attributes),
        )
        .where(Product.is_active == True)
    )

    filters = []

    if search and search.strip():
        search_pattern = f"%{search.strip()}%"
        filters.append(
            or_(
                Product.name.ilike(search_pattern),
                Product.description.ilike(search_pattern),
                Product.short_description.ilike(search_pattern),
                Brand.name.ilike(search_pattern),
                Category.name.ilike(search_pattern),
            )
        )

    if category_id:
        filters.append(Product.category_id == category_id)
    elif category_slug:
        cat_result = await db.execute(select(Category.id).where(Category.slug == category_slug))
        cat_id = cat_result.scalar_one_or_none()
        if cat_id:
            filters.append(Product.category_id == cat_id)
        else:
            filters.append(Product.category_id == -1)

    if brand_id:
        filters.append(Product.brand_id == brand_id)
    elif brand_slug:
        b_result = await db.execute(select(Brand.id).where(Brand.slug == brand_slug))
        b_id = b_result.scalar_one_or_none()
        if b_id:
            filters.append(Product.brand_id == b_id)
        else:
            filters.append(Product.brand_id == -1)

    if gender:
        filters.append(Product.gender == gender)
    if mechanism:
        filters.append(Product.mechanism == mechanism)
    if case_material:
        filters.append(Product.case_material == case_material)
    if min_price is not None:
        filters.append(Product.price >= min_price)
    if max_price is not None:
        filters.append(Product.price <= max_price)
    if is_featured is not None:
        filters.append(Product.is_featured == is_featured)
    if is_new is not None:
        filters.append(Product.is_new == is_new)

    if filters:
        query = query.where(and_(*filters))

    # Total count query with proper joins
    count_query = (
        select(func.count(Product.id))
        .join(Product.brand, isouter=True)
        .join(Product.category, isouter=True)
        .where(Product.is_active == True)
    )
    if filters:
        count_query = count_query.where(and_(*filters))
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Sorting
    if sort == "price_asc":
        query = query.order_by(Product.price.asc())
    elif sort == "price_desc":
        query = query.order_by(Product.price.desc())
    elif sort == "popular":
        query = query.order_by(Product.is_featured.desc(), Product.created_at.desc())
    else:  # newest
        query = query.order_by(Product.created_at.desc())

    # Pagination
    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)

    result = await db.execute(query)
    products = result.scalars().all()

    return ProductListResponse(
        total=total,
        items=[ProductResponse.model_validate(p) for p in products],
        page=page,
        limit=limit,
    )


@router.get("/{slug_or_id}", response_model=ProductResponse)
async def get_product(slug_or_id: str, db: AsyncSession = Depends(get_db)):
    query = select(Product).options(
        selectinload(Product.brand),
        selectinload(Product.category),
        selectinload(Product.images),
        selectinload(Product.attributes),
    )

    if slug_or_id.isdigit():
        query = query.where(Product.id == int(slug_or_id))
    else:
        query = query.where(Product.slug == slug_or_id)

    result = await db.execute(query)
    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(status_code=404, detail="Mahsulot topilmadi.")

    return ProductResponse.model_validate(product)


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_in: ProductCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    # Check slug uniqueness
    slug_check = await db.execute(select(Product).where(Product.slug == product_in.slug))
    if slug_check.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Ushbu slug bilan mahsulot allaqachon mavjud.")

    images_data = product_in.images or []
    attributes_data = product_in.attributes or []

    product_dict = product_in.model_dump(exclude={"images", "attributes"})
    product = Product(**product_dict)

    db.add(product)
    await db.flush()  # to obtain product.id

    for img in images_data:
        db.add(ProductImage(product_id=product.id, **img.model_dump()))

    for attr in attributes_data:
        db.add(ProductAttribute(product_id=product.id, **attr.model_dump()))

    await db.commit()
    
    # Reload full product
    res = await db.execute(
        select(Product)
        .options(
            selectinload(Product.brand),
            selectinload(Product.category),
            selectinload(Product.images),
            selectinload(Product.attributes),
        )
        .where(Product.id == product.id)
    )
    full_product = res.scalar_one()
    return ProductResponse.model_validate(full_product)


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_in: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Mahsulot topilmadi.")

    update_data = product_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)

    await db.commit()

    res = await db.execute(
        select(Product)
        .options(
            selectinload(Product.brand),
            selectinload(Product.category),
            selectinload(Product.images),
            selectinload(Product.attributes),
        )
        .where(Product.id == product.id)
    )
    return ProductResponse.model_validate(res.scalar_one())


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Mahsulot topilmadi.")

    await db.delete(product)
    await db.commit()
