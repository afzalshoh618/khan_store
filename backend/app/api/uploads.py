import os
import uuid
import logging
import boto3
from botocore.exceptions import BotoCoreError, ClientError
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from app.core.config import settings
from app.models.user import User
from app.api.deps import get_current_admin

logger = logging.getLogger("khan_store_uploads")

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


def get_r2_client():
    if not settings.is_r2_configured:
        return None
    endpoint_url = f"https://{settings.R2_ACCOUNT_ID.strip()}.r2.cloudflarestorage.com"
    return boto3.client(
        "s3",
        endpoint_url=endpoint_url,
        aws_access_key_id=settings.R2_ACCESS_KEY_ID.strip(),
        aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY.strip(),
        region_name="auto",
    )


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

    # 3. Generate secure randomized UUID filename
    ext = ALLOWED_MIME_TYPES[content_type]
    unique_filename = f"{uuid.uuid4().hex}{ext}"

    # 4. Check if Cloudflare R2 is configured or requested
    if settings.USE_R2 or settings.is_r2_configured:
        if not settings.is_r2_configured:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Rasm saqlash xizmati (Cloudflare R2) kalitlari to'liq sozlanmagan.",
            )
        try:
            s3_client = get_r2_client()
            s3_client.put_object(
                Bucket=settings.R2_BUCKET_NAME.strip(),
                Key=unique_filename,
                Body=content,
                ContentType=content_type,
            )
            public_base = (settings.R2_PUBLIC_URL or f"https://{settings.R2_BUCKET_NAME.strip()}.r2.dev").rstrip("/")
            public_url = f"{public_base}/{unique_filename}"
            return {"url": public_url, "filename": unique_filename}
        except (BotoCoreError, ClientError, Exception) as err:
            logger.error(f"Cloudflare R2 Upload Error: {err}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Cloudflare R2 bulutli xotiraga fayl yuklashda xatolik yuz berdi.",
            )

    # 5. Local disk fallback (Default for local development)
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as f:
        f.write(content)

    url = f"/static/uploads/{unique_filename}"
    return {"url": url, "filename": unique_filename}

