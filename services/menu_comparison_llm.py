"""
Menu Comparison LLM Service
Analyzes pricing differences between user's menu and competitors
Separation of Concerns: Only handles LLM analysis, no parsing or storage
"""
import os
import time
import logging
from typing import Dict, List
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)


class MenuComparisonLLM:
    """
    Analyze menu pricing using Gemini 2.0 Flash
    
    Responsibilities:
    - Compare user's menu vs competitor menus
    - Identify pricing gaps
    - Find missing items
    - Generate actionable insights
    """
    
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment")
        
        genai.configure(api_key=api_key)
        self.model_name = "gemini-2.0-flash-exp"
        logger.info(f"✅ Menu Comparison LLM initialized ({self.model_name})")
    
    async def analyze_menu_comparison(
        self,
        user_menu: Dict,
        competitor_menus: List[Dict],
        restaurant_name: str
    ) -> Dict:
        """
        Analyze pricing differences and generate insights
        
        Args:
            user_menu: User's menu data with items and pricing
            competitor_menus: List of competitor menu data
            restaurant_name: User's restaurant name
            
        Returns:
            {
                "insights": [...],
                "metadata": {
                    "model_used": str,
                    "analysis_time_seconds": float,
                    "cost": float,
                    "insights_generated": int
                }
            }
        """
        logger.info(f"🧠 Analyzing menu comparison for: {restaurant_name}")
        
        # Count user menu items (handle nested structure)
        user_item_count = 0
        if 'categories' in user_menu:
            for cat in user_menu['categories']:
                user_item_count += len(cat.get('items', []))
        else:
            user_item_count = len(user_menu.get('items', []))
        
        logger.info(f"   User menu items: {user_item_count}")
        logger.info(f"   Competitor menus: {len(competitor_menus)}")
        
        start_time = time.time()
        
        try:
            # Build analysis prompt
            prompt = self._build_analysis_prompt(
                user_menu=user_menu,
                competitor_menus=competitor_menus,
                restaurant_name=restaurant_name
            )
            
            # Call Gemini
            logger.info(f"🤖 Calling {self.model_name} for analysis...")
            model = genai.GenerativeModel(self.model_name)
            
            response = model.generate_content(
                prompt,
                generation_config={
                    "temperature": 0.3,  # Slightly higher for creative insights
                    "top_p": 0.95,
                    "top_k": 40,
                    "max_output_tokens": 4096,
                }
            )
            
            analysis_time = time.time() - start_time
            logger.info(f"✅ Analysis complete in {analysis_time:.2f}s")
            
            # Parse response
            insights = self._parse_insights(response.text)
            
            # Calculate cost
            estimated_cost = 0.003  # ~$0.002-0.004 per analysis
            
            metadata = {
                "model_used": self.model_name,
                "analysis_time_seconds": round(analysis_time, 2),
                "cost": estimated_cost,
                "insights_generated": len(insights)
            }
            
            logger.info(f"📊 Generated {len(insights)} insights")
            
            return {
                "insights": insights,
                "metadata": metadata
            }
            
        except Exception as e:
            analysis_time = time.time() - start_time
            logger.error(f"❌ Analysis failed: {e}")
            
            return {
                "insights": [],
                "metadata": {
                    "model_used": self.model_name,
                    "analysis_time_seconds": round(analysis_time, 2),
                    "cost": 0.0,
                    "insights_generated": 0,
                    "error": str(e)
                }
            }
    
    def _build_analysis_prompt(
        self,
        user_menu: Dict,
        competitor_menus: List[Dict],
        restaurant_name: str
    ) -> str:
        """Build analysis prompt with menu data"""
        
        # Load prompt template
        prompt_path = "prompts/menu_comparison_analysis_prompt.md"
        try:
            with open(prompt_path, 'r', encoding='utf-8') as f:
                template = f.read()
            
            # Format menu data
            user_menu_text = self._format_menu_for_prompt(user_menu, "YOUR MENU")
            competitor_text = ""
            for i, comp_menu in enumerate(competitor_menus, 1):
                comp_name = comp_menu.get('competitor_name', f'Competitor {i}')
                competitor_text += self._format_menu_for_prompt(comp_menu, f"COMPETITOR {i}: {comp_name}")
                competitor_text += "\n\n"
            
            # Replace placeholders
            prompt = template.replace("{restaurant_name}", restaurant_name)
            prompt = prompt.replace("{user_menu}", user_menu_text)
            prompt = prompt.replace("{competitor_menus}", competitor_text)
            
            logger.info(f"📄 Built analysis prompt: {len(prompt)} chars")
            return prompt
            
        except FileNotFoundError:
            logger.warning(f"⚠️  Prompt file not found, using fallback")
            return self._get_fallback_prompt(user_menu, competitor_menus, restaurant_name)
    
    def _format_menu_for_prompt(self, menu: Dict, title: str) -> str:
        """Format menu data for prompt"""
        lines = [f"## {title}", ""]
        
        # Handle two possible structures:
        # 1. User menu: {"menu": {...}, "categories": [...]}
        # 2. Competitor menu: {"items": [...]}
        
        categories = menu.get('categories', [])
        items = menu.get('items', [])
        
        if categories:
            # User menu format - already organized by category
            for category in categories:
                category_name = category.get('name', 'Other')
                cat_items = category.get('items', [])
                
                if not cat_items:
                    continue
                    
                lines.append(f"### {category_name}")
                for item in cat_items:
                    name = item.get('name', item.get('item_name', 'Unknown'))
                    prices = item.get('prices', [])
                    
                    if prices:
                        price_str = ", ".join([
                            f"{p.get('size', 'Regular')}: ${p.get('price', 0):.2f}"
                            for p in prices
                        ])
                        lines.append(f"- {name}: {price_str}")
                    else:
                        lines.append(f"- {name}: Price not available")
                lines.append("")
        elif items:
            # Competitor menu format - flat list, group by category
            by_category = {}
            for item in items:
                category = item.get('category', 'Other')
                if category not in by_category:
                    by_category[category] = []
                by_category[category].append(item)
            
            for category, cat_items in by_category.items():
                lines.append(f"### {category}")
                for item in cat_items:
                    name = item.get('item_name', item.get('name', 'Unknown'))
                    prices = item.get('prices', [])
                    
                    if prices:
                        price_str = ", ".join([
                            f"{p.get('size', 'Regular')}: ${p.get('price', 0):.2f}"
                            for p in prices
                        ])
                        lines.append(f"- {name}: {price_str}")
                    else:
                        lines.append(f"- {name}: Price not available")
                lines.append("")
        else:
            return f"{title}: No items found"
        
        return "\n".join(lines)
    
    def _get_fallback_prompt(
        self,
        user_menu: Dict,
        competitor_menus: List[Dict],
        restaurant_name: str
    ) -> str:
        """Fallback prompt if file not found"""
        user_text = self._format_menu_for_prompt(user_menu, "YOUR MENU")
        comp_text = ""
        for i, comp in enumerate(competitor_menus, 1):
            comp_text += self._format_menu_for_prompt(comp, f"COMPETITOR {i}")
        
        return f"""Analyze pricing for {restaurant_name} vs competitors.

{user_text}

{comp_text}

Identify:
1. Pricing gaps (items priced significantly different)
2. Missing items (competitors have but you don't)
3. Opportunities (items you could add or reprice)

Return JSON:
{{
  "insights": [
    {{
      "insight_type": "pricing_gap|missing_item|opportunity",
      "title": "Brief title",
      "description": "Detailed explanation",
      "user_item_name": "Your item name or null",
      "user_item_price": price or null,
      "competitor_item_name": "Their item name or null",
      "competitor_item_price": price or null,
      "competitor_business_name": "Which competitor",
      "price_difference": difference in dollars or null,
      "price_difference_percent": percentage or null,
      "confidence": "high|medium|low",
      "priority": 0-100
    }}
  ]
}}"""
    
    def _parse_insights(self, response_text: str) -> List[Dict]:
        """Parse LLM response into insights"""
        import json
        
        # Remove markdown code blocks
        response_text = response_text.strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        
        response_text = response_text.strip()
        
        # Parse JSON
        try:
            data = json.loads(response_text)
            insights = data.get("insights", [])
            
            # Validate and clean insights
            cleaned_insights = []
            for insight in insights:
                if insight.get("title") and insight.get("description"):
                    cleaned_insights.append(insight)
            
            return cleaned_insights
            
        except json.JSONDecodeError as e:
            logger.error(f"❌ JSON parsing failed: {e}")
            logger.error(f"Response: {response_text[:500]}...")
            return []
