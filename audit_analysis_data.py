#!/usr/bin/env python3
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
client = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_ROLE_KEY'))

analysis_id = '82cb405b-4093-4e4c-9bde-b0704ddb498e'

# Get analysis details
analysis = client.table('analyses').select('*').eq('id', analysis_id).execute().data[0]
print(f'Restaurant: {analysis["restaurant_name"]}')
print(f'Location: {analysis["location"]}')
print(f'Tier: {analysis["tier"]}')

# Get competitors
comps = client.table('analysis_competitors').select('*').eq('analysis_id', analysis_id).execute().data
print(f'\nCompetitors: {len(comps)}')
for c in comps:
    print(f'  - {c["competitor_name"]} ({c["rating"]}⭐, {c["review_count"]} reviews)')

# Get ALL reviews collected
print(f'\n{"="*80}')
print('REVIEWS COLLECTED PER COMPETITOR')
print("="*80)
total_reviews = 0
for comp in comps:
    reviews = client.table('reviews').select('*').eq('competitor_id', comp['competitor_id']).execute().data
    total_reviews += len(reviews)
    print(f'\n{comp["competitor_name"]}: {len(reviews)} reviews')
    for idx, r in enumerate(reviews, 1):
        print(f'  {idx}. [{r["rating"]}⭐] {r["text"][:100]}...')

print(f'\n{"="*80}')
print(f'TOTAL REVIEWS COLLECTED: {total_reviews}')
print(f'REVIEWS PER COMPETITOR: {total_reviews / len(comps) if comps else 0:.1f}')
print("="*80)

# Get insights
insights = client.table('insights').select('*').eq('analysis_id', analysis_id).execute().data
print(f'\nINSIGHTS GENERATED: {len(insights)}')
for i in insights:
    print(f'\n--- {i["title"]} ---')
    print(f'Category: {i["category"]}')
    print(f'Source: {i.get("competitor_name", "N/A")}')
    print(f'Mentions: {i["mention_count"]}')
    print(f'Confidence: {i["confidence"]}')
    print(f'Quote: "{i["proof_quote"]}"')
    print(f'Description: {i["description"][:150]}...')
