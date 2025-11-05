# #10 Can Pack Size & Usable Weight Audit

**Date:** November 4, 2024  
**Issue:** System cannot properly handle #10 can pack sizes and variable usable weights per can

---

## Problem Statement

### Current Limitations

1. **Pack Size Conversion Issue:**
   - Invoice shows: `6/#10 cans`
   - System cannot convert to: `1/#10 can` at proportional price
   - Pattern `6/#10` is recognized but doesn't break down to per-can cost

2. **Variable Usable Weight Issue:**
   - Different #10 cans have different usable product weights
   - Example: #10 can of tomatoes ≠ #10 can of beans (different oz per can)
   - System assumes fixed weight (6.5 lb) for all #10 cans
   - User needs to specify actual usable ounces when entering recipe quantity

---

## Current System Analysis

### 1. Unit Converter Service (`services/unit_converter.py`)

**Current #10 Can Handling:**
```python
# Line ~150 in PACK_PATTERNS
(r'(\d+)\s*#(\d+)', 'can_size'),  # Matches "6 #10", "12 #5"

# Line ~180 in parse_pack_size()
elif pattern_type == 'can_size':
    # #10 can is approximately 6.5 lb
    can_sizes = {'10': 6.5, '5': 3.5, '2': 1.25}
    can_num = match.group(2)
    return {
        'count': int(match.group(1)),  # 6
        'size': Decimal(str(can_sizes.get(can_num, 1.0))),  # 6.5 lb
        'unit': 'lb',
        'type': 'can_size'
    }
```

**Problems:**
- ✅ Recognizes `6/#10` pattern
- ❌ Assumes fixed 6.5 lb per #10 can (not accurate for all products)
- ❌ Cannot break down to per-can cost
- ❌ No way to store/retrieve actual usable weight per product

### 2. Cost Calculation Flow

**Current Flow:**
```
Invoice: "6/#10 cans @ $45.00"
  ↓
Parse: count=6, size=6.5lb, unit=lb
  ↓
Total weight: 6 × 6.5 = 39 lb
  ↓
Unit cost: $45.00 ÷ 39 lb = $1.15/lb
  ↓
Recipe: "3 oz of tomatoes"
  ↓
Cost: 3 oz × ($1.15/lb ÷ 16 oz/lb) = $0.22
```

**Problems:**
- ❌ 6.5 lb assumption may be wrong
- ❌ User cannot specify actual usable weight
- ❌ No per-can cost calculation

### 3. Database Schema

**Current Fields:**
```sql
-- invoice_items table
pack_size TEXT,  -- Stores "6/#10 cans"
unit_price NUMERIC(10,2),  -- Stores $45.00 (total pack price)

-- menu_item_ingredients table
quantity_per_serving NUMERIC(12,3),  -- Stores 3.0
unit_of_measure TEXT,  -- Stores "oz"
```

**Missing:**
- ❌ No field for usable_weight_per_can
- ❌ No field for actual_can_size_oz
- ❌ No metadata table for can size standards

---

## Required Changes

### Phase 1: Database Schema Updates

#### 1.1 Add Can Metadata Table
```sql
CREATE TABLE can_size_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    invoice_item_id UUID NOT NULL REFERENCES invoice_items(id),
    
    -- Can details
    can_size_number TEXT NOT NULL,  -- "10", "5", "2"
    cans_per_pack INTEGER NOT NULL,  -- 6, 12, 24
    usable_weight_oz NUMERIC(10,2),  -- User-specified actual weight
    
    -- Calculated fields
    total_pack_weight_oz NUMERIC(10,2),  -- cans_per_pack × usable_weight_oz
    cost_per_can NUMERIC(10,4),  -- pack_price ÷ cans_per_pack
    cost_per_oz NUMERIC(10,4),  -- pack_price ÷ total_pack_weight_oz
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_id, invoice_item_id)
);

CREATE INDEX idx_can_metadata_user_item ON can_size_metadata(user_id, invoice_item_id);
```

#### 1.2 Add Standard Can Sizes Reference
```sql
CREATE TABLE standard_can_sizes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    can_number TEXT NOT NULL UNIQUE,  -- "10", "5", "2", "303"
    typical_weight_oz NUMERIC(10,2),  -- Typical usable weight
    typical_weight_lb NUMERIC(10,2),  -- For display
    description TEXT,  -- "Restaurant/Institutional size"
    
    CONSTRAINT check_can_number CHECK (can_number IN ('10', '5', '3', '2', '303', '300', '2.5', '1'))
);

-- Seed data
INSERT INTO standard_can_sizes (can_number, typical_weight_oz, typical_weight_lb, description) VALUES
('10', 104, 6.5, '#10 can - Restaurant/Institutional (6.5 lb typical)'),
('5', 56, 3.5, '#5 can - Foodservice (3.5 lb typical)'),
('3', 46, 2.875, '#3 can - Large (2.875 lb typical)'),
('2', 20, 1.25, '#2 can - Medium (1.25 lb typical)'),
('303', 16, 1.0, '#303 can - Standard soup can (1 lb typical)'),
('300', 14, 0.875, '#300 can - Small (14 oz typical)');
```

