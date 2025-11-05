#!/bin/bash
# Digital Ocean Deployment Script
# Run this on your Digital Ocean droplet

set -e  # Exit on error

echo "🚀 Restaurant IQ - Digital Ocean Deployment"
echo "==========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

# 1. Update system
echo -e "${YELLOW}📦 Updating system packages...${NC}"
apt-get update
apt-get upgrade -y

# 2. Install Docker
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}🐳 Installing Docker...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    systemctl enable docker
    systemctl start docker
else
    echo -e "${GREEN}✅ Docker already installed${NC}"
fi

# 3. Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}🐳 Installing Docker Compose...${NC}"
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
else
    echo -e "${GREEN}✅ Docker Compose already installed${NC}"
fi

# 4. Install Nginx
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}🌐 Installing Nginx...${NC}"
    apt-get install -y nginx
    systemctl enable nginx
else
    echo -e "${GREEN}✅ Nginx already installed${NC}"
fi

# 5. Install Certbot (for SSL)
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}🔒 Installing Certbot...${NC}"
    apt-get install -y certbot python3-certbot-nginx
else
    echo -e "${GREEN}✅ Certbot already installed${NC}"
fi

# 6. Create application directory
APP_DIR="/opt/restaurant-iq"
echo -e "${YELLOW}📁 Creating application directory: $APP_DIR${NC}"
mkdir -p $APP_DIR
cd $APP_DIR

# 7. Clone repository (or copy files)
echo -e "${YELLOW}📥 Clone your repository here:${NC}"
echo "   git clone https://github.com/yourusername/restaurant-iq.git ."
echo ""
read -p "Press enter when repository is cloned..."

# 8. Check for .env.production
if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ .env.production not found!${NC}"
    echo "Please create .env.production with your production secrets"
    echo "Template: .env.production.example"
    exit 1
else
    echo -e "${GREEN}✅ .env.production found${NC}"
fi

# 9. Build Docker images
echo -e "${YELLOW}🏗️  Building Docker images...${NC}"
docker-compose -f docker-compose.yml build

# 10. Start services
echo -e "${YELLOW}🚀 Starting services...${NC}"
docker-compose -f docker-compose.yml up -d

# 11. Wait for services to be healthy
echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"
sleep 10

# Check health
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    docker-compose logs api
    exit 1
fi

# 12. Configure Nginx
echo -e "${YELLOW}🌐 Configuring Nginx...${NC}"
read -p "Enter your domain name (e.g., example.com): " DOMAIN

# Copy nginx config
cp nginx.conf /etc/nginx/sites-available/restaurant-iq

# Update domain in config
sed -i "s/yourdomain.com/$DOMAIN/g" /etc/nginx/sites-available/restaurant-iq

# Enable site
ln -sf /etc/nginx/sites-available/restaurant-iq /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx config
nginx -t

# 13. Get SSL certificate
echo -e "${YELLOW}🔒 Setting up SSL certificate...${NC}"
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

# 14. Reload Nginx
systemctl reload nginx

# 15. Configure firewall
echo -e "${YELLOW}🔥 Configuring firewall...${NC}"
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# 16. Set up auto-renewal for SSL
echo -e "${YELLOW}🔄 Setting up SSL auto-renewal...${NC}"
systemctl enable certbot.timer
systemctl start certbot.timer

# 17. Final checks
echo ""
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo "🔍 Running final checks..."
echo ""

# Check services
echo "Docker containers:"
docker-compose ps

echo ""
echo "🌐 Your application should be available at:"
echo "   https://$DOMAIN"
echo ""
echo "📊 Check logs:"
echo "   docker-compose logs -f api"
echo "   tail -f /var/log/nginx/restaurant-iq-error.log"
echo ""
echo "🔄 Restart services:"
echo "   docker-compose restart"
echo ""
echo "🛑 Stop services:"
echo "   docker-compose down"
echo ""
echo -e "${YELLOW}⚠️  Remember to:${NC}"
echo "   1. Update DNS records to point to this server"
echo "   2. Test all critical features"
echo "   3. Set up monitoring/alerts"
echo "   4. Configure backups"
echo ""
