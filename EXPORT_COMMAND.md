# Quick Export Command

## Your Connection String

```
postgresql://postgres:[YOUR_PASSWORD]@db.syxquxgynoinzwhwkosa.supabase.co:5432/postgres
```

---

## Option 1: Use the Helper Script (Easiest)

```bash
export_dev_database.bat
```

This will:
1. Check if pg_dump is installed
2. Prompt you for your password
3. Export your complete schema
4. Save to `database/production_schema.sql`

---

## Option 2: Manual Command

### Step 1: Get Your Database Password

1. Go to: https://app.supabase.com/project/syxquxgynoinzwhwkosa
2. Click **Settings** → **Database**
3. Look for your database password
   - If you don't have it, click **"Reset database password"**
   - Save the new password!

### Step 2: Run This Command

Replace `YOUR_ACTUAL_PASSWORD` with your real password:

```bash
pg_dump --schema-only "postgresql://postgres:YOUR_ACTUAL_PASSWORD@db.syxquxgynoinzwhwkosa.supabase.co:5432/postgres" > database/production_schema.sql
```

**Example:**
If your password is `MySecretPass123`, the command would be:
```bash
pg_dump --schema-only "postgresql://postgres:MySecretPass123@db.syxquxgynoinzwhwkosa.supabase.co:5432/postgres" > database/production_schema.sql
```

### Step 3: Verify It Worked

```bash
# Check file was created
dir database\production_schema.sql

# Look at first few lines
type database\production_schema.sql | more
```

You should see SQL like:
```sql
--
-- PostgreSQL database dump
--

CREATE TABLE users (...);
CREATE TABLE subscriptions (...);
```

---

## What This Does

The `--schema-only` flag exports:
- ✅ All tables and columns
- ✅ All indexes
- ✅ All foreign keys
- ✅ All functions and triggers
- ✅ All RLS policies
- ✅ All views and sequences

But **NOT** the data (which is what you want for production).

---

## Troubleshooting

### "pg_dump: command not found"

**Install PostgreSQL:**
1. Download: https://www.postgresql.org/download/windows/
2. Run installer
3. Add to PATH (installer should do this)
4. Restart terminal
5. Try again

**Or use Docker:**
```bash
docker run --rm postgres:15 pg_dump --schema-only "postgresql://postgres:YOUR_PASSWORD@db.syxquxgynoinzwhwkosa.supabase.co:5432/postgres" > database/production_schema.sql
```

### "password authentication failed"

- Double-check your password
- Try resetting it in Supabase dashboard
- Make sure there are no spaces or special characters causing issues

### "could not connect to server"

- Check you're not behind a firewall
- Try using the pooler connection string:
  ```
  postgresql://postgres.syxquxgynoinzwhwkosa:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
  ```

### "connection timed out"

- Your network might be blocking port 5432
- Try the pooler (port 6543) instead
- Check with your IT department if on corporate network

---

## Next Steps

After exporting:

1. ✅ Review the file: `code database/production_schema.sql`
2. ✅ Create production Supabase project
3. ✅ Apply schema to production (copy/paste into SQL Editor)
4. ✅ Verify tables exist
5. ✅ Continue with production setup (JWT, API keys, etc.)

---

## Quick Reference

**Your dev database:**
- Project: `syxquxgynoinzwhwkosa`
- URL: `db.syxquxgynoinzwhwkosa.supabase.co`
- Port: `5432` (direct) or `6543` (pooler)

**Export file:**
- Location: `database/production_schema.sql`
- Contains: Complete schema (no data)
- Size: Typically 50-500 KB depending on your schema

---

**Time Required:** 2-5 minutes
**Last Updated:** November 3, 2025
