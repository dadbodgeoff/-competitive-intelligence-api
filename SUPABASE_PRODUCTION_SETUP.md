# Supabase Production Setup - Complete Guide

## Overview

You need to create a **separate** Supabase project for production. Don't reuse your dev project!

**Time Required:** 20-30 minutes

---

## Part 1: Create Production Project (5 minutes)

### Step 1: Go to Supabase Dashboard
Open: https://supabase.com/dashboard

### Step 2: Create New Project

Click **"New Project"** button (top right)

Fill in:

**Project Name:**
```
restaurant-analytics-prod
```

**Database Password:**
Generate a strong password (save it somewhere secure!):

```powershell
# Run in PowerShell:
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

Copy the output and paste it as your database password.

**Region:**
Choose closest to your users:
- `us-east-1` (US East)
- `us-west-1` (US West)  
- `eu-west-1` (Europe)

**Pricing Plan:**
- Select **"Free"** to start

Click **"Create new project"**

⏳ Wait 2-3 minutes for provisioning...

---

## Part 2: Get Your Credentials (2 minutes)

Once your project is ready:

### Step 1: Open Project Settings
Click the **gear icon (⚙️)** in the left sidebar

### Step 2: Go to API Section
Click **"API"** in the settings menu

### Step 3: Copy These Three Values

You'll see "Project API keys" section. Copy:

**1. Project URL**
```
Example: https://xyzabc123.supabase.co
```

**2. anon public key**
```
Starts with: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**3. service_role key** (⚠️ Keep this secret!)
```
Also starts with: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
(but different from anon key)
```

### Step 4: Update .env.production

Open your `.env.production` file and paste these values:

```env
SUPABASE_URL=https://xyzabc123.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Part 3: Run Database Migrations (15 minutes)

Now you need to create all your database tables in the production project.

### Step 1: Open SQL Editor

In your Supabase dashboard:
1. Click **"SQL Editor"** in the left sidebar
2. Click **"New query"**

### Step 2: Run Migrations in Order

You need to run these migration files in order. For each one:

1. Open the file in your code editor
2. Copy the entire contents
3. Paste into Supabase SQL Editor
4. Click **"Run"** (or press Ctrl+Enter)
5. Check for success message

**Run these in order:**

#### Migration 1: Core Schema
```
File: database/schema.sql
```
This creates your core tables (users, subscriptions, etc.)

#### Migration 2: Inventory Foundation
```
File: database/migrations/002_inventory_foundation.sql
```
Creates inventory tables

#### Migration 3: Reference Data
```
File: database/migrations/003_reference_data.sql
```
Adds reference data (units, categories, etc.)

#### Migration 4: Fuzzy Matching
```
File: database/migrations/004_fuzzy_matching_setup.sql
```
Sets up fuzzy matching for invoice items

#### Migration 5: Unit Conversions
```
File: database/migrations/005_unit_conversion_fields.sql
```
Adds unit conversion fields

#### Migration 6: User Preferences
```
File: database/migrations/006_user_preferences.sql
```
Creates user preferences table

#### Migration 7: Price Analytics Functions
```
File: database/migrations/007_price_analytics_functions.sql
```
Adds price analytics functions

#### Migration 8-11: Price Tracking
```
Files:
- database/migrations/008_relax_extended_price_constraint.sql
- database/migrations/009_price_tracking_columns.sql
- database/migrations/010_standardize_timestamps.sql
- database/migrations/011_item_price_tracking_FIXED.sql
```
Sets up price tracking system

#### Migration 12-13: Menu System
```
Files:
- database/migrations/012_menu_management_system.sql
- database/migrations/013_menu_item_ingredients.sql
```
Creates menu and recipe management

#### Migration 14: Menu Comparison
```
File: database/migrations/014_competitor_menu_comparison.sql
```
Adds competitor menu comparison

#### Migration 15: Transactional Delete
```
File: database/migrations/015_transactional_delete.sql
```
Adds safe deletion functions

#### Migration 19-22: Security & Limits
```
Files:
- database/migrations/019_atomic_usage_limits.sql
- database/migrations/020_add_file_hash_column.sql
- database/migrations/021_enable_rls_critical_tables.sql
- database/migrations/022_fix_function_search_paths.sql
```
Adds usage limits and enables Row Level Security

### Step 3: Verify Tables Were Created

In Supabase dashboard:
1. Click **"Table Editor"** in left sidebar
2. You should see all your tables listed

Key tables to check for:
- `users`
- `subscriptions`
- `invoices`
- `inventory_items`
- `restaurant_menus`
- `menu_items`
- `menu_comparisons`

---

## Part 4: Enable Row Level Security (5 minutes)

This is CRITICAL for production security!

### Step 1: Open SQL Editor

Click **"SQL Editor"** → **"New query"**

### Step 2: Run This SQL

Copy and paste this entire block:

```sql
-- Enable RLS on all user-facing tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'users', 'subscriptions', 'invoices', 'inventory_items',
    'restaurant_menus', 'menu_items', 'menu_comparisons'
);
```

Click **"Run"**

You should see a list of tables with `rowsecurity = true`

---

## Part 5: Test Your Production Database (3 minutes)

### Step 1: Verify Connection

Run this command in your terminal:

```bash
python -c "from dotenv import load_dotenv; load_dotenv('.env.production'); from config.supabase_client import get_supabase_client; client = get_supabase_client(); print('✅ Connected to:', client.supabase_url)"
```

You should see:
```
✅ Connected to: https://xyzabc123.supabase.co
```

### Step 2: Run Verification Script

```bash
python verify_production_setup.py
```

This checks that all your Supabase credentials are correct and different from dev.

---

## Troubleshooting

### "Migration failed: relation already exists"
This means the table already exists. Skip to the next migration.

### "Permission denied"
Make sure you're using the `service_role` key, not the `anon` key.

### "Connection refused"
Double-check your `SUPABASE_URL` is correct (no typos).

### "Invalid API key"
Make sure you copied the full key (they're very long - 200+ characters).

---

## Quick Reference

**Your Dev Supabase:**
```
URL: https://syxquxgynoinzwhwkosa.supabase.co
Purpose: Development and testing
```

**Your Prod Supabase:**
```
URL: https://[your-new-project].supabase.co
Purpose: Production data only
```

**Never mix these!** Always use separate projects.

---

## Next Steps

After completing this setup:

1. ✅ Verify with: `python verify_production_setup.py`
2. ✅ Test connection works
3. ✅ Deploy your application with `.env.production`
4. ✅ Run smoke tests

---

## Need Help?

**Supabase Documentation:**
- https://supabase.com/docs/guides/database

**Common Issues:**
- Can't find SQL Editor? Look in left sidebar
- Migration errors? Run them one at a time
- RLS issues? Check the security guide

---

**Estimated Time:** 20-30 minutes total
**Last Updated:** November 3, 2025
