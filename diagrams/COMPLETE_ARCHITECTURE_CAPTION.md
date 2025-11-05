# Complete Architecture: Restaurant Intelligence SaaS Platform

Built a production-ready full-stack AI platform with 5 core modules, real-time streaming, and enterprise-grade security.

## 🏗️ Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS + Shadcn UI
- **Backend**: FastAPI + Python 3.14
- **Database**: Supabase PostgreSQL (45 tables, 10+ functions, 20+ indexes)
- **AI**: Google Gemini 2.0 Flash (Vision + Text)
- **Caching**: Redis (rate limiting + sessions)
- **Security**: HTTPOnly cookies, CSP, RLS, ClamAV malware scanning

## 🚀 Key Features

### 5 Core Modules
1. **Review Analysis** - Competitive intelligence from customer reviews
2. **Invoice Processing** - Parse vendor invoices, track prices (Gemini Vision)
3. **Menu Management** - Parse menus, calculate COGS (Gemini Vision)
4. **Menu Comparison** - Compare your menu vs competitors
5. **Price Analytics** - Track price changes, detect anomalies, forecast trends

### Real-Time Streaming
- Server-Sent Events (SSE) for live progress updates
- 3 streaming endpoints: analysis, invoice parsing, menu parsing
- Custom React hooks: `useStreamingAnalysis`, `useInvoiceParseStream`, `useMenuParseStream`
- 0-100% progress tracking with step-by-step updates

### Enterprise Security
- ✅ HTTPOnly Cookies (SameSite=Lax) - No localStorage
- ✅ JWT Authentication (HS256)
- ✅ Content Security Policy (CSP) headers
- ✅ Row Level Security (RLS) on all user tables
- ✅ ClamAV malware scanning on all uploads
- ✅ Rate limiting (tier-based, Redis-backed)
- ✅ Error sanitization (prod/dev aware)
- ✅ HSTS + X-Frame-Options + X-Content-Type-Options

### Tier-Based Access Control
- **Free**: 2 analyses/week, 1 invoice/week, 1 menu/week
- **Premium**: 50 invoices/hour, 20 menus/hour, unlimited analyses
- **Enterprise**: Unlimited everything + API access
- Atomic database operations prevent race conditions

## 📊 By The Numbers
- **45** Database Tables
- **47** Backend Services
- **7** API Route Groups
- **5** Middleware Layers
- **20** Frontend Pages
- **5** LLM Services (Free, Enhanced, Premium, Invoice Parser, Menu Parser)
- **3** Subscription Tiers
- **10+** Database Functions
- **20+** Database Indexes

## 🎯 Architecture Highlights

### Request Lifecycle
```
Browser → Security Headers → React → API Gateway → Middleware Stack → 
Route Groups → Service Layer → AI/LLM → Database → Response
```

### File Upload Flow
```
Upload → Validate (10MB, PDF/Image) → Malware Scan (ClamAV) → 
Duplicate Check (File Hash) → Store (Supabase) → Parse (Gemini Vision) → 
Stream Progress (SSE) → Save Results → Display
```

### Authentication Flow
```
Login → Supabase Auth → Generate JWT → Set HTTPOnly Cookie → 
Every Request → Validate JWT → Check RLS → Allow/Deny
```

## 💡 Challenges Overcome

### 1. HTTPOnly Cookie Auth (8 hours debugging)
**Problem**: Cookies not being sent cross-domain  
**Solution**: `SameSite=Lax` + `withCredentials: true` + Vite proxy config

### 2. Race Conditions in Usage Limits
**Problem**: Multiple concurrent requests bypassing limits  
**Solution**: Atomic database functions with `FOR UPDATE` locks

### 3. CSP Configuration
**Problem**: Balancing security with Google Fonts + external APIs  
**Solution**: Environment-based CSP with report-only mode for testing

### 4. Fuzzy Matching for Invoice Parsing
**Problem**: Vendor item names don't match inventory  
**Solution**: Levenshtein + Jellyfish algorithms → 95%+ accuracy

### 5. SSE vs WebSockets
**Problem**: WebSockets overkill for one-way streaming  
**Solution**: Server-Sent Events (SSE) - simpler, better for progress updates

### 6. RLS Policies
**Problem**: Complex multi-table queries with RLS  
**Solution**: Service client for admin operations, user client for RLS enforcement

### 7. Real-Time Progress Tracking
**Problem**: Users want to see AI processing in real-time  
**Solution**: SSE streaming with step-by-step updates (0-100%)

## 🔧 What I Learned

1. **FastAPI middleware ordering matters** - Security headers → CORS → Auth → Rate limiting
2. **Supabase RLS is powerful but tricky** - Use service client for admin, user client for RLS
3. **SSE is better than WebSockets for one-way streaming** - Simpler protocol, auto-reconnect
4. **Redis is essential for rate limiting at scale** - In-memory counters with TTL
5. **Atomic operations prevent race conditions** - Database functions with locks
6. **Error sanitization is critical** - Never expose stack traces in production
7. **Performance profiling saves time** - Track every step, identify bottlenecks