### Phase 2: Backend Service Updates

#### 2.1 Enhanced Unit Converter

**New Method: `parse_can_pack_size_detailed()`**
```python
def parse_can_pack_size_detailed(self, pack_size: str) -> Optional[Dict]:
    """
    Parse can pack sizes with detailed breakdown
    
    Examples:
        "6/#10 cans" → {
            'count': 6,
            'can_number': '10',
            'type': 'can_pack',
            'requires_usable_weight': True
        }
        "12/#5" → {
            'count': 12,
            'can_number': '5',
            'type': 'can_pack',
            'requires_usable_weight': True
        }
    """
    pattern = r'(\d+)\s*/?\s*#(\d+)'
    match = re.search(pattern, pack_size, re.IGNORECASE)
    
    if match:
        return {
            'count': int(match.group(1)),
            'can_number': match.group(2),
            'type': 'can_pack',
            'requires_usable_weight': True,
            'typical_weight_oz': self.get_typical_can_weight(match.group(2))
        }
    
    return None

def get_typical_can_weight(self, can_number: str) -> Optional[float]:
    """Get typical weight for can size from database"""
    # Query standard_can_sizes table
    pass

def calculate_can_pack_cost(
    self,
    pack_price: Decimal,
    cans_per_pack: int,
    usable_weight_oz: Optional[Decimal] = None,
    can_number: Optional[str] = None
) -> Dict:
    """
    Calculate costs for can packs
    
    Args:
        pack_price: Total pack price ($45.00)
        cans_per_pack: Number of cans (6)
        usable_weight_oz: Actual usable ounces per can (user-specified)
        can_number: Can size number for typical weight lookup
    
    Returns:
        {
            'cost_per_can': Decimal,
            'cost_per_oz': Decimal,
            'total_weight_oz': Decimal,
            'needs_user_input': bool,
            'typical_weight_oz': Optional[Decimal]
        }
    """
    cost_per_can = pack_price / Decimal(str(cans_per_pack))
    
    if usable_weight_oz:
        # User provided actual weight
        total_weight_oz = usable_weight_oz * Decimal(str(cans_per_pack))
        cost_per_oz = pack_price / total_weight_oz
        needs_user_input = False
    else:
        # Need user to specify weight
        typical_weight = self.get_typical_can_weight(can_number) if can_number else None
        cost_per_oz = None
        total_weight_oz = None
        needs_user_input = True
    
    return {
        'cost_per_can': cost_per_can,
        'cost_per_oz': cost_per_oz,
        'total_weight_oz': total_weight_oz,
        'needs_user_input': needs_user_input,
        'typical_weight_oz': typical_weight
    }
```

#### 2.2 Menu Recipe Service Updates

**New Method: `prompt_for_can_weight()`**
```python
async def add_ingredient_with_can_prompt(
    self,
    menu_item_id: str,
    invoice_item_id: str,
    quantity_per_serving: float,
    unit_of_measure: str,
    user_id: str,
    usable_weight_oz_per_can: Optional[float] = None  # NEW PARAMETER
) -> Dict:
    """
    Add ingredient with can weight handling
    
    Flow:
    1. Check if invoice_item is a can pack
    2. If yes and no usable_weight provided:
       - Return prompt for user input
       - Include typical weight as suggestion
    3. If usable_weight provided:
       - Store in can_size_metadata
       - Calculate accurate costs
    4. Add ingredient with accurate cost
    """
    # Get invoice item
    invoice_item = await self.get_invoice_item(invoice_item_id, user_id)
    pack_size = invoice_item.get('pack_size')
    
    # Check if it's a can pack
    converter = UnitConverter()
    can_details = converter.parse_can_pack_size_detailed(pack_size)
    
    if can_details and can_details['requires_usable_weight']:
        # Check if we have stored weight
        existing_metadata = await self.get_can_metadata(user_id, invoice_item_id)
        
        if not existing_metadata and not usable_weight_oz_per_can:
            # Need user input
            return {
                'status': 'needs_can_weight',
                'can_details': can_details,
                'prompt': f"How many ounces of usable product are in each #{can_details['can_number']} can?",
                'typical_weight_oz': can_details['typical_weight_oz'],
                'suggestion': f"Typical #{can_details['can_number']} can contains ~{can_details['typical_weight_oz']} oz"
            }
        
        # Use provided or stored weight
        usable_weight = usable_weight_oz_per_can or existing_metadata['usable_weight_oz']
        
        # Store metadata if new
        if not existing_metadata:
            await self.store_can_metadata(
                user_id=user_id,
                invoice_item_id=invoice_item_id,
                can_number=can_details['can_number'],
                cans_per_pack=can_details['count'],
                usable_weight_oz=usable_weight,
                pack_price=invoice_item['unit_price']
            )
        
        # Calculate accurate costs
        cost_data = converter.calculate_can_pack_cost(
            pack_price=Decimal(str(invoice_item['unit_price'])),
            cans_per_pack=can_details['count'],
            usable_weight_oz=Decimal(str(usable_weight)),
            can_number=can_details['can_number']
        )
        
        # Continue with normal ingredient addition using accurate cost_per_oz
        # ...
    
    # Normal flow for non-can items
    # ...
```

