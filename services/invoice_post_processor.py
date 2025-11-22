"""
Invoice Post-Processor
Auto-corrects common Gemini parsing errors using invoice math as ground truth
Pattern: Validates and corrects after AI parsing, before user review
"""
import re
from typing import Dict, List, Tuple
from decimal import Decimal


class InvoicePostProcessor:
    def __init__(self):
        self.tolerance = Decimal('0.01')  # 1 cent tolerance
        
        # Category normalization mapping
        self.category_mapping = {
            'dry': 'DRY',
            'dry_goods': 'DRY',
            'dry goods': 'DRY',
            'refrigerated': 'REFRIGERATED',
            'refrigerated_goods': 'REFRIGERATED',
            'refrigerated goods': 'REFRIGERATED',
            'frozen': 'FROZEN',
            'frozen_goods': 'FROZEN',
            'frozen goods': 'FROZEN',
            'DRY': 'DRY',
            'REFRIGERATED': 'REFRIGERATED',
            'FROZEN': 'FROZEN'
        }
    
    def _validate_pack_size_conversion(self, pack_size: str) -> Dict:
        """
        Validate if pack size can be converted to quantity
        Returns: {valid: bool, reason: str, suggested_fix: str}
        """
        if not pack_size or pack_size.strip() == '':
            return {"valid": True, "reason": None, "suggested_fix": None}
        
        normalized = pack_size.strip().upper()
        if normalized in {'CATCH WEIGHT', 'VARIABLE'}:
            return {"valid": True, "reason": None, "suggested_fix": None}
        
        # Try to convert and see if it results in zero
        try:
            from services.unit_converter import UnitConverter
            converter = UnitConverter()
            quantity, unit = converter.calculate_total_quantity(pack_size, 1)
            
            if quantity == 0 or quantity is None:
                return {
                    "valid": False,
                    "reason": "Pack size converts to zero quantity",
                    "suggested_fix": "Verify pack size format (e.g., '12 6 OZ' not '12 0 OZ')"
                }
            
            return {"valid": True, "reason": None, "suggested_fix": None}
            
        except Exception as e:
            return {
                "valid": False,
                "reason": f"Cannot parse pack size: {str(e)}",
                "suggested_fix": "Enter pack size manually or leave blank"
            }
    
    def post_process(self, raw_invoice: Dict) -> Dict:
        """
        Main pipeline: validate and auto-correct parsed invoice
        
        Returns invoice with corrections and metadata
        """
        invoice = raw_invoice.copy()
        corrections_made = []
        items_with_issues = []
        
        # Process each line item
        for i, item in enumerate(invoice['line_items']):
            original_item = item.copy()
            
            # Step 1: Correct pack size formatting and enhance with known patterns
            item['pack_size'] = self.correct_pack_size(
                item.get('pack_size', ''),
                item.get('description', '')
            )
            
            item = self.enhance_pack_size(item)
            
            # Step 2: Detect special pricing types
            item = self.detect_weight_based_pricing(item)
            
            # Step 3: Normalize price decimals
            item = self.normalize_prices(item)
            
            # Step 4: Normalize category
            item['category'] = self.normalize_category(item.get('category', 'DRY'))
            
            # Step 5: Validate pack size conversion
            pack_size_validation = self._validate_pack_size_conversion(item.get('pack_size', ''))
            if not pack_size_validation['valid']:
                items_with_issues.append({
                    "line": i + 1,
                    "item_number": item.get('item_number', ''),
                    "description": item['description'],
                    "issue_type": "pack_size_invalid",
                    "reason": pack_size_validation['reason'],
                    "suggested_fix": pack_size_validation['suggested_fix'],
                    "pack_size": item.get('pack_size', '')
                })
                item['needs_review'] = True
                item['review_reason'] = pack_size_validation['reason']
                item['suggested_fix'] = pack_size_validation['suggested_fix']
            
            # Step 6: Validate and correct math (skip if weight-based)
            if not item.get('skip_qty_validation'):
                item = self.validate_and_correct_line_item(item)
            
            # Step 7: Track what changed
            changes = self.get_changed_fields(original_item, item)
            if changes:
                corrections_made.append({
                    'line': i + 1,
                    'item_number': item.get('item_number', 'N/A'),
                    'description': item.get('description', '')[:50],
                    'changes': changes,
                    'confidence': item.get('confidence', 'high')
                })
            
            invoice['line_items'][i] = item
        
        # Validate invoice totals
        calculated_subtotal = sum(
            Decimal(str(item['extended_price']))
            for item in invoice['line_items']
        )
        
        stated_subtotal = Decimal(str(invoice.get('subtotal', 0)))
        subtotal_diff = abs(calculated_subtotal - stated_subtotal)
        
        validation_warnings = []
        if subtotal_diff > Decimal('0.10'):
            validation_warnings.append({
                'type': 'subtotal_mismatch',
                'calculated': float(calculated_subtotal),
                'stated': float(stated_subtotal),
                'difference': float(subtotal_diff)
            })
        
        # Add post-processing metadata
        items_needing_review = len([
            i for i in invoice['line_items']
            if i.get('validation_status') == 'needs_review'
        ])
        
        invoice['post_processing'] = {
            'corrections_made': len(corrections_made),
            'items_needing_review': items_needing_review,
            'items_with_issues': items_with_issues,
            'confidence': self.calculate_overall_confidence(invoice['line_items']),
            'details': corrections_made,
            'validation_warnings': validation_warnings
        }
        
        return invoice
    
    def validate_and_correct_line_item(self, item: Dict) -> Dict:
        """
        Validate math and auto-correct if possible
        Uses extended_price as ground truth (ALWAYS CORRECT)
        
        Formula: quantity = extended_price ÷ unit_price
        """
        qty = Decimal(str(item.get('quantity', 0)))
        unit_price = Decimal(str(item.get('unit_price', 0)))
        extended = Decimal(str(item.get('extended_price', 0)))
        
        # SPECIAL CASE: Both quantity and extended are 0 but unit_price exists
        # This indicates OCR failure - default to safe values and flag for review
        if qty == 0 and extended == 0 and unit_price > 0:
            item['quantity'] = 1.0
            item['extended_price'] = float(unit_price)
            item['validation_status'] = 'needs_review'
            item['validation_issue'] = 'OCR failed to read quantity/extended - defaulted to qty=1'
            item['confidence'] = 'low'
            item['needs_review'] = True
            item['review_reason'] = 'Missing quantity and extended price. Defaulted to qty=1, extended=$' + f'{float(unit_price):.2f}' + '. Please verify actual values.'
            item['correction_note'] = 'Auto-filled: qty=1, extended=unit_price (OCR error)'
            return item
        
        # PRIORITY 1: If quantity is 0, ALWAYS calculate from extended/unit
        # This is the most common LLM error
        if qty == 0 and unit_price > 0:
            correct_qty = extended / unit_price
            if self.is_reasonable_quantity(float(correct_qty)):
                item['original_quantity'] = float(qty)
                item['quantity'] = float(correct_qty)
                item['validation_status'] = 'auto_corrected'
                item['correction_note'] = f'Qty calculated: ${float(extended)} ÷ ${float(unit_price)} = {float(correct_qty):.2f}'
                item['correction_reason'] = 'Quantity was 0, calculated from extended/unit'
                item['confidence'] = 'high'
                return item
        
        # Calculate what extended SHOULD be with current values
        calculated_extended = qty * unit_price
        
        # Check if math is correct (within tolerance)
        if abs(calculated_extended - extended) <= self.tolerance:
            item['validation_status'] = 'passed'
            item['confidence'] = 'high'
            return item
        
        # PRIORITY 2: Math doesn't match - recalculate quantity from extended/unit
        # Extended price is ALWAYS the ground truth (it's printed on invoice)
        if unit_price > 0:
            correct_qty = extended / unit_price
            if self.is_reasonable_quantity(float(correct_qty)):
                item['original_quantity'] = float(qty)
                item['quantity'] = float(correct_qty)
                item['validation_status'] = 'auto_corrected'
                item['correction_note'] = f'Qty recalculated: ${float(extended)} ÷ ${float(unit_price)} = {float(correct_qty):.2f} (was {float(qty)})'
                item['correction_reason'] = 'Math validation: extended ÷ unit'
                item['confidence'] = 'high'
                return item
        
        # Strategy 2: Correct unit price (less common)
        if qty > 0:
            correct_unit_price = extended / qty
            if self.is_reasonable_price(float(correct_unit_price)):
                item['original_unit_price'] = float(unit_price)
                item['unit_price'] = float(correct_unit_price)
                item['validation_status'] = 'auto_corrected'
                item['correction_note'] = f'Unit price corrected to ${float(correct_unit_price):.2f}'
                item['correction_reason'] = 'Extended price validation'
                item['confidence'] = 'medium'
                return item
        
        # Can't auto-correct - flag for user review
        item['validation_status'] = 'needs_review'
        item['validation_issue'] = f'Math error: {float(qty)} × ${float(unit_price)} ≠ ${float(extended)}'
        item['confidence'] = 'low'
        return item
    
    def detect_weight_based_pricing(self, item: Dict) -> Dict:
        """
        Detect weight-based pricing (per-pound items)
        These have different math: qty × unit_price × actual_weight = extended
        """
        if item.get('pricing_type') == 'weight_based':
            return item
        
        pack = item.get('pack_size') or ''
        desc = item.get('description') or ''
        
        # Indicators of weight-based pricing
        weight_indicators = [
            'LB LB' in pack.upper(),
            'CATCH WEIGHT' in desc.upper(),
            'CRYO' in desc.upper(),
            'Tot Wgt:' in desc,
            '/LB' in pack.upper()
        ]
        
        if any(weight_indicators):
            item['pricing_type'] = 'weight_based'
            item['skip_qty_validation'] = True
            
            # Try to extract actual weight
            weight_match = re.search(r'Tot Wgt:\s*([\d.]+)', desc)
            if weight_match:
                actual_weight = float(weight_match.group(1))
                item['actual_weight'] = actual_weight
                
                # Calculate true per-pound price
                extended = float(item.get('extended_price', 0))
                if actual_weight > 0:
                    item['true_unit_price'] = extended / actual_weight
                
                # Update quantity to reflect actual weight
                item['original_quantity'] = item.get('quantity')
                item['quantity'] = actual_weight
                item['validation_status'] = 'auto_corrected'
                item['correction_note'] = f'Weight-based pricing: {actual_weight} LBS @ ${item["true_unit_price"]:.2f}/LB'
                item['confidence'] = 'high'
        
        return item
    
    def normalize_prices(self, item: Dict) -> Dict:
        """
        Normalize price decimal places
        Unit prices: 2-4 decimals, Extended: always 2
        """
        # Extended price should always be 2 decimals
        extended = item.get('extended_price', 0)
        item['extended_price'] = round(float(extended), 2)
        
        # Unit price typically 2-4 decimals
        unit = item.get('unit_price', 0)
        item['unit_price'] = round(float(unit), 4)
        
        return item
    
    def enhance_pack_size(self, item: Dict) -> Dict:
        """
        Normalize common commercial foodservice pack size patterns
        and backfill pack size from description when missing.
        """
        pack = (item.get('pack_size') or '').strip()
        description = item.get('description') or ''
        
        if pack and 'original_pack_size' not in item:
            item['original_pack_size'] = pack
        
        combined_text = f"{pack} {description}".upper()
        
        # Catch weight indicators override pack handling
        if re.search(r'\b(CATCH\s*WT|CWT|RANDOM\s*WEIGHT)\b', combined_text):
            item['pack_size'] = 'CATCH WEIGHT'
            item['pricing_type'] = 'weight_based'
            item['skip_qty_validation'] = True
            item.setdefault('correction_reason', 'catch_weight_detected')
            return item
        
        normalized = self._normalize_pack_string(pack.upper())
        
        if not normalized:
            extracted = self._extract_pack_from_description(description)
            if extracted:
                normalized = extracted
        
        if normalized:
            item['pack_size'] = normalized
        
        return item
    
    def _normalize_pack_string(self, pack: str) -> str:
        """Apply hard-coded normalization rules for pack formats."""
        if not pack:
            return ''
        
        text = pack.replace('-', ' ')
        text = re.sub(r'[,;]', ' ', text)
        
        # Normalize special #10 can patterns and variations
        text = re.sub(r'\b(\d+)\s*/\s*#\s*(\d+)\b', r'\1 \2', text, flags=re.IGNORECASE)
        text = re.sub(r'\b(\d+)\s*/\s*(\d+)#\b', r'\1 \2', text, flags=re.IGNORECASE)
        text = re.sub(r'\b(\d+)\s*#\s*(\d+)\s*(?:CAN|CANS|TIN|TINS)?\b', r'\1 \2', text, flags=re.IGNORECASE)
        
        # Reverse format like 10#/4 → 10 4 LB
        def reverse_hash_repl(match: re.Match) -> str:
            count = match.group(1)
            size = match.group(2)
            return f"{count} {size} LB"
        
        text = re.sub(r'\b(\d+)#\s*/\s*(\d+(?:\.\d+)?)\b', reverse_hash_repl, text, flags=re.IGNORECASE)
        
        # Slash notation with optional unit (4/5 LB, 2/10 LB AVG)
        def slash_repl(match: re.Match) -> str:
            count = match.group(1)
            size = match.group(2)
            unit = self._normalize_unit_token(match.group(3))
            if not unit and count == '1' and size == '1':
                return '1 EA'
            return f"{count} {size} {unit}".strip()
        
        text = re.sub(
            r'\b(\d+)\s*/\s*(\d+(?:\.\d+)?)(?:\s*(LB|LBS|#|OZ|OZS|KG|G|GAL|GA|QT|PT|CT|PK|EA|EACH|DZ|PKG))?\b',
            slash_repl,
            text,
            flags=re.IGNORECASE
        )
        
        # Remove packaging descriptors without losing units
        text = re.sub(r'\b(AVG|AV|IW|I/W|I\.W\.|I\.W|NET WT|NETWT|NET)\b', '', text, flags=re.IGNORECASE)
        text = re.sub(r'\b(BAG|BAGS|TUB|TUBS|CARTON|CARTONS|TRAY|TRAYS|BOX|BOXES|BTL|BTLS|BOTTLE|BOTTLES)\b', '', text, flags=re.IGNORECASE)
        
        # Normalize EA/EACH cases
        if re.fullmatch(r'\s*(EACH|EA)\s*', text, flags=re.IGNORECASE):
            return '1 EA'
        
        text = re.sub(r'\bEACH\b', 'EA', text, flags=re.IGNORECASE)
        
        # Collapse whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        if not text:
            return ''
        
        # Remove trailing CASE/CS unless it's the only token
        tokens = text.split()
        if len(tokens) > 2 and tokens[-1] in {'CS', 'CASE'}:
            tokens = tokens[:-1]
        text = ' '.join(tokens)
        
        # Normalize tokens again after trimming
        text = re.sub(r'\s+', ' ', text).strip()
        
        if text.upper() in {'1/1', '1 1'}:
            return '1 EA'
        
        if text.upper() in {'CS', 'CASE'}:
            return '1 CS'
        
        return text.upper()
    
    def _normalize_unit_token(self, token: str) -> str:
        """Normalize unit tokens to canonical forms."""
        if not token:
            return ''
        
        unit = token.upper()
        mapping = {
            '#': 'LB',
            'LBS': 'LB',
            'POUND': 'LB',
            'POUNDS': 'LB',
            'OZS': 'OZ',
            'OUNCE': 'OZ',
            'OUNCES': 'OZ',
            'CTS': 'CT',
            'CTN': 'CT',
            'PKG': 'PK',
            'PKGS': 'PK',
            'PACK': 'PK',
            'EACH': 'EA',
            'GA': 'GAL'
        }
        return mapping.get(unit, unit)
    
    def _extract_pack_from_description(self, description: str) -> str:
        """Pull pack size clues out of the description when missing."""
        if not description:
            return ''
        
        text = description.upper()
        
        net_match = re.search(r'NET\s*WT\.?\s*(\d+(?:\.\d+)?)\s*(LB|LBS|#|OZ|OZS|KG|G|GAL|GA|QT|PT)', text)
        if net_match:
            unit = self._normalize_unit_token(net_match.group(2))
            return f"{net_match.group(1)} {unit}"
        
        # General weight/volume capture, skipping drained weight references
        for match in re.finditer(r'(\d+(?:\.\d+)?)\s*(LB|LBS|#|OZ|OZS|KG|G|GAL|GA|QT|PT)\b', text):
            context = text[max(0, match.start() - 12):match.start()]
            if re.search(r'\bDR(?:AINED)?\s*WT\b', context):
                continue
            unit = self._normalize_unit_token(match.group(2))
            return f"{match.group(1)} {unit}"
        
        ct_match = re.search(r'(\d+)\s*CT\b', text)
        if ct_match:
            return f"{ct_match.group(1)} CT"
        
        return ''
    
    def normalize_category(self, category: str) -> str:
        """
        Normalize category to valid database values
        Maps various LLM outputs to: DRY, REFRIGERATED, FROZEN
        """
        if not category:
            return 'DRY'  # Default
        
        # Normalize to lowercase for lookup
        category_lower = category.lower().strip()
        
        # Try direct mapping
        if category_lower in self.category_mapping:
            return self.category_mapping[category_lower]
        
        # Fallback: try to match keywords
        if 'refrig' in category_lower or 'cold' in category_lower:
            return 'REFRIGERATED'
        elif 'froz' in category_lower or 'ice' in category_lower:
            return 'FROZEN'
        else:
            return 'DRY'  # Default fallback
    
    def correct_pack_size(self, pack_size: str, description: str) -> str:
        """
        Correct common pack size OCR errors
        Examples: "6/10 OZ" → "6 10 OZ", "12x2LB" → "12 2 LB"
        """
        if not pack_size:
            return pack_size
        
        # Pattern 1: Slash notation (6/10 → 6 10)
        pack_size = re.sub(r'(\d+)/(\d+)', r'\1 \2', pack_size)
        
        # Pattern 2: X notation (12x2 → 12 2)
        pack_size = re.sub(r'(\d+)[xX×](\d+)', r'\1 \2', pack_size)
        
        # Pattern 3: Remove extra spaces
        pack_size = ' '.join(pack_size.split())
        
        return pack_size
    
    def is_reasonable_quantity(self, qty: float) -> bool:
        """Check if quantity is reasonable (not negative, not huge)"""
        return 0 < qty <= 10000
    
    def is_reasonable_price(self, price: float) -> bool:
        """Check if price is reasonable (not negative, not absurd)"""
        return 0 < price <= 100000
    
    def get_changed_fields(self, original: Dict, updated: Dict) -> List[Dict]:
        """Track what fields changed"""
        changes = []
        
        fields_to_check = ['quantity', 'unit_price', 'pack_size', 'description']
        
        for field in fields_to_check:
            orig_val = original.get(field)
            new_val = updated.get(field)
            
            if orig_val != new_val and new_val is not None:
                changes.append({
                    'field': field,
                    'original': orig_val,
                    'corrected': new_val,
                    'reason': updated.get('correction_reason', 'Auto-correction')
                })
        
        return changes
    
    def calculate_item_confidence(self, item: Dict) -> str:
        """
        Calculate confidence score for an item
        Returns: 'high' | 'medium' | 'low'
        """
        score = 100
        
        # Deductions
        if item.get('validation_status') == 'auto_corrected':
            score -= 10
        
        if item.get('validation_status') == 'needs_review':
            score -= 40
        
        if item.get('pricing_type') == 'weight_based':
            score -= 5
        
        if not item.get('item_number'):
            score -= 15
        
        # Check if math still doesn't work
        qty = Decimal(str(item.get('quantity', 0)))
        unit = Decimal(str(item.get('unit_price', 0)))
        extended = Decimal(str(item.get('extended_price', 0)))
        
        if not item.get('skip_qty_validation'):
            if abs(qty * unit - extended) > self.tolerance:
                score -= 20
        
        pack_size = (item.get('pack_size') or '').upper()
        if 'CATCH WEIGHT' in pack_size:
            score -= 15
        if '/' in (item.get('original_pack_size') or item.get('pack_size') or ''):
            score -= 10
        quantity = item.get('quantity') or 0
        if 'EA' in pack_size and quantity and quantity > 20:
            score -= 20
        
        # Return confidence level
        if score >= 90:
            return 'high'
        if score >= 70:
            return 'medium'
        return 'low'
    
    def calculate_overall_confidence(self, items: List[Dict]) -> str:
        """Calculate overall confidence for all items"""
        if not items:
            return 'low'
        
        confidences = [self.calculate_item_confidence(item) for item in items]
        
        # Count confidence levels
        high_count = confidences.count('high')
        low_count = confidences.count('low')
        
        # Overall confidence
        if low_count > len(items) * 0.2:  # More than 20% low confidence
            return 'low'
        if high_count >= len(items) * 0.8:  # 80%+ high confidence
            return 'high'
        return 'medium'
