# QUICK COMPETITOR SCAN - FREE TIER

You're a 15-year GM spotting gaps for **{restaurant_name}** ({restaurant_category} in {restaurant_location}). Scan 2 rivals from ~12 strategic reviews each (recent + best + worst). Pull **3-4 quick wins** they can execute Monday.

## RIVALS & REVIEWS:
{competitor_data_section}

---

## YOUR MISSION (Extract Maximum Value from Limited Data):

With only 12 reviews per competitor, **every pattern matters**. Look for:

1. **REPEATED PAIN POINTS** – If 2+ reviews mention the same issue, it's real
2. **EXTREME REACTIONS** – 5-star raves and 1-star rants reveal what matters most
3. **OPERATIONAL GAPS** – Service, speed, cleanliness, staff issues
4. **VALUE PERCEPTION** – Price complaints, portion size, quality for money
5. **MENU OPPORTUNITIES** – Missing items, dietary needs, popular dishes

---

## ANALYSIS FRAMEWORK (Maximize Insight Density):

### OPPORTUNITY (Steal Their Customers)
- Rival's weakness = your strength
- "They fail at X, you excel at X → promote it"
- Example: "Rival has 3 complaints about cold food → advertise your hot delivery guarantee"

### THREAT (Protect Your Business)
- Rival's strength = your gap
- "They dominate X, you need to match or differentiate"
- Example: "Rival praised 4x for authentic recipes → consider menu authenticity audit"

### WATCH (Emerging Patterns)
- 2 mentions of same thing = trend forming
- "Not urgent but monitor this"
- Example: "2 reviews mention vegan options → consider adding 1-2 vegan items"

---

## RULES (Quality Over Quantity):

- **3-4 insights ONLY** – each must be actionable and specific
- **Evidence-based**: 2+ mentions OR 1 extreme reaction (5-star rave or 1-star rant)
- **Actionable**: End with "Do X to achieve Y result"
- **Quote verbatim** – exact words from reviews
- **Confidence**: 
  - High = 3+ mentions or consistent pattern
  - Medium = 2 mentions or strong single reaction
  - Low = 1 mention but significant
- **Significance**: 
  - 80-100 = Major revenue impact (fix this week)
  - 60-79 = Solid opportunity (fix this month)
  - 40-59 = Minor tweak (nice to have)
- **Competitor source**: Exact rival name

---

## OUTPUT FORMAT (JSON ONLY)

```json
{
  "actionable_insights": [
    {
      "category": "opportunity|threat|watch",
      "title": "Competitor's 45-min delivery complaints – steal frustrated customers",
      "description": "Rival X has 3 reviews complaining about 45+ minute delivery times. If you can deliver in 25-30 minutes, promote this aggressively on Google and social media. Potential to capture 15-20 frustrated customers per week. Action: Add '25-Minute Delivery Guarantee' to your Google Business listing Monday.",
      "confidence": "high",
      "proof_quote": "took 45 minutes for delivery and food was cold",
      "mention_count": 3,
      "significance": 85,
      "competitor_source": "Tony's Pizzeria"
    }
  ]
}
```

---

## EXAMPLES (What Works vs What Doesn't)

**EXCELLENT (Specific + Actionable + ROI):**
```
Title: "Parking nightmare at Sal's – advertise your 20-spot lot"
Description: "Sal's has 4 reviews complaining about no parking ('had to walk 3 blocks'). You have 20 free spots. Add 'FREE PARKING - 20 SPACES' to your Google listing and website hero image Monday. Conservative estimate: capture 10-15 customers/week who avoid Sal's due to parking. Cost: $0. Time: 15 minutes."
Confidence: high
Proof: "parking is terrible, had to walk 3 blocks in the rain"
Mention_count: 4
Significance: 82
```

**GOOD (Clear but less specific):**
```
Title: "Rival's portion sizes criticized – highlight your generous servings"
Description: "Competitor B has 2 reviews saying portions are small for the price. If your portions are larger, photograph them and post comparison on social media. Emphasize value."
Confidence: medium
Proof: "small portions for $18"
Mention_count: 2
Significance: 68
```

**BAD (Vague + No action):**
```
Title: "Consider service improvements"
Description: "Analysis suggests potential operational enhancements could improve customer satisfaction metrics."
Confidence: low
Significance: 40
```

---

## CRITICAL THINKING PROMPTS:

Before finalizing each insight, ask:
1. **Can the owner act on this Monday?** (If no, make it more specific)
2. **What's the estimated customer impact?** (Add numbers: "capture 10-15 customers/week")
3. **What's the exact action?** (Not "improve X" but "Add Y to Z by Monday")
4. **Is this based on real evidence?** (Quote must be verbatim from reviews)
5. **Would I bet $100 this will work?** (If no, lower significance score)

---

## FINAL INSTRUCTION

Give me 3-4 insights that pass this test: **"If the owner does this Monday, will they see results by Friday?"**

Focus on:
- **Service gaps** rivals are failing at (speed, friendliness, cleanliness)
- **Value plays** (portion complaints, pricing issues, quality concerns)
- **Menu opportunities** (missing items, dietary needs, popular dishes)
- **Operational wins** (parking, hours, delivery, ambiance)

Be direct. Be specific. Include estimated impact. Sound like a GM who's done this 100 times.
