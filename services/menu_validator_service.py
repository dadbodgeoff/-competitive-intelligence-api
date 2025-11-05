"""
Menu Validator Service
Validates menu data structure and content
Pattern: Follows services/invoice_validator_service.py
"""
import logging
from typing import Dict, List

logger = logging.getLogger(__name__)


class MenuValidatorService:
    """Validate menu data before saving"""
    
    def validate_menu(self, menu_data: Dict) -> Dict:
        """
        Validate menu data structure and content
        
        Args:
            menu_data: Parsed menu data from Gemini
            
        Returns:
            {
                "valid": bool,
                "errors": [str],
                "warnings": [str],
                "items_validated": int
            }
        """
        errors = []
        warnings = []
        
        # Check required fields
        if not menu_data:
            errors.append("Menu data is empty")
            return {
                "valid": False,
                "errors": errors,
                "warnings": warnings,
                "items_validated": 0
            }
        
        # Validate restaurant name
        restaurant_name = menu_data.get("restaurant_name")
        if not restaurant_name or restaurant_name.strip() == "":
            warnings.append("Restaurant name is missing or empty")
        
        # Validate menu items
        menu_items = menu_data.get("menu_items", [])
        if not menu_items:
            errors.append("No menu items found")
            return {
                "valid": False,
                "errors": errors,
                "warnings": warnings,
                "items_validated": 0
            }
        
        # Validate each item
        items_validated = 0
        for idx, item in enumerate(menu_items):
            item_errors = self._validate_item(item, idx)
            errors.extend(item_errors)
            
            if not item_errors:
                items_validated += 1
        
        # Check if we have at least some valid items
        if items_validated == 0:
            errors.append("No valid menu items found")
        
        # Determine overall validity
        valid = len(errors) == 0 and items_validated > 0
        
        return {
            "valid": valid,
            "errors": errors,
            "warnings": warnings,
            "items_validated": items_validated
        }
    
    def _validate_item(self, item: Dict, index: int) -> List[str]:
        """Validate individual menu item"""
        errors = []
        
        # Check required fields
        if not item.get("category"):
            errors.append(f"Item {index + 1}: Missing category")
        
        if not item.get("item_name"):
            errors.append(f"Item {index + 1}: Missing item name")
        
        # Validate prices
        prices = item.get("prices", [])
        if not prices:
            # Items without prices are allowed (e.g., "Market Price")
            pass
        else:
            for price_idx, price in enumerate(prices):
                if not isinstance(price, dict):
                    errors.append(f"Item {index + 1}, Price {price_idx + 1}: Invalid price format")
                    continue
                
                price_value = price.get("price")
                if price_value is None:
                    errors.append(f"Item {index + 1}, Price {price_idx + 1}: Missing price value")
                elif not isinstance(price_value, (int, float)):
                    errors.append(f"Item {index + 1}, Price {price_idx + 1}: Price must be a number")
                elif price_value < 0:
                    errors.append(f"Item {index + 1}, Price {price_idx + 1}: Price cannot be negative")
        
        return errors
