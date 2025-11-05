# Frontend Critical User Journeys Audit Prompt

Use this prompt to audit each frontend user journey and identify what needs E2E testing.

---

## User Journey 1: Onboarding

### Audit Questions:
1. **Landing Page**
   - What is the entry point URL?
   - What CTAs lead to registration?
   - Is there a demo or preview?

2. **Registration**
   - What form fields are required?
   - What client-side validation exists?
   - Where does the form submit to?
   - What happens on success?
   - What happens on error?

3. **Login**
   - What form fields are required?
   - Is there a "remember me" option?
   - Where does the form submit to?
   - Where is the user redirected after login?

4. **Auth Persistence**
   - How is auth state stored (localStorage, cookie)?
   - Does auth persist across page refreshes?
   - What happens when token expires?

### Files to Audit:
- `frontend/src/pages/LandingPage.tsx`
- `frontend/src/components/auth/RegisterForm.tsx`
- `frontend/src/components/auth/LoginForm.tsx`
- `frontend/src/stores/authStore.ts`
- `frontend/src/services/api/client.ts`

### Critical Test Steps:
1. [ ] Navigate to landing page
2. [ ] Click "Sign Up" CTA
3. [ ] Fill registration form with valid data
4. [ ] Submit form
5. [ ] Verify success message appears
6. [ ] Verify redirect to dashboard
7. [ ] Refresh page
8. [ ] Verify user still logged in
9. [ ] Logout
10. [ ] Login with same credentials
11. [ ] Verify redirect to dashboard

### Success Criteria:
- User can complete registration without errors
- User is automatically logged in after registration
- Auth state persists across page refreshes
- Login works with registered credentials

### Error Scenarios to Test:
- Invalid email format
- Weak password
- Email already exists
- Network error during registration
- Invalid login credentials

---

## User Journey 2: Invoice Workflow

### Audit Questions:
1. **Navigation**
   - How does user navigate to invoice upload?
   - Is there a dashboard link?

2. **File Upload**
   - What file types are accepted?
   - Is there drag-and-drop?
   - What happens during upload?
   - Is there a progress indicator?

3. **Streaming Parsing**
   - How are real-time updates displayed?
   - What stages are shown (parsing, validating, saving)?
   - Can user cancel parsing?

4. **Review Table**
   - How are parsed items displayed?
   - Can user edit items?
   - Can user delete items?
   - Is there pagination?

5. **Invoice Detail**
   - How does user navigate to detail page?
   - What information is shown?
   - Can user download original PDF?

6. **Price Analytics**
   - How does user navigate to analytics?
   - What charts/graphs are shown?
   - Can user filter by date range?

### Files to Audit:
- `frontend/src/pages/DashboardPage.tsx`
- `frontend/src/pages/InvoiceListPage.tsx`
- `frontend/src/pages/InvoiceDetailPage.tsx`
- `frontend/src/pages/PriceAnalyticsDashboard.tsx`
- `frontend/src/components/invoice/InvoiceUpload.tsx`
- `frontend/src/components/invoice/InvoiceReviewTable.tsx`
- `frontend/src/components/invoice/ProcessingResultScreen.tsx`
- `frontend/src/hooks/useInvoiceParseStream.ts`

### Critical Test Steps:
1. [ ] Login as test user
2. [ ] Navigate to invoice upload page
3. [ ] Select PDF file
4. [ ] Upload file
5. [ ] Verify progress bar appears
6. [ ] Verify streaming updates display
7. [ ] Wait for parsing to complete
8. [ ] Verify review table shows items
9. [ ] Click on an invoice
10. [ ] Verify detail page loads
11. [ ] Navigate to price analytics
12. [ ] Verify charts display

### Success Criteria:
- File uploads without errors
- Real-time parsing updates display
- Parsed items appear in review table
- Detail page shows correct data
- Analytics dashboard loads

### Error Scenarios to Test:
- Invalid file type
- File too large
- Parsing fails
- Network error during upload
- No items parsed

