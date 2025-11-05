# Streaming Analysis Pipeline Fix

## Problem Identified

The streaming review analysis was **finding competitors and collecting reviews** but **failing to save data** to the database, causing the pipeline to die silently.

### Root Causes

1. **Schema Mismatch in Competitor Storage**
   - `streaming_orchestrator.py` was trying to insert columns that don't exist in the `competitors` table
   - Columns like `analysis_id`, `latitude`, `longitude`, `category`, `google_rating` don't exist
   - This caused silent failures in the upsert operation

2. **Wrong Query in Exclusion Service**
   - `competitor_exclusion_service.py` was querying non-existent `competitors_data` column in `analyses` table
   - Should query the `analysis_competitors` junction table instead
   - This caused the error: `column analyses.competitors_data does not exist`

### Database Schema (Actual)

```sql
-- Competitors table
CREATE TABLE public.competitors (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    rating DECIMAL(2,1),
    review_count INTEGER,
    phone VARCHAR(50),
    website VARCHAR(500),
    google_place_id VARCHAR(255),
    yelp_id VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Junction table linking analyses to competitors
CREATE TABLE public.analysis_competitors (
    analysis_id UUID REFERENCES analyses(id),
    competitor_id VARCHAR(255) REFERENCES competitors(id),
    competitor_name VARCHAR(255),
    rating DECIMAL(2,1),
    review_count INTEGER,
    distance_miles DECIMAL(5,2),
    PRIMARY KEY (analysis_id, competitor_id)
);
```

## Fixes Applied

### 1. Fixed Competitor Storage (`streaming_orchestrator.py`)

**Before:**
```python
competitor_data = {
    "id": competitor.place_id,
    "analysis_id": analysis_id,  # ❌ doesn't exist
    "place_id": competitor.place_id,  # ❌ wrong column name
    "latitude": competitor.latitude,  # ❌ doesn't exist
    "longitude": competitor.longitude,  # ❌ doesn't exist
    "google_rating": competitor.rating,  # ❌ wrong column name
    "category": request.category,  # ❌ doesn't exist
    ...
}
```

**After:**
```python
competitor_data = {
    "id": competitor.place_id,
    "name": competitor.name,
    "address": competitor.address,
    "rating": competitor.rating,
    "review_count": competitor.review_count,
    "google_place_id": competitor.place_id,  # ✅ correct column
    "created_at": datetime.utcnow().isoformat()
}
```

### 2. Fixed Exclusion Query (`competitor_exclusion_service.py`)

**Before:**
```python
result = self.client.table("analyses").select(
    "competitors_data"  # ❌ column doesn't exist
).eq("user_id", user_id)...
```

**After:**
```python
result = self.client.table("analysis_competitors").select(
    "competitor_id, analyses!inner(user_id, status, created_at)"
).eq("analyses.user_id", user_id)...
```

### 3. Added Error Logging

Added try-catch blocks with explicit logging to catch future database errors:

```python
try:
    result = service_client.table("competitors").upsert(competitor_data_list).execute()
    logger.info(f"✅ Stored {len(competitor_data_list)} competitors in database")
except Exception as e:
    logger.error(f"❌ Failed to store competitors: {e}")
```

## Expected Flow (After Fix)

1. ✅ User submits analysis request
2. ✅ Analysis record created in `analyses` table
3. ✅ Competitors discovered via Outscraper
4. ✅ **Competitors stored in `competitors` table** (NOW WORKS)
5. ✅ **Junction records created in `analysis_competitors`** (NOW WORKS)
6. ✅ Reviews collected and stored in `reviews` table
7. ✅ Reviews sent to LLM for analysis
8. ✅ Insights generated and stored
9. ✅ Results streamed to frontend

## Testing

Run a new analysis and check the logs for:
- `✅ Stored X competitors in database`
- `✅ Stored X analysis_competitor records`

Then verify in Supabase:
```sql
SELECT 
    a.restaurant_name,
    a.status,
    COUNT(ac.competitor_id) as competitor_count
FROM analyses a
LEFT JOIN analysis_competitors ac ON a.id = ac.analysis_id
WHERE a.created_at > NOW() - INTERVAL '1 hour'
GROUP BY a.id, a.restaurant_name, a.status;
```

Should now show `competitor_count > 0` for completed analyses.
