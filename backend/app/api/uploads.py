import os
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from app.core.config import settings
from app.models.user import User
from app.api.deps import get_current_admin

router = APIRouter(prefix="/upload", tags=["Uploads"])

ALLOWED_MIME_TYPES = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "video/quicktime": ".mov",
}

MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024   # 5MB Max Limit for photos
MAX_VIDEO_SIZE_BYTES = 20 * 1024 * 1024  # 20MB Max Limit for short demo videos


@router.post("", status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = File(...),
    admin: User = Depends(get_current_admin),
):
    # 1. MIME Type Validation
    content_type = (file.content_type or "").lower()
    if content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Faqat JPEG, PNG, WEBP rasmlari hamda MP4, WEBM, MOV videolari ruxsat etilgan.",
        )

    # 2. File Size Validation (Photos max 5MB, Videos max 20MB)
    content = await file.read()
    is_video = content_type.startswith("video/")
    max_size = MAX_VIDEO_SIZE_BYTES if is_video else MAX_IMAGE_SIZE_BYTES

    if len(content) > max_size:
        max_mb = 20 if is_video else 5
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Fayl hajmi {max_mb}MB dan oshmasligi kerak.",
        )

    # 3. Create upload directory safely
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    # 4. Generate secure randomized UUID filename
    ext = ALLOWED_MIME_TYPES[content_type]
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as f:
        f.write(content)

    url = f"/static/uploads/{unique_filename}"
    return {"url": url, "filename": unique_filename}
