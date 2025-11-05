# COGS Tracker - Quick Start Guide

## 🚀 What Just Got Built

A new **COGS Tracker Dashboard** at `/cogs` that shows all your menu items with their profitability metrics in one place.

---

## ✅ Ready to Use

1. **Start your dev server** (if not running):
   ```bash
   cd frontend
   npm run dev
   ```

2. **Navigate to COGS Tracker**:
   - Click "COGS Tracker" in the sidebar (💰 icon)
   - Or go to: `http://localhost:5173/cogs`

3. **That's it!** No backend restart needed, no database changes, nothing else to configure.

---

## 🎯 What You'll See

### If You Have a Menu Uploaded:
- **Summary cards** showing key metrics
- **Table of all menu items** with COGS data
- **Filter and sort** capabilities
- **Quick actions** to build/edit recipes

### If You Don't Have a Menu:
- Prompt to upload a menu
- Click "Upload Menu" to get started

---

## 🔄 How It Works

```
COGS Tracker
    ↓ (fetches data from existing APIs)
Menu Items + Recipes
    ↓ (displays in table)
Click "Build" or "Edit"
    ↓ (navigates to)
Recipe Builder (existing page)
    ↓ (make changes)
Return to COGS Tracker
    ↓ (see updated data)
```

**Zero backend changes** - it's all frontend magic! ✨

---

## 🧪 Quick Test

1. Go to `/cogs`
2. See your menu items listed
3. Click "Build" on an item without a recipe
4. Add some ingredients
5. Return to COGS Tracker
6. See the updated COGS and margin!

---

## 📊 Key Features

- **Search** - Find items by name or category
- **Filter** - All / With Recipe / No Recipe
- **Sort** - Click any column header
- **Health Badges** - Visual indicators (🟢🟡🔴)
- **Quick Actions** - Build or edit recipes with one click

---

## 🎨 What's Different from Recipe Builder?

| Recipe Builder | COGS Tracker |
|----------------|--------------|
| One item at a time | All items at once |
| Detailed ingredient list | Summary metrics |
| Add/edit/delete ingredients | View and navigate |
| Deep dive | Bird's eye view |

**Both pages work together** - use COGS Tracker to find items needing attention, then jump to Recipe Builder to make changes.

---

## 🔧 Files Created

```
frontend/src/
├── hooks/
│   └── useCOGSOverview.ts          (data fetching)
├── components/cogs/
│   ├── COGSSummaryCards.tsx        (metrics cards)
│   └── COGSTable.tsx               (main table)
└── pages/
    └── COGSDashboardPage.tsx       (main page)
```

Plus updates to:
- `App.tsx` (route)
- `AppSidebar.tsx` (navigation)
- `MenuItemRecipePage.tsx` (back link)

---

## 🚨 Rollback (If Needed)

If something breaks:

1. Remove route from `App.tsx` (search for `/cogs`)
2. Remove nav link from `AppSidebar.tsx` (search for `COGS Tracker`)
3. Delete the 4 new files listed above

Your existing recipe system will be completely unaffected.

---

## 📈 Next Steps

### Immediate
- [ ] Test with your actual menu data
- [ ] Try all filters and sorting
- [ ] Build a few recipes and see them update
- [ ] Check mobile responsiveness

### Future Enhancements (Not Built Yet)
- Export to CSV
- Charts and visualizations
- Bulk operations
- Recipe templates
- Historical tracking

---

## 💡 Pro Tips

1. **Use filters** - "No Recipe" filter shows items needing attention
2. **Sort by Food Cost %** - Find your most/least profitable items
3. **Search by category** - Review one category at a time
4. **Bookmark `/cogs`** - Quick access to your profitability dashboard

---

## 🐛 Known Limitations

- No pagination (may be slow with 100+ items)
- Table scrolls horizontally on mobile (can add card view later)
- No export feature yet (coming in Phase 2)
- No charts yet (coming in Phase 2)

None of these are blockers for using it today!

---

## 📚 Documentation

- **Full Audit**: `COGS_TRACKER_AUDIT_AND_EXPANSION_PLAN.md`
- **Implementation Details**: `COGS_TRACKER_IMPLEMENTATION_COMPLETE.md`
- **User Guide**: `COGS_TRACKER_USER_GUIDE.md`
- **This Guide**: `COGS_TRACKER_QUICK_START.md`

---

## ✨ Summary

You now have a **production-ready COGS Tracker** that:
- ✅ Shows all menu items with profitability metrics
- ✅ Filters and sorts for easy analysis
- ✅ Integrates seamlessly with existing recipe system
- ✅ Required zero backend changes
- ✅ Can be rolled back instantly if needed

**Go check it out at `/cogs`!** 🎉
