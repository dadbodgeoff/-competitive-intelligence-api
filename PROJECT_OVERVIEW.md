Competitive Intelligence Platform - Project Overview

## What This Application Does

A SaaS platform that analyzes competitor reviews using AI to provide actionable business insights for restaurants.

**Core Function**: Input your restaurant and location → System finds competitors → Analyzes their reviews → Generates strategic recommendations

## Architecture# 

### Frontend (React + TypeScript)
- Single Page Application with client-side routing
- Modern UI with TailwindCSS
- Real-time form validation
- Secure authentication flow
- Protected routes for authenticated users

### Backend (Python + FastAPI)
- RESTful API with async support
- JWT-based authentication
- Supabase integration for user management
- AI-powered analysis engine
- Google Places API integration for competitor discovery

### Database (Supabase PostgreSQL)
- User accounts and profiles
- Analysis history storage
- Row-level security policies
- Subscription tier management

## Features Built

### Authentication System
- User registration with email/password
- Secure login with JWT tokens
- Token refresh mechanism
- Protected routes (redirect to login if not authenticated)
- User profile management
- Logout functionality

### User Interface
- Landing page with product overview
- Login page
- Registration page
- Dashboard showing user info and quick actions
- Analysis creation form
- Toast notifications for user feedback

### Analysis Engine
- Competitor discovery via Google Places API
- Review fetching from multiple sources
- LLM-powered analysis using Google Gemini
- Insight categorization (strengths, weaknesses, opportunities, threats)
- Actionable recommendation generation
- Confidence scoring for insights

### API Endpoints

**Authentication**
- `POST /api/v1/auth/register` - Create new user account
- `POST /api/v1/auth/login` - Authenticate user
- `GET /api/v1/auth/me` - Get current user profile
- `POST /api/v1/auth/logout` - End user session

**Analysis**
- `POST /api/v1/analysis/run` - Start new competitive analysis
- `GET /api/v1/analysis/{id}` - Get analysis results
- `GET /api/v1/analysis/{id}/status` - Check analysis progress

**System**
- `GET /api/v1/health` - Health check endpoint

## Technology Stack

### Frontend
- React 18
- TypeScript
- Vite (build tool)
- React Router v6 (routing)
- React Query (data fetching)
- Zustand (state management)
- Axios (HTTP client)
- TailwindCSS (styling)
- Radix UI (component primitives)
- React Hook Form + Zod (form validation)

### Backend
- Python 3.14
- FastAPI (web framework)
- Uvicorn (ASGI server)
- Supabase (authentication & database)
- Google Gemini (LLM)
- Google Places API (competitor data)
- JWT (authentication tokens)

### Infrastructure
- Development servers on localhost
- Hot reload enabled
- CORS configured for local development
- Environment variable management

## Project Structure

```
src/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/          # Login, Register, UserProfile
│   │   │   ├── analysis/      # Analysis forms and results
│   │   │   └── ui/            # Reusable UI components
│   │   ├── pages/             # Route pages
│   │   ├── services/          # API clients
│   │   ├── stores/            # State management
│   │   └── types/             # TypeScript definitions
│   └── package.json
├── api/
│   ├── routes/                # API endpoints
│   ├── middleware/            # Auth, logging
│   └── schemas/               # Request/response models
├── services/
│   ├── llm_analysis_service.py
│   ├── review_fetching_service.py
│   └── google_places_service.py
└── database/
    └── schema.sql
```

## Current Status

### Working
- User registration and login
- Session management with JWT
- Protected route navigation
- Dashboard access
- Analysis form UI
- Backend analysis pipeline
- LLM insight generation
- Competitor comparison logic

### Pending
- Supabase RLS policy configuration (blocks database saves)
- Analysis results display page
- Analysis history view
- Subscription tier enforcement
- Payment integration
- Email verification

## Development Workflow

1. Start backend: `python -m uvicorn api.main:app --reload`
2. Start frontend: `cd frontend && npm run dev`
3. Access application: `http://localhost:5173`
4. API available at: `http://127.0.0.1:8000`

## Test Credentials

- Email: `nrivikings8@gmail.com`
- Password: `testpass123`
- Tier: Free

## Key Design Decisions

- JWT tokens stored in localStorage with encryption
- User profile fetched separately after login (backend doesn't return user in token response)
- Protected routes check auth state before rendering
- React Query for server state management
- Zustand for client state management
- Tailwind for consistent design system
- TypeScript for type safety
