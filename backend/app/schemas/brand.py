from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class BrandBase(BaseModel):
    name: str
    slug: str
    logo_url: Optional[str] = None
    description: Optional[str] = None
    country: str = "Shveytsariya"


class BrandCreate(BrandBase):
    pass


class BrandResponse(BrandBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
