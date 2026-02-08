# Deploy NomadWay para Hostinger - MANUAL
**Status:** ✅ PARCIAL (arquivos principais enviados)
**Próximo passo:** Upload manual via File Manager

---

## 🎯 STATUS ATUAL

**Site respondendo:** ✅ https://nomadway.com.br/ (HTTP 200)
**Arquivos enviados:**
- ✅ index.html
- ✅ logo.png
- ✅ robots.txt
- ✅ sitemap.xml
- ⏳ _next/ (em processamento via FTP)
- ⏳ pt/ (páginas em português)
- ⏳ en/ (páginas em inglês)

---

## ⚠️ PROBLEMA FTP COMANDO-LINHA

FTP via curl (comando-linha) tem limitações:
- ❌ Não cria diretórios automaticamente
- ❌ Upload recursivo complexo
- ❌ Erros com paths longos

---

## 🛠️ SOLUÇÃO: UPLOAD MANUAL

### **Opção 1: File Manager Hostinger (RECOMENDADO)**

1. **Acesse hPanel:** https://hpanel.hostinger.com
2. **Login** com suas credenciais
3. **Hosting** → **Manage** (nomadway.com.br)
4. **File Manager** → **Go to File Manager**
5. **Navegue:** domains/nomadway.com.br/public_html/
6. **DELETE todos arquivos antigos:**
   - components, scripts, prisma, .yarn, etc
   - Manter: index.html, logo.png (se quiser)