## 🎨 Design Decisions

### Why FastAPI?
- Async/await support for concurrent operations
- Automatic OpenAPI docs
- Pydantic validation
- Middleware ecosystem

### Why Supabase?
- PostgreSQL with built-in auth
- Row Level Security (RLS)
- Real-time subscriptions
- File storage with signed URLs

### Why Gemini 2.0 Flash?
- Vision + Text in one model
- Structured output (JSON schema)
- Fast inference (8-12s for invoices)
- Cost-effective ($0.11-$0.35 per analysis)

### Why SSE over WebSockets?
- One-way communication (server → client)
- Auto-reconnect built-in
- Simpler protocol
- Better for progress updates

## 📈 Performance

- **Invoice Parsing**: 8-12 seconds average (Gemini Vision)
- **Review Analysis**: 30-60 seconds average (depends on review count)
- **Menu Parsing**: 10-15 seconds average (Gemini Vision)
- **Fuzzy Matching**: 95%+ accuracy (Levenshtein + Jellyfish)
- **Database Queries**: <100ms average (20+ indexes)

## 🚢 Deployment

- Docker + docker-compose
- Health checks (`/health`, `/api/v1/health`)
- Environment-based config (dev/prod)
- Redis for caching + rate limiting
- ClamAV for malware scanning

## 🔮 What's Next?

- [ ] Stripe integration for payments
- [ ] Email notifications (SendGrid)
- [ ] Export to PDF/Excel
- [ ] Mobile app (React Native)
- [ ] API access for enterprise tier
- [ ] Custom reports builder
- [ ] Multi-restaurant support
- [ ] Team collaboration features

## 🤔 Questions I Can Answer

- How did you implement HTTPOnly cookie auth?
- How does the fuzzy matching work?
- How do you prevent race conditions in usage limits?
- How does SSE streaming work?
- How do you handle errors in production?
- How do you structure a FastAPI project?
- How do you implement Row Level Security?

## 📚 Tech Stack Deep Dive

### Frontend (React 18 + TypeScript)
- **Routing**: React Router v6
- **State**: Zustand (auth), React Query (data)
- **UI**: Shadcn UI + TailwindCSS
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Streaming**: EventSource API (SSE)

### Backend (FastAPI + Python 3.14)
- **Web Framework**: FastAPI
- **Auth**: Supabase Auth + JWT
- **Database**: Supabase PostgreSQL
- **Caching**: Redis
- **AI**: Google Gemini 2.0 Flash
- **File Processing**: ClamAV, PIL, PyPDF2
- **Fuzzy Matching**: Levenshtein, Jellyfish

### Database (Supabase PostgreSQL)
- **Tables**: 45 (users, analyses, invoices, menus, etc.)
- **Functions**: 10+ (fuzzy matching, price analytics, atomic operations)
- **Indexes**: 20+ (performance optimization)
- **RLS**: Row Level Security on all user tables
- **Triggers**: Automatic timestamps, cascade deletes

### Infrastructure
- **Hosting**: Docker + docker-compose
- **Caching**: Redis
- **Storage**: Supabase Storage (signed URLs)
- **Monitoring**: Performance profiler, event bus
- **Security**: ClamAV, CSP, HSTS, X-Frame-Options

## 💬 Reddit-Ready Talking Points

**For r/webdev**:
> Built a full-stack AI platform with real-time streaming. React → FastAPI → Gemini AI → PostgreSQL. HTTPOnly cookies for auth, SSE for real-time updates, Redis for rate limiting. 8 hours debugging auth but we made it! 🎉

**For r/SideProject**:
> Restaurant intelligence platform that analyzes competitor reviews, parses invoices, and compares menus using AI. Free tier with usage limits, premium for unlimited. Built with React + FastAPI + Gemini 2.0.

**For r/Python**:
> FastAPI backend with 47 services, 7 route groups, 5 middleware layers. Integrated Google Gemini for AI parsing, Supabase for database + auth, Redis for caching. Real-time SSE streaming for progress updates.

**For r/reactjs**:
> React 18 + TypeScript frontend with 20 pages, real-time SSE streaming, Zustand for auth, React Query for data. Built a complete SaaS platform with tier-based access control.

**For LinkedIn**:
> Shipped a production-ready SaaS platform with 5 core modules, real-time AI processing, and enterprise-grade security. React + FastAPI + Gemini AI + Supabase. Key features: HTTPOnly cookies, CSP headers, RLS policies, atomic usage limits, SSE streaming. #WebDev #AI #FullStack

## 🔗 Links

- **Live Demo**: [Coming Soon]
- **GitHub**: [Private Repo]
- **Tech Blog**: [Coming Soon]
- **Twitter**: [@YourHandle]

---

**Built with ❤️ and lots of ☕**

*Questions? Comments? Roasts? Drop them below! 👇*
