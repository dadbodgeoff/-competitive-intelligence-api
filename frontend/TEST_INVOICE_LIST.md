# Invoice List Page Debug Guide

## The Problem
Backend returns 2 invoices successfully, but frontend doesn't display them.

## Backend Status
✅ **WORKING** - Test confirms:
```
GET /api/invoices/?limit=50
Status: 200
Invoices: 2
Latest: PERFORMANCE FOODSERVICE - $1001.72
```

## Frontend Code Status
✅ **CODE IS CORRECT** - InvoiceListPage.tsx properly:
1. Calls `apiClient.get('/api/invoices/?limit=50')`
2. Extracts `data.invoices`
3. Sets state with `setInvoices(data.invoices || [])`
4. Renders with proper mapping

## Most Likely Causes

### 1. Browser Cache (90% likely)
**Solution:** Hard refresh or incognito
- Chrome/Edge: `Ctrl + Shift + R` or `Ctrl + F5`
- Firefox: `Ctrl + Shift + R`
- Or open incognito window

### 2. Auth Interceptor Redirecting
**Solution:** Check browser console for:
- Redirect messages
- 401 errors
- Network requests being cancelled

### 3. Not Logged In
**Solution:** 
1. Go to `/login`
2. Login with: `nrivikings8@gmail.com` / `testpass123`
3. Navigate to `/invoices`

## Debug Steps

1. **Open Browser DevTools** (F12)

2. **Go to Console Tab** - Look for:
   - Any red errors
   - "Login successful" message
   - API errors

3. **Go to Network Tab**
   - Filter by "invoices"
   - Click on the request
   - Check:
     - Status code (should be 200)
     - Response tab (should show invoices array)
     - Cookies tab (should have access_token)

4. **Go to Application Tab**
   - Cookies → http://localhost:5173
   - Should see: `access_token` and `refresh_token`
   - If missing → need to login

## Expected Response Structure
```json
{
  "success": true,
  "invoices": [
    {
      "id": "uuid",
      "invoice_number": "string",
      "vendor_name": "string",
      "invoice_date": "date",
      "total": number,
      "status": "parsed|reviewed|approved",
      "created_at": "timestamp"
    }
  ],
  "total_count": number,
  "has_more": boolean
}
```

## If Still Not Working

Check these in browser console:
```javascript
// Check if logged in
console.log('Auth:', localStorage.getItem('auth'))

// Manually test API
fetch('http://localhost:8000/api/invoices/?limit=50', {
  credentials: 'include'
}).then(r => r.json()).then(console.log)
```
