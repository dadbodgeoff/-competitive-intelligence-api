# 🍕 Competitive Intelligence API

A full-stack restaurant competitive analysis platform that uses AI to analyze competitor reviews and generate actionable business insights.

## 🚀 Features

- **🔍 Competitor Discovery** - Automatically find nearby competitors using Google Places API
- **📊 Review Analysis** - Fetch and analyze thousands of customer reviews
- **🤖 AI Insights** - Generate actionable insights using Google Gemini AI
- **📈 Tiered Analysis** - Free (3 competitors) and Premium (5 competitors) tiers
- **🎯 Smart Categorization** - Threats, opportunities, and watch items
- **📱 Modern Frontend** - React + TypeScript with real-time progress tracking
- **🔐 Secure Authentication** - JWT-based auth with Supabase backend
- **⚡ Fast Performance** - Optimized pipeline with caching

## 🏗️ Architecture

### Backend (Python FastAPI)
- **API Routes** - RESTful endpoints for analysis and authentication
- **Services** - Modular services for Google Places, review fetching, and LLM analysis
- **Database** - Supabase PostgreSQL with RLS policies
- **Authentication** - JWT tokens with secure user management

### Frontend (React + TypeScript)
- **Modern UI** - Tailwind CSS with shadcn/ui components
- **State Management** - Zustand for auth and application state
- **Real-time Updates** - Progress tracking during analysis
- **Responsive Design** - Mobile-first approach

## 🛠️ Tech Stack

**Backend:**
- Python 3.11+
- FastAPI
- Supabase (PostgreSQL)
- Google Places API
- Google Gemini AI
- Pydantic for validation

**Frontend:**
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Query
- React Router

## 📋 Prerequisites

- Python 3.11+
- Node.js 18+
- Supabase account
- Google Cloud Platform account (for Places & Gemini APIs)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd competitive-intelligence-api
```

### 2. Backend Setup
```bash
# Install Python dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Edit .env with your API keys and database credentials
```

### 3. Database Setup
```bash
# Run the database schema in your Supabase SQL editor
# File: database/schema.sql
```

### 4. Frontend Setup
```bash
cd frontend
npm install
```

### 5. Start Development Servers

**Backend:**
```bash
python -m uvicorn api.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173` to access the application.

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google APIs
GOOGLE_PLACES_API_KEY=your_places_api_key
GOOGLE_GEMINI_API_KEY=your_gemini_api_key

# JWT
JWT_SECRET_KEY=your_secret_key
```

### API Keys Setup

1. **Supabase**: Create project at [supabase.com](https://supabase.com)
2. **Google Places API**: Enable in [Google Cloud Console](https://console.cloud.google.com)
3. **Google Gemini API**: Get key from [AI Studio](https://aistudio.google.com)

## 📊 Usage

### Creating an Analysis

1. **Register/Login** - Create account or sign in
2. **New Analysis** - Enter restaurant details
3. **Choose Tier** - Free (3 competitors) or Premium (5 competitors)
4. **Wait for Results** - Real-time progress tracking
5. **View Insights** - Analyze competitors and actionable insights

### Analysis Results Include:

- **Competitor Overview** - Ratings, reviews, distance, addresses
- **AI Insights** - Categorized threats, opportunities, and watch items
- **Evidence Quotes** - Supporting customer review excerpts
- **Confidence Scores** - High/Medium/Low confidence ratings

## 🏢 Business Tiers

### Free Tier
- 3 competitors analyzed
- Basic insights generation
- Standard processing
- $0.11 estimated cost per analysis

### Premium Tier
- 5 competitors analyzed
- Advanced strategic insights
- Priority processing
- $0.25 estimated cost per analysis

## 🔐 Security

- **Environment Variables** - All secrets in `.env` (never committed)
- **JWT Authentication** - Secure token-based auth
- **RLS Policies** - Row-level security in database
- **Input Validation** - Pydantic schemas for all inputs
- **Rate Limiting** - API rate limits by tier

## 🧪 Testing

### Backend Tests
```bash
python test_complete_system_end_to_end.py
python test_frontend_backend_flow.py
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## 📁 Project Structure

```
competitive-intelligence-api/
├── api/                    # FastAPI backend
│   ├── routes/            # API endpoints
│   ├── middleware/        # Auth & CORS
│   └── schemas/           # Pydantic models
├── services/              # Business logic
│   ├── google_places_service.py
│   ├── llm_analysis_service.py
│   └── review_fetching_service.py
├── database/              # Database schemas & migrations
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API services
│   │   ├── stores/        # State management
│   │   └── types/         # TypeScript types
└── prompts/               # AI prompts
```

## 🚀 Deployment

### Backend Deployment
- Deploy to Railway, Heroku, or AWS
- Set environment variables
- Run database migrations

### Frontend Deployment
- Build: `npm run build`
- Deploy to Vercel, Netlify, or AWS S3
- Configure API URL

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder
- **Issues**: Open GitHub issues for bugs
- **Questions**: Use GitHub discussions

## 🎯 Roadmap

- [ ] Menu intelligence module
- [ ] Advanced analytics dashboard
- [ ] Multi-location support
- [ ] API rate optimization
- [ ] Mobile app

---

**Built with ❤️ for restaurant owners who want to stay competitive**