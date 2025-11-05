# Content Security Policy (CSP) Implementation Audit Prompt

## Objective
Perform a comprehensive audit of the entire application infrastructure to identify all resources, dependencies, and configurations required to implement a strict Content Security Policy without breaking functionality.

---

## Phase 1: Frontend Resource Discovery

### 1.1 External Scripts & CDNs
**Task:** Scan the entire frontend codebase for external script sources.

**Search for:**
- `<script src="https://...">` in HTML files
- `import ... from 'https://...'` in JS/TS files
- Dynamic script injection: `document.createElement('script')`
- Third-party libraries loaded from CDNs
- Analytics scripts (Google Analytics, Mixpanel, etc.)
- Error tracking (Sentry, LogRocket, etc.)
- Payment processors (Stripe, PayPal)
- Social media widgets (Twitter, Facebook)

**Files to check:**
- `frontend/index.html`
- `frontend/public/*.html`
- All `.tsx`, `.ts`, `.jsx`, `.js` files
- `package.json` for CDN-loaded dependencies

**Document:**
- Full URL of each external resource
- Purpose of the resource
- Whether it can be self-hosted
- Whether it loads additional resources

---

### 1.2 Inline Scripts & Styles
**Task:** Identify all inline JavaScript and CSS that will be blocked by strict CSP.

**Search for:**
- `<script>` tags without `src` attribute
- `<style>` tags in HTML
- `style="..."` inline attributes
- `onclick="..."`, `onload="..."` event handlers
- `javascript:` URLs
- `eval()`, `Function()`, `setTimeout(string)` usage

**Files to check:**
- All HTML files
- All React/Vue/Svelte components
- Build output in `dist/` or `build/`

**Document:**
- Location of each inline script/style
- Whether it can be moved to external file
- Whether it requires `unsafe-inline` (last resort)

---

### 1.3 Image & Media Sources
**Task:** Catalog all image, video, and media sources.

**Search for:**
- `<img src="...">` tags
- CSS `background-image: url(...)`
- `<video>`, `<audio>` sources
- Blob URLs, Data URLs
- User-uploaded content domains
- External image CDNs (Cloudinary, Imgix, etc.)

**Files to check:**
- All component files
- All CSS files
- API responses that return image URLs

**Document:**
- All domains serving images
- Whether user-generated content is allowed
- Whether data: URIs are used

---

### 1.4 Font Sources
**Task:** Identify all font loading mechanisms.

**Search for:**
- Google Fonts links
- `@font-face` declarations
- Font CDNs (Adobe Fonts, Font Awesome)
- Local font files

**Files to check:**
- `index.html` for font links
- All CSS files for `@font-face`
- `tailwind.config.ts` for font configurations

**Document:**
- All font source domains
- Whether fonts can be self-hosted

---

### 1.5 WebSocket & Server-Sent Events
**Task:** Find all real-time connection endpoints.

**Search for:**
- `new WebSocket(...)`
- `new EventSource(...)`
- Socket.io connections
- Supabase Realtime connections

**Files to check:**
- All service files
- Streaming/real-time features
- `services/redis_client.py` usage in frontend

