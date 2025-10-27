# FREE TIER COMPETITIVE ANALYSIS PROMPT

## Design Goals
- **Cost Target**: <$0.11 per analysis
- **Performance Target**: <10 seconds processing
- **Token Limits**: <1000 input tokens, <500 output tokens
- **Quality Target**: 3-4 actionable insights based on real data

## Prompt Structure

### Input Format
```
# COMPETITIVE ANALYSIS - FREE TIER

Analyze {competitor_count} competitors for {restaurant_name} ({restaurant_category} in {restaurant_location}).

## COMPETITORS & REVIEWS:

### {Competitor Name} ({avg_rating}⭐, {review_count} reviews)
[{rating}⭐] {truncated_review_text}...
[{rating}⭐] {truncated_review_text}...

### {Competitor Name 2} ({avg_rating}⭐, {review_count} reviews)
[{rating}⭐] {truncated_review_text}...
```

### Output Format
```json
{
  "actionable_insights": [
    {
      "category": "opportunity/threat/watch",
      "title": "Insight Title",
      "description": "Actionable description for restaurant",
      "confidence": "high/medium/low",
      "proof_quote": "Exact quote from reviews above",
      "mention_count": number,
      "significance": 0-100,
      "competitor_source": "competitor_name"
    }
  ]
}
```

## Cost Optimization Strategies

### Data Optimization
1. **Review Filtering**: Only high-quality reviews (>20 chars, has rating)
2. **Review Sampling**: Max 10 reviews per competitor, diverse rating distribution
3. **Text Truncation**: Max 120 characters per review, cut at sentence boundaries
4. **Competitor Limiting**: Max 3 competitors for free tier

### Prompt Optimization
1. **Concise Instructions**: Clear, direct rules without examples
2. **Structured Output**: JSON format for easy parsing
3. **Token Counting**: Monitor and optimize prompt length
4. **Essential Fields Only**: Only include necessary data fields

### Processing Optimization
1. **Timeout Protection**: 10-second timeout with fallback
2. **Response Validation**: Ensure quotes exist in source data
3. **Error Handling**: Graceful fallback when LLM fails
4. **Async Processing**: Non-blocking LLM calls

## Quality Assurance

### Data Validation
- **Quote Verification**: Proof quotes must exist in source reviews
- **Competitor Attribution**: Competitor sources must be valid
- **Confidence Scoring**: Based on review frequency and consistency
- **Mention Counting**: Accurate count based on actual review mentions

### Insight Quality
- **Actionability**: Each insight must be implementable
- **Specificity**: Include specific competitor names and evidence
- **Relevance**: Focus on restaurant category-specific insights
- **Uniqueness**: Insights should vary based on actual competitor data

## Fallback Strategy

When LLM is unavailable or times out:
1. **Use Real Competitor Names**: Generate insights using actual competitor data
2. **Generic but Relevant**: Provide category-appropriate insights
3. **Mark as Fallback**: Include metadata indicating fallback mode
4. **Maintain Structure**: Same output format for consistent processing

## Performance Monitoring

### Cost Metrics
- **Token Usage**: Track input/output tokens per analysis
- **API Costs**: Monitor actual vs. target costs ($0.11)
- **Processing Time**: Track LLM response times

### Quality Metrics
- **Insight Uniqueness**: % of insights that differ between restaurants
- **Quote Accuracy**: % of proof quotes found in source data
- **Competitor Attribution**: % of insights with valid competitor sources

## Example Optimized Prompt

```
# COMPETITIVE ANALYSIS - FREE TIER

Analyze 3 competitors for Mario's Pizza (pizza in Boston, MA).

## COMPETITORS & REVIEWS:
### Tony's Pizza (4.2⭐, 8 reviews)
[5⭐] Amazing crust and fast service, got my order in 15 minutes...
[3⭐] Good pizza but parking is terrible, had to walk 3 blocks...
[4⭐] Love the garlic knots, better than other places nearby...

### Boston Pizza Co (3.8⭐, 6 reviews)
[4⭐] Decent pizza but took 45 minutes for delivery...
[2⭐] Overpriced for what you get, $25 for medium pizza...
[5⭐] Best pepperoni in the area, crispy and flavorful...

## OUTPUT (JSON):
{
  "actionable_insights": [
    {"category": "opportunity/threat/watch", "title": "Title", "description": "Description", "confidence": "high/medium/low", "proof_quote": "Exact quote from reviews above", "mention_count": number, "significance": 0-100, "competitor_source": "competitor_name"}
  ]
}

## RULES:
- Generate 3-4 insights maximum for cost efficiency
- Use EXACT quotes from reviews above as proof_quote
- Focus on actionable opportunities for Mario's Pizza
- Base confidence on review frequency and consistency
- Include specific competitor names in descriptions
- Set mention_count based on how many reviews mention this issue
- Calculate significance (0-100) based on impact potential
- Each insight must have a competitor_source from the data above

CRITICAL: Only use quotes that appear EXACTLY in the reviews above.
```

## Expected Output Example

```json
{
  "actionable_insights": [
    {
      "category": "opportunity",
      "title": "Service Speed Advantage",
      "description": "Mario's Pizza can capitalize on competitors' slow service - Tony's delivers in 15 minutes while Boston Pizza Co takes 45 minutes.",
      "confidence": "high",
      "proof_quote": "took 45 minutes for delivery",
      "mention_count": 2,
      "significance": 75,
      "competitor_source": "Boston Pizza Co"
    },
    {
      "category": "opportunity", 
      "title": "Parking Convenience Gap",
      "description": "Address parking issues that competitors struggle with to improve customer experience.",
      "confidence": "medium",
      "proof_quote": "parking is terrible, had to walk 3 blocks",
      "mention_count": 1,
      "significance": 60,
      "competitor_source": "Tony's Pizza"
    },
    {
      "category": "watch",
      "title": "Pricing Sensitivity Monitoring",
      "description": "Monitor competitor pricing as customers show price sensitivity in the market.",
      "confidence": "medium", 
      "proof_quote": "Overpriced for what you get, $25 for medium pizza",
      "mention_count": 1,
      "significance": 55,
      "competitor_source": "Boston Pizza Co"
    }
  ]
}
```

This approach ensures cost-effective analysis while maintaining insight quality and data accuracy.