import re
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, Field

from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.user import User, UserRole
from app.schemas.auth import UserCreate, UserLogin, UserResponse, Token
from app.api.deps import get_current_user
from app.core.rate_limiter import (
    check_login_rate_limit,
    record_failed_login_attempt,
    reset_login_rate_limit,
)

router = APIRouter(prefix="/auth", tags=["Auth"])


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, description="Yangi parol kamida 8 belgi bo'lishi kerak")


def validate_password_strength(password: str):
    if len(password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Yangi parol kamida 8 ta belgidan iborat bo'lishi kerak.",
        )
    if not re.search(r"[A-Za-z]", password) or not re.search(r"[0-9]", password):
        raise HTTPException(
            status_code=400,
            detail="Yangi parol tarkibida kamida bitta harf va bitta raqam bo'lishi kerak.",
        )


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, response: Response, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_in.email))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ushbu email bilan allaqachon ro'yxatdan o'tilgan.",
        )

    result_count = await db.execute(select(User))
    users_list = result_count.scalars().all()
    role = UserRole.ADMIN if len(users_list) == 0 else UserRole.CUSTOMER

    validate_password_strength(user_in.password)

    new_user = User(
        email=user_in.email.lower().strip(),
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        phone=user_in.phone,
        role=role,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    token = create_access_token(subject=new_user.id)

    # Set HttpOnly Cookie for security
    response.set_cookie(
        key="khan_token",
        value=token,
        httponly=True,
        samesite="lax",
        max_age=60 * 60 * 24 * 7,  # 7 days
    )

    return Token(access_token=token, user=UserResponse.model_validate(new_user))


@router.post("/login", response_model=Token)
async def login(
    request: Request,
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    check_login_rate_limit(request, form_data.username)

    result = await db.execute(select(User).where(User.email == form_data.username.lower().strip()))
    user = result.scalar_one_or_none()

    if not user or not verify_password(form_data.password, user.hashed_password):
        record_failed_login_attempt(request, form_data.username)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email yoki parol noto'g'ri.",
        )

    reset_login_rate_limit(request, form_data.username)
    token = create_access_token(subject=user.id)

    response.set_cookie(
        key="khan_token",
        value=token,
        httponly=True,
        samesite="lax",
        max_age=60 * 60 * 24 * 7,
    )

    return Token(access_token=token, user=UserResponse.model_validate(user))


@router.post("/json-login", response_model=Token)
async def json_login(
    request: Request,
    response: Response,
    credentials: UserLogin,
    db: AsyncSession = Depends(get_db),
):
    check_login_rate_limit(request, credentials.email)

    result = await db.execute(select(User).where(User.email == credentials.email.lower().strip()))
    user = result.scalar_one_or_none()

    if not user or not verify_password(credentials.password, user.hashed_password):
        record_failed_login_attempt(request, credentials.email)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email yoki parol noto'g'ri.",
        )

    reset_login_rate_limit(request, credentials.email)
    token = create_access_token(subject=user.id)

    response.set_cookie(
        key="khan_token",
        value=token,
        httponly=True,
        samesite="lax",
        max_age=60 * 60 * 24 * 7,
    )

    return Token(access_token=token, user=UserResponse.model_validate(user))


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key="khan_token")
    return {"message": "Tizimdan muvaffaqiyatli chiqildi."}


@router.post("/change-password")
async def change_password(
    pwd_in: PasswordChangeRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(pwd_in.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Joriy parol noto'g'ri kiritildi.",
        )

    validate_password_strength(pwd_in.new_password)

    current_user.hashed_password = get_password_hash(pwd_in.new_password)
    db.add(current_user)
    await db.commit()

    # Clear current token cookie to force re-login
    response.delete_cookie(key="khan_token")

    return {"message": "Parol muvaffaqiyatli o'zgartirildi. Iltimos, yangi parol bilan qayta kiring."}


@router.get("/me", response_model=UserResponse)
async def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user
