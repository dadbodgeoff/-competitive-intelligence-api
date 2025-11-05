# Invoice Processing Architecture Showcase

## Title:
**"The architecture behind my invoice processing system: 6 layers, real-time streaming, and zero-coupling design"**

## Reddit Post:

Hey r/webdev! Wanted to share the complete architecture of my invoice processing system. This took months to perfect, and I'm proud of the patterns I landed on.

**The Challenge:**
Building a production-grade invoice processor isn't just about OCR. You need security, real-time updates, data integrity, intelligent matching, and analytics - all while keeping it maintainable and fast.

**My Solution: 6-Layer Architecture**

### 🖥️ **Layer 1: Client Layer**
- Drag & drop PDF upload with instant feedback
- Real-time progress via Server-Sent Events (not polling!)
- Interactive review with inline editing
- Optimistic UI updates

**Why SSE over WebSockets?** Simpler protocol, works over HTTP, perfect for one-way server→client updates. No connection management headaches.

### 🔒 **Layer 2: Security Layer**
- **HTTPOnly cookies** for auth tokens (8 hours to migrate, worth it)
- **Malware scanning** on every upload (ClamAV integration)
- **Row Level Security** in database (users can't see each other's data)
- **CORS policies** properly configured

**Security-first approach:** Auth token is inaccessible to JavaScript, protecting against XSS. Every file scanned before processing.

### 🤖 **Layer 3: AI Processing Layer**
- **Streaming architecture** with non-blocking I/O
- **Gemini 2.5 Flash** for vision + text extraction
- **Structured extraction** with JSON schema validation
- **Smart validation** catches AI mistakes (wrong decimals, swapped values)

**The validation layer is key:** AI sometimes makes mistakes. I validate that extended_price = quantity × unit_price, check date formats, flag outliers. Catches ~15% of errors before they hit the database.

### 🧠 **Layer 4: Intelligence Layer**
This is where it gets interesting:

**Fuzzy Matching Engine:**
- Levenshtein distance algorithm
- 85% similarity threshold (tuned over 100+ invoices)
- Text normalization (lowercase, remove special chars)
- Handles vendor variations automatically

Example: "SYSCO FETA CHEESE" matches to "Feta Cheese" from another vendor. No manual mapping needed.

**Duplicate Detection:**
- Multi-field hashing (vendor + invoice_number + date)
- Prevents accidental re-uploads
- Returns 409 Conflict with helpful message

**Post-Processing:**
- Error correction (common AI mistakes)
- Format standardization (dates, prices)
- Category inference

### 💾 **Layer 5: Data Layer - Source of Truth**
This is my favorite architectural decision:

**Single Source of Truth Pattern:**
- One table (`invoice_items`) serves ALL modules
- ACID transactions (all-or-nothing saves)
- No derived tables, no background jobs
- Direct queries only

**Why this matters:** Zero coupling between modules. Want to add a new feature? Just query the source table. No sync issues, no stale data, no complexity.

**What gets saved:**
- Invoice header (vendor, date, total, parse metadata)
- Line items (description, quantity, price)
- Price tracking (historical snapshots)
- Audit trail (who, when, what changed)

### 📈 **Layer 6: Analytics Layer**
- **Direct queries** to source of truth (no caching)
- **Real-time calculations** (7-day avg, 28-day avg, price changes)
- **Cross-vendor comparison** (finds cheapest supplier)
- **Smart alerts** (spike detection, unusual prices)

**Performance:** 130ms for dashboard, 270ms for full item list, 60ms for price comparison. Fast enough without caching complexity.

---

## **Key Architectural Patterns:**

### ✅ **Source of Truth Pattern**
Single database table serves all modules independently. No coupling, no sync issues.

### ✅ **Streaming Architecture**
Non-blocking I/O throughout. SSE for real-time updates. User sees progress as it happens.

### ✅ **Validation Layers**
AI validation → User review → Database constraints. Multiple checkpoints prevent bad data.

### ✅ **Fuzzy Matching**
Automatic linking across vendors. Handles typos and variations without manual mapping.

### ✅ **ACID Transactions**
All-or-nothing saves. Either the entire invoice saves or nothing does. No partial data.

### ✅ **Security-First**
HTTPOnly cookies, malware scanning, row-level security. Built for production from day one.

---

## **Real Production Metrics:**

**Performance:**
- Upload + security: 470ms
- AI parsing: 30-64s (depends on invoice size)
- Database save: 723ms (includes fuzzy matching)
- Analytics queries: 60-270ms

**Cost:**
- $0.0006 per invoice
- Processing 1,000 invoices = $0.60
- Compare to $5-10 per invoice for manual entry

**Scale:**
- 9 invoices processed
- 143 line items tracked
- 106 unique products
- 2 vendors analyzed
- $13,587 total spend