---

## User Journey 3: Menu Workflow

### Audit Questions:
1. **Menu Upload**
   - How does user navigate to menu upload?
   - What file types are accepted?
   - Is there streaming parsing?

2. **Menu Review**
   - How are parsed menu items displayed?
   - Can user edit items?
   - Can user add items manually?

3. **Ingredient Linking**
   - How does user link menu items to inventory?
   - Is there a search modal?
   - Can user create new inventory items?

4. **COGS Display**
   - Where is COGS shown?
   - Is it calculated automatically?
   - Can user see ingredient breakdown?

### Files to Audit:
- `frontend/src/pages/MenuDashboard.tsx`
- `frontend/src/pages/MenuParsingProgressPage.tsx`
- `frontend/src/components/menu/MenuUpload.tsx`
- `frontend/src/components/menu/MenuReviewTable.tsx`
- `frontend/src/components/menu/IngredientSearchModal.tsx`
- `frontend/src/components/menu/IngredientList.tsx`
- `frontend/src/hooks/useMenuParseStream.ts`

### Critical Test Steps:
1. [ ] Login as test user
2. [ ] Navigate to menu upload
3. [ ] Upload menu PDF
4. [ ] Verify streaming progress
5. [ ] Wait for parsing to complete
6. [ ] Verify menu items display
7. [ ] Click "Link Ingredients" on an item
8. [ ] Search for inventory item
9. [ ] Select ingredient
10. [ ] Verify COGS updates

### Success Criteria:
- Menu uploads successfully
- Items are parsed correctly
- Ingredient search works
- COGS calculation displays

### Error Scenarios to Test:
- Invalid file type
- Parsing fails
- No items parsed
- Ingredient search returns no results

---

## User Journey 4: Menu Comparison

### Audit Questions:
1. **Comparison Start**
   - How does user initiate comparison?
   - Is there a form to fill?

2. **Competitor Selection**
   - How are competitors discovered?
   - Can user select competitors manually?
   - How many can be selected?

3. **Comparison Progress**
   - Is there a progress indicator?
   - What stages are shown?
   - Can user cancel?

4. **Results Display**
   - How are comparison results shown?
   - Are there insights/recommendations?
   - Can user see competitor menus?

5. **Save & Retrieve**
   - Can user save comparison?
   - Where are saved comparisons shown?
   - Can user view past comparisons?

### Files to Audit:
- `frontend/src/pages/MenuComparisonPage.tsx`
- `frontend/src/pages/CompetitorSelectionPage.tsx`
- `frontend/src/pages/MenuComparisonResultsPage.tsx`
- `frontend/src/pages/SavedComparisonsPage.tsx`
- `frontend/src/services/api/menuComparisonApi.ts`
- `frontend/src/types/menuComparison.ts`

### Critical Test Steps:
1. [ ] Login as test user
2. [ ] Navigate to menu comparison
3. [ ] Enter business details
4. [ ] Click "Find Competitors"
5. [ ] Verify competitors display
6. [ ] Select 2 competitors
7. [ ] Click "Start Comparison"
8. [ ] Verify progress displays
9. [ ] Wait for completion
10. [ ] Verify results display
11. [ ] Click "Save Comparison"
12. [ ] Navigate to saved comparisons
13. [ ] Verify comparison appears in list

### Success Criteria:
- Competitors are discovered
- Comparison completes successfully
- Results display insights
- Comparison can be saved and retrieved

### Error Scenarios to Test:
- No competitors found
- Comparison fails
- Network error during comparison
- Save fails

---

## User Journey 5: Review Analysis

### Audit Questions:
1. **Analysis Form**
   - What information is required?
   - Is there tier selection?
   - What validation exists?

2. **Tier Selection**
   - How does user select tier?
   - What are the differences shown?
   - Is pricing displayed?

3. **Streaming Analysis**
   - How are real-time updates shown?
   - What stages are displayed?
   - Can user cancel?