### Phase 3: Frontend Updates

#### 3.1 Enhanced Ingredient Search Modal

**Add Can Weight Prompt:**
```tsx
// New state
const [canWeightPrompt, setCanWeightPrompt] = useState<CanWeightPrompt | null>(null);
const [usableWeightOz, setUsableWeightOz] = useState('');

interface CanWeightPrompt {
  can_number: string;
  cans_per_pack: number;
  typical_weight_oz: number;
  prompt: string;
  suggestion: string;
}

// Modified handleAdd
const handleAdd = async () => {
  if (!selectedItem) return;

  try {
    setAdding(true);
    
    const response = await onAdd({
      invoice_item_id: selectedItem.id,
      quantity_per_serving: parseFloat(quantity),
      unit_of_measure: unit,
      usable_weight_oz_per_can: usableWeightOz ? parseFloat(usableWeightOz) : undefined,
      notes: notes || undefined,
    });

    // Check if we need can weight input
    if (response.status === 'needs_can_weight') {
      setCanWeightPrompt(response.can_details);
      setUsableWeightOz(response.typical_weight_oz.toString());
      return; // Don't close modal, show prompt
    }

    // Success - close modal
    handleClose();
  } catch (error) {
    // Handle error
  } finally {
    setAdding(false);
  }
};

// Render can weight prompt
{canWeightPrompt && (
  <div className="p-4 rounded-lg border border-orange-500/30 bg-orange-500/5">
    <h4 className="font-semibold text-white mb-2">
      #{canWeightPrompt.can_number} Can Weight Needed
    </h4>
    <p className="text-sm text-slate-300 mb-3">
      {canWeightPrompt.prompt}
    </p>
    <p className="text-xs text-slate-400 mb-3">
      💡 {canWeightPrompt.suggestion}
    </p>
    <div>
      <Label className="text-slate-300 mb-2">
        Usable ounces per #{canWeightPrompt.can_number} can
      </Label>
      <div className="flex gap-3 items-center">
        <Input
          type="number"
          step="0.1"
          min="0"
          value={usableWeightOz}
          onChange={(e) => setUsableWeightOz(e.target.value)}
          placeholder={canWeightPrompt.typical_weight_oz.toString()}
          className="input-field flex-1"
        />
        <span className="text-slate-400">oz per can</span>
      </div>
      <p className="text-xs text-slate-500 mt-2">
        This will be saved and reused for this product
      </p>
    </div>
  </div>
)}
```

#### 3.2 Display Can Information

**Show can details in ingredient list:**
```tsx
{ingredient.pack_size?.includes('#') && (
  <div className="text-xs text-slate-400 mt-1">
    📦 {ingredient.pack_size} 
    {ingredient.usable_weight_oz && (
      <span className="ml-2">
        ({ingredient.usable_weight_oz} oz per can)
      </span>
    )}
  </div>
)}
```

### Phase 4: API Updates

#### 4.1 New Endpoints

**GET `/api/v1/menu/can-metadata/:invoice_item_id`**
- Get stored can weight for an invoice item
- Returns usable_weight_oz if previously entered

**POST `/api/v1/menu/can-metadata`**
```json
{
  "invoice_item_id": "uuid",
  "can_number": "10",
  "cans_per_pack": 6,
  "usable_weight_oz": 104.0
}
```

**GET `/api/v1/menu/standard-can-sizes`**
- Get reference data for typical can weights
- Used for suggestions

#### 4.2 Modified Endpoints

**POST `/api/v1/menu/:menu_item_id/ingredients`**
```json
{
  "invoice_item_id": "uuid",
  "quantity_per_serving": 3.0,
  "unit_of_measure": "oz",
  "usable_weight_oz_per_can": 104.0,  // NEW - optional
  "notes": "string"
}
```

