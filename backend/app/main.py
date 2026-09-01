import os
import logging
from fastapi import FastAPI, Request, Response, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.api.auth import router as auth_router
from app.api.categories import router as categories_router
from app.api.brands import router as brands_router
from app.api.products import router as products_router
from app.api.cart import router as cart_router
from app.api.orders import router as orders_router
from app.api.admin import router as admin_router
from app.api.uploads import router as uploads_router
from app.api.promocodes import router as promocodes_router

# Configure Logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("khan_store_security")

is_production = settings.ENVIRONMENT.lower() == "production"

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Khan Store - Premium Accessories E-Commerce API",
    version="1.0.0",
    docs_url=None if is_production else "/docs",
    redoc_url=None if is_production else "/redoc",
    openapi_url=None if is_production else f"{settings.API_V1_STR}/openapi.json",
)

# HTTP Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response: Response = await call_next(request)
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response


# Global Exception Handler (Sanitizes 500 error traces to clients)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Internal Server Error on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Tizimda xatolik yuz berdi. Iltimos, bir ozdan so'ng qayta urinib ko'ring."},
    )


# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS if (settings.BACKEND_CORS_ORIGINS and "*" not in settings.BACKEND_CORS_ORIGINS) else ["*"],
    allow_origin_regex=r"https://.*\.up\.railway\.app|http://localhost:.*|http://127\.0\.0\.1:.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static uploads directory
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=settings.STATIC_DIR), name="static")

# Include Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(categories_router, prefix=settings.API_V1_STR)
app.include_router(brands_router, prefix=settings.API_V1_STR)
app.include_router(products_router, prefix=settings.API_V1_STR)
app.include_router(cart_router, prefix=settings.API_V1_STR)
app.include_router(orders_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)
app.include_router(uploads_router, prefix=settings.API_V1_STR)
app.include_router(promocodes_router, prefix=settings.API_V1_STR)


@app.on_event("startup")
async def on_startup_init_db():
    logger.info("Initializing Database tables & schema...")
    try:
        from app.core.database import engine, Base, AsyncSessionLocal
        from app.models.product import Product
        from sqlalchemy import select

        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

        async with AsyncSessionLocal() as session:
            try:
                res = await session.execute(select(Product))
                prod = res.scalars().first()
                if not prod:
                    logger.info("Database empty. Auto-seeding initial products & 19 brands...")
                    from app.core.seed import seed_data
                    await seed_data(drop_existing=False)
                    logger.info("Database auto-seeded successfully!")
            except Exception as seed_err:
                logger.warning(f"Product query failed, running full seed... {seed_err}")
                from app.core.seed import seed_data
                await seed_data(drop_existing=False)
    except Exception as e:
        logger.error(f"Startup DB auto-init error: {e}", exc_info=True)



@app.get("/")
async def root():
    return {
        "status": "online",
        "store": "Khan Store Premium",
        "version": "1.0.0",
    }


@app.get("/health")
@app.get("/api/health")
async def health_check():
    return {"status": "ok"}


