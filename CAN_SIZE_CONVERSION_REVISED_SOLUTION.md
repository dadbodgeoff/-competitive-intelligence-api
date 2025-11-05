# #10 Can Solution - REVISED (Invoice-First Architecture)

**Date:** November 4, 2024  
**Constraint:** `invoice_items` table is the ONLY source of truth for pricing/analytics  
**Principle:** No new pricing data storage - compute on-the-fly from existing data

---

## Architectural Principle

✅ **CORRECT:** `invoice_items` → compute → display  
❌ **WRONG:** `invoice_items` → store in new table → display

**Your system already has everything needed in `invoice_items`:**
- `pack_size` (e.g., "6/#10 cans")
- `unit_price` (e.g., $45.00)

**We just need to:**
1. Parse pack_size better (already 90% done)
2. Prompt user for usable weight when needed
3. Store user preference (NOT pricing data) separately
4. Compute costs on-the-fly from invoice_items

---

## What We CAN Use From Existing Endpoints

### ✅ Already Available from `invoice_items`:
```sql
SELECT 
    id,
    description,
    pack_size,        -- "6/#10 cans"
    unit_price,       -- $45.00
    quantity,
    extended_price,
    created_at
FROM invoice_items
WHERE user_id = ? AND description ILIKE ?
```

**This gives us everything for pricing!**

### ✅ Current Menu Recipe Service Already Does:
```python
# services/menu_recipe_service.py (line ~115)
enhanced_items = []
for item in matched_items:
    vendor_pack_size = item.get("pack_size")  # From invoice_items
    pack_price = float(item.get("unit_price") or 0)  # From invoice_items
    
    # Calculate unit cost from pack (ALREADY DOING THIS)
    unit_cost_weight, weight_unit, unit_cost_piece, error = converter.calculate_unit_cost_from_pack(
        Decimal(str(pack_price)),
        vendor_pack_size
    )
```

**We're already reading from invoice_items correctly!**

---

## What's Missing (The Gap)

### Problem 1: Fixed Can Weight Assumption
```python
# services/unit_converter.py (line ~170)
can_sizes = {'10': 6.5, '5': 3.5, '2': 1.25}  # HARDCODED ❌
```

**This is the ONLY issue** - we assume all #10 cans = 6.5 lb

### Problem 2: No User Preference Storage
When user says "this #10 can has 98 oz", we need to remember that **preference** (not pricing data).

---

## REVISED Solution (Respects Architecture)

### Option A: User Preferences Table (RECOMMENDED)

**Store user PREFERENCES, not pricing data:**

```sql
-- This is NOT pricing data - it's user configuration
CREATE TABLE user_can_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    
    -- What product (by description pattern)
    product_description_pattern TEXT NOT NULL,  -- "tomatoes, diced"
    
    -- User's preference for this product type
    can_number TEXT NOT NULL,  -- "10"
    usable_weight_oz NUMERIC(10,2) NOT NULL,  -- 98.0 (user-specified)
    
    -- Metadata
    notes TEXT,  -- "Drained weight for our brand"
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_id, product_description_pattern, can_number)
);

CREATE INDEX idx_user_can_prefs ON user_can_preferences(user_id, product_description_pattern);
```

