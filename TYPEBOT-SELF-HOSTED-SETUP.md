# Typebot Self-Hosted Setup - NomadWay

**Versão:** Complete deployment guide
**Data:** 2026-02-12
**Status:** Ready to deploy

---

## 📋 ÍNDICE

1. [VPS Requirements](#1-vps-requirements)
2. [Docker Setup](#2-docker-setup)
3. [Typebot Data Setup](#3-typebot-data-setup)
4. [Typebot Studio Setup](#4-typebot-studio-setup)
5. [Domain Configuration](#5-domain-configuration)
6. [Typebot Bot Creation](#6-typebot-bot-creation)
7. [Embed in NomadWay Website](#7-embed-in-nomadway-website)
8. [Testing & Verification](#8-testing--verification)

---

## 1. VPS Requirements

### Minimum Specs:
- **OS:** Ubuntu 22.04 LTS (recommended)
- **CPU:** 2 cores
- **RAM:** 4GB
- **Storage:** 40GB SSD
- **Bandwidth:** 2TB/month

### Recommended Providers:
- DigitalOcean ($12/mês - Basic Droplet)
- Linode ($10/mês - Nanode 4GB)
- Vultr ($12/mês - 4GB Regular Performance)
- Hetzner ($9/méscal - CX41)

**Note:** Self-hosted Typebot: Unlimited bots, unlimited messages, FULL CONTROL

---

## 2. DOCKER SETUP

### Step 2.1: SSH into VPS

```bash
ssh root@your-vps-ip
```

### Step 2.2: Update System

```bash
apt update -y && apt upgrade -y
```

### Step 2.3: Install Docker & Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose -y

# Verify installation
docker --version
docker-compose --version
```

### Step 2.4: Create Typebot Directory

```bash
mkdir -p /opt/typebot
cd /opt/typebot
```

---

## 3. TYPEBOT DATA SETUP

### Step 3.1: Create .env File

```bash
nano .env
```

**Paste this configuration:**

```env
# Typebot Studio (Frontend)
NEXT_PUBLIC_VIEWER_URL=https://bot.nomadway.app
NEXT_PUBLIC_STUDIO_URL=https://studio.nomadway.app

# Typebot API (Backend)
DATABASE_URL=postgresql://typebot:YourSecurePasswordHere@typebot-db:5432/typebot
ENCRYPTION_SECRET=YourSuperSecretEncryptionKeyAtLeast32CharactersLong
NEXTAUTH_SECRET=YourNextAuthSecretAtLeast32CharactersLong
NEXT_PUBLIC_ENCRYPTION_SECRET=YourSuperSecretEncryptionKeyAtLeast32CharactersLong

# Google OAuth (Optional - for easy login)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# SMTP Email Configuration (Optional - for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=NomoadWay Bot <no-reply@nomadway.com>

# Storage (Local filesystem - default)
NEXT_PUBLIC_STORAGE_SERVICE=local-s3
S3_ENDPOINT=http://typebot-minio:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=typebot
S3_REGION=us-east-1
```

### Step 3.2: IMPORTANT: Generate Secure Passwords

```bash
# Generate random encryption secret (minimum 32 chars)
openssl rand -base64 42

# Generate database password
openssl rand -base64 32

# Generate NextAuth secret
openssl rand -base64 42
```

**Replace in .env:**
- `YourSecurePasswordHere` → Generated DB password
- `YourSuperSecretEncryptionKeyAtLeast32CharactersLong` → Generated encryption secret
- `YourNextAuthSecretAtLeast32CharactersLong` → Generated NextAuth secret

---

## 4. TYPEBOT STUDIO SETUP

### Step 4.1: Create docker-compose.yml

```bash
nano docker-compose.yml
```

**Paste this configuration:**

```yaml
version: '3.8'

services:
  # Typebot Studio (Frontend)
  studio:
    image: baptisteArno/typebot-studio:latest
    container_name: typebot-studio
    ports:
      - "3001:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - ENCRYPTION_SECRET=${ENCRYPTION_SECRET}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=https://studio.nomadway.app
      - NEXT_PUBLIC_VIEWER_URL=${NEXT_PUBLIC_VIEWER_URL}
      - NEXT_PUBLIC_STUDIO_URL=${NEXT_PUBLIC_STUDIO_URL}
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_PORT=${SMTP_PORT}
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASSWORD=${SMTP_PASSWORD}
      - SMTP_FROM=${SMTP_FROM}
      - NEXT_PUBLIC_STORAGE_SERVICE=${NEXT_PUBLIC_STORAGE_SERVICE}
      - S3_ENDPOINT=${S3_ENDPOINT}
      - S3_ACCESS_KEY=${S3_ACCESS_KEY}
      - S3_SECRET_KEY=${S3_SECRET_KEY}
      - S3_BUCKET=${S3_BUCKET}
      - S3_REGION=${S3_REGION}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
    restart: unless-stopped
    networks:
      - typebot-network

  # Typebot Builder (API)
  builder:
    image: baptisteArno/typebot-builder:latest
    container_name: typebot-builder
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - ENCRYPTION_SECRET=${ENCRYPTION_SECRET}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=https://bot.nomadway.app
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_PORT=${SMTP_PORT}
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASSWORD=${SMTP_PASSWORD}
      - SMTP_FROM=${SMTP_FROM}
      - NEXT_PUBLIC_STORAGE_SERVICE=${NEXT_PUBLIC_STORAGE_SERVICE}
      - S3_ENDPOINT=${S3_ENDPOINT}
      - S3_ACCESS_KEY=${S3_ACCESS_KEY}
      - S3_SECRET_KEY=${S3_SECRET_KEY}
      - S3_BUCKET=${S3_BUCKET}
      - S3_REGION=${S3_REGION}
    restart: unless-stopped
    networks:
      - typebot-network

  # PostgreSQL Database
  typebot-db:
    image: postgres:15-alpine
    container_name: typebot-db
    environment:
      - POSTGRES_USER=typebot
      - POSTGRES_PASSWORD=YourSecurePasswordHere
      - POSTGRES_DB=typebot
    volumes:
      - typebot-db-data:/var/lib/postgresql/data
    restart: unless-stopped
    networks:
      - Typebot-network

  # MinIO (S3-compatible storage for images)
  typebot-minio:
    image: minio/minio:latest
    container_name: typebot-minio
    command: server /data --console-address ":9001"
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      - MINIO_ROOT_USER=${S3_ACCESS_KEY}
      - MINIO_ROOT_PASSWORD=${S3_SECRET_KEY}
    volumes:
      - typebot-minio-data:/data
    restart: unless-stopped
    networks:
      - typebot-network

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: typebot-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - studio
      - builder
    restart: unless-stopped
    networks:
      - typebot-network

volumes:
  typebot-db-data:
  typebot-minio-data:

networks:
  typebot-network:
    driver: bridge
```

### Step 4.2: Create Nginx Configuration

```bash
touch nginx.conf
nano nginx.conf
```

**Paste this configuration:**

```nginx
events {
    worker_connections 1024;
}

http {
    # Typebot Builder API
    upstream typebot-builder {
        server typebot-builder:3000;
    }

    # Typebot Studio
    upstream typebot-studio {
        server typebot-studio:3000;
    }

    # MinIO Console
    upstream typebot-minio {
        server typebot-minio:9001;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    # Builder API (bot.nomadway.app)
    server {
        listen 80;
        server_name bot.nomadway.app;

        location / {
            limit_req zone=api burst=20 nodelay;

            proxy_pass http://typebot-builder;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }

    # Typebot Studio (studio.nomadway.app)
    server {
        listen 80;
        server_name studio.nomadway.app;

        location / {
            proxy_pass http://typebot-studio;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }

    # MinIO Console (media.nomadway.app)
    server {
        listen 80;
        server_name media.nomadway.app;

        location / {
            proxy_pass http://typebot-minio;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

---

## 5. DOMAIN CONFIGURATION

### Step 5.1: Point Domains to VPS IP

**These 3 domains required:**

1. **bot.nomadway.app** → Typebot API/Builder
2. **studio.nomadway.app** → Typebot Studio (UI)
3. **media.nomadway.app** → MinIO Storage (images)

**DNS Records (A / CNAME):**

```
bot.nomadway.app        A    YOUR_VPS_IP
studio.nomadway.app     A    YOUR_VPS_IP
media.nomadway.app      A    YOUR_VPS_IP
```

### Step 5.2: SSL Certificate (Let's Encrypt - Optional but Recommended)

```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Generate SSL certificates (all 3 domains)
certbot --nginx -d bot.nomadway.app -d studio.nomadway.app -d media.nomadway.app

# Auto-renew SSL (certbot setup automatically)
```

**If SSL configured, update nginx.conf:**
- Change `listen 80;` to `listen 443 ssl;`
- Add SSL certificate paths (Certbot updates automatically)

---

## 6. TYPEBOT BOT CREATION

### Step 6.1: Launch Typebot

```bash
# In /opt/typebot directory
cd /opt/typebot

# Start all containers
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Step 6.2: Access Typebot Studio

**URL:** https://studio.nomadway.app

**First Time Setup:**
1. Create account (Google OAuth or Email)
2. Verify email (if using email signup)
3. Create workspace: "NomadWay"

### Step 6.3: Create NomadWay Bot

**Dashboard → Create New Typebot**

```yaml
Bot Name: NomadWay AI
Description: AI chatbot for NomadWay digital nomad community
```

### Step 6.4: Bot Flow Design (7 Blocks)

**BLOCK 1 - WELCOME**
```
Group start: Welcome

Typebot Display:
"👋 Hey! Welcome to NomadWay 💬

I'm here to help you explore our community of digital nomads,
find events, connect with like-minded people, and more!

Let's get started. What's your name?"

Input:
Variable: {userName}
Placeholder: "Your name..."
Required: Yes
```

**BLOCK 2 - PROFILE SELECTION**
```
Display Options:

1️⃣ Digital Nomad
I work remotely and travel
currently looking for connections

2️⃣ Remote Worker
I work from home, interested in
the nomad lifestyle

3️⃣ Business/Company
I'm a business owner or represent
a company interested in partnerships

4️⃣ Event Organiser
I organize events for nomads and
remote workers

Choose: [1] [2] [3] [4] (Button options)

Save to: {userProfile}
```

**BLOCK 3A - DIGITAL NOMAD FLOW**
```
Conditional: {userProfile} == "1"

Display:
"Perfect, {{userName}}! 🌍

As a digital nomad, NomadWay can help you:

✅ Connect with like-minded nomads worldwide
✅ Join local events and meetups
✅ Find co-working spaces
✅ Discover nomad-friendly destinations
✅ Build your professional network

What interests you most?"

Options:
• Join Community
• Find Events
• Get Free App
• Ask FAQ

Link to: BLOCK 4 (based on selection)
```

**BLOCK 3B - REMOTE WORKER FLOW**
```
Conditional: {userProfile} = "2"

Display:
"Hey {{userName}}! 💡

As a remote worker, NomadWay can help you:

✅ Learn about the digital nomad lifestyle
✅ Prepare to become nomad
✅ Find resources and guides
✅ Connect with experienced nomads

What would you like to explore?"

Options:
• Get Started Guide
• Join Community
• Read Blog
• Ask FAQ
```

**BLOCK 3C - BUSINESS FLOW**
```
Conditional: {userProfile} = "3"

Display:
"Hi {{userName}}! 💼

NomadWay is excited about partnerships with businesses!

Current partnership opportunities:

🎯 Festivals:
Nomad Summit, Alicante NomadFest, etc.

🏢 Coworkings
Colab spaces worldwide

🏠 Colivings
Extended-stay accommodations

**Services:**
Travel insurance, SIM cards, etc.

Next step:
→ Email us for collaboration: partners@nomadway.com

Or continue exploring:

Options:
• View Partners
• Get Partnership Deck
• Ask FAQ
```

**BLOCK 3D - EVENT ORGANISER FLOW**
```
Conditional: {userProfile} = "4"

Display:
"Hi {{userName}}! 🎪

Event organisers love NomadWay!

We can help you:

✅ Promote your event to nomads
✅ Connect with attendees
✅ Find sponsorship opportunities
✅ Share best practices

Next steps:
→ NomadWay community: Join now
→ Feature your event: Email us

What would you like?

Options:
• Feature my event
• List upcoming events
• Join organiser community
• Ask FAQ
```

**BLOCK 4 - FEATURE EXPLORATION**

**Flow 4A: Join Community**
```
Display:
"📱 Join the NomadWay Community!

🌍 Network with 2K+ nomads across 40+ countries
🎪 Create and join local events
💬 Join location-based chat groups
🤝 Collaborate on projects

Download now:

📲 App Store: https://apps.apple.com/app/nomadway
📲 Play Store: https://play.google.com/store/apps/details?id=nomadway.app

Or join our WhatsApp Premium Community:
→ Learn more: https://nomadway.com/pricing

Already joined? Great!

What's next?

Options:
• Explore Features
• Get Help
• Ask FAQ"
```

**Flow 4B: Find Events**
```
Display:
"🎪 Upcoming NomadWay Events!

Upcoming festivals and meetups:

🇪🇸 Alicante Nomad Summit (Apr 2026)
🇪🇪 Athens NomadFest (May 2026)
🇪🇸 Turkey NomadFest (Jun 2026)
🇱🇻 Nomads in Paradise (Jul 2026)

Create your own event:
→ Use the NomadWay app
→ Set location and details
→ Invite nomads in your area

Want to?

Options:
• View All Events
• Create Event
• Ask FAQ"
```

**Flow 4C: Get Free App**
```
Display:
"📱 Get NomadWay - FREE!

Start connecting today:

🎯 Features:
- Location-based matching
- Event creation
- Chat groups
- Profile and sharing
- 2K+ active members

📲 Download now:
- App Store: https://apps.apple.com/app/nomadway
- Play Store: https://play.google.com/store/apps/details?id=nomadway.app

Already downloaded?

Options:
• Log in now
• Ask FAQ
```

**BLOCK 5 - FAQ**
```
Display:
"❓ Frequently Asked Questions

Q: Is NomadWay free?
Yes! Download and connect for free.
Premium memberships coming soon for exclusive features.

Q: How do I join events?
Create a free account → Navigate to Events → Tap Join Event

Q: Can I create my own event?
Yes! Use the app to create events and invite nomads.

Q: Is NomadWay available in my city?
NomadWay is active in 40+ countries worldwide!

Learn more:
→ Full FAQ → https://nomadway.com/faq

Ready to continue?

Options:
• Return to Main Menu
• Explore Features
• Join Community"
```

**BLOCK 6 - LEAD CAPTURE**
```
Display:
"✨ Want updates from NomadWay?

We'll inform you of:
• New features, events
• Community highlights
• Partnership opportunities"

Input:
Variable: {userEmail}
Placeholder: "your@email.com"
Type: Email

Display on save:
"Thank you, {{userName}}! 🎉

We'll send updates to: {{userEmail}}

Is there anything else you'd like to explore?

Options:
• Explore Features
• Join Community
• Ask FAQ"
```

**BLOCK 7 - FINAL CTA**
```
Display:
"🚀 Ready to start your NomadWay journey?

Steps:
1. Download app (App Store / Play Store)
2. Create free account
3. Set up your profile
4. Start connecting!

Need more info?
→ Website: https://nomadway.com
→ Blog: https://nomadway.com/blog
→ Support: contato@nomadway.com.br

Thanks for chatting, {{userName}}! 🌍

Have an amazing nomad journey ahead! ✈️

Chat with us again:
📱 WhatsApp: +34610243061
📧 Email: contato@nomadway.com.br"
```

### Step 6.5: Save & Publish Bot

1. Click "Publish" in Typebot Studio
2. Copy "Public ID" from embed code
3. Example ID: `nomadway-bot-abc123xyz`

---

## 7. EMBED IN NOMADWAY WEBSITE

### Step 7.1: Add Typebot to NomadWay Project

**File:** `/Users/clowd/.openclaw/workspace/nomadway/src/app/[lang]/layout.tsx`

**Add this script before closing </body>:**

```tsx
<script type="module" src="https://bot.nomadway.app/api/v1/typebots/nomadway-bot/public/iframe"></script>
<script type="module">
  import Typebot from 'https://bot.nomadway.app/api/v1/typebots/nomadway-bot/public/iframe';

  Typebot.init({
    typebot: 'nomadway-bot',
    apiHost: 'https://bot.nomadway.app',
    theme: {
      button: {
        backgroundColor: '#FF6B35',
        customIcon: 'https://raw.githubusercontent.com/baptisteArno/typebot.io/main/docs/assets/icon.svg',
        size: 'large',
      },
      chatWindow: {
        welcomeMessage: '',
        backgroundColor: '#1a1a2e',
        defaultOpeningMessage: {
          enabled: false,
        },
      },
    },
  });
</script>
```

### Step 7.2: Create Typebot Embed Component (Optional - Better Structure)

**File:** `/Users/clowd/.openclaw/workspace/nomadway/src/components/TypebotEmbed.tsx`

```tsx
'use client'

import { useEffect } from 'react'

export default function TypebotEmbed() {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://bot.nomadway.app/api/v1/typebots/nomadway-bot/public/iframe'
    script.type = 'module'
    document.body.appendChild(script)

    // Cleanup
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  return null // Component renders nothing (self-initializing)
}
```

### Step 7.3: Add Component to Layout

**File:** `/Users/clowd/.openclaw/workspace/nomadway/src/app/[lang]/layout.tsx`

```tsx
import TypebotEmbed from '@/components/TypebotEmbed'

// ... existing code ...

return (
  <html lang={locale}>
    <head>
      {/* ... existing head tags ... */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.Typebot = {
              init: ({ typebot, apiHost, theme }) => {
                // Typebot init logic
              }
            }
          `
        }}
      />
    </head>
    <body>
      {children}
      <TypebotEmbed />
    </body>
  </html>
)
```

### Step 7.4: Add Typebot Script to <head>

**File:** `/Users/clowd/.openclaw/workspace/nomadway/src/app/[lang]/layout.tsx`

```tsx
// Add this inside <head>
<script
  dangerouslySetInnerHTML={{
    __html: `
      window.TypebotInit = function() {
        if (window.Typebot) {
          Typebot.init({
            typebot: 'nomadway-bot',
            apiHost: 'https://bot.nomadway.app',
            theme: {
              button: {
                backgroundColor: '#FF6B35',
                size: 'large',
              },
              chatWindow: {
                welcomeMessage: '',
                backgroundColor: '#1a1a2e',
              },
            },
          })
        }
      }

      window.addEventListener('load', window.TypebotInit)
    `
  }}
/>
```

---

## 8. TESTING & VERIFICATION

### Test Checklist:

**Typebot Setup:**
- [ ] VPS accessible via SSH
- [ ] Docker containers running: `docker-compose ps`
- [ ] All 3 domains resolve to VPS IP
- [ ] https://studio.nomadway.app accessible
- [ ] https://bot.nomadway.app accessible
- [ ] https://media.nomadway.app accessible

**Typebot Bot:**
- [ ] Bot created in Typebot Studio
- [ ] 7 flows configured correctly
- [ ] Bot published successfully
- [ ] Public ID copied: `nomadway-bot-xxx`

**Website Integration:**
- [ ] TypebotEmbed component created
- [ ] Added to layout.tsx
- [ ] Script added to <head>
- [ ] Chatbot button appears on nomadway.com.br
- [ ] Bot flows work correctly
- [ ] Mobile responsive

**Functional Testing:**
- [ ] Welcome flow works → Name input
- [ ] Profile selection works → Digital Nomad/Remote/Business/Event
- [ ] Category flows work → 4 categories navigate correctly
- [ ] Join Community works → Links to App Store/Play Store
- [ ] Find Events works → Shows upcoming events
- [ ] Get Free App works → Links to download
- [ ] FAQ works → Answers questions
- [ ] Lead capture works → Email input
- [ ] Final CTA works → Thank you message

**UX Testing:**
- [ ] Chatbot appears on desktop (bottom-right)
- [ ] Chatbot appears on mobile (bottom-right)
- [ ] Button color: #FF6B35 (primary brand color)
- [ ] Chat window background: #1a1a2e (dark theme)
- [ ] Font size readable on all devices
- [ ] All links work correctly
- [ ] Smooth transitions between flows

---

## 9. DEPLOYMENT STEPS SUMMARY

### VPS Side (Marlon's VPS):

```bash
# 1. SSH into VPS
ssh root@vps-ip

# 2. Update system
apt update && apt upgrade -y

# 3. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 4. Create Typebot directory
mkdir -p /opt/typebot
cd /opt/typebot

# 5. Create .env file (paste configuration)
echo 'DATABASE_URL=...' > .env
# ... all .env variables

# 6. Create docker-compose.yml (paste YAML)
echo '...' > docker-compose.yml

# 7. Create nginx.conf (paste nginx config)
echo '...' > nginx.conf

# 8. Generate SSL certificates
apt install certbot python3-certbot-nginx -y
certbot --nginx -d bot.nomadway.app -d studio.nomadway.app -d media.nomadway.app

# 9. Start Typebot
docker-compose up -d

# 10. Verify
docker-compose ps
docker-compose logs -f
```

### Domain Configuration:

**DNS Records:**
```
bot.nomadway.app        A    VPS_IP
studio.nomadway.app     A    VPS_IP
media.nomadway.app      A    VPS_IP
```

### Bot Creation (Typebot Studio):

1. Access: https://studio.nomadway.app
2. Create account/verify
3. Create new typebot: "NomadWay Bot"
4. Design 7 flows (use templates above)
5. Publish bot
6. Copy public ID

### Website Integration:

```bash
# On local machine
cd /Users/clowd/.openclaw/workspace/nomadway

# Add TypebotEmbed component
nano src/components/TypebotEmbed.tsx
# ... paste component code

# Update layout.tsx
nano src/app/[lang]/layout.tsx
# ... add component + script

# Commit & push
git add -A
git commit -m "feat: Add Typebot self-hosted chatbot integration"
git push origin main
```

---

## 10. MONITORING & MAINTENANCE

### Monitor VPS:

```bash
# Check Docker containers
docker-compose ps

# View logs
docker-compose logs -f

# Restart specific container
docker-compose restart builder

# Update Typebot to latest
docker-compose pull
docker-compose up -d
```

### Backup Database:

```bash
# Backup PostgreSQL
docker exec typebot-db pg_dump -U typebot typebot > backup-$(date +%Y%m%d).sql

# Restore
docker exec -i typebot-db psql -U typebot typebot < backup-20260212.sql
```

### Update Typebot:

```bash
# Pull latest images
cd /opt/typebot
docker-compose pull

# Recreate containers
docker-compose up -d --force-recreate
```

---

## 11. TROUBLESHOOTING

### Common Issues:

**Issue:** Can't access Typebot Studio
**Solution:** Check VPS firewall, verify DNS propagation, check Nginx logs

**Issue:** Bot not loading on website
**Solution:** Check console errors, verify bot ID, check script loading

**Issue:** Docker containers not starting
**Solution:** Check .env environment variables, verify Docker logs

**Issue:** SSL certificate not generating
**Solution:** Verify DNS records point to correct IP, wait for DNS propagation

---

## 12. COST ESTIMATION

### Monthly Costs:

**VPS:** $12/mo (DigitalOcean Basic)
**Domain:** Already owned (nomadway.app)
**SSL:** FREE (Let's Encrypt)

**Total Monthly:** ~$12/month

**Benefits:**
- Unlimited bots
- Unlimited messages
- Full control
- No typebot.io cloud costs
- Custom branding

---

## 13. NEXT STEPS

1. **Deploy Typebot on VPS** (∼30 min)
2. **Configure DNS** (∼5 min)
3. **Generate SSL** (∼5 min)
4. **Create Bot Flows** (∼1 hour)
5. **Embed in Website** (∼15 min)
6. **Test All Flows** (∼30 min)

**Total Time:** ~2 hours

---

*Last Updated: 2026-02-12*
*Status: Ready to deploy - Self-hosted Typebot for NomadWay*
*Documentation: Complete deployment guide + bot flows*

---

**Quick Reference:**
- Typebot Studio: https://studio.nomadway.app
- Typebot API: https://bot.nomadway.app
- MinIO Console: https://media.nomadway.app
- Bot Public ID: (to be set after creation)

**Questions?**
- Docker setup help: Check logs
- Bot flow design: Use templates
- Website integration: Copy embed code