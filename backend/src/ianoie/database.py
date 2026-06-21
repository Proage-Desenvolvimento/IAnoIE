from collections.abc import AsyncGenerator

from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import sessionmaker

from ianoie.config import settings

# Async engine (FastAPI endpoints)
async_engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True,
    pool_recycle=1800,  # recycle connections before Postgres/idle timeouts kill them
    pool_timeout=10,  # fail fast instead of hanging when the pool is exhausted
    connect_args={"timeout": 10, "command_timeout": 30},  # asyncpg connect + per-query
)

async_session_factory = async_sessionmaker(async_engine, expire_on_commit=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_factory() as session:
        yield session


# Sync engine (Celery tasks)
sync_engine = create_engine(
    settings.database_url_sync,
    echo=settings.debug,
    pool_size=10,
    max_overflow=5,
    pool_pre_ping=True,
    pool_recycle=1800,
    pool_timeout=10,
    connect_args={"connect_timeout": 10},  # psycopg2 connect timeout
)

sync_session_factory = sessionmaker(sync_engine, expire_on_commit=False)
