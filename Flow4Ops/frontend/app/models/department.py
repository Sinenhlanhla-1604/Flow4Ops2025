from sqlalchemy import Column, String, ForeignKey, TIMESTAMP, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base


class Department(Base):
    """
    Department model for organizing users within an organization.
    
    Examples: Sales, Operations, HR, IT, Finance
    """
    
    __tablename__ = "departments"
    
    # Primary Key
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    
    # Foreign Key to Organization
    org_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Organization this department belongs to"
    )
    
    # Basic Information
    name = Column(
        String(100),
        nullable=False,
        index=True,
        comment="Department name (e.g., 'Sales', 'Operations')"
    )
    
    # Optional Department Head
    head_user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        comment="User ID of department head/manager"
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
        back_populates="departments"
    )
    
    users = relationship(
        "User",
        back_populates="department",
        foreign_keys="User.department_id"
    )
    
    head_user = relationship(
        "User",
        foreign_keys=[head_user_id],
        post_update=True  # Allows circular reference (head is also in users)
    )
    
    def __repr__(self) -> str:
        return f"<Department(id={self.id}, name={self.name}, org_id={self.org_id})>"