4. **Insights Display**
   - How are insights rendered?
   - Are they categorized?
   - Can user expand/collapse?

5. **Evidence Reviews**
   - How are evidence reviews shown?
   - Can user read full reviews?
   - Are they grouped by competitor?

6. **Save & Retrieve**
   - Can user save analysis?
   - Where are saved analyses shown?
   - Can user view past analyses?

### Files to Audit:
- `frontend/src/components/analysis/ReviewAnalysisForm.tsx`
- `frontend/src/components/analysis/TierSelector.tsx`
- `frontend/src/components/analysis/AnalysisProgressTracker.tsx`
- `frontend/src/components/analysis/StreamingAnalysisResults.tsx`
- `frontend/src/components/analysis/ReviewAnalysisResults.tsx`
- `frontend/src/components/analysis/InsightsGrid.tsx`
- `frontend/src/components/analysis/ReviewEvidenceSection.tsx`
- `frontend/src/pages/SavedAnalysesPage.tsx`
- `frontend/src/hooks/useStreamingAnalysis.ts`

### Critical Test Steps:
1. [ ] Login as test user
2. [ ] Navigate to review analysis
3. [ ] Fill in business details
4. [ ] Select tier (free or premium)
5. [ ] Submit form
6. [ ] Verify streaming progress displays
7. [ ] Wait for analysis to complete
8. [ ] Verify insights display
9. [ ] Expand evidence reviews
10. [ ] Verify reviews display
11. [ ] Click "Save Analysis"
12. [ ] Navigate to saved analyses
13. [ ] Verify analysis appears in list

### Success Criteria:
- Form validates inputs
- Tier selection works
- Streaming updates display
- Insights render correctly
- Evidence reviews are accessible
- Analysis can be saved and retrieved

### Error Scenarios to Test:
- Invalid business name
- Analysis fails
- Network error during streaming
- No insights generated
- Save fails

---

## Cross-Cutting Concerns

### Error Handling
**Audit Questions:**
- How are API errors displayed?
- Is there a toast notification system?
- Are errors user-friendly?
- Do errors include actionable guidance?

**Files to Audit:**
- `frontend/src/components/ui/toast.tsx`
- `frontend/src/services/api/client.ts`

**Test Scenarios:**
- [ ] API returns 400 (bad request)
- [ ] API returns 401 (unauthorized)
- [ ] API returns 403 (forbidden)
- [ ] API returns 404 (not found)
- [ ] API returns 500 (server error)
- [ ] Network timeout
- [ ] Network offline

### Loading States
**Audit Questions:**
- Are loading states shown for async operations?
- Are buttons disabled during loading?
- Are spinners/skeletons used?

**Test Scenarios:**
- [ ] Form submission shows loading
- [ ] File upload shows progress
- [ ] Data fetching shows skeleton
- [ ] Navigation shows loading

### Responsive Design
**Audit Questions:**
- Does the app work on mobile?
- Does the app work on tablet?
- Are touch interactions supported?

**Test Scenarios:**
- [ ] Test on mobile viewport (375px)
- [ ] Test on tablet viewport (768px)
- [ ] Test on desktop viewport (1920px)

---

## Audit Output Template

For each user journey, document:

```markdown
## Journey: [Name]

### Entry Point:
- URL: [Starting URL]
- Navigation: [How user gets there]

### Steps:
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Components Involved:
- [Component 1]
- [Component 2]
- [Component 3]

### API Calls:
- [Endpoint 1]: [Purpose]
- [Endpoint 2]: [Purpose]

### Success Criteria:
- [Criterion 1]
- [Criterion 2]

### Error Scenarios:
- [Scenario 1]: [Expected behavior]
- [Scenario 2]: [Expected behavior]

### Test Data Required:
- [Data 1]
- [Data 2]

### Estimated Test Time:
- [X minutes]
```

---

## Next Steps After Audit

1. Prioritize journeys by user impact
2. Identify shared test utilities needed
3. Determine test data requirements
4. Set up Playwright configuration
5. Create test implementation plan
