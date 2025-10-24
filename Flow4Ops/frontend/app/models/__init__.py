"""
SQLAlchemy models for Flow4Ops.

Import all models here so Alembic can auto-detect them for migrations.
"""

from app.core.database import Base
from app.models.organization import Organization
from app.models.user import User
from app.models.department import Department

# Import additional models as they're created
# from app.models.client import Client
# from app.models.deal import Deal
# from app.models.request import Request

__all__ = [
    "Base",
    "Organization",
    "User",
    "Department",
]