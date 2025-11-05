# Restaurant Intelligence Platform

A full-stack SaaS platform for restaurant operators to manage invoices, track pricing, analyze menus, and gain competitive intelligence.

## Features

- **Invoice Management**: Upload and parse vendor invoices with AI
- **Price Analytics**: Track ingredient prices over time with alerts
- **Menu Intelligence**: Parse menus and calculate COGS
- **Competitor Analysis**: Compare your menu against competitors
- **Review Analysis**: AI-powered analysis of customer reviews
- **Multi-tier Subscriptions**: Free, Pro, and Enterprise tiers

## Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite
- TailwindCSS + shadcn/ui
- React Router
- Zustand (state management)
- Axios

**Backend:**
- FastAPI (Python 3.11)
- Supabase (PostgreSQL + Auth)
- Redis (caching)
- Google Gemini (LLM)
- Docker

## Quick Start (Development)

### Prerequisites
- Docker & Docker Compose
- Node.js 20+
- Python 3.11+

### Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd restaurant-intelligence
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Start development stack:
```bash
docker-compose -f docker-compose.dev.yml up
```

4. Access the app:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/api/docs

## Production Deployment

See `PRODUCTION_SETUP_GUIDE.md` for detailed deployment instructions.

### Quick Deploy to Digital Ocean

1. Create `.env.production` with production secrets
2. Build and deploy:
```bash
docker-compose build
docker-compose up -d
```

## Project Structure

```
├── api/                 # FastAPI backend routes
├── services/            # Business logic services
├── database/            # Database migrations
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API clients
│   │   └── stores/      # State management
├── config/              # Configuration
├── models/              # Data models
└── prompts/             # LLM prompts

```

## Environment Variables

Required environment variables:

```env
# Supabase
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT
JWT_SECRET_KEY=your-jwt-secret

# Google APIs
GOOGLE_GEMINI_API_KEY=your-gemini-key
GOOGLE_PLACES_API_KEY=your-places-key

# External Services
SERPAPI_KEY=your-serpapi-key
OUTSCRAPER_API_KEY=your-outscraper-key
```

## License

Proprietary - All Rights Reserved

## Support

For issues or questions, contact: [your-email]
