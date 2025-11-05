# Deploy to Digital Ocean + GoDaddy DNS

## What I Need From You

### 1. Production Secrets (Do This First)

Create `.env.production` file with these values:

```env
# === SUPABASE (Create NEW production project) ===
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# === JWT (Generate new secret) ===
JWT_SECRET_KEY=

# === GOOGLE APIs (Production keys) ===
GOOGLE_GEMINI_API_KEY=
GOOGLE_PLACES_API_KEY=

# === EXTERNAL SERVICES (Production keys) ===
SERPAPI_KEY=
OUTSCRAPER_API_KEY=

# === YOUR DOMAIN ===
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

**How to get these:**

1. **Supabase Production:**
   - Go to https://supabase.com/dashboard
   - Click "New Project"
   - Name: "restaurant-iq-prod"
   - Copy URL and keys from Settings → API

2. **JWT Secret:**
   ```bash
   # Run this in PowerShell:
   -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
   ```

3. **API Keys:**
   - Use your existing keys OR create new production keys
   - Set up billing alerts on each service

### 2. Your Domain Name

**What's your GoDaddy domain?** (e.g., `restaurantiq.com`)

I need to know this to:
- Configure CORS
- Set up DNS records
- Configure SSL

### 3. Digital Ocean Account

**Do you have:**
- [ ] Digital Ocean account created?
- [ ] Payment method added?
- [ ] SSH key set up? (optional but recommended)

---

## Deployment Steps (I'll Guide You)

### Step 1: Create Production Supabase Database

1. Go to https://supabase.com/dashboard
2. Create new project
3. Run migrations:
   - Go to SQL Editor
   - Copy/paste each file from `database/migrations/` in order
   - Run them one by one (001, 002, 003, etc.)

### Step 2: Create `.env.production`

Fill in all the values above and save as `.env.production` in your project root.

### Step 3: Choose Deployment Method

**Option A: App Platform (Easiest - Recommended)**
- Cost: ~$12/month
- Auto SSL, auto scaling, managed
- No server management

**Option B: Droplet (Cheaper)**
- Cost: ~$6/month
- You manage the server
- More control

**Which do you prefer?**

---

## Option A: App Platform (Recommended)

### What I Need:
1. Your domain name
2. Confirm `.env.production` is ready
3. Your GitHub repo is pushed

### Steps:
1. Go to Digital Ocean → App Platform
2. Click "Create App"
3. Connect GitHub: `dadbodgeo/restauarant-iq-prod`
4. Select branch: `main`
5. I'll give you the exact environment variables to paste
6. Add Redis component
7. Deploy!

---

## Option B: Droplet

### What I Need:
1. Your domain name
2. Confirm `.env.production` is ready
3. Do you want me to create the setup script?

### Steps:
1. Create Ubuntu 22.04 droplet ($6/month)
2. SSH into it
3. Run deployment script
4. Configure DNS

---

## GoDaddy DNS Setup

Once your Digital Ocean app is running, you'll need to:

1. **Get IP Address from Digital Ocean**
   - App Platform: They give you a URL
   - Droplet: You get an IP address

2. **Update GoDaddy DNS:**
   - Log into GoDaddy
   - Go to your domain → DNS Management
   - Add/Update these records:

   **For App Platform:**
   ```
   Type: CNAME
   Name: @
   Value: [Digital Ocean gives you this]
   TTL: 600
   ```

   **For Droplet:**
   ```
   Type: A
   Name: @
   Value: [Your droplet IP]
   TTL: 600
   
   Type: A
   Name: www
   Value: [Your droplet IP]
   TTL: 600
   ```

---

## What Happens Next

1. **You provide:**
   - Domain name
   - Confirm `.env.production` is ready
   - Choose deployment method (A or B)

2. **I'll create:**
   - Exact deployment commands
   - Environment variable list for Digital Ocean
   - DNS configuration instructions
   - Verification checklist

3. **You deploy:**
   - Follow step-by-step guide
   - Update DNS in GoDaddy
   - Test the site

4. **We verify:**
   - Site loads
   - Auth works
   - Database connected
   - All features working

---

## Quick Checklist

Before we start, make sure you have:

- [ ] GoDaddy domain name (tell me what it is)
- [ ] Digital Ocean account with payment method
- [ ] Production Supabase project created
- [ ] All API keys ready (Google, SerpAPI, Outscraper)
- [ ] `.env.production` file created locally
- [ ] Decided: App Platform or Droplet?

---

## Cost Breakdown

**Minimum (Droplet):**
- Digital Ocean Droplet: $6/month
- Domain (GoDaddy): ~$12/year
- **Total: ~$7/month**

**Recommended (App Platform):**
- Digital Ocean App Platform: $12/month
- Redis: $15/month
- Domain (GoDaddy): ~$12/year
- **Total: ~$28/month**

**API Costs (Usage-Based):**
- Google Gemini: Free tier (60 req/min)
- SerpAPI: $50/month (5,000 searches)
- Outscraper: $30/month (1,000 requests)
- Only pay if you hit limits

---

## Ready to Deploy?

**Tell me:**
1. Your domain name
2. App Platform or Droplet?
3. Is `.env.production` ready?

Then I'll give you the exact commands to run!
