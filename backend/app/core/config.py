import os
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Khan Store Premium"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"  # 'development' or 'production'
    SECRET_KEY: str = "SUPER_SECRET_KHAN_STORE_KEY_CHANGE_IN_PRODUCTION_987654321"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 60  # 60 minutes for enhanced token security

    # Telegram Bot Settings
    TELEGRAM_BOT_TOKEN: str = "8737400032:AAHtkMxXhw27Pmh-wSsRSisSIYYGSL6e1tg"
    TELEGRAM_CHAT_ID: str = "-1004299963020"

    # Database
    MYSQL_HOST: str = "localhost"
    MYSQL_PORT: int = 3306
    MYSQL_USER: str = "khan_user"
    MYSQL_PASSWORD: str = "khan_password"
    MYSQL_DB: str = "khan_store_db"
    MYSQL_DATABASE: str = "khan_store_db"
    USE_MYSQL: bool = False
    DATABASE_URL: Union[str, None] = None

    # CORS Origins
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
    ]

    # Media uploads
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    STATIC_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "static")
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "static", "uploads")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    @field_validator("DATABASE_URL", mode="before")
    def assemble_db_connection(cls, v: Union[str, None], info) -> str:
        if isinstance(v, str) and v.strip():
            return v
        data = info.data
        host = data.get("MYSQL_HOST", "localhost")
        use_mysql = data.get("USE_MYSQL") or str(os.getenv("USE_MYSQL", "")).lower() == "true"
        if host in ["mysql", "khan_mysql"] or use_mysql:
            user = data.get("MYSQL_USER", "khan_user")
            password = data.get("MYSQL_PASSWORD", "khan_password")
            port = data.get("MYSQL_PORT", 3306)
            db = data.get("MYSQL_DB") or data.get("MYSQL_DATABASE") or "khan_store_db"
            return f"mysql+aiomysql://{user}:{password}@{host}:{port}/{db}"
        return "sqlite+aiosqlite:///./khan_store.db"


settings = Settings()
