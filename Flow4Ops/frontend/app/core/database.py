from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import sessionmaker, DeclarativeBase, Session
from typing import AsyncGenerator
import uuid

from app.core.config import settings


# Metadata with naming convention for constraints
# This ensures consistent naming for indexes, foreign keys, etc.
convention = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s"
}

metadata = MetaData(naming_convention=convention)


# Base class for all models
class Base(DeclarativeBase):
    """
    Base class for all SQLAlchemy models.
    
    Provides common functionality:
    - UUID primary keys by default
    - metadata with naming conventions
    """
    metadata = metadata
    
    # Type annotation for ORM (helps with IDE autocomplete)
    __name__: str


# Synchronous database engine (for migrations, scripts)
sync_engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,  # Log SQL queries in debug mode
    pool_pre_ping=True,  # Verify connection before using (handles stale connections)
    pool_size=5,
    max_overflow=10,
)

# Synchronous session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=sync_engine,
    class_=Session,
)


# Asynchronous database engine (for FastAPI endpoints)
async_engine = create_async_engine(
    settings.DATABASE_URL_ASYNC,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
)

# Asynchronous session factory
AsyncSessionLocal = async_sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False,  # Allows accessing loaded objects after commit
)


# Dependency for FastAPI endpoints
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that provides a database session.
    
    Usage:
        @app.get("/users")
        async def get_users(db: AsyncSession = Depends(get_db)):
            result = await db.execute(select(User))
            return result.scalars().all()
    
    Automatically commits on success, rolls back on error.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# Synchronous version for scripts and migrations
def get_sync_db() -> Session:
    """
    Synchronous database session for Alembic migrations and scripts.
    
    Usage:
        db = get_sync_db()
        try:
            db.add(user)
            db.commit()
        finally:
            db.close()
    """
    return SessionLocal()


# Helper to generate UUIDs
def generate_uuid() -> str:
    """Generate UUID string for primary keys"""
    return str(uuid.uuid4())