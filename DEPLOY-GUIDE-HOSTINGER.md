# Deploy NomadWay para Hostinger
**Domínio:** nomadway.com.br
**Hosting:** Hostinger (Node.js compatível)
**Build gerado:** ✅ (14 páginas)

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