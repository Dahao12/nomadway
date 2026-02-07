# 🚀 Guia Rápido de Deploy - NomadWay

## ⚡ Deploy na Vercel (Recomendado - GRÁTIS)

### Opção A: Deploy via Interface Web (Mais Fácil)

1. **Criar conta na Vercel** (se ainda não tem):
   - Acesse: https://vercel.com/signup
   - Faça login com GitHub/GitLab/Bitbucket

2. **Fazer upload do projeto**:
   
   **Método 1: Via GitHub (recomendado)**
   ```bash
   # No terminal, dentro da pasta do projeto:
   git init
   git add .
   git commit -m "Initial commit - NomadWay website"
   git branch -M main
   
   # Crie um repositório no GitHub e depois:
   git remote add origin https://github.com/SEU-USUARIO/nomadway.git
   git push -u origin main
   ```
   
   - Vá para https://vercel.com/new
   - Clique em "Import Git Repository"
   - Selecione seu repositório "nomadway"
   - Clique em "Deploy"
   
   **Método 2: Via Vercel CLI**
   ```bash
   # Instalar Vercel CLI globalmente
   npm install -g vercel
   
   # Fazer login
   vercel login
   
   # Deploy (dentro da pasta do projeto)
   vercel
   
   # Para produção:
   vercel --prod
   ```

3. **Aguarde** (2-3 minutos):
   - A Vercel vai instalar dependências
   - Fazer build do projeto
   - Deploy automático

4. **Pronto!** 🎉
   - Você receberá uma URL tipo: `nomadway.vercel.app`
   - O site estará no ar!

---

## 🌐 Configurar Domínio Próprio (Opcional)

### Se você já tem um domínio (ex: nomadway.com):

1. **Na Vercel**:
   - Vá em Settings → Domains
   - Adicione seu domínio: `nomadway.com`
   - Copie os registros DNS fornecidos

2. **No seu provedor de domínio** (GoDaddy, Namecheap, Registro.br, etc):
   - Adicione os registros DNS:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

3. **Aguarde propagação** (até 48h, geralmente 10-30 minutos)

4. **SSL automático**: A Vercel configura HTTPS automaticamente

---

## 📋 Checklist Pré-Deploy

Antes de fazer deploy, verifique:

- [ ] ✅ Todos os textos revisados (PT e EN)
- [ ] ✅ Logo carregando corretamente
- [ ] ✅ Links do WhatsApp e email corretos
- [ ] ✅ Testou em modo de produção localmente:
  ```bash
  npm run build
  npm run start
  ```
- [ ] ✅ Sem erros de TypeScript/ESLint:
  ```bash
  npm run lint
  ```

---

## 🔧 Comandos Úteis

```bash
# Testar build localmente ANTES de deploy
npm run build
npm run start

# Ver site em localhost:3000

# Se tiver erros, corrigir e rodar novamente
npm run lint
```

---

## 📊 Monitoramento Pós-Deploy

### 1. Verificar funcionamento:
- Abra o site no navegador
- Teste todas as páginas (Home, Serviços, Preços, Contato)
- Teste em mobile (inspecione no Chrome: F12 → Toggle device)
- Teste os 2 idiomas (PT/EN)

### 2. Verificar performance:
- Acesse: https://pagespeed.web.dev/
- Cole a URL do seu site
- Objetivo: >90 pontos em Mobile e Desktop

### 3. Verificar SEO:
- Busque no Google: `site:nomadway.vercel.app` (após 2-3 dias)
- Verifique se aparece indexado

---

## 🆘 Problemas Comuns

### Erro: "Build failed"
```bash
# Teste localmente primeiro:
npm run build

# Se funcionar local mas falhar na Vercel:
# - Verifique se package.json tem todas as dependências
# - Verifique se não tem erros de TypeScript
```

### Erro: "Image optimization error"
```bash
# Certifique-se que a logo está em public/logo.png
# E que next.config.js está configurado corretamente
```

### Site muito lento:
```bash
# Otimize imagens:
# - Use formato WebP
# - Comprima imagens pesadas
# - Use Next/Image para otimização automática
```

---

## 🔄 Atualizações Futuras

Sempre que fizer mudanças no código:

**Se usa GitHub:**
```bash
git add .
git commit -m "Descrição da mudança"
git push
# Deploy automático na Vercel!
```

**Se usa Vercel CLI:**
```bash
vercel --prod
```

---

## 📞 Precisa de Ajuda?

- **Documentação Vercel**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Suporte NomadWay**: dev@nomadway.com

---

**🎉 Parabéns pelo deploy!**

Seu site está no ar em: **https://nomadway.vercel.app** (ou seu domínio)

**Próximos passos sugeridos:**
1. ✅ Compartilhe o link com a equipe
2. ✅ Configure Google Analytics
3. ✅ Configure Google Search Console
4. ✅ Adicione o site no LinkedIn/Instagram da empresa
5. ✅ Teste formulário de contato com email real

---

*Made with ❤️ for NomadWay*
