# Supabase Production Setup - Visual Guide

## 🎯 Goal
Create a separate production Supabase project and set up your database.

**Time:** 20-30 minutes

---

## 📍 Part 1: Create Production Project

### Step 1: Open Supabase Dashboard

Go to: **https://supabase.com/dashboard**

You'll see your existing projects. Your dev project is:
```
syxquxgynoinzwhwkosa
```

### Step 2: Click "New Project"

Look for a button that says **"New Project"** (usually top right or center)

### Step 3: Fill in the Form

You'll see a form with these fields:

**📝 Project Name:**
```
restaurant-analytics-prod
```
(You can name it anything, but this is clear)

**🔐 Database Password:**

This is important! Generate a strong one:

**Option A - PowerShell (Windows):**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**Option B - Python:**
```bash
python -c "import secrets, string; print(''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32)))"
```

Copy the output and paste it as your database password.

**💾 SAVE THIS PASSWORD!** You'll need it for direct database access.

**🌍 Region:**

Choose the closest to your users:
- **US East (N. Virginia)** - `us-east-1`
- **US West (N. California)** - `us-west-1`
- **Europe (Ireland)** - `eu-west-1`
- **Asia Pacific (Singapore)** - `ap-southeast-1`

**💰 Pricing Plan:**

Select **"Free"** to start. You can upgrade later.

### Step 4: Create Project

Click **"Create new project"**

⏳ **Wait 2-3 minutes** while Supabase sets up your database...

You'll see a progress indicator. When it's done, you'll see your project dashboard.

---

## 📍 Part 2: Get Your API Credentials

### Step 1: Open Settings

In your new project dashboard, look at the **left sidebar**.

Click the **⚙️ gear icon** (Settings)

### Step 2: Go to API Section

In the settings menu, click **"API"**

### Step 3: Find Your Credentials

Scroll down to the section called **"Project API keys"**

You'll see several values. You need these THREE:

#### 1️⃣ Project URL

Looks like:
```
https://abcdefghijklmnop.supabase.co
```

**What to do:**
- Click the copy icon next to it
- Open your `.env.production` file
- Paste it as:
```env
SUPABASE_URL=https://abcdefghijklmnop.supabase.co
```

#### 2️⃣ anon public key

This is a long string starting with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

It's labeled **"anon"** or **"anon public"**

**What to do:**
- Click the copy icon
- In `.env.production`, paste it as:
```env
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 3️⃣ service_role key

Another long string starting with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

It's labeled **"service_role"** and has a warning: ⚠️ "Never expose this key"

**What to do:**
- Click "Reveal" if it's hidden
- Click the copy icon
- In `.env.production`, paste it as:
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### ✅ Checkpoint

Your `.env.production` should now have:
```env
SUPABASE_URL=https://your-new-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📍 Part 3: Run Database Migrations

Now you need to create all your tables in the production database.

### Step 1: Open SQL Editor

In your Supabase dashboard (left sidebar), click **"SQL Editor"**

### Step 2: Create New Query

Click the **"New query"** button (usually top right)

You'll see a blank SQL editor.

### Step 3: Get Migration List

In your terminal, run:
```bash
python list_migrations.py
```

This shows you all migrations in order.

### Step 4: Run Each Migration

For each migration file:

**A. Open the file in your code editor**

Example: Open `database/schema.sql`

**B. Select all and copy** (Ctrl+A, Ctrl+C)

**C. Go back to Supabase SQL Editor**

**D. Paste the SQL** (Ctrl+V)

**E. Click "Run"** (or press Ctrl+Enter)

**F. Wait for success message**

You should see:
```
Success. No rows returned
```
or
```
Success. X rows affected
```

**G. Move to next migration**

Click "New query" and repeat for the next file.

### Migration Order

Run these files in this exact order:

1. `database/schema.sql` - Core tables
2. `database/migrations/002_inventory_foundation.sql`
3. `database/migrations/003_reference_data.sql`
4. `database/migrations/004_fuzzy_matching_setup.sql`
5. `database/migrations/005_unit_conversion_fields.sql`
6. `database/migrations/006_user_preferences.sql`
7. `database/migrations/007_price_analytics_functions.sql`
8. `database/migrations/008_relax_extended_price_constraint.sql`
9. `database/migrations/009_price_tracking_columns.sql`
10. `database/migrations/010_standardize_timestamps.sql`
11. `database/migrations/011_item_price_tracking_FIXED.sql`
12. `database/migrations/012_menu_management_system.sql`
13. `database/migrations/013_menu_item_ingredients.sql`
14. `database/migrations/014_competitor_menu_comparison.sql`
15. `database/migrations/015_transactional_delete.sql`
16. `database/migrations/019_atomic_usage_limits.sql`
17. `database/migrations/020_add_file_hash_column.sql`
18. `database/migrations/021_enable_rls_critical_tables.sql`
19. `database/migrations/022_fix_function_search_paths.sql`

### ⚠️ If You Get Errors

**"relation already exists"**
- The table already exists, skip to next migration

**"permission denied"**
- Make sure you're logged into the correct project
- Check you're using service_role key in your .env

**"syntax error"**
- Make sure you copied the entire file
- Check for any special characters that didn't copy correctly

---

## 📍 Part 4: Verify Tables Were Created

### Step 1: Open Table Editor

In Supabase dashboard (left sidebar), click **"Table Editor"**

### Step 2: Check for Tables

You should see a list of tables including:
- ✅ users
- ✅ subscriptions
- ✅ invoices
- ✅ invoice_items
- ✅ inventory_items
- ✅ restaurant_menus
- ✅ menu_items
- ✅ menu_comparisons

If you see these, your migrations worked! 🎉

---

## 📍 Part 5: Test Connection

### Step 1: Run Verification Script

In your terminal:
```bash
python verify_production_setup.py
```

### Step 2: Check Output

You should see:
```
✓ SUPABASE_URL: OK
✓ SUPABASE_ANON_KEY: OK
✓ SUPABASE_SERVICE_ROLE_KEY: OK
✓ All checks passed!
```

If you see errors, double-check you copied the credentials correctly.

---

## 🎉 Success!

You now have:
- ✅ Separate production Supabase project
- ✅ All database tables created
- ✅ Credentials in `.env.production`
- ✅ Connection verified

## 🚀 Next Steps

1. Generate JWT secret: `python generate_jwt_secret.py`
2. Set up production API keys (Google, SerpAPI, etc.)
3. Run full verification: `python verify_production_setup.py`
4. Deploy your application!

---

## 📚 Quick Reference

**Your Projects:**

| Environment | URL | Purpose |
|-------------|-----|---------|
| Dev | `syxquxgynoinzwhwkosa.supabase.co` | Development & testing |
| Prod | `[your-new-project].supabase.co` | Production data only |

**Important Files:**

| File | Purpose |
|------|---------|
| `.env` | Dev environment (current) |
| `.env.production` | Prod environment (new) |
| `SUPABASE_PRODUCTION_SETUP.md` | Detailed text guide |
| `SUPABASE_VISUAL_GUIDE.md` | This file - visual guide |

---

## ❓ Need Help?

**Can't find SQL Editor?**
- Look in the left sidebar of your Supabase dashboard
- It's between "Table Editor" and "Database"

**Migrations failing?**
- Run them one at a time
- Check for error messages
- Make sure you're in the correct project

**Connection not working?**
- Verify you copied the full keys (they're 200+ characters)
- Check for extra spaces or line breaks
- Make sure you're using the production project URL

---

**Last Updated:** November 3, 2025
