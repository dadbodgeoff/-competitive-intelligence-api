# Invoice Backend E2E Test Results

## Test Run: November 2, 2025

### Summary
✅ **7 passed, 1 skipped** - All invoice authentication tests working correctly

### Issues Found & Fixed

#### 1. HTTP 307 Redirects (FIXED)
**Problem**: Tests were failing with 307 redirects because:
- API endpoint: `/api/invoices` (no trailing slash)
- FastAPI redirects to: `/api/invoices/` (with trailing slash)
- `AsyncClient` doesn't follow redirects by default

**Solution**: Added `follow_redirects=True` to all test requests

#### 2. Response Format Handling (FIXED)
**Problem**: Test expected raw list, but API returns wrapped response:
```json
{
  "success": true,
  "invoices": [...],
  "total_count": 2,
  "has_more": false
}
```

**Solution**: Updated test to handle both formats (wrapped and raw)

#### 3. Missing save-stream Endpoint (DOCUMENTED)
**Problem**: Test expected `/api/invoices/save-stream` endpoint (405 Method Not Allowed)

**Finding**: 
- The `useSaveStream` hook exists in frontend but is **not used**
- Actual flow uses `/api/invoices/save` after user review
- Invoice flow: Upload → Parse (streaming) → User Review → Save (single POST)
- No streaming needed for save because it's a single database write

**Solution**: Skipped test with documentation explaining the actual flow

### Test Coverage

| Test | Status | Description |
|------|--------|-------------|
| `test_list_invoices_requires_auth` | ✅ PASS | Unauthenticated requests return 401 |
| `test_list_invoices_with_cookie_auth` | ✅ PASS | Cookie authentication works correctly |
| `test_upload_invoice_requires_auth` | ✅ PASS | Upload requires authentication |
| `test_save_invoice_requires_auth` | ✅ PASS | Save requires authentication |
| `test_save_invoice_stream_requires_auth` | ⏭️ SKIP | Endpoint not implemented (not needed) |
| `test_get_invoice_detail_requires_auth` | ✅ PASS | Get detail requires authentication |
| `test_delete_invoice_requires_auth` | ✅ PASS | Delete requires authentication |
| `test_user_can_only_see_own_invoices` | ✅ PASS | Users see only their own data |

### Invoice Flow Architecture

```
1. Upload PDF
   ↓
2. Parse with LLM (streaming SSE)
   ↓
3. Show preview to user
   ↓
4. User reviews/corrects data
   ↓
5. User clicks "Save"
   ↓
6. POST /api/invoices/save (single write)
   ↓
7. Database write complete
```

**Key Insight**: No database writes happen until user confirms the data is correct. This prevents bad data from entering the system.

### Authentication Verification

All invoice endpoints properly require authentication via HTTPOnly cookies:
- ✅ List invoices
- ✅ Upload invoice
- ✅ Save invoice
- ✅ Get invoice detail
- ✅ Delete invoice

### Next Steps

1. Consider removing unused `useSaveStream` hook from frontend (dead code)
2. Document that invoice save is intentionally non-streaming
3. All invoice auth tests are now stable and passing
