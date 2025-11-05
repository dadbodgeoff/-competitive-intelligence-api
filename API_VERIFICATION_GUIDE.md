# API Endpoint Verification Guide

## Quick Test

Run this command to verify all API endpoints are production-ready:

```bash
python verify_api_endpoints.py
```

## What It Checks

The script verifies that **all 8 modules** have correct API endpoint patterns:

### ✅ Modules Tested:
1. **Authentication & Analysis** - Login, register, profile, review analysis
2. **Invoice Processing** - Upload, parse, save invoices
3. **Menu Management** - Upload, parse, save menus
4. **Menu Comparison** - Competitor discovery and analysis
5. **Price Analytics** - Price tracking and analytics
6. **Streaming Analysis** - Real-time streaming endpoints
7. **Usage Limits** - Usage tracking and limits
8. **Shared API Client** - Base API client configuration

### ✅ What It Validates:

**Correct Patterns:**
- ✓ `baseURL: import.meta.env.VITE_API_URL || ''`
- ✓ API paths like `/api/invoices/upload`
- ✓ Uses `${baseUrl}` variable
- ✓ External URLs (fonts, analytics, etc.)

**Incorrect Patterns (Will Fail):**
- ❌ `baseURL: 'http://localhost:8000'` (hardcoded)
- ❌ Missing `/api/` prefix in paths
- ❌ Hardcoded localhost URLs

## Output Example

### ✅ Success:
```
================================================================================
✅ ALL MODULES READY FOR PRODUCTION!
================================================================================

Total Modules: 8
Modules Passed: 8
Total Endpoints: 38
✓ Passed: 38
✗ Failed: 0
```

### ❌ Failure:
```
📦 Module: Invoice Processing
────────────────────────────────────────────────────────────────────────────────
  Files checked: 10
  Endpoints found: 6
  ✓ Passed: 5
  ✗ Failed: 1

  Issue in frontend/src/hooks/useInvoiceParseStream.ts:92
    URL: http://localhost:8000/api/invoices/parse
    ❌ Hardcoded localhost URL
    Code: const baseUrl = 'http://localhost:8000';
```

## How to Fix Issues

If the script finds issues:

1. **Hardcoded localhost URLs:**
   ```typescript
   // ❌ Wrong
   const baseUrl = 'http://localhost:8000';
   
   // ✅ Correct
   const baseUrl = import.meta.env.VITE_API_URL || '';
   ```

2. **Missing /api/ prefix:**
   ```typescript
   // ❌ Wrong
   apiClient.get('/invoices/list')
   
   // ✅ Correct
   apiClient.get('/api/invoices/list')
   ```

3. **Incorrect baseURL:**
   ```typescript
   // ❌ Wrong
   axios.create({ baseURL: '/api' })
   
   // ✅ Correct
   axios.create({ baseURL: import.meta.env.VITE_API_URL || '' })
   ```

## When to Run

Run this script:
- ✅ Before committing API changes
- ✅ Before deploying to production
- ✅ After switching environments (dev → docker → prod)
- ✅ When debugging API connection issues

## Exit Codes

- `0` - All tests passed, ready for production
- `1` - Issues found, fix before deploying

## Integration with CI/CD

Add to your deployment pipeline:

```yaml
# .github/workflows/deploy.yml
- name: Verify API Endpoints
  run: python verify_api_endpoints.py
```

This ensures you never deploy with incorrect API configurations!
