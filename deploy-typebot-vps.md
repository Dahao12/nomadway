# Typebot Deployment Instructions - NomadWay (VPS SIDE)

**Para Marlon:** Execute estes comandos no seu VPS para configurar Typebot self-hosted

---

## 🚀 EXECUTE ISTO NO SEU VPS

### Passo 1: Conectar ao VPS

```bash
ssh root@SEU_VPS_IP
```

### Passo 2: Atualizar Sistema

```bash
apt update -y && apt upgrade -y
```

### Passo 3: Instalar Docker + Compose

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
apt install docker-compose -y

# Verificar
docker --version
docker-compose --version
```

### Passo 4: Criar Diretório Typebot

```bash
mkdir -p /opt/typebot
cd /opt/typebot
```

### Passo 5: Criar .env com Suas Creds

```bash
nano .env
```

**COLAR ISTO (SUBSTITUIR OS VALORES):**

```env
# Typebot Studio (Frontend)
NEXT_PUBLIC_VIEWER_URL=https://bot.nomadway.app
NEXT_PUBLIC_STUDIO_URL=https://studio.nomadway.app

# Database (POSTGRESQL)
DATABASE_URL=postgresql://typebot:SUA_SENHA_DB_AQUI@typebot-db:5432/typebot
ENCRYPTION_SECRET=SUA_ENCRYPT_SECRET_KEY_AQUI_NO_MINIMO_32_CARACTERES
NEXTAUTH_SECRET=SUA_NEXT_AUTH_SECRET_AQUI_NO_MINIMO_32_CARACTERES
NEXT_PUBLIC_ENCRYPTION_SECRET=SUA_ENCRYPT_SECRET_KEY_AQUI_NO_MINIMO_32_CARACTERES

# SMTP Email (Opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=SUA_SENHA_APP_GMAIL
SMTP_FROM=NomadWay Bot <no-reply@nomadway.com>

# Storage (MinIO S3-compatible)
NEXT_PUBLIC_STORAGE_SERVICE=local-s3
S3_ENDPOINT=http://typebot-minio:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=typebot
S3_REGION=us-east-1
```

**GERAR SENHAS ALEATÓRIAS:**

```bash
# Para DB password
openssl rand -base64 32

# Para encryption secrets (execute 3 vezes para 3 chaves diferentes)
openssl rand -base64 42
```

**SUBSTITUIR NO .ENV:**
- `SUA_SENHA_DB_AQUI` → Senha gerada para DB
- `SUA_ENCRYPT_SECRET_KEY_AQUI_NO_MINIMO_32_CARACTERES` → Chave gerada (dois lugares)
- `SUA_NEXT_AUTH_SECRET_AQUI_NO_MINIMO_32_CARACTERES` → Chave gerada

**Salve e saia (Ctrl+X, Y, Enter)**

### Passo 6: Criar docker-compose.yml

```bash
nano docker-compose.yml
```

**COLAR ISTO TODO:**

```yaml
version: '3.8'

services:
  # Typebot Studio (Frontend)
  studio:
    image: baptisteArno/typebot-studio:latest
    container_name: typebot-studio
    ports:
      - "3001:3000"
    env_file:
      - .env
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
    restart: unless-stopped
    networks:
      - typebot-network

  # Typebot Builder (API)
  builder:
    image: baptisteArno/typebot-builder:latest
    container_name: typebot-builder
    ports:
      - "3000:3000"
    env_file:
      - .env
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
      - POSTGRES_PASSWORD=SUBSTITUIR_AQUI_PELA_SENHA_DB_QUE_VC_GEROU
      - POSTGRES_DB=typebot
    volumes:
      - typebot-db-data:/var/lib/postgresql/data
    restart: unless-stopped
    networks:
      - typebot-network

  # MinIO (S3-compatible storage)
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

**IMPORTANTE: SUBSTITUIR**
- `SUBSTITUIR_AQUI_PELA_SENHA_DB_QUE_VC_GEROU` → A mesma senha que você gerou e colocou no `.env` em DATABASE_URL

**Salve e saia (Ctrl+X, Y, Enter)**

### Passo 7: Criar nginx.conf

```bash
nano nginx.conf
```

**COLAR ISTO:**

```nginx
events {
    worker_connections 1024;
}

http {
    upstream typebot-builder {
        server typebot-builder:3000;
    }

    upstream typebot-studio {
        server typebot-studio:3000;
    }

    upstream typebot-minio {
        server typebot-minio:9001;
    }

    # Builder API (bot.nomadway.app)
    server {
        listen 80;
        server_name bot.nomadway.app;

        location / {
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

**Salve e saia (Ctrl+X, Y, Enter)**

### Passo 8: Criar DNS no Seu DNS Provider

**NECESSÁRIO: Criar 3 subdomínios apontando para SEU_VPS_IP:**

```
bot.nomadway.app        A    SEU_VPS_IP
studio.nomadway.app     A    SEU_VPS_IP
media.nomadway.app      A    SEU_VPS_IP
```

**Subdomínios:**
1. bot.nomadway.app → API/Builder
2. studio.nomadway.app → Studio (UI para criar bots)
3. media.nomadway.app → Storage (imagens)

### Passo 9: (OPCIONAL) Instalar SSL Certificates

```bash
apt install certbot python3-certbot-nginx -y

# Gerar certificados para os 3 domínios
certbot --nginx -d bot.nomadway.app -d studio.nomadway.app -d media.nomadway.app
```

**Responda:**
- Email: seu email
- A (yes) →同意条款
- 2 (No redirect) → Para não conflitar

### Passo 10: Iniciar Typebot

```bash
# Em /opt/typebot
docker-compose up -d

# Verificar status (todos containers devem estar Up)
docker-compose ps

# Verificar logs (se houver erro)
docker-compose logs -f
```

**Deve mostrar algo assim:**
```
typebot-studio    Up    3000/tcp
typebot-builder   Up    3000/tcp
typebot-db        Up    5432/tcp
typebot-minio     Up    9000/tcp
typebot-nginx     Up    80:80/tcp, 443:443/tcp
```

---

## ✅ PRONTO! VERIFICAR

**Acesse:**
- **Typebot Studio:** https://studio.nomadway.app

**Se funcionar:**
1. Criar conta (Google ou Email)
2. Criar novo bot "NomadWay Bot"
3. Usar templates em TYPEBOT-SELF-HOSTED-SETUP.md
4. Publicar bot
5. Copiar Bot ID

**Depois, me mande o Bot ID e eu configuro no site NomadWay!** 🚀

---

## 🔧 TROUBLESHOOTING

**Erro: Containers não iniciam**
```bash
docker-compose logs -f
# Veja qual container falhou
```

**Erro: Não consigo acessar studio.nomadway.app**
```bash
# Verificar DNS com ping
ping studio.nomadway.app

# Deve apontar para SEU_VPS_IP
```

**Erro: Connection timeout**
```bash
# Acessar UFW firewall e abrir portas
ufw allow 80
ufw allow 443
ufw allow 22
```

**Para reiniciar todos containers:**
```bash
docker-compose restart
```

**Para parar tudo:**
```bash
docker-compose down
```

**Para zerar e começar de novo (PERDE DADOS):**
```bash
docker-compose down -v  # Remove volumes (CUIDADO!)
```

---

*Execute estes comandos e me avise quando terminar!*
*Depois vamos criar o bot no Typebot Studio* 💬