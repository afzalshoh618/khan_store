from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.promocode import PromoCode
from app.models.user import User
from app.schemas.promocode import (
    PromoCodeCreate,
    PromoCodeResponse,
    PromoCodeValidateRequest,
    PromoCodeValidateResponse,
)
from app.api.deps import get_current_admin

router = APIRouter(prefix="/promocodes", tags=["PromoCodes"])


@router.get("", response_model=List[PromoCodeResponse])
async def list_promocodes(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    result = await db.execute(select(PromoCode).order_by(PromoCode.created_at.desc()))
    return result.scalars().all()


@router.post("", response_model=PromoCodeResponse, status_code=status.HTTP_201_CREATED)
async def create_promocode(
    promo_in: PromoCodeCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    code_upper = promo_in.code.upper().strip()
    result = await db.execute(select(PromoCode).where(PromoCode.code == code_upper))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Ushbu promokod allaqachon mavjud.")

    promo = PromoCode(
        code=code_upper,
        discount_amount=promo_in.discount_amount,
        is_active=promo_in.is_active if promo_in.is_active is not None else True,
    )
    db.add(promo)
    await db.commit()
    await db.refresh(promo)
    return promo


@router.delete("/{promo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_promocode(
    promo_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    result = await db.execute(select(PromoCode).where(PromoCode.id == promo_id))
    promo = result.scalar_one_or_none()
    if not promo:
        raise HTTPException(status_code=404, detail="Promokod topilmadi.")

    await db.delete(promo)
    await db.commit()


@router.post("/validate", response_model=PromoCodeValidateResponse)
async def validate_promocode(
    req: PromoCodeValidateRequest,
    db: AsyncSession = Depends(get_db),
):
    code_upper = req.code.upper().strip()
    result = await db.execute(select(PromoCode).where(PromoCode.code == code_upper))
    promo = result.scalar_one_or_none()

    if not promo or not promo.is_active:
        return PromoCodeValidateResponse(
            valid=False,
            code=code_upper,
            discount_amount=0.0,
            message="Kiritilgan promokod mavjud emas yoki muddati o'tgan.",
        )

    return PromoCodeValidateResponse(
        valid=True,
        code=promo.code,
        discount_amount=promo.discount_amount,
        message=f"Promokod qabul qilindi! {promo.discount_amount:,.0f} so'm chegirma qo'llanildi.".replace(",", " "),
    )