**Key Points:**
- ✅ NOT tied to specific invoice_item_id (preferences are product-level)
- ✅ NOT storing prices (just user's weight preference)
- ✅ Reusable across all invoices for same product type
- ✅ invoice_items remains source of truth for pricing

### Option B: Frontend-Only Storage (SIMPLER)

**Store preferences in browser localStorage:**

```typescript
// frontend/src/utils/canPreferences.ts
interface CanPreference {
  productPattern: string;  // "tomatoes"
  canNumber: string;       // "10"
  usableWeightOz: number;  // 98
}

export const canPreferences = {
  save(userId: string, pref: CanPreference) {
    const key = `can_prefs_${userId}`;
    const prefs = this.getAll(userId);
    prefs[`${pref.productPattern}_${pref.canNumber}`] = pref;
    localStorage.setItem(key, JSON.stringify(prefs));
  },
  
  get(userId: string, productPattern: string, canNumber: string): number | null {
    const prefs = this.getAll(userId);
    const pref = prefs[`${productPattern}_${canNumber}`];
    return pref?.usableWeightOz || null;
  },
  
  getAll(userId: string): Record<string, CanPreference> {
    const key = `can_prefs_${userId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {};
  }
};
```

**Pros:**
- ✅ Zero database changes
- ✅ Zero backend changes
- ✅ Instant implementation
- ✅ Still respects invoice_items as source of truth

**Cons:**
- ⚠️ Lost if user clears browser data
- ⚠️ Not synced across devices

---

## Implementation Flow (Option B - Frontend Only)

### 1. Enhanced Unit Converter (Backend)

**Only change: Make can weight configurable**

```python
# services/unit_converter.py

def parse_can_pack_size(
    self, 
    pack_size: str,
    usable_weight_oz_per_can: Optional[float] = None  # NEW PARAMETER
) -> Optional[Dict]:
    """
    Parse can pack sizes with optional user-specified weight
    
    Args:
        pack_size: "6/#10 cans"
        usable_weight_oz_per_can: User-specified weight (e.g., 98.0)
    """
    pattern = r'(\d+)\s*/?\s*#(\d+)'
    match = re.search(pattern, pack_size, re.IGNORECASE)
    
    if match:
        can_number = match.group(2)
        
        # Use user-specified weight OR typical weight
        if usable_weight_oz_per_can:
            weight_oz = usable_weight_oz_per_can
        else:
            # Typical weights (fallback)
            typical_weights = {'10': 104, '5': 56, '2': 20}
            weight_oz = typical_weights.get(can_number, 104)
        
        return {
            'count': int(match.group(1)),
            'can_number': can_number,
            'size': Decimal(str(weight_oz / 16)),  # Convert to lb
            'unit': 'lb',
            'type': 'can_size',
            'usable_weight_oz': weight_oz,
            'needs_user_confirmation': usable_weight_oz_per_can is None
        }
    
    return None

def calculate_unit_cost_from_pack(
    self,
    pack_price: Decimal,
    pack_size: str,
    usable_weight_oz_per_can: Optional[float] = None  # NEW PARAMETER
) -> Tuple[Optional[Decimal], Optional[str], Optional[Decimal], Optional[str]]:
    """
    Calculate unit cost with optional can weight override
    """
    parsed = self.parse_can_pack_size(pack_size, usable_weight_oz_per_can)
    
    if not parsed:
        return (None, None, None, "Could not parse pack size")
    
    # Calculate costs using actual or typical weight
    if parsed['type'] == 'can_size':
        count = Decimal(str(parsed['count']))
        weight_per_can_lb = parsed['size']
        total_weight_lb = count * weight_per_can_lb
        
        cost_per_lb = pack_price / total_weight_lb
        cost_per_oz = cost_per_lb / Decimal('16')
        cost_per_can = pack_price / count
        
        return (
            cost_per_oz,
            'oz',
            cost_per_can,
            None
        )
    
    # ... rest of existing logic
```

### 2. Frontend: Can Weight Prompt

**Add to IngredientSearchModal.tsx:**

```tsx
import { canPreferences } from '@/utils/canPreferences';

// New state
const [canPrompt, setCanPrompt] = useState<{
  canNumber: string;
  typicalWeight: number;
  productName: string;
} | null>(null);
const [canWeight, setCanWeight] = useState('');

