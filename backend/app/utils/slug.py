import re
import unicodedata
from typing import Optional, Type
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select


def slugify(text: str) -> str:
    """
    Converts arbitrary string to a clean URL-friendly slug.
    Example: "Tissot PRX 1:1" -> "tissot-prx-1-1"
    """
    if not text:
        return "item"
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('utf-8')
    text = re.sub(r'[^a-z0-9]+', '-', text.lower())
    text = re.sub(r'-+', '-', text).strip('-')
    return text or "item"


async def generate_unique_slug(
    db: AsyncSession,
    text_or_slug: str,
    model: Type,
    current_id: Optional[int] = None
) -> str:
    """
    Generates a unique slug for a given SQLAlchemy model.
    If the base slug exists in the database, automatically appends -2, -3, etc.
    """
    base_slug = slugify(text_or_slug)
    
    # Check if base_slug is available
    query = select(model.id).where(model.slug == base_slug)
    if current_id is not None:
        query = query.where(model.id != current_id)
    
    result = await db.execute(query)
    if not result.scalar_one_or_none():
        return base_slug

    # If base_slug is already taken, append -2, -3, etc.
    counter = 2
    while True:
        candidate_slug = f"{base_slug}-{counter}"
        query = select(model.id).where(model.slug == candidate_slug)
        if current_id is not None:
            query = query.where(model.id != current_id)
        
        res = await db.execute(query)
        if not res.scalar_one_or_none():
            return candidate_slug
        counter += 1