7. **Upload:**
   - Click em **Upload**
   - Selecione **/Users/clowd/.openclaw/workspace/nomadway/out/**
   - Upload **TODOS** arquivos e pastas

**Segundos estimados:** 2-3 min (drag & drop)

---

### **Opção 2: FileZilla (FTP Client)**

1. **Baixar FileZilla:** https://filezilla-project.org
2. **Conectar:**
   - Host: 185.245.180.59
   - User: u608840078
   - Pass: 5676484aS@@
   - Porta: 21
3. **Navegar:** domains/nomadway.com.br/public_html/
4. **Delete** tudo antigo
5. **Upload** pasta out/** (drag & drop)

**Segundos estimados:** 2-5 min

---

### **Opção 3: Browser (Chrome) - Direto**

1. **Chrome:** ftp://185.245.180.59
2. **User:** u608840078
3. **Pass:** 5676484aS@@
4. **Navegar:** domains/nomadway.com.br/public_html/
5. **Arrastar arquivos** do Finder

**Segundos estimados:** 3-5 min

---

## 📂 ARQUIVOS PARA UPLOAD

```
/Users/clowd/.openclaw/workspace/nomadway/out/
├── index.html          ✅
├── logo.png            ✅
├── robots.txt          ✅
├── sitemap.xml         ✅
├── _next/              ⏳ (fazer upload)
│   ├── static/
│   │   ├── css/
│   │   ├── chunks/
│   │   └── media/
│   └── ...
├── pt/                 ⏳ (fazer upload)
│   ├── index.html
│   ├── contact/
│   ├── services/
│   └── pricing/
├── en/                 ⏳ (fazer upload)
│   ├── index.html
│   ├── contact/
│   ├── services/
│   └── pricing/
└── favicon.svg
```

---

## ✅ DEPOIS DO UPLOAD

1. **Acesse:** https://nomadway.com.br
2. **Verifique:**
   - Homepage carrega
   - Redirecionamento para /pt ou /en
   - Logo aparece
   - Links funcionam
   - Formulário envia para contato@nomadway.com.br

3. **Teste formulário:** /pt/contact
   - Preencha um teste
   - Envie
   - Verifique email em contato@nomadway.com.br

---

## 🎯 RECOMENDAÇÃO

**File Manager (hPanel)** - Mais simples, arrastar-e-soltar

**FileZilla** - Mais controle, resume de uploads

**Browser FTP** - Mais direto, sem instalar nada

---

**Upload manual é mais rápido e confiável!** 🚀

---

## 🚀 PASSO 1: CONFIGURAÇÃO JÁ FEITA

### ✅ `next.config.js` atualizado:
- ❌ Removido: `basePath: '/nomadway'`
- ❌ Removido: `assetPrefix: '/nomadway'`
- ✅ Pronto para root domain

### ✅ Componentes atualizados:
- Header: `/logo.png`
- Footer: `/logo.png`

### ✅ Build gerado:
- Pasta: `/Users/clowd/.openclaw/workspace/nomadway/out/`
- 14 páginas geradas
- Todos assets prontos

---

## 📤 PASSO 2: UPLOAD VIA FTP

### **Credenciais Hostinger:**
```
FTP Hostname: ftp://nomadway.com.br
FTP IP: 185.245.180.59
FTP Username: u608840078
File Upload Path: public_html/
```

### **Opção A: FileZilla (GUI)**

1. **Abra FileZilla**
2. **Credenciais:**
   - Host: 185.245.180.59
   - Usuario: u608840078
   - Senha: (sua senha Hostinger)
   - Porta: 21
3. **Conectar**
4. **Navegar até: `public_html/`**
5. **Upload conteúdo de:**
   ```
   /Users/clowd/.openclaw/workspace/nomadway/out/*
   ```
6. **Para: `public_html/`** (root folder)
7. **Arrastar TODOS arquivos/folders**

### **Opção B: Cyberduck (Mac)**

1. **Open Connection**
2. **Protocol:** FTP
3. **Server:** ftp://nomadway.com.br
4. **Username:** u608840078
5. **Password:** (sua senha)
6. **Path:** public_html
7. **Conectar → Upload de: `out/*`**

### **Opção C: Command Line (FTP)**

```bash
ftp 185.245.180.59
# Usuario: u608840078
# Senha: (sua senha)

cd public_html
lcd /Users/clowd/.openclaw/workspace/nomadway/out
mput -r *
bye
```

---

## ✅ PASSO 3: VERIFICAÇÃO

### **Após upload, acesse:**
1. **https://nomadway.com.br** (root)
2. **https://nomadway.com.br/pt** (PT)
3. **https://nomadway.com.br/en** (EN)
4. **https://nomadway.com.br/pt/contact** (testar formulário)

### **Verifique:**
- ✅ Logo aparece (/logo.png)
- ✅ Navegação funciona
- ✅ Formulário envia para contato@nomadway.com.br
- ✅ Links funcionam
- ✅ Todos assets carregam (CSS, JS, imagens)

---

## 🔄 PASSO 4: DNS (JÁ CONFIGURADO?)

### **Nameservers atuais:**
```
ns1.dns-parking.com
ns2.dns-parking.com
```

### **Se não funcionar, mudar para Hostinger:**
```
ns1.hostinger.com
ns2.hostinger.com
```

**No painel Hostinger:**
- Domains → nomadway.com.br
- DNS / Nameservers
- Use Hostinger Nameservers

---

## 📝 RESUMO

**O que fazer:**
1. ✅ Código atualizado (basePath removido)
2. ✅ Build gerado (`out/` folder)
3. 📤 Upload via FTP para `public_html/`
4. ✅ Verificar nomadway.com.br

**Conteúdo do `out/` folder:**
```
out/
├── pt/
│   ├── index.html
│   ├── contact/
│   ├── services/
│   └── pricing/
├── en/
│   ├── index.html
│   ├── contact/
│   ├── services/
│   └── pricing/
├── _next/
│   └── static/
│       ├── chunks/
│       └── css/
├── favicon.ico (se criar)
├── logo.png
├── robots.txt
└── sitemap.xml
```

---

## 🎯 RESULTADO FINAL

**URL profissional:** https://nomadway.com.br
**SEO:** Melhor (root domain)
**Performance:** Servidor Brasil
**Email:** contato@nomadway.com.br (já configurado via FormSubmit)

---

**Upload feito? Site funciona?**