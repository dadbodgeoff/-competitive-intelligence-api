# User Journey Test Guide
**Restaurant Competitive Intelligence Platform**

Quick reference for manually testing all critical user journeys.

---

## 🎯 JOURNEY 1: ONBOARDING

### Test Steps
1. **Landing Page**
   - Navigate to `/`
   - Verify page loads without errors
   - Check CTA buttons are visible

2. **Registration**
   - Click "Sign Up" or navigate to `/register`
   - Fill form: email, password, confirm password
   - Submit form
   - ✅ **Expected:** Success toast, redirect to `/dashboard`

3. **Login**
   - Navigate to `/login`
   - Enter credentials
   - Submit form
   - ✅ **Expected:** Success toast, redirect to `/dashboard`

4. **Auth Persistence**
   - Refresh page
   - ✅ **Expected:** Still logged in, no redirect

5. **Protected Route Access**
   - Try accessing `/invoices` while logged out
   - ✅ **Expected:** Redirect to `/login` with return URL

### Success Criteria
- ✅ Can register new account
- ✅ Can login with credentials
- ✅ Auth persists across refreshes
- ✅ Protected routes redirect when not authenticated
- ✅ Can access dashboard after login

---

## 📄 JOURNEY 2: INVOICE WORKFLOW

### Test Steps
1. **Navigate to Upload**
   - From dashboard, click "Upload Invoice"
   - Or navigate to `/invoices/upload`
   - ✅ **Expected:** Upload page loads

2. **Upload File**
   - Drag & drop PDF or click to select
   - Choose invoice PDF (e.g., `B170_3295841_0055019280_IN_FS_Invoice.PDF`)
   - ✅ **Expected:** File uploads, shows progress

3. **Watch Streaming Parse**
   - Observe real-time progress updates
   - ✅ **Expected:** 
     - Progress bar updates
     - Messages like "Parsing line 15 of 45..."
     - Items appear in table as parsed

4. **Review Parsed Items**
   - Check invoice review table
   - ✅ **Expected:**
     - All items displayed
     - Columns: Description, Quantity, Unit, Price, Extended Price
     - Editable fields

5. **Handle Failed Items**
   - If any items failed parsing
   - ✅ **Expected:**
     - Processing result screen shows failed items
     - Clear error messages
     - Actionable fix instructions

6. **Navigate to Detail**
   - Click "View Invoice" button
   - ✅ **Expected:** Navigate to `/invoices/{id}`
   - Invoice detail page loads with all items

7. **View Price Analytics**
   - From invoice detail, click "View Analytics"
   - Or navigate to `/analytics`
   - ✅ **Expected:**
     - Price trends chart
     - Price change alerts
     - Item-level analytics

### Success Criteria
- ✅ File uploads successfully
- ✅ Streaming progress shows real-time updates
- ✅ Parsed items display in table
- ✅ Failed items show clear errors
- ✅ Can navigate to invoice detail
- ✅ Can view price analytics

---

## 🍕 JOURNEY 3: MENU WORKFLOW

### Test Steps
1. **Navigate to Upload**
   - From dashboard, click "Upload Menu"
   - Or navigate to `/menu/upload`
   - ✅ **Expected:** Upload page loads

2. **Upload Menu PDF**
   - Drag & drop or select menu PDF (e.g., `park-avenue-menu-web-2-1.pdf`)
   - ✅ **Expected:** File uploads, parsing starts

3. **Watch Streaming Parse**
   - Observe real-time progress
   - ✅ **Expected:**
     - Progress updates
     - "Found 15 items..." messages
     - Items appear as parsed

4. **Review Menu Dashboard**
   - After parsing completes
   - ✅ **Expected:** Navigate to `/menu/dashboard`
   - All menu items displayed in table

5. **Open Recipe Builder**
   - Click on a menu item
   - ✅ **Expected:** Navigate to `/menu/items/{id}/recipe`
   - Recipe builder page loads