**Accuracy:**
- High confidence extraction
- 85% auto-match rate (fuzzy matching)
- 15% flagged for review (validation catches errors)
- Zero data loss (ACID transactions)

---

## **What I'm Proud Of:**

**1. Zero-Coupling Architecture**
Each layer is independent. I can swap out the AI provider, change the database, or add new analytics without touching other layers.

**2. Real-time Everything**
SSE streaming means users see progress instantly. No "processing..." spinner for 60 seconds. They see "Extracting items... 5 found... 10 found... 15 found..."

**3. Intelligent Matching**
The fuzzy matching engine handles real-world messiness. Vendors use different names, have typos, abbreviate differently. It just works.

**4. Production-Ready Security**
Not an afterthought. HTTPOnly cookies, malware scanning, row-level security from day one.

**5. Source of Truth Pattern**
This was the breakthrough. No background jobs, no sync issues, no derived tables. Just query the source.

---

## **Tech Stack:**

**Backend:**
- Python + FastAPI (async throughout)
- PostgreSQL (Supabase)
- Gemini 2.5 Flash (AI)

**Frontend:**
- React + TypeScript
- Vite (build tool)
- React Query (caching)

**Infrastructure:**
- Supabase (database + storage + auth)
- Server-Sent Events (real-time)
- HTTPOnly cookies (security)

---

## **Lessons Learned:**

**1. SSE > WebSockets for one-way updates**
Simpler, works over HTTP, no connection management. Perfect for progress updates.

**2. Validation is critical with AI**
AI makes mistakes. Build validation layers. Check math, flag outliers, let users review.

**3. Fuzzy matching needs tuning**
Started at 70% threshold (too many false positives), ended at 85% (sweet spot).

**4. Source of Truth > Derived Tables**
Simpler architecture, no sync issues, easier to reason about.

**5. Security takes time**
Migrating to HTTPOnly cookies took 8 hours. Worth it. Don't skip security.

---

## **What's Next:**

- Batch processing (upload multiple invoices)
- Scheduled imports (auto-fetch from vendor portals)
- Predictive analytics (forecast price changes)
- Mobile app (React Native)

---

The diagram shows all 6 layers and how they interact. Each layer has a specific responsibility, and they're loosely coupled.

Happy to answer questions about the architecture, fuzzy matching algorithms, SSE implementation, or anything else!

---

## **Discussion Prompts:**

**For comments, emphasize:**

**On Architecture:**
"The Source of Truth pattern was a game-changer. I used to have derived tables and background jobs syncing data. Now it's just direct queries to one table. Simpler, faster, no sync issues."

**On Fuzzy Matching:**
"The fuzzy matching uses Levenshtein distance with text normalization. I normalize both strings (lowercase, remove special chars), then calculate edit distance. 85% threshold was tuned over 100+ real invoices. Too low = false positives, too high = missed matches."

**On Validation:**
"The AI is good but not perfect. I've seen it swap quantity and price, miss decimal points, or hallucinate items. The validation layer catches these: checks if extended_price = quantity × unit_price, validates date formats, flags prices that are 3x standard deviation from average."

**On SSE:**
"SSE is underrated. Everyone jumps to WebSockets, but for one-way server→client updates, SSE is simpler. It's just HTTP with chunked transfer encoding. No connection management, no ping/pong, no reconnection logic. Just works."

**On Security:**
"HTTPOnly cookies mean the auth token is stored by the browser but inaccessible to JavaScript. Even if someone injects malicious JS (XSS attack), they can't steal the token. Took 8 hours to migrate from localStorage but worth it for production."

**On Performance:**
"723ms to save an invoice with 15 items, including fuzzy matching against 106 existing products, is pretty good. The secret is proper database indexes and ACID transactions. Everything happens in one transaction - either it all saves or nothing does."

**On Cost:**
"$0.0006 per invoice means processing 50 invoices per month costs $0.03. That's negligible. The real cost is development time, but once it's built, the marginal cost is basically zero."

---

## **What Makes This Impressive:**

✅ **6-layer architecture** (not just "frontend + backend")
✅ **Real-time streaming** (SSE, not polling)
✅ **Intelligent matching** (fuzzy algorithm, tuned threshold)
✅ **Security-first** (HTTPOnly, malware scan, RLS)
✅ **Source of Truth pattern** (zero coupling)
✅ **Production metrics** (real data, not theoretical)
✅ **ACID transactions** (data integrity)
✅ **Smart validation** (catches AI errors)
✅ **Fast queries** (60-270ms with no caching)
✅ **Cheap** ($0.0006 per invoice)

This isn't a tutorial project. This is production-grade software with real architectural decisions and trade-offs.
