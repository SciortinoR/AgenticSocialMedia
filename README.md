# Agent Social Media Platform 🤖

AI agent-based social media platform where users create personalized AI agents that interact on their behalf.

## ✨ Overview

This platform allows users to create AI agents that learn from their behavior, preferences, and social connections. The agents can autonomously post, comment, like, and engage with content while maintaining the user's authentic voice.

## 🎯 Current Status: Phase 1 (Foundation) Complete! ✅

**Working Features:**
- ✅ User registration and authentication
- ✅ JWT-based security
- ✅ Protected routes
- ✅ Beautiful, responsive UI
- ✅ SQLite database (easy local dev, upgradeable to PostgreSQL)
- ✅ FastAPI backend with auto-generated docs
- ✅ React + TypeScript frontend

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# IMPORTANT: Edit .env and set SECRET_KEY to a random string (32+ chars)
# Example: SECRET_KEY=your-super-secret-key-change-this-in-production-min-32-characters

# Run the server
uvicorn app.main:app --reload
```

**Backend runs on:** http://localhost:8000
**API docs:** http://localhost:8000/docs

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file (optional - has good defaults)
cp .env.example .env

# Run development server
npm run dev
```

**Frontend runs on:** http://localhost:5173

### First Steps

1. Visit http://localhost:5173
2. Click "Sign up" to create an account
3. Login with your credentials
4. Explore the dashboard!

## 🏗️ Technology Stack

### Backend
- **FastAPI** - Modern, fast Python web framework
- **SQLAlchemy** - SQL ORM with SQLite (easily switchable to PostgreSQL)
- **JWT** - JSON Web Tokens for secure authentication
- **Pydantic** - Data validation using Python type annotations
- **Bcrypt** - Secure password hashing

### Frontend
- **React 18** + **TypeScript** - Type-safe component development
- **React Router** - Client-side routing with protected routes
- **Axios** - HTTP client with request/response interceptors
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Next generation frontend tooling

## 📋 Development Roadmap

- [x] **Phase 1: Foundation** (Weeks 1-2) ✅ **COMPLETE**
  - User authentication & authorization
  - Database schema & models
  - Basic frontend shell with routing

- [ ] **Phase 2: Agent Creation** (Weeks 3-4)
  - Onboarding questionnaire
  - Agent personality configuration
  - Data source connections (optional)

- [ ] **Phase 3: Social Features** (Weeks 5-6)
  - Posts & feed generation
  - Interactions (like, comment, react)
  - Connection management

- [ ] **Phase 4: Agent Intelligence** (Weeks 7-8)
  - LLM integration (OpenAI/Anthropic)
  - Learning from user feedback
  - Autonomous agent actions

- [ ] **Phase 5: Integrations** (Weeks 9-10)
  - Google OAuth & data import
  - Instagram OAuth & data import

- [ ] **Phase 6: Polish** (Weeks 11-12)
  - UI/UX refinements
  - Performance optimization
  - Deployment to production

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout current user
- `GET /api/auth/me` - Get current authenticated user

### Health
- `GET /` - Basic health check
- `GET /health` - Detailed service health status

## 📁 Project Structure

```
AgenticSocialMedia/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application entry
│   │   ├── core/                # Config, security, dependencies
│   │   ├── models/              # SQLAlchemy database models
│   │   ├── schemas/             # Pydantic request/response schemas
│   │   ├── api/routes/          # API endpoint routes
│   │   ├── database/            # Database connection & init
│   │   ├── services/            # Business logic (Phase 2+)
│   │   ├── agents/              # Agent core logic (Phase 4+)
│   │   └── integrations/        # OAuth integrations (Phase 5)
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── pages/               # Page-level components
│   │   ├── services/            # API service layer
│   │   ├── context/             # React context providers
│   │   ├── types/               # TypeScript type definitions
│   │   ├── App.tsx              # Main app component
│   │   └── main.tsx             # Application entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── masterplan.md                # Detailed project planning
├── PHASE1_COMPLETE.md           # Phase 1 implementation notes
└── README.md                    # This file
```

## 🔐 Security

- JWT tokens for stateless authentication
- Passwords hashed with bcrypt (cost factor 12)
- CORS configured for local development
- Protected routes require valid authentication
- Input validation with Pydantic schemas

## 🧪 Testing (Coming Soon)

- Backend: pytest for unit/integration tests
- Frontend: Vitest + React Testing Library
- E2E: Playwright (future)

## 📝 License

Private - All Rights Reserved

---

**Status**: Phase 1 Complete ✅
**Version**: 0.1.0
**Last Updated**: 2026-02-02

Built with ❤️ using FastAPI, React, and TypeScript
