# Competitor Exclusion Feature

## Overview
Prevents users from re-analyzing the same competitors within a 14-day cooldown period, ensuring fresh insights and avoiding wasted API calls.

## How It Works

### 1. Tracking
- **Menu Comparisons**: Tracks competitors via `competitor_businesses` table
- **Review Analysis**: Tracks competitors via `streaming_analyses.competitors_data` field
- **Cooldown Period**: 14 days (configurable in `CompetitorExclusionService`)

### 2. Exclusion Logic
When a user starts a new analysis:
1. System queries database for competitors analyzed in last 14 days
2. Extracts `place_id` values from both menu and review analyses
3. Passes excluded place_ids to discovery service
4. Discovery service filters out excluded competitors from results
5. Returns only fresh competitors that haven't been analyzed recently

### 3. Integration Points

#### Menu Comparison
```python
# services/menu_comparison_orchestrator.py
excluded_place_ids = await self.exclusion_service.get_excluded_place_ids(
    user_id=user_id,
    analysis_type='menu'
)

competitors = await self.discovery_service.find_competitors(
    location=location,
    restaurant_name=restaurant_name,
    excluded_place_ids=excluded_place_ids
)
```

#### Review Analysis
```python
# services/streaming_orchestrator.py
excluded_place_ids = await self.exclusion_service.get_excluded_place_ids(
    user_id=current_user,
    analysis_type='review'
)

analysis_results = await asyncio.to_thread(
    self.outscraper_service.analyze_competitors_parallel,
    location=request.location,
    excluded_place_ids=excluded_place_ids
)
```

## Benefits

### For Users
- ✅ Always get fresh competitor insights
- ✅ No duplicate analyses wasting their quota
- ✅ Discover new competitors in their area over time

### For System
- ✅ Reduces redundant API calls to Google Places
- ✅ Reduces redundant review scraping
- ✅ Better resource utilization
- ✅ More diverse competitive intelligence data

## Configuration

### Cooldown Period
Default: 14 days

To change:
```python
# services/competitor_exclusion_service.py
class CompetitorExclusionService:
    def __init__(self, supabase_client: Client):
        self.cooldown_days = 14  # Change this value
```

### Analysis Types
- `'menu'`: Only exclude from menu comparisons
- `'review'`: Only exclude from review analyses  
- `'both'`: Exclude from both (default)

## Database Schema

### Menu Comparisons
```sql
-- competitor_businesses table
SELECT place_id 
FROM competitor_businesses
WHERE user_id = ? 
  AND created_at >= NOW() - INTERVAL '14 days'
```

### Review Analyses
```sql
-- streaming_analyses table
SELECT competitors_data 
FROM streaming_analyses
WHERE user_id = ? 
  AND status = 'completed'
  AND created_at >= NOW() - INTERVAL '14 days'
```

## Error Handling
- If exclusion service fails, returns empty list (doesn't block discovery)
- Logs warnings but continues with normal discovery
- Graceful degradation ensures feature never breaks core functionality

## Future Enhancements
1. **User Preferences**: Allow users to adjust cooldown period
2. **Manual Override**: Let users force re-analyze specific competitors
3. **Exclusion Dashboard**: Show users which competitors are excluded and when they'll be available again
4. **Smart Exclusions**: Exclude based on similarity (e.g., same chain, same owner)
5. **Explicit Tracking Table**: Create dedicated `analyzed_competitors` table for better performance

## Testing
```python
# Test exclusion service
from services.competitor_exclusion_service import CompetitorExclusionService

service = CompetitorExclusionService(supabase_client)

# Get excluded place_ids
excluded = await service.get_excluded_place_ids(
    user_id="test-user-id",
    analysis_type="both"
)

print(f"Excluded: {len(excluded)} competitors")
```

## Monitoring
Watch logs for:
- `🚫 Excluding X competitors for user` - Shows exclusion is working
- `🚫 Filtered out X recently analyzed competitors` - Shows filtering is working
- `📋 Found X competitors from menu/review analyses` - Shows tracking is working
