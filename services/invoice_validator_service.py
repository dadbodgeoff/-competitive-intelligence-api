"""
Invoice Validator Service
Validates parsed invoice data for accuracy and completeness
Pattern: Follows existing validation patterns
"""
from typing import Dict, List
from decimal import Decimal


class InvoiceValidatorService:
    def __init__(self):
        self.tolerance = Decimal('0.02')  # $0.02 tolerance for rounding
    
    def validate_invoice(self, invoice_data: Dict) -> Dict:
        """
        Validate parsed invoice data
        
        Returns:
            Dict with validation results and warnings
        """
        warnings = []
        errors = []
        
        # Check required fields
        required_fields = ['invoice_number', 'invoice_date', 'vendor_name', 'line_items', 'total']
        for field in required_fields:
            if field not in invoice_data or not invoice_data[field]:
                errors.append(f"Missing required field: {field}")
        
        if errors:
            return {
                "valid": False,
                "errors": errors,
                "warnings": warnings,
                "math_checks_passed": False
            }
        
        # Validate line items
        line_items = invoice_data.get('line_items', [])
        
        if len(line_items) == 0:
            errors.append("No line items found")
        elif len(line_items) < 3:
            warnings.append(f"Only {len(line_items)} items found - invoice may be incomplete")
        
        # Validate each line item
        for i, item in enumerate(line_items):
            item_warnings = self._validate_line_item(item, i + 1)
            warnings.extend(item_warnings)
        
        # Validate totals
        math_checks = self._validate_totals(invoice_data)
        warnings.extend(math_checks['warnings'])
        
        # Check for duplicate items (same item number appearing multiple times)
        item_numbers = [item.get('item_number') for item in line_items if item.get('item_number')]
        if len(item_numbers) != len(set(item_numbers)):
            warnings.append("Duplicate item numbers detected")
        
        # Date validation
        try:
            from datetime import datetime, timedelta
            invoice_date = datetime.strptime(invoice_data['invoice_date'], '%Y-%m-%d')
            days_old = (datetime.now() - invoice_date).days
            
            if days_old > 90:
                warnings.append(f"Invoice is {days_old} days old")
            if days_old < -7:
                warnings.append("Invoice date is in the future")
        except:
            warnings.append("Invalid invoice date format")
        
        # Total amount sanity check
        total = invoice_data.get('total', 0)
        if total > 50000:
            warnings.append(f"Unusually large total: ${total:,.2f}")
        if total < 10:
            warnings.append(f"Unusually small total: ${total:,.2f}")
        
        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings,
            "math_checks_passed": math_checks['passed'],
            "items_validated": len(line_items)
        }
    
    def _validate_line_item(self, item: Dict, item_num: int) -> List[str]:
        """Validate a single line item"""
        warnings = []
        
        # Check required fields
        if not item.get('description'):
            warnings.append(f"Item {item_num}: Missing description")
        
        if not item.get('quantity'):
            warnings.append(f"Item {item_num}: Missing quantity")
        
        if not item.get('unit_price'):
            warnings.append(f"Item {item_num}: Missing unit price")
        
        # Skip math validation for weight-based items (post-processor handles these)
        if item.get('skip_qty_validation') or item.get('pricing_type') == 'weight_based':
            return warnings
        
        # Check extended price calculation
        try:
            qty = Decimal(str(item.get('quantity', 0)))
            unit_price = Decimal(str(item.get('unit_price', 0)))
            extended = Decimal(str(item.get('extended_price', 0)))
            
            calculated = qty * unit_price
            diff = abs(extended - calculated)
            
            if diff > self.tolerance:
                warnings.append(
                    f"Item {item_num}: Extended price mismatch "
                    f"(${extended} vs calculated ${calculated})"
                )
        except:
            warnings.append(f"Item {item_num}: Invalid numeric values")
        
        # Optional field warnings
        if not item.get('item_number'):
            warnings.append(f"Item {item_num}: Missing item number")
        
        if not item.get('pack_size'):
            warnings.append(f"Item {item_num}: Missing pack size")
        
        if not item.get('category'):
            warnings.append(f"Item {item_num}: Missing category")
        
        return warnings
    
    def _validate_totals(self, invoice_data: Dict) -> Dict:
        """Validate invoice totals"""
        warnings = []
        passed = True
        
        try:
            line_items = invoice_data.get('line_items', [])
            subtotal = Decimal(str(invoice_data.get('subtotal', 0)))
            tax = Decimal(str(invoice_data.get('tax', 0)))
            total = Decimal(str(invoice_data.get('total', 0)))
            
            # Calculate sum of line items
            calculated_subtotal = sum(
                Decimal(str(item.get('extended_price', 0)))
                for item in line_items
            )
            
            # Check subtotal
            subtotal_diff = abs(subtotal - calculated_subtotal)
            if subtotal_diff > Decimal('0.05'):
                warnings.append(
                    f"Subtotal mismatch: ${subtotal} vs calculated ${calculated_subtotal}"
                )
                passed = False
            
            # Check total
            calculated_total = subtotal + tax
            total_diff = abs(total - calculated_total)
            if total_diff > self.tolerance:
                warnings.append(
                    f"Total mismatch: ${total} vs calculated ${calculated_total}"
                )
                passed = False
            
        except Exception as e:
            warnings.append(f"Error validating totals: {str(e)}")
            passed = False
        
        return {
            "passed": passed,
            "warnings": warnings
        }
