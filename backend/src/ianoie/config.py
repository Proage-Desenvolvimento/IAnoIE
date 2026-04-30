from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )

    app_name: str = "IAnoIE"
    debug: bool = False

    # PostgreSQL
    database_url: str = "postgresql+asyncpg://ianoie:ianoie@localhost:5432/ianoie"
    database_url_sync: str = "postgresql+psycopg2://ianoie:ianoie@localhost:5432/ianoie"

    # Docker
    docker_host: str = "unix:///var/run/docker.sock"
    docker_timeout: int = 120

    # JWT
    jwt_secret: str = "CHANGE-ME-IN-PRODUCTION"
    jwt_algorithm: str = "HS256"
    jwt_expire_hours: int = 24

    # Redis / Celery
    redis_url: str = "redis://localhost:6379/0"
    celery_broker_url: str = "redis://localhost:6379/1"
    celery_result_backend: str = "redis://localhost:6379/2"

    # Encryption
    encryption_key: str = "CHANGE-ME-32-BYTES-BASE64-KEY="

    # GPU
    gpu_poll_interval_seconds: int = 60
    gpu_metrics_retention_days: int = 7

    # Templates
    templates_dir: str = "/app/templates"

    # Default admin
    default_admin_email: str = "admin@ianoie.local"
    default_admin_password: str = "admin"


settings = Settings()
