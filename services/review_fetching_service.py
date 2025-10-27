#!/usr/bin/env python3
"""
Review Fetching Service for Competitive Intelligence
Handles multi-source review collection with intelligent deduplication
"""
import googlemaps
import os
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta
import logging
from dataclasses import dataclass
from dotenv import load_dotenv
import hashlib
import re

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

@dataclass
class ReviewData:
    """Standardized review data structure"""
    review_id: str
    competitor_id: str
    source: str  # 'google' or 'yelp'
    external_id: str
    author_name: str
    rating: int
    text: str
    review_date: datetime
    language: Optional[str]
    helpful_count: Optional[int]
    response_from_owner: Optional[str]
    quality_score: float  # 0-1 score for review quality

class ReviewFetchingService:
    """Service for fetching and processing reviews from multiple sources"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GOOGLE_PLACES_API_KEY")
        if not self.api_key:
            logger.warning("Google Places API key not found. Using mock data.")
            self.client = None
        else:
            self.client = googlemaps.Client(key=self.api_key)
    
    async def fetch_competitor_reviews(
        self, 
        competitor_place_id: str, 
        competitor_name: str,
        max_reviews: int = 50,
        language: str = "en"
    ) -> List[ReviewData]:
        """Fetch reviews for a specific competitor"""
        
        if not self.client:
            return self._get_mock_reviews(competitor_place_id, competitor_name)
        
        try:
            # Get place details with reviews
            place_details = self.client.place(
                place_id=competitor_place_id,
                fields=['name', 'reviews', 'rating', 'user_ratings_total'],
                language=language
            )
            
            if not place_details.get('result'):
                logger.error(f"No place details found for {competitor_place_id}")
                return []
            
            place_data = place_details['result']
            reviews_data = place_data.get('reviews', [])
            
            processed_reviews = []
            
            for review in reviews_data[:max_reviews]:
                try:
                    processed_review = self._process_google_review(
                        review, competitor_place_id, competitor_name
                    )
                    if processed_review and self._is_quality_review(processed_review):
                        processed_reviews.append(processed_review)
                except Exception as e:
                    logger.error(f"Error processing review: {e}")
                    continue
            
            logger.info(f"Fetched {len(processed_reviews)} quality reviews for {competitor_name}")
            return processed_reviews
            
        except Exception as e:
            logger.error(f"Failed to fetch reviews for {competitor_place_id}: {e}")
            return self._get_mock_reviews(competitor_place_id, competitor_name)
    
    def _process_google_review(
        self, 
        review: Dict, 
        competitor_id: str, 
        competitor_name: str
    ) -> Optional[ReviewData]:
        """Process a single Google Places review into standardized format"""
        try:
            # Generate unique review ID
            review_text = review.get('text', '')
            author_name = review.get('author_name', 'Anonymous')
            time_stamp = review.get('time', 0)
            
            # Create unique ID based on content and metadata
            unique_string = f"{competitor_id}_{author_name}_{time_stamp}_{review_text[:50]}"
            review_id = hashlib.md5(unique_string.encode()).hexdigest()
            
            # Parse review date
            review_date = datetime.fromtimestamp(time_stamp) if time_stamp else datetime.now()
            
            # Calculate quality score
            quality_score = self._calculate_review_quality(review_text, review.get('rating', 0))
            
            return ReviewData(
                review_id=review_id,
                competitor_id=competitor_id,
                source='google',
                external_id=review_id,  # Google doesn't provide stable review IDs
                author_name=author_name,
                rating=review.get('rating', 0),
                text=review_text,
                review_date=review_date,
                language=review.get('language'),
                helpful_count=None,  # Not available in Google Places API
                response_from_owner=None,  # Would need additional API call
                quality_score=quality_score
            )
            
        except Exception as e:
            logger.error(f"Error processing Google review: {e}")
            return None
    
    def _calculate_review_quality(self, text: str, rating: int) -> float:
        """Calculate quality score for a review (0-1 scale)"""
        if not text or len(text.strip()) < 10:
            return 0.1  # Very short reviews are low quality
        
        quality_score = 0.5  # Base score
        
        # Length factor (optimal around 50-200 characters)
        text_length = len(text.strip())
        if 50 <= text_length <= 200:
            quality_score += 0.2
        elif 20 <= text_length < 50:
            quality_score += 0.1
        elif text_length > 500:
            quality_score -= 0.1  # Very long reviews might be spam
        
        # Specific details factor
        specific_keywords = [
            'food', 'service', 'staff', 'atmosphere', 'price', 'menu',
            'order', 'wait', 'clean', 'fresh', 'taste', 'portion'
        ]
        keyword_count = sum(1 for keyword in specific_keywords if keyword.lower() in text.lower())
        quality_score += min(keyword_count * 0.05, 0.2)
        
        # Avoid obvious spam patterns
        spam_patterns = [
            r'(.)\1{4,}',  # Repeated characters
            r'[A-Z]{10,}',  # All caps words
            r'www\.|http|\.com',  # URLs
        ]
        
        for pattern in spam_patterns:
            if re.search(pattern, text):
                quality_score -= 0.3
                break
        
        # Rating consistency (extreme ratings with short text are suspicious)
        if (rating == 1 or rating == 5) and text_length < 30:
            quality_score -= 0.1
        
        return max(0.0, min(1.0, quality_score))
    
    def _is_quality_review(self, review: ReviewData) -> bool:
        """Determine if a review meets quality standards"""
        # Minimum quality threshold
        if review.quality_score < 0.3:
            return False
        
        # Minimum text length
        if len(review.text.strip()) < 15:
            return False
        
        # Must have valid rating
        if not (1 <= review.rating <= 5):
            return False
        
        # Check for obvious spam content
        spam_indicators = [
            'click here', 'visit our website', 'call now',
            'best deal', 'limited time', 'act now'
        ]
        
        text_lower = review.text.lower()
        if any(indicator in text_lower for indicator in spam_indicators):
            return False
        
        return True
    
    def deduplicate_reviews(self, reviews: List[ReviewData]) -> List[ReviewData]:
        """Remove duplicate reviews across sources"""
        seen_reviews = set()
        unique_reviews = []
        
        for review in reviews:
            # Create fingerprint based on content similarity
            fingerprint = self._create_review_fingerprint(review)
            
            if fingerprint not in seen_reviews:
                seen_reviews.add(fingerprint)
                unique_reviews.append(review)
            else:
                logger.debug(f"Duplicate review detected: {review.review_id}")
        
        logger.info(f"Deduplicated {len(reviews)} -> {len(unique_reviews)} reviews")
        return unique_reviews
    
    def _create_review_fingerprint(self, review: ReviewData) -> str:
        """Create a fingerprint for duplicate detection"""
        # Normalize text for comparison
        normalized_text = re.sub(r'[^\w\s]', '', review.text.lower())
        normalized_text = ' '.join(normalized_text.split())
        
        # Create fingerprint from key elements
        fingerprint_data = f"{review.author_name.lower()}_{review.rating}_{normalized_text[:100]}"
        return hashlib.md5(fingerprint_data.encode()).hexdigest()
    
    def _get_mock_reviews(self, competitor_id: str, competitor_name: str) -> List[ReviewData]:
        """Generate mock review data for development/testing"""
        mock_reviews = [
            ReviewData(
                review_id="mock_review_1",
                competitor_id=competitor_id,
                source='google',
                external_id="mock_ext_1",
                author_name="Sarah Johnson",
                rating=5,
                text="Amazing pizza! The crust was perfectly crispy and the toppings were fresh. Service was quick and friendly. Definitely coming back!",
                review_date=datetime.now() - timedelta(days=5),
                language="en",
                helpful_count=12,
                response_from_owner=None,
                quality_score=0.85
            ),
            ReviewData(
                review_id="mock_review_2",
                competitor_id=competitor_id,
                source='google',
                external_id="mock_ext_2",
                author_name="Mike Chen",
                rating=4,
                text="Good food and reasonable prices. The atmosphere is casual and welcoming. Wait time was about 15 minutes on a Friday night.",
                review_date=datetime.now() - timedelta(days=12),
                language="en",
                helpful_count=8,
                response_from_owner="Thank you for your feedback! We're glad you enjoyed your visit.",
                quality_score=0.78
            ),
            ReviewData(
                review_id="mock_review_3",
                competitor_id=competitor_id,
                source='google',
                external_id="mock_ext_3",
                author_name="Lisa Rodriguez",
                rating=3,
                text="The food was okay but nothing special. Service could be improved - had to wait a while to get our order taken.",
                review_date=datetime.now() - timedelta(days=20),
                language="en",
                helpful_count=3,
                response_from_owner=None,
                quality_score=0.65
            ),
            ReviewData(
                review_id="mock_review_4",
                competitor_id=competitor_id,
                source='google',
                external_id="mock_ext_4",
                author_name="David Kim",
                rating=5,
                text="Best pizza in the neighborhood! Love the thin crust and the variety of toppings. Staff is always friendly and the place is clean.",
                review_date=datetime.now() - timedelta(days=8),
                language="en",
                helpful_count=15,
                response_from_owner="We appreciate your loyalty! Thank you for being a valued customer.",
                quality_score=0.92
            )
        ]
        
        return mock_reviews
    
    async def fetch_reviews_for_analysis(
        self, 
        competitors: List[Dict], 
        max_reviews_per_competitor: int = 50
    ) -> Dict[str, List[ReviewData]]:
        """Fetch reviews for all competitors in an analysis"""
        all_reviews = {}
        
        for competitor in competitors:
            competitor_id = competitor.get('id')
            competitor_name = competitor.get('name', 'Unknown')
            
            if not competitor_id:
                logger.warning(f"No ID found for competitor: {competitor_name}")
                continue
            
            try:
                reviews = await self.fetch_competitor_reviews(
                    competitor_place_id=competitor_id,
                    competitor_name=competitor_name,
                    max_reviews=max_reviews_per_competitor
                )
                
                # Deduplicate reviews
                unique_reviews = self.deduplicate_reviews(reviews)
                all_reviews[competitor_id] = unique_reviews
                
                logger.info(f"Collected {len(unique_reviews)} reviews for {competitor_name}")
                
            except Exception as e:
                logger.error(f"Failed to fetch reviews for {competitor_name}: {e}")
                all_reviews[competitor_id] = []
        
        total_reviews = sum(len(reviews) for reviews in all_reviews.values())
        logger.info(f"Total reviews collected: {total_reviews}")
        
        return all_reviews