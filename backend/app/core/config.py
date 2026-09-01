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

    # CORS Origins (accepts list or comma-separated string from env ALLOWED_ORIGINS)
    ALLOWED_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
    ]
    BACKEND_CORS_ORIGINS: List[str] = []

    # Cloudflare R2 Object Storage
    R2_ACCOUNT_ID: str = ""
    R2_ACCESS_KEY_ID: str = ""
    R2_SECRET_ACCESS_KEY: str = ""
    R2_BUCKET_NAME: str = ""
    R2_PUBLIC_URL: str = ""
    USE_R2: bool = False

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

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[List[str], str, None], info=None) -> List[str]:
        origins = []
        allowed = os.getenv("ALLOWED_ORIGINS")
        if isinstance(allowed, str) and allowed.strip():
            origins.extend([item.strip() for item in allowed.split(",") if item.strip()])

        if isinstance(v, str) and v.strip():
            origins.extend([item.strip() for item in v.split(",") if item.strip()])
        elif isinstance(v, list):
            origins.extend(v)

        default_origins = ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8000"]
        for default in default_origins:
            if default not in origins:
                origins.append(default)

        return list(dict.fromkeys(origins))

    @field_validator("DATABASE_URL", mode="before")
    def assemble_db_connection(cls, v: Union[str, None], info=None) -> str:
        try:
            # Check Railway environment variables (MYSQL_URL, MYSQLURL, DATABASE_URL)
            env_url = v or os.getenv("MYSQL_URL") or os.getenv("MYSQLURL") or os.getenv("DATABASE_URL")
            if isinstance(env_url, str) and env_url.strip():
                url = env_url.strip()
                if url.startswith("mysql://"):
                    url = url.replace("mysql://", "mysql+aiomysql://", 1)
                elif url.startswith("mysql+pymysql://"):
                    url = url.replace("mysql+pymysql://", "mysql+aiomysql://", 1)
                elif url.startswith("mysql+mysqldb://"):
                    url = url.replace("mysql+mysqldb://", "mysql+aiomysql://", 1)
                return url

            host = os.getenv("MYSQL_HOST", "localhost")
            use_mysql = os.getenv("USE_MYSQL", "").lower() == "true" or host in ["mysql", "khan_mysql"]
            if use_mysql:
                user = os.getenv("MYSQL_USER", "khan_user")
                password = os.getenv("MYSQL_PASSWORD", "khan_password")
                port = os.getenv("MYSQL_PORT", "3306")
                db = os.getenv("MYSQL_DB") or os.getenv("MYSQL_DATABASE") or "khan_store_db"
                return f"mysql+aiomysql://{user}:{password}@{host}:{port}/{db}"

            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            db_path = os.path.join(base_dir, "khan_store.db")
            return f"sqlite+aiosqlite:///{db_path}"
        except Exception:
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            db_path = os.path.join(base_dir, "khan_store.db")
            return f"sqlite+aiosqlite:///{db_path}"

    @property
    def is_r2_configured(self) -> bool:
        return bool(
            self.R2_ACCOUNT_ID and self.R2_ACCOUNT_ID.strip() and
            self.R2_ACCESS_KEY_ID and self.R2_ACCESS_KEY_ID.strip() and
            self.R2_SECRET_ACCESS_KEY and self.R2_SECRET_ACCESS_KEY.strip() and
            self.R2_BUCKET_NAME and self.R2_BUCKET_NAME.strip()
        )


settings = Settings()