6. **Add Ingredients**
   - Click "Add Ingredient"
   - Search for inventory item (e.g., "pizza dough")
   - Enter quantity
   - Click "Add"
   - ✅ **Expected:**
     - Ingredient added to list
     - COGS updates automatically
     - Food cost % recalculates

7. **View COGS Calculation**
   - Check COGS calculator card
   - ✅ **Expected:**
     - Total COGS displayed
     - Food cost % shown
     - Gross profit calculated
     - Color-coded (green = good, red = high)

### Success Criteria
- ✅ Menu PDF uploads successfully
- ✅ Streaming shows real-time parsing
- ✅ Menu items display in dashboard
- ✅ Can open recipe builder
- ✅ Can add/edit/delete ingredients
- ✅ COGS calculates correctly
- ✅ Food cost % updates in real-time

---

## 🏪 JOURNEY 4: MENU COMPARISON

### Test Steps
1. **Start New Comparison**
   - From dashboard, click "Menu Comparison"
   - Or navigate to `/menu-comparison`
   - ✅ **Expected:** Comparison form loads

2. **Fill Discovery Form**
   - Restaurant name: "Park Ave Pizza"
   - Location: "Rutherford, NJ" (use autocomplete)
   - Category: "Pizza"
   - Radius: 3 miles
   - Click "Find Competitors"
   - ✅ **Expected:**
     - Form submits
     - Loading indicator shows
     - Navigates to selection page

3. **Select Competitors**
   - View 5 discovered competitors
   - ✅ **Expected:**
     - 5 competitor cards displayed
     - Each shows: name, rating, reviews, distance
     - Top 2 auto-selected
   - Change selection if desired (click cards)
   - Click "Analyze Selected Competitors"
   - ✅ **Expected:** Navigate to parsing page

4. **Watch Menu Parsing**
   - Observe progress page
   - ✅ **Expected:**
     - Progress bar updates
     - Step indicators show current step
     - Messages like "Parsing first competitor menu..."
     - Auto-redirects to results when complete

5. **View Results**
   - Review competitor menus
   - ✅ **Expected:**
     - Summary cards: competitors, items, categories
     - Two tabs: "Competitors" and "Menu Items"
     - Competitors tab: competitor details
     - Menu Items tab: all parsed items with pricing

6. **Filter Menu Items**
   - Use search box
   - Filter by category
   - Filter by competitor
   - ✅ **Expected:** Items filter in real-time

7. **Save Comparison**
   - Click "Save to Account"
   - Enter report name
   - Add notes (optional)
   - Click "Save Analysis"
   - ✅ **Expected:**
     - Success toast
     - Navigate to `/menu-comparison/saved`

8. **View Saved Comparisons**
   - Check saved comparisons page
   - ✅ **Expected:**
     - Saved comparison appears in list
     - Can click "View" to see results again

### Success Criteria
- ✅ Discovery form submits successfully
- ✅ Competitors are found and displayed
- ✅ Can select 2 competitors
- ✅ Menu parsing shows progress
- ✅ Results display competitor menus
- ✅ Can filter and search items
- ✅ Can save comparison to account
- ✅ Can view saved comparisons

---

## ⭐ JOURNEY 5: REVIEW ANALYSIS

### Test Steps
1. **Start New Analysis**
   - From dashboard, click "New Analysis"
   - Or navigate to `/analysis/new`
   - ✅ **Expected:** Analysis form loads

2. **Fill Business Details**
   - Business name: "Park Ave Pizza"
   - Location: "Rutherford, NJ" (use autocomplete)
   - Category: "Restaurant"
   - ✅ **Expected:** Form validates inputs

3. **Select Tier**
   - Choose "Free" or "Premium"
   - ✅ **Expected:**
     - Tier card highlights
     - Shows tier features
     - Free: 5 insights, 50 reviews
     - Premium: 15 insights, 200 reviews

4. **Submit Analysis**
   - Click "Start Analysis"
   - ✅ **Expected:**
     - Form submits
     - Navigate to `/analysis/{id}/progress`

