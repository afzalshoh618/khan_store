import enum
from datetime import datetime
from sqlalchemy import String, Text, Integer, Float, Boolean, DateTime, ForeignKey, Index, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class QualityTier(str, enum.Enum):
    ORIGINAL = "original"
    LUX_COPY = "lux_copy"
    SUPER_CLONE = "super_clone"


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    short_description: Mapped[str] = mapped_column(String(500), nullable=True)
    video_url: Mapped[str] = mapped_column(String(500), nullable=True)
    
    # Pricing & Stock
    price: Mapped[float] = mapped_column(Float, index=True, nullable=False)
    original_price: Mapped[float] = mapped_column(Float, nullable=True)
    stock_quantity: Mapped[int] = mapped_column(Integer, default=10, nullable=False)
    
    # Highlights & Badges
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    is_new: Mapped[bool] = mapped_column(Boolean, default=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Foreign Keys with Indexes
    brand_id: Mapped[int] = mapped_column(Integer, ForeignKey("brands.id"), index=True, nullable=False)
    category_id: Mapped[int] = mapped_column(Integer, ForeignKey("categories.id"), index=True, nullable=False)
    
    # Direct filters attributes
    quality_tier: Mapped[QualityTier] = mapped_column(SQLEnum(QualityTier), default=QualityTier.ORIGINAL, index=True, nullable=False)
    gender: Mapped[str] = mapped_column(String(20), default="Erkaklar uchun", index=True) # Erkaklar, Ayollar, Uniseks
    mechanism: Mapped[str] = mapped_column(String(50), default="Avtomatik", index=True) # Avtomatik, Kvars, Mexanik
    case_material: Mapped[str] = mapped_column(String(100), default="Zanglamaydigan po'lat", index=True) # Oltin, Po'lat, Titanius
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    brand = relationship("Brand", back_populates="products")
    category = relationship("Category", back_populates="products")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan", order_by="ProductImage.display_order")
    attributes = relationship("ProductAttribute", back_populates="product", cascade="all, delete-orphan")
    cart_items = relationship("CartItem", back_populates="product", cascade="all, delete-orphan")
    order_items = relationship("OrderItem", back_populates="product")

    __table_args__ = (
        Index("idx_product_filter", "brand_id", "category_id", "price"),
    )


class ProductImage(Base):
    __tablename__ = "product_images"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    product_id: Mapped[int] = mapped_column(Integer, ForeignKey("products.id"), nullable=False)
    image_url: Mapped[str] = mapped_column(String(500), nullable=False)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False)
    display_order: Mapped[int] = mapped_column(Integer, default=0)

    product = relationship("Product", back_populates="images")


class ProductAttribute(Base):
    __tablename__ = "product_attributes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    product_id: Mapped[int] = mapped_column(Integer, ForeignKey("products.id"), nullable=False)
    attribute_key: Mapped[str] = mapped_column(String(100), nullable=False) # e.g. Suv o'tkazmaslik, Korpus diametri, Shisha
    attribute_value: Mapped[str] = mapped_column(String(255), nullable=False) # e.g. 100m / 10 ATM, 42mm, Sapfir

    product = relationship("Product", back_populates="attributes")
