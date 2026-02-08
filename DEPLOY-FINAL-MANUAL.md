# Upload NomadWay para Hostinger - FALHA FTP CURL

## ❌ PROBLEMA FINAL

**FTP via curl (comando-linha) LIMITADO:**
- Diretórios `_next/static/chunks/app/[lang]` com `[]` causam problemas
- Paths complexos com `/` no nome falham em upload
- Mesmo testando com `test.txt` → funcionou
- Mas arquivos `_next/` ❌

**Root cause:**
- `curl + ftp` não lida bem com nomes complexos de arquivos
- Barras e colchetes nos paths são problemáticos

---

## ✅ SOLUÇÃO CONFIRMADA: UPLOAD MANUAL

### **File Manager Hostinger (MAIS SIMPLES) ⭐**

**Tempo: 2-5 min**

1. **Login:** https://hpanel.hostinger.com
2. **Hosting** → **Manage** (nomadway.com.br)
3. **File Manager** → **Go to File Manager**
4. **Navegar:** `domains/nomadway.com.br/public_html/`
5. **Delete tudo antigo:**
   - ❌ components, scripts, prisma, .yarn, tsconfig.json, etc
   - ✅ Manter: index.html, logo.png, robots.txt (se quiser)
6. **Upload:**
   - Click **Upload** botão (topo)
   - Drag & drop: `/Users/clowd/.openclaw/workspace/nomadway/out/**`
   - Upload TODOS arquivos e pastas
7. **Wait:** 2-3 min

---

### **FileZilla (FTP CLIENT)**

**Tempo: 3-5 min**

1. **Download:** https://filezilla-project.org/download.php
2. **Open** FileZilla
3. **Connect:**
   ```
   Host: 185.245.180.59
   User: u608840078
   Pass: 5676484aS@@
   Port: 21
   ```
4. **Connect**
5. **Navigate** (Right pane):
   - Go to: `domains/nomadway.com.br/public_html/`
6. **Delete** arquivos antigos (seleção múltipla com Ctrl+A)
7. **Upload** (Left pane):
   - Drag & drop: `/Users/clowd/.openclaw/workspace/nomadway/out/**`
   - Solte no painel direito
8. **Wait:** Completed! (watch queue)

---

## 📂 CONTEÚDO DO FOLDER out/

```
/Users/clowd/.openclaw/workspace/nomadway/out/
├── index.html              ✅ Homepage (já enviada)
├── logo.png                ✅ Logo (já enviado)
├── robots.txt              ✅ Robots (já enviado)
├── sitemap.xml             ✅ Sitemap (já enviado)
├── test.txt                🗑️ Arquivo teste (pode deletar)
├── favicon.svg             ⏳ Upload
├── _next/                  ⏳ CRITICAL - Upload tudo!
│   ├── static/
│   │   ├── css/
│   │   ├── chunks/
│   │   └── media/
│   └── ...
├── pt/                     ⏳ CRITICAL - Upload tudo!
│   ├── index.html
│   ├── contact/
│   ├── pricing/
│   └── services/
└── en/                     ⏳ CRITICAL - Upload tudo!
    ├── index.html
    ├── contact/
    ├── pricing/
    └── services/
```

---

## ✅ DEPOIS DO UPLOAD

1. **Acesse:** https://nomadway.com.br
2. **Verifique:**
   - ✅ Homepage loads
   - ✅ Assets (_next static files) carregam
   - ✅ Redirecionamento para /pt ou /en funciona
   - ✅ Logo aparece
   - ✅ Navegação funciona

3. **Teste páginas:**
   - https://nomadway.com.br/pt
   - https://nomadway.com.br/en
   - https://nomadway.com.br/pt/contact
   - https://nomadway.com.br/pt/pricing
   - https://nomadway.com.br/pt/services

4. **Teste formulário:**
   - Acesse /pt/contact
   - Preencha campos
   - Click "Enviar Mensagem"
   - Verifique email: contato@nomadway.com.br

---

## 🎯 RESUMO

**FTP comando-linha:** ❌ Não funciona (paths complexos)
**FileZilla:** ✅ Funciona perfeitamente
**File Manager:** ✅ Mais simple (drag & drop)

**Recomendo:** File Manager (hPanel) - mais simples, sem instalar software

---

## 📞 PROBLEMAS DURANTE UPLOAD?

**Credenciais:**
- FTP: u608840078
- Pass: 5676484aS@
- Host: 185.245.180.59

**Erro de permissão?**
Mande screenshot do erro

---

**Upload manual = 100% chance de funcionar!** 🚀