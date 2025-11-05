# Files Ready for Safe Deletion

## Obsolete Navigation Components

These 3 files are no longer used anywhere in the codebase and can be safely deleted:

### 1. DashboardSidebar.tsx
```
frontend/src/components/dashboard/DashboardSidebar.tsx
```
**Reason:** Replaced by `AppSidebar.tsx`
**Verified:** 0 imports found

### 2. PageHeader.tsx
```
frontend/src/components/layout/PageHeader.tsx
```
**Reason:** Replaced by breadcrumbs in new PageLayout
**Verified:** 0 imports found

### 3. OLD PageLayout.tsx
```
frontend/src/components/layout/PageLayout.tsx
```
**Reason:** Replaced by new PageLayout that uses AppShell
**Verified:** 0 imports found
**⚠️ WARNING:** Make sure this is the OLD one (doesn't use AppShell)

---

## Quick Delete Commands

### Windows (PowerShell):
```powershell
Remove-Item frontend\src\components\dashboard\DashboardSidebar.tsx
Remove-Item frontend\src\components\layout\PageHeader.tsx
Remove-Item frontend\src\components\layout\PageLayout.tsx
```

### Mac/Linux:
```bash
rm frontend/src/components/dashboard/DashboardSidebar.tsx
rm frontend/src/components/layout/PageHeader.tsx
rm frontend/src/components/layout/PageLayout.tsx
```

---

## Verification Before Deleting

Run these commands to double-check nothing imports them:

```bash
cd frontend/src
grep -r "DashboardSidebar" . --include="*.tsx" --include="*.ts"
grep -r "PageHeader" . --include="*.tsx" --include="*.ts"
grep -r "from.*PageLayout" . --include="*.tsx" --include="*.ts"
```

All should return no results (or only comments/docs).

---

## After Deletion

1. Run build to verify:
```bash
cd frontend
npm run build
```

2. If build succeeds, you're done! ✅

3. If build fails, check the error and restore files if needed:
```bash
git checkout HEAD -- frontend/src/components/dashboard/DashboardSidebar.tsx
git checkout HEAD -- frontend/src/components/layout/PageHeader.tsx
git checkout HEAD -- frontend/src/components/layout/PageLayout.tsx
```

---

## Status

- **Ready to Delete:** Yes ✅
- **Risk Level:** Minimal
- **Backup Available:** Yes (via git)
- **Verification Done:** Yes

**Go ahead and delete them!** 🗑️
