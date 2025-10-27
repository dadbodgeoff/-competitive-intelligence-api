# Competitor Name Attribution Audit Report

## Problem
Insights show `competitor_name: None` instead of actual competitor names (e.g., "Firehouse Pizza Shop II", "Supreme Pizza")

## Root Cause Analysis

### 1. Database Schema Status

**Original schema** (`database/schema.sql` line 82-93):
```sql
CREATE TABLE public.insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID REFERENCES public.analyses(id),
    competitor_id VARCHAR(255) REFERENCES public.competitors(id),
    category VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    confidence VARCHAR(20) NOT NULL,
    mention_count INTEGER DEFAULT 0,
    significance DECIMAL(4,2),
    proof_quote TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**❌ MISSING:** `competitor_name` column

**Migration file exists** (`database/add_competitor_name_to_insights.sql`):
```sql
ALTER TABLE insights 
ADD COLUMN competitor_name TEXT;
```

**Status:** ⚠️ Migration file exists but may not have been run in Supabase

### 2. Code Analysis

**Location:** `services/enhanced_analysis_storage.py` line 49-76

**Current code** (line 56-67):
```python
insight_data = {
    "id": f"insight_{analysis_id}_{i}",
    "analysis_id": analysis_id,
    "category": insight.get('category', 'watch'),
    "title": insight.get('title', 'Untitled Insight'),
    "description": insight.get('description', ''),
    "confidence": insight.get('confidence', 'medium'),
    "mention_count": insight.get('mention_count', 1),
    "significance": insight.get('significance', 0.0),
    "proof_quote": insight.get('proof_quote', ''),
    "created_at": datetime.utcnow().isoformat()
}
```

**❌ MISSING:** `competitor_name` field is NOT being extracted from LLM response and stored

### 3. LLM Response Check

**LLM IS generating competitor_source correctly:**
- Insight 1: "competitor_source": "Firehouse Pizza Shop II"
- Insight 2: "competitor_source": "Firehouse Pizza Shop II"  
- Insight 3: "competitor_source": "Supreme Pizza"
- Insight 4: "competitor_source": "Supreme Pizza"

**Proof:** The prompt instructs LLM to include `competitor_source` and it's working.

### 4. Data Flow

```
LLM Response (✅ Has competitor_source)
    ↓
enhanced_analysis_storage.py (❌ Doesn't extract competitor_source)
    ↓
Database (❌ competitor_name column may not exist)
    ↓
Result: competitor_name = None
```

## Issues Found

### Issue #1: Database Column Missing (MAYBE)
**File:** Supabase database
**Problem:** `competitor_name` column may not exist in `insights` table
**Evidence:** Migration file exists but unclear if it was run
**Impact:** Even if code is fixed, data can't be stored without column

### Issue #2: Code Not Extracting competitor_source
**File:** `services/enhanced_analysis_storage.py` line 56-67
**Problem:** `insight.get('competitor_source')` is never called
**Evidence:** No `competitor_name` field in `insight_data` dictionary
**Impact:** Even if column exists, data isn't being written

## Solution Required

### Step 1: Verify Database Column Exists
Run this query in Supabase SQL Editor:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'insights' 
AND column_name = 'competitor_name';
```

**Expected result:** 
- If returns row: Column exists ✅
- If returns empty: Column missing ❌ → Run migration

### Step 2: Fix Code to Extract competitor_source
**File:** `services/enhanced_analysis_storage.py`
**Line:** 56-67
**Change needed:**
```python
insight_data = {
    "id": f"insight_{analysis_id}_{i}",
    "analysis_id": analysis_id,
    "category": insight.get('category', 'watch'),
    "title": insight.get('title', 'Untitled Insight'),
    "description": insight.get('description', ''),
    "confidence": insight.get('confidence', 'medium'),
    "mention_count": insight.get('mention_count', 1),
    "significance": insight.get('significance', 0.0),
    "proof_quote": insight.get('proof_quote', ''),
    "competitor_name": insight.get('competitor_source', 'Multiple Sources'),  # ADD THIS LINE
    "created_at": datetime.utcnow().isoformat()
}
```

## Verification Steps

1. **Check if column exists in Supabase:**
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'insights' AND column_name = 'competitor_name';
   ```

2. **If column doesn't exist, run migration:**
   ```sql
   ALTER TABLE insights ADD COLUMN competitor_name TEXT;
   CREATE INDEX idx_insights_competitor_name ON insights(competitor_name);
   ```

3. **Update code** in `services/enhanced_analysis_storage.py`

4. **Test with new analysis** to verify competitor_name is populated

## Summary

**Two-part fix required:**
1. ✅ Database: Ensure `competitor_name` column exists (run migration if needed)
2. ✅ Code: Extract `competitor_source` from LLM response and store as `competitor_name`

**Current Status:**
- LLM: ✅ Working correctly (generating competitor_source)
- Database: ⚠️ Unknown (need to verify column exists)
- Code: ❌ Not extracting competitor_source from LLM response

**Next Action:** 
Check Supabase to see if `competitor_name` column exists in `insights` table.
