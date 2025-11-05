# Complete Infrastructure & Security Architecture

**Diagram:** `31_complete_infrastructure_security.mmd`

## Overview

This diagram shows your complete production-ready infrastructure with all security layers, data flows, and system integrations mapped accurately.

---

## Architecture Layers (Top to Bottom)

### 1. Client Layer
- **Browser** - User's web browser
- **React DevTools** - Development tools (dev only)

### 2. Security Layer - Browser
All security headers implemented via `SecurityHeadersMiddleware`:
- **CSP** - Content Security Policy (blocks XSS)
- **HSTS** - HTTP Strict Transport Security (forces HTTPS)
- **X-Frame-Options** - Clickjacking protection (DENY)
- **X-Content-Type-Options** - MIME sniffing protection
- **SameSite=Lax** - CSRF protection via cookies

### 3. Frontend - React/Vite
- **Pages** - Dashboard, Analysis, Invoices, Menu, etc.
- **Components** - Reusable UI components
- **Auth Store** - Zustand state management (no localStorage)
- **API Client** - Axios with `withCredentials: true`
- **Monitoring** - Optional Sentry/PostHog integration

### 4. Network Layer
- **CORS** - Restricts origins to localhost (dev) or production domain
- **HTTPS/TLS** - Encrypted transport (production only)

### 5. API Gateway - FastAPI
**Middleware Stack (in order):**
1. SecurityHeadersMiddleware - Adds all security headers
2. CORSMiddleware - Handles cross-origin requests
3. Request Logging - Logs requests, sanitizes auth headers
4. Global Exception Handler - Uses ErrorSanitizer

**Special Endpoints:**
- `/health` - Simple health check
- `/api/v1/health` - Detailed health check (DB, Redis, ClamAV)
- `/api/csp-report` - CSP violation logging

### 6. Authentication Layer
- **Auth Routes** - Login, register, logout, refresh
- **get_current_user** - Middleware that validates JWT from HTTPOnly cookie
- **JWT Validation** - HS256 algorithm
- **Supabase Auth** - User management backend

### 7. API Routes Layer

**Analysis Module:**
- Tier Analysis (Free/Pro/Premium)
- Streaming Analysis (SSE)
- Analysis Orchestrator

**Invoice Module:**
- Upload (rate limited)
- Parse (SSE streaming)
- Management (CRUD)
- Processing (inventory updates)

**Menu Module:**
- Upload (rate limited)
- Parse (SSE streaming)
- Management (CRUD)
- Recipes (ingredient mapping)
- Comparison (competitor analysis)

**Other Routes:**
- Subscription management
- Price analytics
- User preferences

### 8. Rate Limiting Layer
- **Rate Limiting Middleware** - Enforces limits per tier
- **Redis** - Stores rate limit counters and session data

### 9. Service Layer

**File Processing:**
- File Validator (10MB limit, PDF/Image only)
- Malware Scanner (ClamAV integration)
- Duplicate Detector (file hash checking)

**LLM Services:**
- Free Tier LLM (basic analysis)
- Enhanced LLM (pro features)
- Premium LLM (full features)
- Menu Parser (Gemini Vision)
- Invoice Parser (Gemini Vision)

**Data Services:**
- Fuzzy Matcher (Levenshtein + Jellyfish algorithms)
- Unit Converter (standardization)
- Price Analytics Service
- Vendor Item Mapper

**Storage Services:**
- Invoice Storage (Supabase bucket)
- Menu Storage (Supabase bucket)
- Analysis Storage (with evidence)
- Menu Comparison Storage

**Security Services:**
- Error Sanitizer (prod/dev aware)
- Ownership Validator (user data access control)

**Monitoring Services:**
- Invoice Monitoring (session tracking)
- Performance Profiler (timing analysis)
- Event Bus (async processing)

### 10. External APIs (Backend Only)
- **Google Gemini** - LLM processing
- **Google Places** - Competitor discovery
- **SerpAPI** - Premium review fetching
- **Outscraper** - Review fetching

### 11. Database Layer - Supabase PostgreSQL

**Core Tables:**
- users (RLS enabled)
- analyses (RLS enabled)
- reviews (RLS enabled)
- competitors

**Invoice Tables:**
- invoices (RLS enabled)
- invoice_items
- inventory_transactions
- item_price_tracking

**Menu Tables:**
- menus (RLS enabled)
- menu_items
- menu_item_ingredients
- competitor_menus
- competitor_menu_items
- saved_menu_comparisons

**Inventory Tables:**
- inventory_items (master data)
- vendors
- categories
- units_of_measure

**System Tables:**
- subscriptions
- usage_limits (atomic updates)
- user_preferences

**Security Features:**
- Row Level Security (RLS) on all user tables
- Database Functions (fuzzy matching, price analytics, cascade deletes)

### 12. Storage Layer - Supabase
- **Invoices Bucket** - Signed URLs (1 hour expiry)
- **Menus Bucket** - Signed URLs (1 hour expiry)

---

## Security Chains of Command

### Authentication Chain
```
Browser → HTTPOnly Cookie → get_current_user → JWT Validation → Supabase Auth → User Record
```

### Authorization Chain
```
User Request → Ownership Validator → RLS Policies → Database Query → User's Data Only
```

### File Upload Security Chain
```
File Upload → File Validator (size/type) → Malware Scanner (ClamAV) → Duplicate Detector (hash) → Supabase Storage
```