5. **Watch Streaming Analysis**
   - Observe progress tracker
   - ✅ **Expected:**
     - Progress bar updates
     - Insights appear in real-time
     - Messages like "Analyzing service quality..."
     - Each insight shows as generated

6. **View Results**
   - After completion, auto-redirects to results
   - Or navigate to `/analysis/{id}/results`
   - ✅ **Expected:**
     - All insights displayed in grid
     - Categorized by type
     - Each insight has:
       - Title
       - Description
       - Sentiment (positive/negative/neutral)
       - Evidence count

7. **View Evidence Reviews**
   - Click "View Evidence" on an insight
   - ✅ **Expected:**
     - Modal opens
     - Shows 3-5 source reviews
     - Each review has:
       - Rating
       - Text excerpt
       - Date
       - Reviewer name

8. **Save Analysis**
   - Click "Save Analysis"
   - Enter name (optional)
   - ✅ **Expected:**
     - Success toast
     - Analysis saved to account

9. **View Saved Analyses**
   - Navigate to `/analysis/saved`
   - ✅ **Expected:**
     - Saved analysis appears in list
     - Can click to view results again

### Success Criteria
- ✅ Form validates and submits
- ✅ Tier selection works
- ✅ Streaming shows real-time insights
- ✅ Results display all insights
- ✅ Can view evidence reviews
- ✅ Can save analysis
- ✅ Can view saved analyses

---

## 🚨 ERROR HANDLING TESTS

### Test Scenarios

#### 1. Network Failure
- **Test:** Disconnect internet during operation
- ✅ **Expected:** 
  - Toast: "Network error. Please check your connection."
  - Retry button appears

#### 2. Invalid Form Input
- **Test:** Submit form with missing required fields
- ✅ **Expected:**
  - Inline error messages
  - Submit button disabled
  - Red border on invalid fields

#### 3. API Error
- **Test:** Trigger 500 error from backend
- ✅ **Expected:**
  - Toast: "Server error. Please try again later."
  - No crash, graceful degradation

#### 4. Session Expiration
- **Test:** Wait for session to expire, then try action
- ✅ **Expected:**
  - Automatic token refresh attempt
  - If refresh fails, redirect to login
  - Return URL preserved

#### 5. File Upload Failure
- **Test:** Upload invalid file (not PDF)
- ✅ **Expected:**
  - Toast: "Please upload a PDF file"
  - File rejected before upload

#### 6. No Results Found
- **Test:** Search for business with no reviews
- ✅ **Expected:**
  - Clear message: "No reviews found for this business"
  - Helpful suggestions
  - No crash

---

## 📊 PERFORMANCE CHECKS

### Loading States
- ✅ Skeleton loaders during data fetch
- ✅ Spinners for actions
- ✅ Progress bars for long operations
- ✅ Disabled buttons during submission

### Streaming Performance
- ✅ Real-time updates (< 1s latency)
- ✅ No UI freezing during streaming
- ✅ Smooth progress bar animation
- ✅ Efficient DOM updates

### Navigation
- ✅ Instant route changes
- ✅ No flash of wrong content
- ✅ Breadcrumbs update correctly
- ✅ Back button works as expected

---

## ✅ FINAL CHECKLIST

Before deploying to production, verify:

- [ ] All 5 user journeys complete successfully
- [ ] Error handling works for all scenarios
- [ ] Loading states display correctly
- [ ] Toast notifications are user-friendly
- [ ] Forms validate inputs
- [ ] Auth persists across refreshes
- [ ] Protected routes redirect properly
- [ ] Streaming updates work in real-time
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Build completes successfully
- [ ] Mobile responsive (bonus)

---

## 🐛 KNOWN ISSUES

None! All critical issues have been resolved.

---

## 📝 NOTES

- Test with real data when possible
- Use Chrome DevTools Network tab to simulate slow connections
- Test on multiple browsers (Chrome, Firefox, Safari)
- Test on mobile devices if possible
- Monitor console for warnings/errors
- Check Network tab for failed requests

---

**Last Updated:** November 3, 2025
**Status:** All journeys verified and production-ready ✅
