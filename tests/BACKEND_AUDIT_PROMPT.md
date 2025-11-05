# Backend Critical Flows Audit Prompt

Use this prompt to audit each backend module and identify what needs testing.

---

## Module 1: Authentication & Authorization

### Audit Questions:
1. **Registration Flow**
   - What validation rules exist for email/password?
   - Where is the user record created (Supabase Auth)?
   - Is there a corresponding profile record created?
   - What happens if registration fails midway?

2. **Login Flow**
   - How are JWT tokens generated and validated?
   - Where is the token stored (httpOnly cookie)?
   - What's the token expiration time?
   - Is there a refresh token mechanism?

3. **Authorization**
   - Which endpoints require authentication?
   - How is the current user extracted from the token?
   - Are there role-based permissions?

4. **RLS (Row Level Security)**
   - Which tables have RLS enabled?
   - What policies enforce data isolation?
   - Can users access other users' data?

### Files to Audit:
- `api/middleware/auth.py` or similar
- `api/routes/auth.py`
- `database/rls_policies_only.sql`
- `database/migrations/021_enable_rls_critical_tables.sql`

### Critical Test Cases to Identify:
- [ ] Valid registration creates user + profile
- [ ] Invalid email/password is rejected
- [ ] Login returns valid JWT token
- [ ] Token refresh works before expiration
- [ ] Expired tokens are rejected
- [ ] Protected endpoints reject unauthenticated requests
- [ ] Users cannot access other users' data (RLS test)

---

## Module 2: Invoice Processing

### Audit Questions:
1. **Upload & Parsing**
   - What file types are accepted?
   - How is the PDF parsed (which service)?
   - Is parsing synchronous or streaming?
   - Where are parsed items temporarily stored?

2. **Data Processing**
   - How does fuzzy matching work?
   - When are unit conversions applied?
   - How is price tracking data calculated?
   - What happens if parsing fails?

3. **Storage**
   - Which tables store invoice data?
   - Are operations atomic (transactions)?
   - How is duplicate detection implemented?
   - Can users retrieve their invoice history?

4. **Validation**
   - What validation rules exist for line items?
   - Are required fields enforced?
   - How are errors reported to the user?

### Files to Audit:
- `api/routes/invoices/parsing.py`
- `api/routes/invoices/management.py`
- `services/invoice_parser_streaming.py`
- `services/invoice_storage_service.py`
- `services/fuzzy_matching/fuzzy_item_matcher.py`
- `services/unit_converter.py`
- `services/invoice_duplicate_detector.py`

### Critical Test Cases to Identify:
- [ ] Valid PDF uploads successfully
- [ ] Streaming response sends chunks
- [ ] Line items are extracted correctly
- [ ] Fuzzy matching links items to inventory
- [ ] Unit conversions are applied
- [ ] Price tracking data is stored
- [ ] Duplicate invoices are detected
- [ ] Invalid PDFs return error
- [ ] User can retrieve invoice history
- [ ] RLS prevents cross-user access

---

## Module 3: Menu Management

### Audit Questions:
1. **Menu Parsing**
   - How are menu PDFs parsed?
   - What data is extracted (items, prices, descriptions)?
   - Is parsing streaming or batch?

2. **Inventory Linking**
   - How are menu items linked to inventory?
   - What is the `menu_item_ingredients` table structure?
   - Can users manually link ingredients?

3. **COGS Calculation**
   - How is COGS calculated?
   - Where is the calculation logic?
   - Is it real-time or batch?

4. **Versioning**
   - Are menu versions tracked?
   - Can users compare menu versions?

### Files to Audit:
- `api/routes/menu/parsing.py`
- `api/routes/menu/management.py`
- `api/routes/menu/recipes.py`
- `services/menu_parser_streaming.py`
- `services/menu_storage_service.py`
- `services/menu_recipe_service.py`
- `database/migrations/012_menu_management_system.sql`
- `database/migrations/013_menu_item_ingredients.sql`

### Critical Test Cases to Identify:
- [ ] Menu PDF uploads successfully
- [ ] Items and prices are extracted
- [ ] Items can be linked to inventory
- [ ] COGS calculation is accurate
- [ ] Menu versions are tracked
- [ ] User can retrieve menu history
- [ ] RLS prevents cross-user access

---

## Module 4: Menu Comparison

### Audit Questions:
1. **Competitor Discovery**
   - How are competitors discovered (Google Places)?
   - What search parameters are used?
   - How many competitors are returned?

2. **Auto-Selection**
   - How are top competitors selected?
   - What criteria determine "top"?

3. **Competitor Menu Parsing**
   - How are competitor menus obtained?
   - Is parsing the same as user menu parsing?

4. **LLM Comparison**
   - Which LLM service is used?
   - What prompt generates the comparison?
   - How are insights structured?

