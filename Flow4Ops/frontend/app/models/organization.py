from sqlalchemy import Column, String, Text, TIMESTAMP, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base


class Organization(Base):
    """
    Organization (Company/Tenant) model.
    
    Each organization is a separate tenant with isolated data (via RLS).
    Multiple users belong to one organization.
    """
    
    __tablename__ = "organizations"
    
    # Primary Key
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
        comment="Unique organization identifier"
    )
    
    # Basic Information
    name = Column(
        String(255),
        nullable=False,
        index=True,
        comment="Organization name (e.g., 'Acme Corp')"
    )
    
    logo_url = Column(
        Text,
        nullable=True,
        comment="URL to organization logo in Supabase Storage"
    )
    
    # Module Configuration
    enabled_modules = Column(
        JSONB,
        nullable=False,
        default=["sales"],
        comment="List of enabled modules: ['sales', 'procurement', 'employee_requests']"
    )
    
    # Custom Settings (flexible JSON storage)
    settings = Column(
        JSONB,
        nullable=False,
        default={},
        comment="Organization-specific settings (currency, timezone, etc.)"
    )
    
    # Subscription Info (Phase 2)
    subscription_tier = Column(
        String(50),
        nullable=False,
        default="free",
        comment="Subscription tier: free, starter, professional, enterprise"
    )
    
    # Timestamps
    created_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=func.now(),
        comment="When organization was created"
    )
    
    updated_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
        comment="Last updated timestamp"
    )
    
    # Relationships
    users = relationship(
        "User",
        back_populates="organization",
        cascade="all, delete-orphan",
        lazy="selectin"
    )
    
    departments = relationship(
        "Department",
        back_populates="organization",
        cascade="all, delete-orphan",
        lazy="selectin"
    )
    
    def __repr__(self) -> str:
        return f"<Organization(id={self.id}, name={self.name})>"
    
    def has_module(self, module_name: str) -> bool:
        """Check if organization has a specific module enabled"""
        return module_name in self.enabled_modules