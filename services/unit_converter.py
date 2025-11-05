"""
Unit Converter Service
Handles pack size parsing and unit conversions
Pattern: Follows services/inventory_service.py structure
"""
import re
from typing import Dict, Optional, Tuple
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)


class UnitConverter:
    """Convert between units and parse pack sizes"""
    
    # ========================================================================
    # COMPREHENSIVE CONVERSION FACTORS
    # Priority: Weight > Volume > Count (as specified)
    # ========================================================================
    
    # WEIGHT CONVERSIONS (Base: oz for precision, convert to lb for display)
    # 1 lb = 16 oz (exact)
    WEIGHT_TO_OUNCES = {
        # Imperial Weight
        'oz': Decimal('1.0'),
        'ounce': Decimal('1.0'),
        'ounces': Decimal('1.0'),
        'lb': Decimal('16.0'),
        'lbs': Decimal('16.0'),
        'pound': Decimal('16.0'),
        'pounds': Decimal('16.0'),
        '#': Decimal('16.0'),  # Pound symbol
        
        # Metric Weight
        'g': Decimal('0.035274'),  # 1 g = 0.035274 oz
        'gram': Decimal('0.035274'),
        'grams': Decimal('0.035274'),
        'kg': Decimal('35.274'),  # 1 kg = 35.274 oz
        'kilogram': Decimal('35.274'),
        'kilograms': Decimal('35.274')
    }
    
    # VOLUME CONVERSIONS (Base: fl oz for precision, convert to gal for display)
    # 1 gal = 128 fl oz (exact)
    VOLUME_TO_FLUID_OUNCES = {
        # Imperial Volume (Liquid)
        'fl oz': Decimal('1.0'),
        'floz': Decimal('1.0'),
        'fluid ounce': Decimal('1.0'),
        'fluid ounces': Decimal('1.0'),
        'cup': Decimal('8.0'),  # 1 cup = 8 fl oz
        'cups': Decimal('8.0'),
        'pt': Decimal('16.0'),  # 1 pint = 16 fl oz
        'pint': Decimal('16.0'),
        'pints': Decimal('16.0'),
        'qt': Decimal('32.0'),  # 1 quart = 32 fl oz
        'quart': Decimal('32.0'),
        'quarts': Decimal('32.0'),
        'gal': Decimal('128.0'),  # 1 gallon = 128 fl oz
        'ga': Decimal('128.0'),
        'gallon': Decimal('128.0'),
        'gallons': Decimal('128.0'),
        
        # Metric Volume
        'ml': Decimal('0.033814'),  # 1 mL = 0.033814 fl oz
        'milliliter': Decimal('0.033814'),
        'milliliters': Decimal('0.033814'),
        'l': Decimal('33.814'),  # 1 L = 33.814 fl oz
        'lt': Decimal('33.814'),
        'liter': Decimal('33.814'),
        'liters': Decimal('33.814'),
        
        # Cooking Measures
        'tbsp': Decimal('0.5'),  # 1 Tbsp = 0.5 fl oz
        'tablespoon': Decimal('0.5'),
        'tablespoons': Decimal('0.5'),
        'tsp': Decimal('0.166667'),  # 1 tsp = 1/6 fl oz
        'teaspoon': Decimal('0.166667'),
        'teaspoons': Decimal('0.166667')
    }
    
    # COUNT CONVERSIONS (Base: each)
    COUNT_TO_EACH = {
        'ea': Decimal('1.0'),
        'each': Decimal('1.0'),
        'pc': Decimal('1.0'),
        'pcs': Decimal('1.0'),
        'piece': Decimal('1.0'),
        'pieces': Decimal('1.0'),
        'ct': Decimal('1.0'),
        'count': Decimal('1.0'),
        'dz': Decimal('12.0'),  # 1 dozen = 12 each
        'dozen': Decimal('12.0'),
        'gross': Decimal('144.0'),  # 1 gross = 144 each
        'cs': Decimal('1.0'),  # Case - treat as 1 unit (will parse count from pack size)
        'case': Decimal('1.0'),
        'box': Decimal('1.0'),
        'pack': Decimal('1.0'),
        'pkg': Decimal('1.0'),
        'package': Decimal('1.0')
    }
    
    # LEGACY: Keep for backward compatibility
    WEIGHT_TO_POUNDS = {k: v / Decimal('16.0') for k, v in WEIGHT_TO_OUNCES.items()}
    VOLUME_TO_GALLONS = {k: v / Decimal('128.0') for k, v in VOLUME_TO_FLUID_OUNCES.items()}
    
    # ========================================================================
    # PACK SIZE PATTERNS (Strict Hierarchy - Order Matters!)
    # Priority: Explicit multiply > Slash > Space-separated > Can size > Count > Simple
    # ========================================================================
    PACK_PATTERNS = [
        # PRIORITY 1: Explicit multiply with "x" or "×"
        # "12 x 2 lb", "12x2lb", "24×8oz"
        (r'(\d+)\s*[xX×]\s*(\d+(?:\.\d+)?)\s*(lb|lbs|oz|#|kg|g|ga|gal|qt|pt|l|lt|fl\s*oz|floz|cup)', 'multiply'),
        
        # PRIORITY 2: Slash notation (common in food service)
        # "6/10 oz", "24/12 oz", "4/5 lb"
        (r'(\d+)\s*/\s*(\d+(?:\.\d+)?)\s*(lb|lbs|oz|#|kg|g|ga|gal|qt|pt|l|lt|fl\s*oz|floz|cup)', 'multiply'),
        
        # PRIORITY 3: Space-separated multiply (invoice format)
        # "2 5 LB", "60 4 OZ", "24 8 OZ"
        # Must have 2+ spaces or be at word boundary to avoid matching "10 lb"
        (r'(\d+)\s{2,}(\d+(?:\.\d+)?)\s*(lb|lbs|oz|#|kg|g|ga|gal|qt|pt|l|lt|fl\s*oz|floz|cup)', 'multiply'),
        (r'(\d+)\s+(\d+(?:\.\d+)?)\s+(lb|lbs|oz|#|kg|g|ga|gal|qt|pt|l|lt|fl\s*oz|floz|cup)(?:\s|$)', 'multiply'),
        
        # PRIORITY 4: Can sizes (special case)
        # "6 #10", "12 #5"
        (r'(\d+)\s*#(\d+)', 'can_size'),
        
        # PRIORITY 5: Count-only (dozen, case, etc.)
        # "24 ct", "2 dz", "1 cs"
        (r'(\d+)\s*(ct|count|dz|dozen|cs|case|box|pack|pkg)', 'count'),
        
        # PRIORITY 6: Simple with unit
        # "10 lb", "5 gal", "24 ea"
        (r'(\d+(?:\.\d+)?)\s*(lb|lbs|oz|#|kg|g|ga|gal|qt|pt|l|lt|fl\s*oz|floz|cup|ea|each|pc|pcs)', 'simple'),
    ]
    
    def parse_pack_size(self, pack_size: str) -> Optional[Dict]:
        """
        Parse pack size string into components
        
        Examples:
            "12 x 2 lb" → {count: 12, size: 2, unit: 'lb', type: 'multiply'}
            "6/10 oz" → {count: 6, size: 10, unit: 'oz', type: 'multiply'}
            "10 lb" → {count: 1, size: 10, unit: 'lb', type: 'simple'}
            "24 ct" → {count: 24, size: 1, unit: 'ea', type: 'count'}
        
        Returns:
            Dict with count, size, unit, type or None if can't parse
        """
        if not pack_size:
            return None
        
        pack_size = pack_size.lower().strip()
        
        for pattern, pattern_type in self.PACK_PATTERNS:
            match = re.search(pattern, pack_size, re.IGNORECASE)
            if match:
                if pattern_type == 'multiply':
                    return {
                        'count': int(match.group(1)),
                        'size': Decimal(match.group(2)),
                        'unit': match.group(3).lower(),
                        'type': 'multiply'
                    }
                elif pattern_type == 'can_size':
                    # Standard can sizes in ounces (usable product weight)
                    # #10 = 96 oz (6 lb), #5 = 56 oz (3.5 lb), #2 = 20 oz (1.25 lb)
                    can_sizes_oz = {'10': 96, '5': 56, '2': 20}
                    can_num = match.group(2)
                    weight_oz = can_sizes_oz.get(can_num, 96)  # Default to 96 oz
                    return {
                        'count': int(match.group(1)),
                        'size': Decimal(str(weight_oz)),  # Keep in oz for accurate conversion
                        'unit': 'oz',
                        'type': 'can_size'
                    }
                elif pattern_type == 'simple':
                    return {
                        'count': 1,
                        'size': Decimal(match.group(1)),
                        'unit': match.group(2).lower(),
                        'type': 'simple'
                    }
                elif pattern_type == 'count':
                    return {
                        'count': int(match.group(1)),
                        'size': Decimal('1.0'),
                        'unit': 'ea',
                        'type': 'count'
                    }
        
        logger.warning(f"Could not parse pack size: {pack_size}")
        return None
    
    def convert_to_base_units(self, quantity: Decimal, unit: str) -> Tuple[Decimal, str]:
        """
        Convert quantity to base unit with strict hierarchy
        
        Args:
            quantity: Amount in original unit
            unit: Original unit (lb, oz, ga, etc.)
        
        Returns:
            Tuple of (converted_quantity, base_unit)
            
        Examples:
            (16, 'oz') → (16.0, 'oz') [base is oz for weight]
            (1, 'lb') → (16.0, 'oz') [converted to base oz]
            (2, 'qt') → (64.0, 'fl oz') [converted to base fl oz]
            (12, 'ea') → (12, 'ea')
            
        Priority: Weight > Volume > Count
        """
        unit = unit.lower().strip()
        
        # PRIORITY 1: Weight units (convert to oz as base)
        if unit in self.WEIGHT_TO_OUNCES:
            converted = quantity * self.WEIGHT_TO_OUNCES[unit]
            return (converted, 'oz')
        
        # PRIORITY 2: Volume units (convert to fl oz as base)
        if unit in self.VOLUME_TO_FLUID_OUNCES:
            converted = quantity * self.VOLUME_TO_FLUID_OUNCES[unit]
            return (converted, 'fl oz')
        
        # PRIORITY 3: Count units (convert to ea as base)
        if unit in self.COUNT_TO_EACH:
            converted = quantity * self.COUNT_TO_EACH[unit]
            return (converted, 'ea')
        
        # Unknown unit - return as-is with warning
        logger.warning(f"Unknown unit: {unit}, returning as-is")
        return (quantity, unit)
    
    def calculate_total_quantity(
        self,
        pack_size: Optional[str],
        quantity: int
    ) -> Tuple[Decimal, str]:
        """
        Calculate total quantity in base units
        
        Args:
            pack_size: Pack size string (e.g., "12 x 2 lb")
            quantity: Number of packs ordered
        
        Returns:
            Tuple of (total_quantity, base_unit)
            
        Examples:
            ("12 x 2 lb", 3) → (72.0, 'lb')  # 3 cases × 12 items × 2 lb
            ("6/10 oz", 2) → (7.5, 'lb')     # 2 cases × 6 items × 10 oz = 120 oz = 7.5 lb
            ("10 lb", 5) → (50.0, 'lb')      # 5 × 10 lb
        """
        # Parse pack size
        parsed = self.parse_pack_size(pack_size) if pack_size else None
        
        if not parsed:
            # No pack size - assume quantity is in "each"
            return (Decimal(str(quantity)), 'ea')
        
        # Calculate total in original units
        if parsed['type'] in ['multiply', 'can_size']:
            # count × size × quantity
            total_original = Decimal(str(parsed['count'])) * parsed['size'] * Decimal(str(quantity))
        elif parsed['type'] == 'count':
            # count × quantity (size is always 1 for count)
            total_original = Decimal(str(parsed['count'])) * Decimal(str(quantity))
        else:
            # size × quantity
            total_original = parsed['size'] * Decimal(str(quantity))
        
        # Convert to base units
        total_base, base_unit = self.convert_to_base_units(total_original, parsed['unit'])
        
        logger.info(
            f"Converted: {quantity} × {pack_size} = {total_base:.2f} {base_unit}"
        )
        
        return (total_base, base_unit)
    
    def get_unit_type(self, unit: str) -> str:
        """
        Determine unit type with strict hierarchy
        
        Args:
            unit: Unit string (lb, oz, gal, ea, etc.)
        
        Returns:
            'weight', 'volume', or 'count'
            
        Priority: Weight > Volume > Count
        """
        unit = unit.lower().strip()
        
        # PRIORITY 1: Weight (top priority as specified)
        if unit in self.WEIGHT_TO_OUNCES:
            return 'weight'
        
        # PRIORITY 2: Volume
        if unit in self.VOLUME_TO_FLUID_OUNCES:
            return 'volume'
        
        # PRIORITY 3: Count (fallback)
        if unit in self.COUNT_TO_EACH:
            return 'count'
        
        # Unknown - default to count for safety
        logger.warning(f"Unknown unit type for '{unit}', defaulting to count")
        return 'count'
    
    def get_base_unit_for_category(self, category: str) -> str:
        """
        Get appropriate base unit for category
        
        Args:
            category: Item category
        
        Returns:
            Base unit (lb, ga, or ea)
        """
        weight_categories = {
            'proteins', 'produce', 'dairy', 'frozen', 'dry_goods'
        }
        
        volume_categories = {
            'beverages', 'cleaning'
        }
        
        if category in weight_categories:
            return 'lb'
        elif category in volume_categories:
            return 'ga'
        else:
            return 'ea'
    
    def calculate_unit_cost_from_pack(
        self,
        pack_price: Decimal,
        pack_size: str
    ) -> Tuple[Optional[Decimal], Optional[str], Optional[Decimal], Optional[str]]:
        """
        Calculate unit cost from pack price and size
        Returns BOTH per-weight cost AND per-piece cost for multiply packs
        
        Args:
            pack_price: Total price for the pack ($75.16)
            pack_size: Pack size string ("60 4 oz", "40 lb", etc.)
        
        Returns:
            Tuple of (unit_cost_per_weight, weight_unit, unit_cost_per_piece, error_message)
            
        Examples:
            ($75.16, "60 4 oz") → ($0.31/oz, "oz", $1.25/ea, None)
            ($40.00, "40 lb") → ($1.00/lb, "lb", None, None)
            ($40.00, None) → (None, None, None, "Pack size not available")
        """
        if not pack_size:
            return (None, None, None, "Pack size not available")
        
        if pack_price <= 0:
            return (None, None, None, "Invalid pack price")
        
        # Parse pack size
        parsed = self.parse_pack_size(pack_size)
        if not parsed:
            return (None, None, None, f"Could not parse pack size: {pack_size}")
        
        # Calculate costs
        unit_cost_per_weight = None
        unit_cost_per_piece = None
        
        if parsed['type'] in ['multiply', 'can_size']:
            # Pack like "60 4 oz" means 60 pieces of 4 oz each
            count = Decimal(str(parsed['count']))
            size = parsed['size']
            
            # Cost per piece (for "ea" recipes)
            unit_cost_per_piece = pack_price / count
            
            # Cost per weight unit (for weight-based recipes)
            total_weight = count * size
            unit_cost_per_weight = pack_price / total_weight
            
            logger.info(
                f"Calculated: ${pack_price} ÷ {count} pieces = ${unit_cost_per_piece:.4f}/ea, "
                f"${pack_price} ÷ {total_weight} {parsed['unit']} = ${unit_cost_per_weight:.4f}/{parsed['unit']}"
            )
        else:
            # Simple pack like "40 lb" - only weight cost
            total_qty = Decimal(str(parsed['count'])) * parsed['size']
            unit_cost_per_weight = pack_price / total_qty
            
            logger.info(
                f"Calculated unit cost: ${pack_price} ÷ {total_qty} {parsed['unit']} = ${unit_cost_per_weight:.4f}/{parsed['unit']}"
            )
        
        return (unit_cost_per_weight, parsed['unit'], unit_cost_per_piece, None)
    
    def validate_unit_compatibility(
        self,
        recipe_unit: str,
        pack_unit: str
    ) -> Tuple[bool, Optional[str]]:
        """
        Check if recipe unit can be converted to pack unit
        
        Args:
            recipe_unit: Unit from recipe (oz, lb, ea, etc.)
            pack_unit: Unit from pack (lb, ga, ea, etc.)
        
        Returns:
            Tuple of (is_compatible, error_message)
            
        Examples:
            ("oz", "lb") → (True, None)
            ("ea", "lb") → (False, "Cannot convert 'ea' to 'lb'")
        """
        recipe_unit = recipe_unit.lower().strip()
        pack_unit = pack_unit.lower().strip()
        
        # Same unit is always compatible
        if recipe_unit == pack_unit:
            return (True, None)
        
        # Check if both are weight units
        if recipe_unit in self.WEIGHT_TO_POUNDS and pack_unit in self.WEIGHT_TO_POUNDS:
            return (True, None)
        
        # Check if both are volume units
        if recipe_unit in self.VOLUME_TO_GALLONS and pack_unit in self.VOLUME_TO_GALLONS:
            return (True, None)
        
        # Check if both are count units
        if recipe_unit in self.COUNT_TO_EACH and pack_unit in self.COUNT_TO_EACH:
            return (True, None)
        
        # Incompatible units
        error_msg = f"Cannot convert '{recipe_unit}' to '{pack_unit}' - incompatible unit types"
        return (False, error_msg)
    
    def convert_recipe_to_pack_unit(
        self,
        recipe_quantity: Decimal,
        recipe_unit: str,
        pack_unit: str
    ) -> Tuple[Optional[Decimal], Optional[str]]:
        """
        Convert recipe quantity to pack unit
        
        Args:
            recipe_quantity: Amount in recipe (4.0)
            recipe_unit: Recipe unit (oz)
            pack_unit: Pack unit (lb)
        
        Returns:
            Tuple of (converted_quantity, error_message)
            
        Examples:
            (4.0, "oz", "lb") → (0.25, None)
            (4.0, "ea", "lb") → (None, "Cannot convert 'ea' to 'lb'")
        """
        # Validate compatibility
        is_compatible, error_msg = self.validate_unit_compatibility(recipe_unit, pack_unit)
        if not is_compatible:
            return (None, error_msg)
        
        # Convert recipe to base unit
        recipe_base_qty, recipe_base_unit = self.convert_to_base_units(recipe_quantity, recipe_unit)
        
        # Convert pack to base unit to get conversion factor
        pack_base_qty, pack_base_unit = self.convert_to_base_units(Decimal('1.0'), pack_unit)
        
        # Verify they converted to same base unit
        if recipe_base_unit != pack_base_unit:
            return (None, f"Unit conversion mismatch: {recipe_base_unit} vs {pack_base_unit}")
        
        # Convert from recipe base to pack unit
        # recipe_base_qty is in base units, we need it in pack units
        # pack_base_qty tells us how many base units = 1 pack unit
        converted_qty = recipe_base_qty / pack_base_qty
        
        logger.info(
            f"Converted: {recipe_quantity} {recipe_unit} → {converted_qty:.4f} {pack_unit}"
        )
        
        return (converted_qty, None)
