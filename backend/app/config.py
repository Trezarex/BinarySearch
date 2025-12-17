from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Application
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 1 week

    # CORS
    FRONTEND_URL: str = "http://localhost:5173"

    # Liveblocks
    LIVEBLOCKS_SECRET_KEY: str

    # Daily.co
    DAILY_API_KEY: str
    DAILY_DOMAIN: str

    # BigQuery
    GOOGLE_CLOUD_PROJECT: str
    BIGQUERY_DATASET: str = "binarysearch"
    GOOGLE_APPLICATION_CREDENTIALS: Optional[str] = None

    # Environment
    ENVIRONMENT: str = "development"

    class Config:
        env_file = ".env"


settings = Settings()