### Error Handling Chain
```
Exception → Global Exception Handler → ErrorSanitizer → Safe Error Message → User
```

### Rate Limiting Chain
```
Request → Rate Limit Middleware → Redis Counter Check → Allow/Deny → Route Handler
```

---

## Data Flow Examples

### Invoice Processing Flow
```
1. User uploads PDF
2. File Validator checks size/type
3. Malware Scanner scans with ClamAV
4. Duplicate Detector checks file hash
5. Invoice Storage saves to Supabase bucket
6. Invoice Parser calls Gemini Vision API
7. Fuzzy Matcher maps items to inventory
8. Invoice data saved to database
9. Inventory transactions created
10. Price tracking updated
```

### Analysis Flow
```
1. User requests analysis
2. Rate Limiter checks quota
3. Analysis Orchestrator determines tier
4. Appropriate LLM service called
5. External APIs fetched (Places, SerpAPI)
6. Gemini processes data
7. Results stored in database
8. SSE streams progress to frontend
9. React updates UI in real-time
```

### Menu Comparison Flow
```
1. User uploads menu
2. Menu Parser extracts items
3. Competitor Discovery finds competitors
4. Competitor Menu Parser fetches menus
5. Menu Comparison LLM analyzes
6. Results stored in database
7. User can save comparison
8. Cascade delete available
```

---

## Security Highlights

### What Protects Against XSS
1. CSP headers (blocks inline scripts)
2. React auto-escaping (all user input)
3. No dangerouslySetInnerHTML usage
4. No eval() or Function() usage

### What Protects Against CSRF
1. SameSite=Lax cookies
2. CORS restrictions
3. Authentication required
4. No GET mutations

### What Protects Against SQL Injection
1. Supabase client (parameterized queries)
2. No f-string SQL queries
3. Pydantic input validation
4. Database functions (safe)

### What Protects Against Unauthorized Access
1. JWT authentication on all routes
2. Row Level Security (RLS) on database
3. Ownership Validator service
4. User-scoped storage paths

### What Protects Against Malware
1. ClamAV malware scanning
2. File type validation
3. File size limits (10MB)
4. PDF signature validation

### What Protects Against Information Leakage
1. Error Sanitizer (prod/dev aware)
2. Global exception handler
3. Request logging sanitizes auth headers
4. No PII in logs

---

## Color Legend

- **Red** - Security components
- **Blue** - Frontend components
- **Green** - Backend/API components
- **Yellow** - Database components
- **Purple** - External APIs
- **Orange** - Storage components

---

## Key Architectural Decisions

### Why HTTPOnly Cookies?
- Prevents XSS token theft
- Browser handles storage securely
- Automatic inclusion in requests
- SameSite provides CSRF protection

### Why SSE Instead of WebSockets?
- Simpler implementation
- One-way communication sufficient
- Works with standard HTTP
- No special server requirements

### Why Supabase?
- Built-in RLS (row-level security)
- PostgreSQL (reliable, feature-rich)
- Storage buckets included
- Auth handled out of box

### Why Redis?
- Fast rate limit counters
- Session data caching
- Duplicate detection (file hashes)
- Minimal overhead

### Why Gemini Vision?
- Excellent OCR for invoices/menus
- Structured output
- Cost-effective
- Good accuracy

---

## Production Readiness Checklist

✅ **Security Headers** - All implemented  
✅ **Authentication** - JWT + HTTPOnly cookies  
✅ **Authorization** - RLS + Ownership validation  
✅ **Rate Limiting** - Per-tier limits enforced  
✅ **Error Handling** - Sanitized, no leaks  
✅ **Input Validation** - Pydantic on all inputs  
✅ **File Security** - Malware scanning, validation  
✅ **CORS** - Restricted origins  
✅ **HTTPS** - HSTS enforced in production  
✅ **Monitoring** - Health checks, optional Sentry  

---

## Environment Variables Required

**Backend (.env):**
```bash
# Core
ENVIRONMENT=production
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
JWT_SECRET_KEY=xxx

# Security
CSP_REPORT_ONLY=false
USE_GOOGLE_FONTS=true
COOKIE_SECURE=true

# External APIs
GOOGLE_GEMINI_API_KEY=xxx
GOOGLE_PLACES_API_KEY=xxx
SERPAPI_KEY=xxx (optional)

# Infrastructure
REDIS_URL=redis://localhost:6379
```

**Frontend (.env.production):**
```bash
VITE_API_URL=https://api.yourdomain.com
VITE_SENTRY_DSN=xxx (optional)
VITE_POSTHOG_KEY=xxx (optional)
```

---

## Deployment Notes

1. **Set ENVIRONMENT=production** - Enables HSTS, strict CSP
2. **Configure HTTPS** - Required for HSTS, secure cookies
3. **Update CORS origins** - Change from localhost to production domain
4. **Rotate secrets** - New JWT_SECRET_KEY for production
5. **Start Redis** - Required for rate limiting
6. **Start ClamAV** - Required for malware scanning
7. **Verify RLS policies** - Check database security
8. **Monitor CSP violations** - Check /api/csp-report logs

---

## This Diagram Shows

✅ Every security layer  
✅ Every middleware in order  
✅ Every service and its dependencies  
✅ Every database table and relationship  
✅ Every external API integration  
✅ Every data flow path  
✅ Every authentication/authorization check  
✅ Every file processing step  

**This is your complete, production-ready infrastructure.**