// Modified handleSelect
const handleSelect = (item: InventoryItemSearchResult) => {
  setSelectedItem(item);
  
  // Check if it's a can pack
  const canMatch = item.pack_size?.match(/(\d+)\s*\/?\s*#(\d+)/);
  if (canMatch) {
    const canNumber = canMatch[2];
    const productPattern = item.name.toLowerCase().split(',')[0].trim();
    
    // Check if we have a saved preference
    const savedWeight = canPreferences.get(user.id, productPattern, canNumber);
    
    if (savedWeight) {
      // Use saved preference
      setCanWeight(savedWeight.toString());
    } else {
      // Prompt user
      const typicalWeights: Record<string, number> = {
        '10': 104, '5': 56, '2': 20
      };
      setCanPrompt({
        canNumber,
        typicalWeight: typicalWeights[canNumber] || 104,
        productName: item.name
      });
      setCanWeight(typicalWeights[canNumber]?.toString() || '104');
    }
  }
  
  setUnit(item.base_unit);
};

// Modified handleAdd
const handleAdd = async () => {
  if (!selectedItem) return;

  // Save can preference if applicable
  if (canPrompt && canWeight) {
    const productPattern = selectedItem.name.toLowerCase().split(',')[0].trim();
    canPreferences.save(user.id, {
      productPattern,
      canNumber: canPrompt.canNumber,
      usableWeightOz: parseFloat(canWeight)
    });
  }

  try {
    setAdding(true);
    await onAdd({
      invoice_item_id: selectedItem.id,
      quantity_per_serving: parseFloat(quantity),
      unit_of_measure: unit,
      usable_weight_oz_per_can: canWeight ? parseFloat(canWeight) : undefined,
      notes: notes || undefined,
    });

    handleClose();
  } catch (error) {
    // Handle error
  } finally {
    setAdding(false);
  }
};

// Render can weight prompt
{canPrompt && (
  <div className="p-4 rounded-lg border border-cyan-500/30 bg-cyan-500/5 mb-4">
    <h4 className="font-semibold text-white mb-2">
      #{canPrompt.canNumber} Can Weight
    </h4>
    <p className="text-sm text-slate-300 mb-3">
      How many ounces of usable product are in each #{canPrompt.canNumber} can of {canPrompt.productName}?
    </p>
    <div className="flex gap-3 items-center">
      <Input
        type="number"
        step="0.1"
        min="0"
        value={canWeight}
        onChange={(e) => setCanWeight(e.target.value)}
        className="input-field flex-1"
        placeholder={canPrompt.typicalWeight.toString()}
      />
      <span className="text-slate-400">oz per can</span>
    </div>
    <p className="text-xs text-slate-500 mt-2">
      💡 Typical #{canPrompt.canNumber} can: ~{canPrompt.typicalWeight} oz
    </p>
    <p className="text-xs text-slate-500 mt-1">
      This will be saved for future use
    </p>
  </div>
)}
```

### 3. Backend: Accept Optional Parameter

**Modify menu_recipe_service.py:**

```python
async def add_ingredient(
    self,
    menu_item_id: str,
    invoice_item_id: str,
    quantity_per_serving: float,
    unit_of_measure: str,
    user_id: str,
    usable_weight_oz_per_can: Optional[float] = None,  # NEW
    menu_item_price_id: Optional[str] = None,
    notes: Optional[str] = None
) -> Dict:
    """Add ingredient with optional can weight override"""
    
    # Get invoice item (SOURCE OF TRUTH)
    invoice_item = await self.get_invoice_item(invoice_item_id, user_id)
    pack_size = invoice_item.get('pack_size')
    pack_price = invoice_item.get('unit_price')
    
    # Calculate cost with optional can weight
    converter = UnitConverter()
    unit_cost_weight, weight_unit, unit_cost_piece, error = converter.calculate_unit_cost_from_pack(
        Decimal(str(pack_price)),
        pack_size,
        usable_weight_oz_per_can  # Pass through to converter
    )
    
    # Rest of existing logic...
```

### 4. API: Accept Optional Parameter

**Modify api/routes/menu/recipes.py:**

```python
@router.post("/{menu_item_id}/ingredients")
async def add_ingredient(
    menu_item_id: str,
    request: AddIngredientRequest,  # Add usable_weight_oz_per_can field
    user_id: str = Depends(get_current_user_id)
):
    """Add ingredient to recipe"""
    
    result = await menu_recipe_service.add_ingredient(
        menu_item_id=menu_item_id,
        invoice_item_id=request.invoice_item_id,
        quantity_per_serving=request.quantity_per_serving,
        unit_of_measure=request.unit_of_measure,
        user_id=user_id,
        usable_weight_oz_per_can=request.usable_weight_oz_per_can,  # NEW
        menu_item_price_id=request.menu_item_price_id,
        notes=request.notes
    )
    
    return result
```

---

## Data Flow (Respects Architecture)

```
┌─────────────────────────────────────────────────────────┐
│ invoice_items (SOURCE OF TRUTH)                         │
│ - pack_size: "6/#10 cans"                              │
│ - unit_price: $45.00                                    │
└─────────────────────────────────────────────────────────┘
                        ↓
                   READ ONLY
                        ↓
┌─────────────────────────────────────────────────────────┐
│ User Preference (localStorage or user_can_preferences)  │
│ - product: "tomatoes"                                   │
│ - can_number: "10"                                      │
│ - usable_weight_oz: 98                                  │
└─────────────────────────────────────────────────────────┘
                        ↓
                   COMBINE
                        ↓
┌─────────────────────────────────────────────────────────┐
│ UnitConverter.calculate_unit_cost_from_pack()          │
│ Input: $45.00, "6/#10", 98 oz                          │
│ Output: $0.0765/oz, $7.50/can                          │
└─────────────────────────────────────────────────────────┘
                        ↓
                    DISPLAY
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Frontend shows:                                         │
│ "Tomatoes 6/#10 @ $45.00"                              │
│ "$7.50/can • $0.0765/oz (98 oz per can)"               │
└─────────────────────────────────────────────────────────┘
```

**Key: invoice_items never modified, only read!**

---

## What Changes Are Needed

### Database Changes: **ZERO** (Option B) or **ONE TABLE** (Option A)

**Option A:** Add `user_can_preferences` table (user config, not pricing)  
**Option B:** Use localStorage (zero DB changes)

### Backend Changes: **MINIMAL**

1. ✅ `UnitConverter.parse_can_pack_size()` - add optional parameter
2. ✅ `UnitConverter.calculate_unit_cost_from_pack()` - add optional parameter
3. ✅ `MenuRecipeService.add_ingredient()` - pass through parameter
4. ✅ API endpoint - accept optional parameter

**NO changes to invoice_items table!**  
**NO new pricing storage!**  
**NO analytics impact!**

### Frontend Changes: **MODERATE**

1. ✅ Add can weight prompt UI
2. ✅ Store/retrieve preferences (localStorage or API)
3. ✅ Pass weight to backend when adding ingredient
4. ✅ Display can info in ingredient list

---

## Comparison: Option A vs Option B

### Option A: Database Table
**Pros:**
- ✅ Synced across devices
- ✅ Never lost
- ✅ Can be backed up
- ✅ Can be shared across team (future)

**Cons:**
- ⚠️ Requires DB migration
- ⚠️ Requires API endpoints
- ⚠️ More testing needed

**Effort:** 6-8 hours

### Option B: localStorage
**Pros:**
- ✅ Zero DB changes
- ✅ Zero new API endpoints
- ✅ Instant implementation
- ✅ Simple to test

**Cons:**
- ⚠️ Lost if browser cleared
- ⚠️ Not synced across devices
- ⚠️ Per-browser storage

**Effort:** 3-4 hours

---

## Recommendation

**Start with Option B (localStorage)**, then migrate to Option A if users request cross-device sync.

**Why:**
1. Respects your architecture (invoice_items = source of truth)
2. Minimal changes
3. Fast to implement
4. Easy to upgrade later
5. No risk to existing pricing/analytics

---

## Summary

✅ **invoice_items remains source of truth**  
✅ **No new pricing data stored**  
✅ **User preferences stored separately**  
✅ **Costs computed on-the-fly**  
✅ **Existing endpoints unchanged**  
✅ **Analytics unaffected**  

**This solution respects your architecture completely!**
