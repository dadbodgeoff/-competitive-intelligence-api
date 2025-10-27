# WEEK 1 SQL UPDATES

## SUPABASE SQL EDITOR UPDATES REQUIRED

Run these SQL commands in your Supabase SQL Editor after Week 1 completion.

## WEEK 1 DATABASE CHANGES

**Status:** READY TO EXECUTE
**Risk Level:** ZERO (Separate tables, no modifications to existing)
**Rollback:** Can drop tables without affecting reviews

## SQL COMMANDS TO RUN

**Execute Menu Intelligence Schema**

**File:** `database/menu_intelligence_schema.sql`

**Creates:**
- 4 new tables for menu intelligence
- Indexes for performance
- RLS policies for security
- Helper functions and triggers

**Tables Created:**
1. `public.menu_analyses` - Menu analysis records
2. `public.menu_insights` - Menu analysis insights  
3. `public.competitor_menus` - Cached competitor menus (7-day TTL)
4. `public.menu_item_matches` - LLM-generated item matches

**Safety Notes:**
- Does NOT modify existing tables
- Does NOT affect review analysis functionality
- Uses same RLS patterns as existing tables
- Can be rolled back by dropping tables

## EXECUTION INSTRUCTIONS

**Before Running SQL:**

1. **Backup Current State**
   ```sql
   SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';
   ```

2. **Verify Review Analysis Works**
   ```bash
   curl -X POST /api/v1/analysis/run -d '{"restaurant_name": "Test", "location": "Test"}'
   ```

**Execute SQL:**

1. Open Supabase Dashboard → SQL Editor
2. Copy entire contents of `database/menu_intelligence_schema.sql`
3. Paste into SQL Editor and click "Run"

**Verify Execution:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'menu_%';

-- Should return:
-- menu_analyses
-- menu_insights  
-- competitor_menus
-- menu_item_matches
```

**After Running SQL:**

1. **Verify Review Analysis Still Works**
   ```bash
   curl -X POST /api/v1/analysis/run -d '{"restaurant_name": "Test", "location": "Test"}'
   ```

2. **Test Menu Tables**
   ```sql
   SELECT COUNT(*) FROM public.menu_analyses;
   SELECT COUNT(*) FROM public.menu_insights;
   ```

## ROLLBACK PLAN

If anything goes wrong:

```sql
DROP TABLE IF EXISTS public.menu_item_matches CASCADE;
DROP TABLE IF EXISTS public.menu_insights CASCADE;
DROP TABLE IF EXISTS public.competitor_menus CASCADE;
DROP TABLE IF EXISTS public.menu_analyses CASCADE;

DROP FUNCTION IF EXISTS public.validate_menu_structure(JSONB);
DROP FUNCTION IF EXISTS public.cleanup_expired_competitor_menus();
DROP FUNCTION IF EXISTS public.update_competitor_menu_access();
```

**After rollback:**
- Review analysis will work exactly as before
- No data loss
- No functionality impact

## EXPECTED RESULTS

**New Tables:** 4
**New Indexes:** 8
**New RLS Policies:** 8
**New Functions:** 3

**Verification:**
```sql
-- Count new tables
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE 'menu_%';
-- Expected: 4

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND tablename LIKE 'menu_%';
-- Expected: All should have rowsecurity = true
```

## COMPLETION CHECKLIST

- [ ] Backed up current database state
- [ ] Verified review analysis works before changes
- [ ] Executed `menu_intelligence_schema.sql` successfully
- [ ] Verified 4 new tables created
- [ ] Verified RLS policies applied
- [ ] Tested review analysis still works after changes
- [ ] Documented completion timestamp

**Completion Timestamp:** ________________
**Executed By:** ________________
**Notes:** ________________