**Response:**
```json
{
  "status": "needs_can_weight",  // NEW status
  "can_details": {
    "can_number": "10",
    "cans_per_pack": 6,
    "typical_weight_oz": 104,
    "prompt": "How many ounces...",
    "suggestion": "Typical #10 can..."
  }
}
```

OR

```json
{
  "status": "success",
  "ingredient_id": "uuid",
  "calculated_cost": 0.22,
  "warnings": []
}
```

---

## User Experience Flow

### Scenario 1: First Time Adding #10 Can Ingredient

1. **User searches for "tomatoes"**
   - Results show: "Tomatoes, Diced 6/#10 @ $45.00"
   - Shows: "$0.75/can (needs weight info)"

2. **User selects item and enters quantity**
   - Enters: "3 oz"
   - Clicks "Add Ingredient"

3. **System prompts for can weight**
   - Modal shows: "How many ounces of usable product are in each #10 can?"
   - Pre-fills: "104 oz" (typical weight)
   - User can adjust: "98 oz" (actual drained weight)

4. **System calculates accurate cost**
   - 6 cans × 98 oz = 588 oz total
   - $45.00 ÷ 588 oz = $0.0765/oz
   - 3 oz × $0.0765 = $0.23 per serving

5. **System stores weight for reuse**
   - Next time user adds this item, no prompt needed
   - Weight is remembered per invoice item

### Scenario 2: Subsequent Uses

1. **User adds same tomatoes to different recipe**
   - System retrieves stored weight (98 oz)
   - No prompt needed
   - Calculates cost immediately

### Scenario 3: Different Pack Size

1. **User gets new invoice: "12/#10 cans @ $85.00"**
   - Different invoice_item_id
   - System prompts again (different product/vendor)
   - User enters weight (may be different)

---

## Implementation Checklist

### Database (2-3 hours)
- [ ] Create `can_size_metadata` table
- [ ] Create `standard_can_sizes` table
- [ ] Seed standard can sizes
- [ ] Add indexes
- [ ] Test queries

### Backend (4-6 hours)
- [ ] Update `UnitConverter.parse_can_pack_size_detailed()`
- [ ] Add `UnitConverter.calculate_can_pack_cost()`
- [ ] Add `UnitConverter.get_typical_can_weight()`
- [ ] Update `MenuRecipeService.add_ingredient()` to handle cans
- [ ] Add `MenuRecipeService.get_can_metadata()`
- [ ] Add `MenuRecipeService.store_can_metadata()`
- [ ] Create API endpoints for can metadata
- [ ] Update cost calculation logic
- [ ] Add tests

### Frontend (3-4 hours)
- [ ] Update `IngredientSearchModal` with can weight prompt
- [ ] Add can weight input UI
- [ ] Update API calls to include `usable_weight_oz_per_can`
- [ ] Handle `needs_can_weight` response status
- [ ] Display can info in ingredient list
- [ ] Add edit capability for stored can weights
- [ ] Test UX flow

### Testing (2 hours)
- [ ] Test #10 can recognition
- [ ] Test cost calculation accuracy
- [ ] Test weight storage/retrieval
- [ ] Test multi-user isolation
- [ ] Test edge cases (missing data, invalid input)

---

## Example Calculations

### Before (Inaccurate):
```
Invoice: 6/#10 cans @ $45.00
Assumed: 6 × 6.5 lb = 39 lb = 624 oz
Cost: $45.00 ÷ 624 oz = $0.072/oz
Recipe: 3 oz × $0.072 = $0.22 ❌ WRONG
```

### After (Accurate):
```
Invoice: 6/#10 cans @ $45.00
User specifies: 98 oz per can (drained weight)
Actual: 6 × 98 oz = 588 oz
Cost: $45.00 ÷ 588 oz = $0.0765/oz
Recipe: 3 oz × $0.0765 = $0.23 ✅ CORRECT
```

---

## Benefits

1. **Accurate COGS** - True cost based on actual usable product
2. **User Control** - Users specify exact weights for their products
3. **Reusability** - Weight stored and reused automatically
4. **Flexibility** - Handles different vendors/products with different weights
5. **Transparency** - Shows per-can and per-oz costs clearly
6. **Education** - Typical weights provided as guidance

---

## Questions to Answer

1. **Should we allow editing stored can weights?**
   - Recommendation: Yes, add "Edit Can Weight" button in ingredient list

2. **Should we prompt every time or only first time?**
   - Recommendation: Only first time per invoice_item_id, then reuse

3. **Should we support other can sizes (#5, #2, etc.)?**
   - Recommendation: Yes, same logic applies to all numbered cans

4. **What if user doesn't know the weight?**
   - Recommendation: Use typical weight as default, show warning

5. **Should we track weight changes over time?**
   - Recommendation: Phase 2 feature - version history

---

**Ready to implement?** This is a complete solution that will give you accurate COGS for all can-based products!
