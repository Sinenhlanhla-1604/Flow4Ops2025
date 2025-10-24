from sqlalchemy import Column, String, Boolean, ForeignKey, TIMESTAMP, func, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum

from app.core.database import Base


class UserRole(str, enum.Enum):
    """User roles for permissions (Phase 1 - basic roles)"""
    ADMIN = "admin"          # Full access to everything
    MANAGER = "manager"      # Department-level access
    USER = "user"            # Standard employee access
    VIEWER = "viewer"        # Read-only access


class User(Base):
    """
    User model for authentication and authorization.
    
    Each user belongs to one organization (tenant) and optionally one department.
    """
    
    __tablename__ = "users"
    
    # Primary Key
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    
    # Foreign Keys
    org_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Organization (tenant) this user belongs to"
    )
    
    department_id = Column(
        UUID(as_uuid=True),
        ForeignKey("departments.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="Optional department assignment"
    )
    
    # Authentication
    email = Column(
        String(255),
        nullable=False,
        unique=True,
        index=True,
        comment="Unique email for login"
    )
    
    hashed_password = Column(
        String(255),
        nullable=False,
        comment="Bcrypt hashed password (never store plain text!)"
    )
    
    is_active = Column(
        Boolean,
        nullable=False,
        default=True,
        comment="Can user log in? (False = deactivated)"
    )
    
    # Profile Information
    name = Column(
        String(255),
        nullable=False,
        comment="Full name (e.g., 'John Doe')"
    )
    
    avatar_url = Column(
        String(500),
        nullable=True,
        comment="URL to profile picture in Supabase Storage"
    )
    
    phone = Column(
        String(50),
        nullable=True,
        comment="Contact phone number"
    )
    
    # Authorization
    role = Column(
        SQLEnum(UserRole),
        nullable=False,
        default=UserRole.USER,
        index=True,
        comment="User role for permissions"
    )
    
    # Activity Tracking
    last_login_at = Column(
        TIMESTAMP(timezone=True),
        nullable=True,
        comment="Last successful login timestamp"
    )
    
    # Timestamps
    created_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=func.now()
    )
    
    updated_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now()
    )
    
    # Relationships
    organization = relationship(
        "Organization",
        back_populates="users"
    )
    
    department = relationship(
        "Department",
        back_populates="users",
        foreign_keys=[department_id]
    )
    
    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"
    
    def is_admin(self) -> bool:
        """Check if user has admin role"""
        return self.role == UserRole.ADMIN
    
    def is_manager(self) -> bool:
        """Check if user has manager or admin role"""
        return self.role in [UserRole.ADMIN, UserRole.MANAGER]
    
    def can_access_module(self, module_name: str) -> bool:
        """Check if user's organization has module enabled"""
        return self.organization.has_module(module_name)