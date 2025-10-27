# Frontend Analysis Flow Design

## Overview

This design implements the complete user flow for competitive analysis from form submission through progress tracking to results display. The system leverages existing components and follows established patterns while adding missing routing infrastructure and backend status endpoint.

## Architecture

### Current State Analysis
- ✅ **Form Component**: `ReviewAnalysisForm` exists and works
- ✅ **Progress Component**: `AnalysisProgressTracker` exists but not routed
- ✅ **Results Component**: `ReviewAnalysisResults` exists but not routed  
- ✅ **API Service**: `ReviewAnalysisAPIService` exists with most endpoints
- ✅ **Progress Hook**: `useAnalysisProgress` exists and optimized
- ❌ **Missing Routes**: No `/analysis/:id/progress` or `/analysis/:id/results` routes
- ❌ **Missing Status Endpoint**: Backend lacks `/api/v1/analysis/{id}/status`

### Implementation Strategy
**Option A: Add Missing Status Endpoint (Recommended)**
- Add `/api/v1/analysis/{id}/status` to backend
- Use existing frontend components with routing
- Maintain real-time progress tracking experience

**Option B: Simplify to Direct Results**
- Skip progress tracking entirely
- Form → Loading → Results (6 second flow)
- Simpler but less engaging UX

**Decision: Option A** - Better user experience with progress tracking

## Components and Interfaces

### 1. Routing Infrastructure (New)

```typescript
// App.tsx additions
<Route
  path="/analysis/:analysisId/progress"
  element={
    <ProtectedRoute>
      <AnalysisProgressPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/analysis/:analysisId/results"
  element={
    <ProtectedRoute>
      <AnalysisResultsPage />
    </ProtectedRoute>
  }
/>
```

### 2. Page Components (New)

```typescript
// AnalysisProgressPage.tsx
export function AnalysisProgressPage() {
  const { analysisId } = useParams<{ analysisId: string }>();
  
  if (!analysisId) {
    return <Navigate to="/dashboard" replace />;
  }

  return <AnalysisProgressTracker analysisId={analysisId} />;
}

// AnalysisResultsPage.tsx  
export function AnalysisResultsPage() {
  const { analysisId } = useParams<{ analysisId: string }>();
  
  if (!analysisId) {
    return <Navigate to="/dashboard" replace />;
  }

  return <ReviewAnalysisResults analysisId={analysisId} />;
}
```

### 3. Backend Status Endpoint (New)

```python
# api/routes/tier_analysis.py
@router.get("/{analysis_id}/status")
async def get_analysis_status(
    analysis_id: str,
    current_user: str = Depends(get_current_user)
):
    # Get analysis record with progress tracking
    analysis = supabase.table("analyses").select("*").eq("id", analysis_id).eq("user_id", current_user).execute()
    
    return AnalysisStatusResponse(
        analysis_id=analysis_id,
        status=analysis.status,
        progress_percentage=calculate_progress(analysis.status),
        current_step=get_current_step(analysis.status),
        estimated_time_remaining_seconds=estimate_time_remaining(analysis)
    )
```

### 4. API Service Integration (Update)

```typescript
// ReviewAnalysisAPIService.ts - Add missing method
async getAnalysisResults(analysisId: string): Promise<ReviewAnalysisResponse> {
  const response = await this.client.get(`/api/v1/analysis/${analysisId}`);
  return response.data;
}
```

## Data Models

### Existing Interfaces (No Changes)
- `AnalysisStatus` - Already defined correctly
- `ReviewAnalysisResponse` - Already defined correctly  
- `ReviewAnalysisRequest` - Already defined correctly

### Backend Schema Updates (New)