5. **Storage & Retrieval**
   - Where are comparisons stored?
   - Can users retrieve saved comparisons?

### Files to Audit:
- `api/routes/menu_comparison.py`
- `services/menu_comparison_orchestrator.py`
- `services/competitor_discovery_service.py`
- `services/competitor_menu_parser.py`
- `services/menu_comparison_llm.py`
- `services/menu_comparison_storage.py`
- `database/migrations/014_competitor_menu_comparison.sql`

### Critical Test Cases to Identify:
- [ ] Competitor discovery returns results
- [ ] Auto-selection picks top 2 competitors
- [ ] Competitor menus are parsed
- [ ] LLM comparison generates insights
- [ ] Comparison can be saved
- [ ] User can retrieve saved comparisons
- [ ] RLS prevents cross-user access

---

## Module 5: Review Analysis

### Audit Questions:
1. **Tier Differentiation**
   - What are the differences between free and premium tiers?
   - How many competitors per tier?
   - How many insights per tier?
   - What's the cost per tier?

2. **Review Collection**
   - How are reviews collected (SerpAPI, Outscraper)?
   - How many reviews per competitor?
   - Are reviews cached?

3. **LLM Analysis**
   - Which LLM service is used per tier?
   - What prompts generate insights?
   - Is analysis streaming?

4. **Storage**
   - Where are analyses stored?
   - Are evidence reviews stored?
   - Can users retrieve saved analyses?

5. **Usage Limits**
   - How are usage limits enforced?
   - Are limits atomic (race condition safe)?

### Files to Audit:
- `api/routes/tier_analysis.py`
- `api/routes/streaming_analysis.py`
- `services/analysis_service_orchestrator.py`
- `services/free_tier_llm_service.py`
- `services/enhanced_llm_service.py`
- `services/premium_tier_llm_service.py`
- `services/streaming_orchestrator.py`
- `services/enhanced_analysis_storage.py`
- `prompts/free_tier_analysis_prompt.md`
- `prompts/enhanced_analysis_prompt.md`

### Critical Test Cases to Identify:
- [ ] Free tier: 3 competitors, 4 insights
- [ ] Premium tier: 5 competitors, 25 insights
- [ ] Streaming analysis sends chunks
- [ ] Insights are stored correctly
- [ ] Evidence reviews are stored
- [ ] Usage limits are enforced
- [ ] Atomic operations prevent race conditions
- [ ] User can retrieve saved analyses
- [ ] RLS prevents cross-user access

---

## Cross-Cutting Concerns

### Audit Questions:
1. **Rate Limiting**
   - Where is rate limiting implemented?
   - What are the limits per tier?
   - Is it per-user or per-IP?
   - How are limits tracked?

2. **Subscription Enforcement**
   - How are subscription tiers checked?
   - Where are usage limits enforced?
   - Are operations atomic?

3. **Error Sanitization**
   - Where are errors sanitized?
   - What PII patterns are blocked?
   - Are stack traces hidden in production?

4. **Monitoring & Logging**
   - What logging framework is used?
   - Are errors logged with context?
   - Is performance tracked?

5. **Database Transactions**
   - Which operations use transactions?
   - Are rollbacks handled correctly?
   - Are there any race conditions?

### Files to Audit:
- `api/middleware/rate_limiting.py`
- `api/middleware/subscription.py`
- `services/error_sanitizer.py`
- `services/ownership_validator.py`
- `frontend/src/lib/monitoring.ts`
- `database/migrations/019_atomic_usage_limits.sql`

### Critical Test Cases to Identify:
- [ ] Rate limiting blocks excess requests
- [ ] Subscription limits are enforced
- [ ] Atomic operations prevent race conditions
- [ ] Error messages don't leak PII
- [ ] Stack traces are hidden in production
- [ ] Monitoring logs capture failures
- [ ] Database transactions rollback on failure

---

## Audit Output Template

For each module, document:

```markdown
## Module: [Name]

### Critical Flows Identified:
1. [Flow name]
   - Entry point: [API endpoint or function]
   - Steps: [List of steps]
   - Success criteria: [What defines success]
   - Failure scenarios: [What can go wrong]

### Test Cases Required:
- [ ] [Test case 1]
- [ ] [Test case 2]
- [ ] [Test case 3]

### Dependencies:
- Database tables: [List]
- External services: [List]
- Other modules: [List]

### Security Considerations:
- RLS policies: [Which tables]
- Authorization checks: [Where]
- Data validation: [What rules]

### Performance Benchmarks:
- Expected response time: [X seconds]
- Expected throughput: [Y requests/second]
```

---

## Next Steps After Audit

1. Prioritize test cases by risk (high-risk flows first)
2. Identify shared test fixtures needed
3. Determine test data requirements
4. Estimate test development time
5. Create test implementation plan
