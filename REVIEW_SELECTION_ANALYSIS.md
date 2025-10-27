# Review Selection & Weighting System Analysis

## Current State

### ✅ What's Working

1. **Quality Scoring System** (in `review_fetching_service.py`)
   - Reviews are scored 0-1 based on multiple factors
   - Factors include: length, specificity, spam detection, rating consistency
   - Quality threshold of 0.3 filters out low-quality reviews
   - Minimum 15 characters required

2. **Quality Calculation Factors:**
   ```python
   - Base score: 0.5
   - Length optimization: +0.2 (50-200 chars optimal)
   - Specific keywords: +0.05 per keyword (max +0.2)
   - Spam detection: -0.3 if spam patterns found
   - Rating consistency: -0.1 for extreme ratings with short text
   ```

3. **Spam Filtering:**
   - Repeated characters detection
   - All-caps detection
   - URL detection
   - Promotional language detection

### ❌ What's Missing

1. **No Intelligent Review Selection**
   - Current: `diverse_sample = quality_reviews[:self.max_reviews_per_competitor]`
   - Just takes first 10 reviews (whatever Google returns)
   - No sorting by quality score
   - No diversity sampling by rating distribution
   - No recency weighting

2. **No Rating Distribution Balance**
   - Should sample across rating spectrum (1-5 stars)
   - Currently might get all 5-star or all 1-star reviews
   - Missing balanced perspective

3. **No Recency Weighting**
   - Older reviews might be less relevant
   - No time-based prioritization

4. **No Sentiment Diversity**
   - Should include mix of positive, negative, neutral
   - Currently random based on Google's order

## How Google Returns Reviews

Google Places API returns reviews in this order:
1. **"most_relevant"** (default) - Google's algorithm
2. Can request **"newest"** sorting
3. Maximum 5 reviews per request (API limitation)

**Current Implementation:**
```python
place_details = self.client.place(
    place_id=competitor_place_id,
    fields=['name', 'reviews', 'rating', 'user_ratings_total'],
    language=language
)
```
- Uses default "most_relevant" sorting
- Gets maximum 5 reviews per competitor
- No additional sorting or filtering applied

## Impact on Analysis Quality

### Current Analysis (1b59b061-1743-4828-a569-6d8f02e844d0)
- **Subway:** 5 reviews collected
- **River Falls:** 5 reviews collected  
- **Chan's Fine Oriental Dining:** 5 reviews collected
- **Total:** 15 reviews

**Review Distribution:**
- Subway: 3 negative (1⭐), 2 positive (5⭐) - Good balance
- River Falls: 4 positive (5⭐), 1 mixed (4⭐) - Skewed positive
- Chan's: 3 positive (5⭐), 1 mixed (4⭐), 1 negative (2⭐) - Good balance

**Quality:** The insights were good because Google's "most_relevant" algorithm happened to provide diverse reviews. But this is **not guaranteed** for every analysis.

## Recommended Improvements

### Priority 1: Sort by Quality Score ⭐⭐⭐
```python
# Instead of:
diverse_sample = quality_reviews[:self.max_reviews_per_competitor]

# Do:
sorted_reviews = sorted(quality_reviews, key=lambda x: x.get('quality_score', 0), reverse=True)
diverse_sample = sorted_reviews[:self.max_reviews_per_competitor]
```

### Priority 2: Rating Distribution Sampling ⭐⭐⭐
```python
def _sample_diverse_reviews(self, reviews: List[Dict], max_count: int) -> List[Dict]:
    """Sample reviews to ensure rating diversity"""
    # Group by rating
    by_rating = {1: [], 2: [], 3: [], 4: [], 5: []}
    for review in reviews:
        rating = review.get('rating', 3)
        by_rating[rating].append(review)
    
    # Sample proportionally or ensure at least 1 from each rating if available
    sampled = []
    ratings_available = [r for r in [1, 2, 3, 4, 5] if by_rating[r]]
    
    if len(ratings_available) >= max_count:
        # Take 1 from each rating, prioritize extremes
        for rating in [1, 5, 2, 4, 3]:
            if by_rating[rating] and len(sampled) < max_count:
                # Take highest quality from this rating
                best = max(by_rating[rating], key=lambda x: x.get('quality_score', 0))
                sampled.append(best)
    else:
        # Take best quality from each available rating
        for rating in ratings_available:
            if by_rating[rating]:
                best = max(by_rating[rating], key=lambda x: x.get('quality_score', 0))
                sampled.append(best)
        
        # Fill remaining slots with highest quality
        remaining = max_count - len(sampled)
        if remaining > 0:
            all_reviews = [r for rating_list in by_rating.values() for r in rating_list]
            all_reviews = [r for r in all_reviews if r not in sampled]
            sorted_remaining = sorted(all_reviews, key=lambda x: x.get('quality_score', 0), reverse=True)
            sampled.extend(sorted_remaining[:remaining])
    
    return sampled[:max_count]
```

### Priority 3: Recency Weighting ⭐⭐
```python
def _calculate_review_quality_with_recency(self, text: str, rating: int, review_date: datetime) -> float:
    """Calculate quality score with recency factor"""
    base_quality = self._calculate_review_quality(text, rating)
    
    # Add recency bonus (reviews from last 6 months get boost)
    days_old = (datetime.now() - review_date).days
    if days_old <= 180:  # 6 months
        recency_bonus = 0.1 * (1 - days_old / 180)  # 0.1 to 0.0 bonus
        base_quality += recency_bonus
    
    return min(1.0, base_quality)
```

### Priority 4: Sentiment Balance ⭐
- Ensure mix of positive/negative/neutral sentiment
- Use rating as proxy for sentiment
- Already covered by rating distribution sampling

## Implementation Plan

### Phase 1: Quick Win (30 minutes)
1. Sort reviews by quality_score before sampling
2. Update `_optimize_competitor_data()` in `real_free_tier_llm_service.py`

### Phase 2: Rating Diversity (1 hour)
1. Implement `_sample_diverse_reviews()` method
2. Ensure balanced rating distribution
3. Test with multiple analyses

### Phase 3: Recency Weighting (30 minutes)
1. Add recency factor to quality calculation
2. Update `_calculate_review_quality()` in `review_fetching_service.py`

### Phase 4: Testing & Validation (1 hour)
1. Run multiple test analyses
2. Verify review distribution
3. Compare insight quality before/after

## Expected Impact

### Before Improvements:
- Random review selection
- Possible rating bias
- Inconsistent insight quality
- Luck-dependent results

### After Improvements:
- ✅ Highest quality reviews selected
- ✅ Balanced rating distribution (1-5 stars)
- ✅ Recent reviews prioritized
- ✅ Consistent, reliable insights
- ✅ Better competitive intelligence

## Cost Impact

**No additional cost** - Still using same number of reviews (5 per competitor), just selecting them more intelligently from the available pool.

## Conclusion

The current system works but relies on luck (Google's "most_relevant" algorithm). Implementing intelligent review selection will:
1. Improve insight quality consistency
2. Ensure balanced perspectives
3. Prioritize recent, high-quality feedback
4. Make the system more reliable for restaurant owners

**Recommendation:** Implement Priority 1 & 2 immediately (1.5 hours total) for significant quality improvement.