**Document:**
- All WebSocket URLs
- All SSE endpoints
- Connection protocols (ws://, wss://)

---

### 1.6 API Endpoints & AJAX Calls
**Task:** Map all API endpoints the frontend connects to.

**Search for:**
- `fetch()` calls
- `axios` requests
- `XMLHttpRequest` usage
- API base URLs in config

**Files to check:**
- `frontend/src/services/api/*.ts`
- Environment variable files
- API client configurations

**Document:**
- All API domains
- Whether they're same-origin or cross-origin
- Whether they use credentials

---

### 1.7 Form Actions & Redirects
**Task:** Identify form submission targets and navigation.

**Search for:**
- `<form action="...">` tags
- `window.location.href = ...`
- `window.open(...)`
- OAuth redirect URLs
- Payment redirect URLs

**Files to check:**
- All form components
- Auth flows
- Payment flows

**Document:**
- All external form targets
- All redirect destinations

---

## Phase 2: Backend Resource Discovery

### 2.1 Response Headers Audit
**Task:** Check what headers the backend currently sends.

**Search for:**
- Existing security headers
- CORS headers
- Cache-Control headers
- Content-Type headers

**Files to check:**
- `api/main.py` middleware
- All route handlers
- Nginx/Apache configs (if applicable)

**Document:**
- Current header configuration
- Conflicts with CSP

---

### 2.2 HTML Response Generation
**Task:** Find where backend generates HTML.

**Search for:**
- Template rendering
- HTML string concatenation
- Email templates with inline styles
- Error pages

**Files to check:**
- All route handlers
- Template directories
- Email service files

**Document:**
- All HTML generation points
- Whether they use inline scripts/styles

---

### 2.3 File Upload & User Content
**Task:** Identify user-generated content handling.

**Search for:**
- File upload endpoints
- Image processing
- PDF generation
- Where uploaded files are served from

**Files to check:**
- `api/routes/invoices/upload.py`
- `api/routes/menu/upload.py`
- Storage service configurations

**Document:**
- Upload domains
- Content-Type validation
- Whether user content can contain scripts

---

## Phase 3: Third-Party Service Audit

### 3.1 External Services Inventory
**Task:** List all third-party services the app integrates with.

**Check:**
- Supabase (database, auth, storage)
- Google APIs (Places, Gemini, Custom Search)
- SerpAPI
- Outscraper
- Redis
- Sentry (if configured)
- Payment processors
- Email services

**Document:**
- Service domains
- API endpoints
- Whether they load additional resources
- Whether they require `connect-src` permissions

---

### 3.2 OAuth & Authentication Flows
**Task:** Map authentication redirect flows.

**Check:**
- Supabase Auth redirects
- Social login providers
- OAuth callback URLs

**Files to check:**
- `api/routes/auth.py`
- Frontend auth components
- Supabase configuration

**Document:**
- All auth redirect domains
- Callback URLs

---

## Phase 4: Build & Development Tools

### 4.1 Development Server
**Task:** Identify dev-only resources.

**Check:**
- Vite dev server
- Hot module replacement (HMR)
- Dev tools
- Source maps

**Document:**
- Dev server URLs
- Whether CSP should differ in dev vs prod

---

### 4.2 Build Process
**Task:** Understand how assets are bundled.

**Check:**
- Vite/Webpack configuration
- Asset hashing
- Code splitting
- Dynamic imports

**Files to check:**
- `vite.config.ts`
- `package.json` build scripts

**Document:**
- Whether nonces are needed
- Whether hashes can be used

---

## Phase 5: Security Risk Assessment

### 5.1 XSS Attack Vectors
**Task:** Identify potential XSS vulnerabilities.

**Check for:**
- User input rendering without sanitization
- `dangerouslySetInnerHTML` usage
- `innerHTML` assignments
- URL parameter rendering
- Database content rendering

**Files to check:**
- All React components
- API response handling
- Form input handling

**Document:**
- High-risk components
- Where user content is displayed

---

### 5.2 Current XSS Protections
**Task:** Audit existing XSS defenses.

**Check:**
- Input validation
- Output encoding
- React's built-in escaping
- DOMPurify or similar libraries

**Document:**
- What's already protected
- What needs additional protection

---

## Phase 6: CSP Policy Design

### 6.1 Directive Requirements
**Task:** For each CSP directive, determine requirements.

**Directives to configure:**

**default-src**
- Fallback for all other directives
- Recommendation: `'self'`

**script-src**
- All JavaScript sources
- Whether `'unsafe-inline'` is needed (avoid!)
- Whether `'unsafe-eval'` is needed (avoid!)
- Nonce or hash strategy

**style-src**
- All CSS sources
- Inline styles requirements
- Tailwind CSS considerations

**img-src**
- All image sources
- Data URIs (`data:`)
- Blob URLs (`blob:`)

**font-src**
- All font sources

**connect-src**
- All API endpoints
- WebSocket URLs
- Third-party APIs

**frame-src**
- Embedded iframes (if any)

**media-src**
- Video/audio sources

**object-src**
- Plugins (should be `'none'`)

**base-uri**
- Restrict `<base>` tag (should be `'self'`)

**form-action**
- Form submission targets

**frame-ancestors**
- Who can embed your site (clickjacking protection)

**upgrade-insecure-requests**
- Force HTTPS

---

### 6.2 Nonce vs Hash Strategy
**Task:** Decide on nonce or hash implementation.

**Considerations:**
- Nonces require server-side generation per request
- Hashes work for static content
- Which fits your architecture better?

**Document:**
- Chosen strategy
- Implementation approach

---

### 6.3 Report-Only Mode
**Task:** Plan CSP rollout strategy.

**Steps:**
1. Deploy with `Content-Security-Policy-Report-Only`
2. Monitor violation reports
3. Adjust policy
4. Switch to enforcing mode

**Document:**
- Report URI endpoint
- Monitoring strategy

---

## Phase 7: Implementation Checklist

### 7.1 Backend Changes Required
- [ ] Add CSP middleware to FastAPI
- [ ] Generate nonces per request (if using nonces)
- [ ] Add CSP header to all HTML responses
- [ ] Set up violation reporting endpoint
- [ ] Configure environment-specific policies

### 7.2 Frontend Changes Required
- [ ] Remove all inline scripts
- [ ] Remove all inline styles
- [ ] Remove all inline event handlers
- [ ] Add nonce to dynamically created scripts
- [ ] Update build process for hashes
- [ ] Test all third-party integrations

### 7.3 Infrastructure Changes Required
- [ ] Update CDN configuration
- [ ] Configure reverse proxy headers
- [ ] Set up CSP reporting service
- [ ] Update deployment scripts

---

## Deliverables

### 1. Resource Inventory Document
Complete list of:
- All external domains
- All inline scripts/styles
- All third-party services
- All API endpoints

### 2. CSP Policy Draft
Initial policy with:
- All required directives
- Justification for each entry
- Fallback options

### 3. Migration Plan
Step-by-step plan including:
- Code changes required
- Testing strategy
- Rollout phases
- Rollback plan

### 4. Risk Assessment
Document covering:
- Current XSS vulnerabilities
- CSP coverage gaps
- Residual risks

---

## Testing Requirements

### Test Cases
1. **Functionality Testing**
   - All features work with CSP enabled
   - No console errors
   - No broken resources

2. **Security Testing**
   - XSS payloads blocked
   - Inline scripts blocked
   - External scripts from unauthorized domains blocked

3. **Performance Testing**
   - No significant performance impact
   - Caching still works

4. **Browser Compatibility**
   - Test in Chrome, Firefox, Safari, Edge
   - Graceful degradation for old browsers

---

## Success Criteria

- [ ] Zero CSP violations in production
- [ ] All features functional
- [ ] No `unsafe-inline` or `unsafe-eval` in production policy
- [ ] XSS attacks demonstrably blocked
- [ ] Policy documented and maintainable
- [ ] Team trained on CSP maintenance

---

## Agent Instructions

As an AI agent performing this audit:

1. **Be thorough**: Check every file, don't skip anything
2. **Be specific**: Provide exact file paths and line numbers
3. **Be practical**: Suggest realistic solutions, not just theoretical best practices
4. **Be cautious**: Flag anything that looks risky
5. **Be clear**: Explain technical concepts in plain language
6. **Prioritize**: Mark critical issues vs nice-to-haves
7. **Provide examples**: Show actual code snippets where relevant

Start with Phase 1 and work through systematically. For each finding, provide:
- **What**: What did you find?
- **Where**: Exact file path and line number
- **Why it matters**: Security/functionality impact
- **Recommendation**: What to do about it
- **Priority**: Critical/High/Medium/Low

Generate a comprehensive report that a developer can use to implement CSP without breaking the application.