```sql
-- Add progress tracking columns to analyses table
ALTER TABLE public.analyses 
ADD COLUMN IF NOT EXISTS progress_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_step VARCHAR(255),
ADD COLUMN IF NOT EXISTS estimated_time_remaining_seconds INTEGER;

-- Add status tracking table for detailed progress
CREATE TABLE IF NOT EXISTS public.analysis_status_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID REFERENCES public.analyses(id),
  status VARCHAR(50) NOT NULL,
  current_step VARCHAR(255),
  progress_percentage INTEGER DEFAULT 0,
  estimated_time_remaining_seconds INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Error Handling

### 1. Form Submission Errors
- **Existing**: `ReviewAnalysisForm` already handles API errors via `useToast`
- **Enhancement**: None needed - already robust

### 2. Progress Tracking Errors  
- **Existing**: `useAnalysisProgress` has retry logic and exponential backoff
- **Enhancement**: Add connection status indicator

### 3. Results Loading Errors
- **Existing**: `ReviewAnalysisResults` shows Alert on API failures
- **Enhancement**: Add retry button and better error messages

### 4. Navigation Errors
- **New**: Add `analysisId` validation in page components
- **New**: Redirect to dashboard for invalid IDs

## Testing Strategy

### 1. Unit Tests (Existing Components)
- `ReviewAnalysisForm.test.tsx` - Already exists
- `AnalysisProgressTracker.test.tsx` - Needs progress simulation
- `ReviewAnalysisResults.test.tsx` - Needs mock data testing

### 2. Integration Tests (New)
- Complete flow: Form → Progress → Results
- Error scenarios: Failed analysis, network errors
- Navigation: Direct URL access, browser back/forward

### 3. E2E Tests (Update Existing)
- Update `analysis-workflow.test.ts` to include new routes
- Test progress polling and auto-redirect
- Test error recovery flows

## Implementation Plan

### Phase 1: Backend Status Endpoint
1. Add `/api/v1/analysis/{id}/status` endpoint to `tier_analysis.py`
2. Add `AnalysisStatusResponse` schema
3. Update database with progress tracking columns
4. Test endpoint with existing analysis IDs

### Phase 2: Frontend Routing
1. Add missing routes to `App.tsx`
2. Create `AnalysisProgressPage.tsx` wrapper
3. Create `AnalysisResultsPage.tsx` wrapper  
4. Update `ReviewAnalysisAPIService` with `getAnalysisResults` method

### Phase 3: Integration Testing
1. Test complete flow: Form → Progress → Results
2. Verify progress polling works correctly
3. Test error scenarios and recovery
4. Validate navigation and URL handling

### Phase 4: Polish and Optimization
1. Add loading states and transitions
2. Optimize polling intervals based on user feedback
3. Add analytics tracking for flow completion
4. Update documentation and user guides

## Technical Decisions

### 1. Progress Tracking Approach
**Decision**: Real-time polling with adaptive intervals
**Rationale**: Better UX than simple loading, existing `useAnalysisProgress` is already optimized

### 2. Component Reuse Strategy  
**Decision**: Wrap existing components in page wrappers
**Rationale**: Minimal changes, leverages existing robust components

### 3. Error Handling Strategy
**Decision**: Graceful degradation with retry options
**Rationale**: Matches existing patterns, provides good UX

### 4. Database Schema Updates
**Decision**: Add progress columns to existing `analyses` table
**Rationale**: Simple, backward compatible, matches existing patterns

## Performance Considerations

### 1. Polling Optimization (Already Implemented)
- Adaptive intervals based on progress
- Tab visibility detection for battery saving
- Exponential backoff on errors

### 2. Component Loading
- Lazy load results components
- Skeleton loading states
- Progressive data loading

### 3. Memory Management
- Stop polling on component unmount
- Clear intervals on navigation
- Cleanup event listeners

## Security Considerations

### 1. Authentication (Already Implemented)
- All routes wrapped with `ProtectedRoute`
- API calls include auth tokens
- RLS policies on database

### 2. Authorization
- Users can only access their own analyses
- `analysisId` validation on backend
- Proper error messages for unauthorized access

### 3. Data Validation
- Input validation on form submission
- URL parameter validation
- API response validation

This design leverages existing robust components while adding the minimal infrastructure needed for a complete analysis flow. The implementation focuses on connecting existing pieces rather than rebuilding functionality.