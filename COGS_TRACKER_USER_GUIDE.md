# COGS Tracker - User Guide

## What is the COGS Tracker?

The **COGS (Cost of Goods Sold) Tracker** gives you a bird's-eye view of profitability across your entire menu. Instead of checking each item individually, you can now see all your menu items, their costs, margins, and food cost percentages in one place.

---

## How to Access

1. Click **"COGS Tracker"** in the left sidebar (💰 icon)
2. Or navigate to: `http://localhost:5173/cogs`

---

## Dashboard Overview

### Summary Cards (Top Row)

**Items with COGS**
- Shows how many items have recipes built
- Example: "12 / 25" means 12 items have recipes out of 25 total

**Avg Margin**
- Average gross profit across all items with recipes
- Higher is better (more profit per item)

**Avg Food Cost**
- Average food cost percentage
- Target: Under 30% (industry standard)
- 🟢 Green: < 30% (healthy)
- 🟡 Orange: 30-35% (warning)
- 🔴 Red: > 35% (needs attention)

**Need Attention**
- Items without recipes + items with high food cost
- These are your priority items to review

---

## Using the Table

### Search
- Type in the search box to filter by item name or category
- Example: Search "burger" to find all burger items

### Status Filters
- **All** - Show everything
- **With Recipe** - Only items that have COGS calculated
- **No Recipe** - Items that need recipes built

### Sorting
Click any column header to sort:
- **Item Name** - Alphabetical
- **Price** - Menu price (high to low or low to high)
- **COGS** - Cost of goods (high to low or low to high)
- **Margin** - Gross profit (high to low or low to high)
- **Food Cost %** - Food cost percentage (low to high or high to low)

Click again to reverse the sort direction.

### Status Badges

🟢 **Healthy** - Food cost < 30% (great margins!)
🟡 **Warning** - Food cost 30-35% (watch this)
🔴 **High Cost** - Food cost > 35% (needs review)
⚪ **No Recipe** - Recipe not built yet

---

## Taking Action

### Build a Recipe
1. Find an item with "No Recipe" status
2. Click the **"Build"** button
3. You'll be taken to the recipe builder
4. Add ingredients and quantities
5. Return to COGS Tracker to see updated data

### Edit a Recipe
1. Find an item with a recipe
2. Click the **"Edit"** button
3. Modify ingredients or quantities
4. Return to COGS Tracker to see changes

---

## Common Workflows

### Find Your Most Profitable Items
1. Click "Food Cost %" column header
2. Items at the top have the lowest food cost (best margins)
3. These are your star performers!

### Find Items Needing Attention
1. Click the **"No Recipe"** filter
2. These items need recipes built
3. Or click "Food Cost %" and scroll to bottom
4. Items with high food cost need recipe review

### Review a Category
1. Type category name in search (e.g., "Appetizers")
2. See all items in that category
3. Compare margins within the category

### Quick Health Check
1. Look at "Avg Food Cost" card
2. If > 30%, you have room for improvement
3. Sort by "Food Cost %" to find problem items
4. Focus on items with 🔴 red badges first

---

## Understanding the Numbers

### Example Row
```
Burger | Entrees | $12.00 | $3.50 | $8.50 | 29.2% | 🟢 Healthy
```

- **Item:** Burger
- **Category:** Entrees
- **Price:** $12.00 (what customer pays)
- **COGS:** $3.50 (cost of ingredients)
- **Margin:** $8.50 (gross profit = $12.00 - $3.50)
- **Food Cost %:** 29.2% (COGS ÷ Price = $3.50 ÷ $12.00)
- **Status:** Healthy (under 30% target)

### What's a Good Food Cost %?

- **< 25%** - Excellent! Very profitable
- **25-30%** - Good! Industry standard
- **30-35%** - Acceptable, but watch it
- **35-40%** - High, consider price increase or recipe adjustment
- **> 40%** - Too high, losing money

---

## Tips & Best Practices

### 1. Start with High-Volume Items
Build recipes for your best-sellers first. These have the biggest impact on profitability.

### 2. Review Regularly
Check your COGS Tracker weekly. Ingredient prices change, so your margins change too.

### 3. Use Filters Strategically
- Monday: Review "No Recipe" items, build 2-3 recipes
- Wednesday: Check "High Cost" items, optimize recipes
- Friday: Review overall metrics, plan menu changes

### 4. Compare Similar Items
Search for a category (e.g., "Pizza") and compare margins. Why is one pizza more profitable than another?

### 5. Set Goals
- Goal: Get all items under 30% food cost
- Goal: Build recipes for 100% of menu items
- Goal: Increase average margin by $1

---

## Troubleshooting

### "No Menu Found"
- You need to upload a menu first
- Click "Upload Menu" button
- Go to Menu Management → Upload Menu

### "No items found"
- Check your search query
- Try clearing filters
- Make sure you have menu items uploaded

### Numbers Don't Match
- Click the "Refresh" button (top right)
- Recipe costs update automatically from latest invoice prices
- If you just added an ingredient, refresh to see changes

### Item Missing
- Check if it's in your uploaded menu
- Try searching by category
- Clear all filters to see everything

---

## Navigation

### From COGS Tracker
- Click **"View Menu"** → Go to Menu Dashboard
- Click **"Build"** or **"Edit"** → Go to Recipe Builder
- Click **"Dashboard"** in breadcrumbs → Go to Main Dashboard

### To COGS Tracker
- From anywhere: Click **"COGS Tracker"** in sidebar
- From Recipe Builder: Click **"COGS Tracker"** button (top left)
- From Menu Dashboard: Click **"COGS Tracker"** in sidebar

---

## FAQ

**Q: Why don't I see COGS for some items?**
A: Those items don't have recipes built yet. Click "Build" to add ingredients.

**Q: How often do costs update?**
A: Costs are pulled from your latest invoice prices automatically. When you upload a new invoice, recipe costs update.

**Q: Can I export this data?**
A: Not yet, but it's coming in a future update!

**Q: What if my food cost is too high?**
A: Three options:
1. Increase menu price
2. Reduce portion sizes
3. Find cheaper ingredient alternatives

**Q: Does this affect my existing recipes?**
A: No! This is just a different view of the same data. Changes you make in the recipe builder show up here, and vice versa.

**Q: Can I see historical trends?**
A: Not yet, but it's planned for a future update!

---

## Keyboard Shortcuts

- **/** - Focus search box
- **Esc** - Clear search
- **Tab** - Navigate between filters

---

## Need Help?

- Check the info card at the bottom of the page
- Visit Menu Dashboard for individual item management
- Contact support if you encounter issues

---

**Pro Tip:** Bookmark `/cogs` for quick access to your profitability dashboard!
