# Flow4Ops Backend (FastAPI + Python)

Centralized operations platform backend — handles authentication, business logic, and database operations.

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- PostgreSQL (via Supabase)
- pip or uv (package manager)

### Setup

1. **Create virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

4. **Initialize database:**
```bash
# Generate SECRET_KEY
openssl rand -hex 32

# Run migrations
alembic upgrade head
```

5. **Start development server:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API will be available at:
- **Swagger docs:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **Health check:** http://localhost:8000/health

---

## 📁 Project Structure

```
backend/
├── alembic/              # Database migrations
│   ├── versions/         # Migration files (auto-generated)
│   └── env.py           # Migration environment config
├── app/
│   ├── api/             # API route handlers
│   │   ├── v1/          # API version 1
│   │   │   ├── auth.py
│   │   │   ├── clients.py
│   │   │   ├── deals.py
│   │   │   └── users.py
│   │   └── deps.py      # Shared dependencies (auth, DB sessions)
│   ├── core/            # Core configuration
│   │   ├── config.py    # Settings from .env
│   │   ├── security.py  # Password hashing, JWT tokens
│   │   └── database.py  # SQLAlchemy engine, session
│   ├── models/          # SQLAlchemy ORM models
│   │   ├── organization.py
│   │   ├── user.py
│   │   ├── client.py
│   │   └── deal.py
│   ├── schemas/         # Pydantic models (API validation)
│   │   ├── user.py
│   │   ├── client.py
│   │   └── deal.py
│   ├── services/        # Business logic layer
│   │   ├── auth.py
│   │   └── pdf.py
│   └── main.py          # FastAPI app entry point
├── tests/               # Pytest test suite
├── .env.example         # Environment variables template
├── .gitignore
├── alembic.ini          # Alembic configuration
├── pyproject.toml       # Black/Ruff/Pytest settings
├── requirements.txt     # Python dependencies
└── README.md
```

---

## 🛠️ Development Commands

### Code Quality
```bash
# Format code with Black
black .

# Lint with Ruff
ruff check .

# Fix auto-fixable issues
ruff check --fix .

# Type check (if using mypy)
mypy app/
```

### Testing
```bash
# Run all tests
pytest

# Run with coverage report
pytest --cov=app tests/

# Run specific test file
pytest tests/test_auth.py -v
```

### Database Migrations
```bash
# Create new migration (after modifying models)
alembic revision --autogenerate -m "Add clients table"

# Apply migrations
alembic upgrade head

# Rollback last migration
alembic downgrade -1

# View migration history
alembic history
```

### Development Server
```bash
# Standard run
uvicorn app.main:app --reload

# With custom port
uvicorn app.main:app --reload --port 8080

# With auto-reload on file changes
uvicorn app.main:app --reload --reload-dir app/
```

---

## 🔐 Security Checklist

- [ ] `.env` file is in `.gitignore`
- [ ] `SECRET_KEY` is randomly generated (32+ characters)
- [ ] `DEBUG=False` in production
- [ ] Row-Level Security (RLS) enabled on all tables
- [ ] Service role key only used in backend (never exposed)
- [ ] CORS origins restricted to known frontends
- [ ] File upload size limits enforced

---

## 📚 Key Technologies

- **FastAPI:** Modern async web framework with auto-generated docs
- **SQLAlchemy 2.0:** ORM with async support
- **Alembic:** Database migration tool
- **Pydantic:** Data validation and settings management
- **Python-JOSE:** JWT token creation/validation
- **Passlib:** Secure password hashing (bcrypt)
- **Supabase:** Managed PostgreSQL + authentication + storage

---

## 🐛 Troubleshooting

### Database connection errors
```bash
# Test connection
psql "postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"

# Check if Supabase project is paused (free tier)
# → Go to Supabase dashboard and restore
```

### Migration conflicts
```bash
# Reset migrations (CAUTION: only in dev!)
alembic downgrade base
alembic upgrade head
```

### Import errors
```bash
# Ensure virtual environment is activated
which python  # Should point to venv/bin/python

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

---

## 📖 API Documentation

Once server is running, visit:
- **Interactive docs:** http://localhost:8000/docs
- **Try endpoints directly in browser with authentication**

---

## 🚢 Deployment Notes

(Phase 2 — Production deployment guide to Railway, Render, or AWS)

---

**Next steps:** See `frontend/README.md` for frontend setup.