from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.schemas.brand import BrandResponse
from app.schemas.category import CategoryResponse
from app.models.product import QualityTier


class ProductImageBase(BaseModel):
    image_url: str
    is_primary: bool = False
    display_order: int = 0


class ProductImageResponse(ProductImageBase):
    id: int

    class Config:
        from_attributes = True


class ProductAttributeBase(BaseModel):
    attribute_key: str
    attribute_value: str


class ProductAttributeResponse(ProductAttributeBase):
    id: int

    class Config:
        from_attributes = True


class ProductBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    short_description: Optional[str] = None
    video_url: Optional[str] = None
    price: float
    original_price: Optional[float] = None
    stock_quantity: int = 10
    is_featured: bool = False
    is_new: bool = True
    is_active: bool = True
    brand_id: int
    category_id: int
    quality_tier: QualityTier = QualityTier.ORIGINAL
    gender: str = "Erkaklar uchun"
    mechanism: str = "Avtomatik"
    case_material: str = "Zanglamaydigan po'lat"


class ProductCreate(ProductBase):
    images: Optional[List[ProductImageBase]] = []
    attributes: Optional[List[ProductAttributeBase]] = []


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    video_url: Optional[str] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    stock_quantity: Optional[int] = None
    is_featured: Optional[bool] = None
    is_new: Optional[bool] = None
    is_active: Optional[bool] = None
    brand_id: Optional[int] = None
    category_id: Optional[int] = None
    quality_tier: Optional[QualityTier] = None
    gender: Optional[str] = None
    mechanism: Optional[str] = None
    case_material: Optional[str] = None


class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime
    brand: Optional[BrandResponse] = None
    category: Optional[CategoryResponse] = None
    images: List[ProductImageResponse] = []
    attributes: List[ProductAttributeResponse] = []

    class Config:
        from_attributes = True


class ProductListResponse(BaseModel):
    total: int
    items: List[ProductResponse]
    page: int
    limit: int
