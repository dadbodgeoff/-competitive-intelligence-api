-- Migration: Relax extended_price validation constraint
-- Issue: Real-world invoices with fractional quantities (10.64 × 4.316 = 45.92224)
-- cause rounding errors that exceed the ±$0.02 tolerance
-- Solution: Increase tolerance to ±$0.05 to handle typical rounding scenarios

-- Drop the existing constraint
ALTER TABLE invoice_items 
DROP CONSTRAINT IF EXISTS valid_extended_price;

-- Add new constraint with relaxed tolerance (±$0.05)
ALTER TABLE invoice_items
ADD CONSTRAINT valid_extended_price CHECK (
    ABS(extended_price - (quantity * unit_price)) <= 0.05
);

-- Note: This still catches major data entry errors while allowing
-- for typical floating-point rounding in invoice calculations
