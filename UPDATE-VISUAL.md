# NomadWay - Atualização de Imagens e Visual

**Data:** 2026-02-16
**Status:** ✅ Pronto para Upload

---

## 🎨 O QUE FOI ATUALIZADO

### 1. **Hero Section** (Componente principal)
- ✅ Imagem de fundo do Barcelona (skyline)
- ✅ Imagem principal com nômade digital trabalhando
- ✅ Layout em grid (texto + imagem)
- ✅ Card flutuante com estatísticas
- ✅ Trust badges inline (clientes, rating, sucesso)
- ✅ Animações suaves de entrada

### 2. **Nova Seção: Lifestyle**
- ✅ Grid de 4 imagens de lifestyle:
  - Trabalho remoto em Barcelona
  - Família em Madrid
  - Networking em Valencia
  - Lifestyle Barcelona
- ✅ Labels com localização
- ✅ Efeitos de hover nas imagens
- ✅ Seção de benefícios com checkmarks

### 3. **Paleta de Cores Atualizada**
- Primary (Azul): #1E40AF → #3B82F6
- Cores profissionais e confiáveis (padrão BigTech)

---

## 📁 ARQUIVOS PRONTOS PARA UPLOAD

**Local:** `/Users/clowd/.openclaw/workspace/nomadway-site/out/`

```
out/
├── index.html          (home - redirecionamento)
├── pt/                 (páginas em português)
│   ├── index.html      (home PT)
│   ├── contact/
│   ├── services/
│   ├── pricing/
│   └── ...
├── en/                 (páginas em inglês)
│   ├── index.html      (home EN)
│   └── ...
├── _next/              (CSS, JS, chunks)
│   └── static/
├── logo.png            (logo)
├── favicon.png         (favicon)
├── robots.txt
└── sitemap.xml
```

---

## 🚀 COMO FAZER O UPLOAD

### Opção 1: File Manager Hostinger (Mais Fácil)

1. **Acesse:** https://hpanel.hostinger.com
2. **Login** com suas credenciais
3. **Hosting** → **Manage** (nomadway.com.br)
4. **File Manager** → **Go to File Manager**
5. **Navegue:** `domains/nomadway.com.br/public_html/`
6. **DELETE** todos os arquivos antigos (manter only .htaccess se existir)
7. **Upload** todos os arquivos da pasta `out/`

### Opção 2: FTP (FileZilla)

**Credenciais:**
- Host: `185.245.180.59`
- User: `u608840078`
- Pass: `5676484aS@@`
- Port: `21`

**Passos:**
1. Conecte ao FTP
2. Navegue até `public_html/`
3. Delete arquivos antigos
4. Upload todo o conteúdo de `out/`

---

## ⚠️ NOTA IMPORTANTE SOBRE AS IMAGENS

As imagens atuais estão usando URLs do **Unsplash** (placeholder gratuito):
- Funcionam imediatamente
- São de alta qualidade
- Podem ser substituídas depois

**Para trocar por imagens próprias:**
1. Adicione imagens em `/public/images/`
2. Atualize os src no componente `Hero.tsx` e `LifestyleSection.tsx`
3. Rebuild: `npm run build`
4. Upload novamente

---

## 🖼️ IMAGENS PARA GERAR (USAR O IMAGE_PROMPTS.md)

As imagens do Unsplash funcionam como placeholder. Para imagens profissionais:

1. Acesse `/Users/clowd/.openclaw/workspace/nomadway/IMAGE_PROMPTS.md`
2. Use os prompts no **Midjourney** ou **DALL-E**
3. Substitua as URLs no código

---

## ✅ CHECKLIST PÓS-UPLOAD

- [ ] Acessar https://nomadway.com.br
- [ ] Verificar se a home carrega com imagens
- [ ] Testar navegação PT/EN
- [ ] Verificar seções: Hero, Services, Lifestyle, Testimonials, CTA
- [ ] Testar formulário de contato
- [ ] Verificar mobile responsiveness

---

## 📝 PRÓXIMOS PASSOS (Sugeridos)

1. **Imagens profissionais** - Usar prompts do IMAGE_PROMPTS.md
2. **Logo atualizada** - Se precisar de nova versão
3. **Sistema de agendamento** - Integrar Calendly ou backend próprio
4. **Analytics** - Adicionar Google Analytics / Hotjar
5. **SEO** - Otimizar meta tags e Open Graph

---

**Build completo.** Agora é só fazer upload! 🚀