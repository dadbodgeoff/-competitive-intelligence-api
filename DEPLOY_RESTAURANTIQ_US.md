# Deploy restaurantiq.us to Digital Ocean

## Your Setup
- **Domain:** restaurantiq.us (GoDaddy)
- **Hosting:** Digital Ocean Droplet
- **Database:** Supabase (already configured)
- **Deployment:** Docker Compose (production env ready)

---

## Step 1: Create Digital Ocean Droplet

1. Go to https://cloud.digitalocean.com/droplets
2. Click "Create Droplet"
3. Choose:
   - **Image:** Ubuntu 22.04 LTS
   - **Plan:** Basic ($6/month or $12/month recommended)
   - **CPU:** Regular (1-2 GB RAM minimum)
   - **Datacenter:** Choose closest to your users
4. **Authentication:** 
   - Add SSH key (recommended) OR
   - Use password
5. **Hostname:** restaurantiq-prod
6. Click "Create Droplet"
7. **Save the IP address** (e.g., 123.45.67.89)

---

## Step 2: SSH into Your Droplet

```bash
# If using SSH key:
ssh root@YOUR_DROPLET_IP

# If using password:
# It will prompt you for the password Digital Ocean emailed you
ssh root@YOUR_DROPLET_IP
```

---

## Step 3: Install Docker on Droplet

Run these commands on your droplet:

```bash
# Update system
apt-get update
apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

---

## Step 4: Clone Your Repo on Droplet

```bash
# Install git if needed
apt-get install -y git

# Clone your repo
git clone https://github.com/dadbodgeo/restauarant-iq-prod.git /opt/restaurant-iq
cd /opt/restaurant-iq
```

---

## Step 5: Upload Your .env.production

**On your local machine**, copy your `.env.production` to the droplet:

```bash
# From your local machine (PowerShell):
scp .env.production root@YOUR_DROPLET_IP:/opt/restaurant-iq/.env.production
```

**OR** create it manually on the droplet:

```bash
# On droplet:
nano /opt/restaurant-iq/.env.production

# Paste your production environment variables
# Save: Ctrl+X, then Y, then Enter
```

---

## Step 6: Update ALLOWED_ORIGINS

Make sure your `.env.production` has:

```env
ALLOWED_ORIGINS=https://restaurantiq.us,https://www.restaurantiq.us
```

---

## Step 7: Build and Start Docker

```bash
cd /opt/restaurant-iq

# Build the images
docker-compose build

# Start services
docker-compose up -d

# Check if running
docker-compose ps

# Check logs
docker-compose logs -f api
```

---

## Step 8: Install and Configure Nginx

```bash
# Install nginx
apt-get install -y nginx

# Copy your nginx config
cp nginx.conf /etc/nginx/sites-available/restaurantiq

# Update domain in config
sed -i 's/yourdomain.com/restaurantiq.us/g' /etc/nginx/sites-available/restaurantiq

# Enable site
ln -s /etc/nginx/sites-available/restaurantiq /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default

# Test config
nginx -t

# Restart nginx
systemctl restart nginx
```

---

## Step 9: Set Up SSL (Let's Encrypt)

```bash
# Install certbot
apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d restaurantiq.us -d www.restaurantiq.us

# Follow prompts:
# - Enter email address
# - Agree to terms
# - Choose redirect HTTP to HTTPS (option 2)

# Test auto-renewal
certbot renew --dry-run
```

---

## Step 10: Configure Firewall

```bash
# Allow SSH, HTTP, HTTPS
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw --force enable

# Check status
ufw status
```

---

## Step 11: Update GoDaddy DNS

1. Go to https://dcc.godaddy.com/manage/restaurantiq.us/dns
2. Click "DNS" → "Manage Zones"
3. **Add/Update A Records:**

   ```
   Type: A
   Name: @
   Value: YOUR_DROPLET_IP
   TTL: 600 (10 minutes)
   ```

   ```
   Type: A
   Name: www
   Value: YOUR_DROPLET_IP
   TTL: 600
   ```

4. Save changes
5. **Wait 5-30 minutes** for DNS propagation

---

## Step 12: Verify Deployment

```bash
# Check if services are running
docker-compose ps

# Check API health
curl http://localhost:8000/health

# Check logs
docker-compose logs api
docker-compose logs redis
```

**From your browser:**
- Visit: https://restaurantiq.us
- Should see your landing page
- Try registering a user
- Try logging in

---

## Step 13: Run Database Migrations

Your Supabase database needs the migrations:

1. Go to https://supabase.com/dashboard
2. Open your production project
3. Go to SQL Editor
4. Run each migration file from `database/migrations/` in order:
   - 001, 002, 003, etc.
   - Copy/paste and execute each one

---

## Troubleshooting

### Site not loading?
```bash
# Check nginx
systemctl status nginx
nginx -t

# Check Docker
docker-compose ps
docker-compose logs api
```

### Database connection failed?
```bash
# Check .env.production has correct Supabase credentials
cat .env.production | grep SUPABASE
```

### SSL not working?
```bash
# Check certbot
certbot certificates

# Renew manually
certbot renew
```

### Need to restart?
```bash
cd /opt/restaurant-iq
docker-compose restart
systemctl restart nginx
```

---

## Updating Your App

When you push changes to GitHub:

```bash
# SSH into droplet
ssh root@YOUR_DROPLET_IP

# Pull latest code
cd /opt/restaurant-iq
git pull origin main

# Rebuild and restart
docker-compose build
docker-compose up -d

# Check logs
docker-compose logs -f api
```

---

## Monitoring

```bash
# View logs
docker-compose logs -f

# Check resource usage
docker stats

# Check disk space
df -h

# Check memory
free -h
```

---

## Backup Strategy

**Database:** Supabase handles backups automatically

**Code:** Already on GitHub

**Environment Variables:** Keep `.env.production` backed up securely (NOT in git!)

---

## Cost Breakdown

- Digital Ocean Droplet: $6-12/month
- Domain (restaurantiq.us): Already paid
- Supabase: Free tier (upgrade if needed)
- **Total: $6-12/month**

---

## Quick Commands Reference

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f api

# Update from GitHub
git pull origin main && docker-compose build && docker-compose up -d

# Check nginx
systemctl status nginx

# Restart nginx
systemctl restart nginx
```

---

## You're Live! 🚀

Once DNS propagates (5-30 minutes), your app will be live at:
- https://restaurantiq.us
- https://www.restaurantiq.us

Test everything:
- [ ] Landing page loads
- [ ] User registration works
- [ ] Login works
- [ ] Invoice upload works
- [ ] Menu parsing works
- [ ] Review analysis works

---

**Need help?** Check logs first: `docker-compose logs -f api`
