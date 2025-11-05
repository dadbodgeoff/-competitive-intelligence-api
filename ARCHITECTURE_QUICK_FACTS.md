# Architecture Quick Facts - For Diagrams & Social Posts

## The Stack (One-Liner)
React + TypeScript + FastAPI + Supabase + Gemini AI + Redis + Docker

## By The Numbers
- **5** Core Modules (Review Analysis, Invoice Processing, Menu Management, Menu Comparison, Price Analytics)
- **23** Database Tables
- **40+** Backend Services
- **7** API Route Groups
- **4** Middleware Layers
- **20** Frontend Pages
- **3** Subscription Tiers
- **10+** Database Functions
- **20+** Database Indexes
- **5** LLM Services

## Security Highlights
✅ HTTPOnly Cookies (SameSite=Lax)
✅ JWT Authentication (HS256)
✅ Content Security Policy (CSP)
✅ Row Level Security (RLS)
✅ ClamAV Malware Scanning
✅ Rate Limiting (Redis-backed)
✅ Error Sanitization
✅ HSTS + X-Frame-Options

## Real-Time Features
- Server-Sent Events (SSE) streaming
- Live progress updates (0-100%)
- Real-time dashboards
- Async processing with Event Bus

## AI/LLM Integration
- Google Gemini 2.0 Flash (Vision + Text)
- Invoice parsing (PDF/Image → structured data)
- Menu parsing (PDF/Image → menu items)
- Review analysis (text → insights)
- Menu comparison (competitive intelligence)

## Tier-Based Limits
**Free**: 2 analyses/week, 1 invoice/week, 1 menu/week
**Premium**: 50 invoices/hour, 20 menus/hour, unlimited analyses
**Enterprise**: Unlimited everything + API access

## Key Flows
1. **Auth**: Login → JWT → HTTPOnly Cookie → Middleware → RLS
2. **Upload**: File → Validate → Scan → Store → Parse (AI) → Stream (SSE) → Save
3. **Analysis**: Input → Discover → Fetch → Analyze (AI) → Generate Insights → Display

## External APIs
- Google Gemini API (LLM)
- Google Places API (competitor discovery)
- SerpAPI (premium reviews)
- Outscraper (review scraping)

## Database Highlights
- Supabase PostgreSQL 15+
- Row Level Security on all user tables
- Atomic operations for usage limits
- Fuzzy matching functions (Levenshtein + Jellyfish)
- Price analytics functions
- Cascade delete functions

## Deployment
- Docker + docker-compose
- Health checks (/health, /api/v1/health)
- Environment-based config (dev/prod)
- Redis for caching + rate limiting

## Performance
- Invoice parsing: 8-12 seconds average
- Review analysis: 30-60 seconds average
- Menu parsing: 10-15 seconds average
- Fuzzy matching: 95%+ accuracy

## Reddit-Ready Talking Points

**For r/webdev**:
"Built a full-stack AI platform with real-time streaming. React → FastAPI → Gemini AI → PostgreSQL. HTTPOnly cookies for auth, SSE for real-time updates, Redis for rate limiting. 8 hours debugging auth but we made it! 🎉"

**For r/SideProject**:
"Restaurant intelligence platform that analyzes competitor reviews, parses invoices, and compares menus using AI. Free tier with usage limits, premium for unlimited. Built with React + FastAPI + Gemini 2.0."

**For r/Python**:
"FastAPI backend with 40+ services, 7 route groups, 4 middleware layers. Integrated Google Gemini for AI parsing, Supabase for database + auth, Redis for caching. Real-time SSE streaming for progress updates."

**For r/reactjs**:
"React 18 + TypeScript frontend with 20 pages, real-time SSE streaming, Zustand for auth, React Query for data. Built a complete SaaS platform with tier-based access control."

**For LinkedIn**:
"Shipped a production-ready SaaS platform with 5 core modules, real-time AI processing, and enterprise-grade security. React + FastAPI + Gemini AI + Supabase. Key features: HTTPOnly cookies, CSP headers, RLS policies, atomic usage limits, SSE streaming. #WebDev #AI #FullStack"

## Challenges Overcome (Great for Posts)
1. **HTTPOnly Cookie Auth**: 8 hours debugging cross-domain cookie issues
2. **Race Conditions**: Solved with atomic database functions
3. **CSP Configuration**: Balancing security with Google Fonts + external APIs
4. **Fuzzy Matching**: Achieved 95%+ accuracy for invoice parsing
5. **SSE Streaming**: Better than WebSockets for one-way real-time updates
6. **RLS Policies**: Powerful but tricky to get right
7. **Rate Limiting**: Redis-backed, tier-based, atomic operations

## What Makes This Impressive
✨ Production-ready security (CSP, RLS, HTTPOnly cookies)
✨ Real-time streaming (SSE, not polling)
✨ AI integration (Gemini Vision + Text)
✨ Tier-based access control (free/premium/enterprise)
✨ Atomic operations (race-condition safe)
✨ Comprehensive testing (unit, integration, E2E)
✨ Docker deployment (health checks, environment config)
✨ Modern stack (React 18, FastAPI, Supabase)

## Color Palette (for diagrams)
- Frontend: `#4F46E5` (Indigo)
- Backend: `#10B981` (Green)
- AI/LLM: `#F59E0B` (Amber)
- Database: `#3B82F6` (Blue)
- Security: `#EF4444` (Red)
- External: `#06B6D4` (Cyan)
- Cache: `#8B5CF6` (Purple)

---

**Use these facts to create impressive, accurate diagrams and social posts!** 🚀
