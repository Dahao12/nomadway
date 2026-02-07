# 🌍 NomadWay - Site Institucional

[![Next.js](https://img.shields.io/badge/Next.js-14.1-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Site institucional profissional da **NomadWay** - consultoria especializada para nômades digitais que desejam viver e trabalhar na Espanha.

🌐 **[Ver Demo ao Vivo](https://nomadway.vercel.app)** (após deploy)

---

## 📋 Sobre o Projeto

A NomadWay oferece consultoria completa para profissionais remotos que sonham em se mudar para a Espanha, incluindo:

- 🛂 **Consultoria de Visto** - Visto de nômade digital
- 💰 **Mentoria Fiscal** - Lei Beckham e planejamento tributário
- 🗺️ **Planejamento Completo** - Moradia, custos, integração cultural

### ✨ Características do Site

- ✅ **Bilíngue**: Português (PT-BR) e Inglês (EN)
- ✅ **Responsivo**: Design mobile-first totalmente adaptável
- ✅ **Performance**: Otimizado para Core Web Vitals
- ✅ **SEO**: Meta tags, sitemap, robots.txt, schema.org
- ✅ **Acessível**: WCAG 2.1 Level AA
- ✅ **Modern Stack**: Next.js 14 App Router + TypeScript + Tailwind CSS

---

## 🚀 Deploy Rápido na Vercel

### Opção 1: Deploy com 1 Clique

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/seu-usuario/nomadway)

### Opção 2: Deploy via CLI

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Fazer login
vercel login

# 3. Deploy (a partir da raiz do projeto)
vercel

# 4. Deploy para produção
vercel --prod
```

### Opção 3: Deploy via GitHub

1. **Push para GitHub**:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/seu-usuario/nomadway.git
git push -u origin main
```

2. **Conectar à Vercel**:
   - Acesse [vercel.com](https://vercel.com)
   - Clique em "Add New Project"
   - Importe seu repositório GitHub
   - Configure (automático) e clique em "Deploy"

---

## 💻 Desenvolvimento Local

### Pré-requisitos

- Node.js 18.17+ 
- npm, yarn ou pnpm

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/nomadway.git
cd nomadway

# 2. Instale as dependências
npm install
# ou
yarn install
# ou
pnpm install

# 3. Execute o servidor de desenvolvimento
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

---

## 📁 Estrutura do Projeto

```
nomadway/
├── public/
│   ├── logo.png              # Logo NomadWay
│   ├── favicon.svg           # Favicon
│   └── manifest.json         # PWA manifest
├── src/
│   ├── app/
│   │   ├── [lang]/           # Páginas dinâmicas por idioma
│   │   │   ├── page.tsx      # Home
│   │   │   ├── services/     # Página de Serviços
│   │   │   ├── pricing/      # Página de Preços
│   │   │   ├── contact/      # Página de Contato
│   │   │   └── layout.tsx    # Layout com Header/Footer
│   │   ├── globals.css       # Estilos globais
│   │   ├── layout.tsx        # Root layout
│   │   ├── sitemap.ts        # Sitemap XML
│   │   └── robots.ts         # Robots.txt
│   ├── components/
│   │   ├── Header.tsx        # Menu de navegação
│   │   ├── Footer.tsx        # Rodapé
│   │   ├── Hero.tsx          # Seção hero
│   │   ├── CTASection.tsx    # Call-to-action
│   │   └── ContactForm.tsx   # Formulário de contato
│   ├── config/
│   │   └── i18n.ts           # Configuração de idiomas
│   ├── dictionaries/
│   │   ├── pt.json           # Traduções PT-BR
│   │   └── en.json           # Traduções EN
│   └── lib/
│       └── getDictionary.ts  # Helper i18n
├── next.config.js            # Configuração Next.js
├── tailwind.config.js        # Configuração Tailwind
├── tsconfig.json             # Configuração TypeScript
└── package.json              # Dependências
```

---

## 🎨 Tecnologias Utilizadas

| Tecnologia | Descrição |
|------------|-----------|
| [Next.js 14](https://nextjs.org/) | Framework React com App Router |
| [TypeScript](https://www.typescriptlang.org/) | Superset JavaScript com tipagem |
| [Tailwind CSS](https://tailwindcss.com/) | Framework CSS utility-first |
| [React Icons](https://react-icons.github.io/react-icons/) | Biblioteca de ícones |

---

## 🌐 Internacionalização (i18n)

O site suporta **2 idiomas**:
- 🇧🇷 **Português (PT-BR)** - `/pt`
- 🇺🇸 **Inglês (EN)** - `/en`

### Adicionar Novo Idioma

1. Adicione o código do idioma em `src/config/i18n.ts`:
```typescript
export const locales = ['pt', 'en', 'es'] as const // Adicionar 'es'
```

2. Crie o arquivo de tradução em `src/dictionaries/es.json`

3. Atualize `src/lib/getDictionary.ts`:
```typescript
const dictionaries = {
  pt: () => import('./dictionaries/pt.json').then((module) => module.default),
  en: () => import('./dictionaries/en.json').then((module) => module.default),
  es: () => import('./dictionaries/es.json').then((module) => module.default), // Novo
}
```

---

## 📄 Páginas do Site

| Página | Rota PT | Rota EN | Descrição |
|--------|---------|---------|-----------|
| Home | `/pt` | `/en` | Landing page com hero, benefícios, serviços, depoimentos |
| Serviços | `/pt/services` | `/en/services` | Detalhes dos serviços oferecidos |
| Preços | `/pt/pricing` | `/en/pricing` | Planos e investimento |
| Contato | `/pt/contact` | `/en/contact` | Formulário e informações de contato |

---

## 🎯 SEO & Performance

### ✅ SEO Implementado

- [x] Meta tags dinâmicas por página e idioma
- [x] Open Graph e Twitter Cards
- [x] Sitemap XML multilíngue
- [x] Robots.txt configurado
- [x] Canonical URLs
- [x] Alternate language tags (hreflang)
- [x] Semantic HTML
- [x] Favicon e manifest.json

### ⚡ Performance

- **Next.js 14**: Server Components e streaming
- **Imagens otimizadas**: Next/Image com lazy loading
- **Fontes otimizadas**: Google Fonts com display=swap
- **CSS modular**: Tailwind CSS com purge automático
- **Bundle size**: Otimizado com tree-shaking

---

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor dev em localhost:3000

# Build
npm run build        # Cria build de produção otimizado
npm run start        # Inicia servidor de produção

# Linting
npm run lint         # Executa ESLint
```

---

## 🚀 Checklist de Deploy

Antes de fazer deploy em produção:

- [ ] ✅ Revisar todo o conteúdo (textos, links, imagens)
- [ ] ✅ Testar formulário de contato
- [ ] ✅ Validar links externos (WhatsApp, Email)
- [ ] ✅ Testar responsividade (mobile, tablet, desktop)
- [ ] ✅ Verificar performance (Lighthouse)
- [ ] ✅ Validar SEO (Google Search Console)
- [ ] ✅ Testar ambos os idiomas (PT/EN)
- [ ] ✅ Configurar domínio customizado
- [ ] ✅ Configurar SSL (automático na Vercel)
- [ ] ✅ Configurar analytics (Google Analytics, etc.)

---

## 📊 Funcionalidades Implementadas

### ✅ Concluído

- [x] Sistema de internacionalização (PT-BR/EN)
- [x] Design responsivo mobile-first
- [x] Header com menu responsivo
- [x] Footer com informações e links
- [x] Página Home completa
- [x] Página Serviços detalhada
- [x] Página Preços com 3 planos
- [x] Página Contato com formulário
- [x] Otimização SEO completa
- [x] Integração logo NomadWay
- [x] Performance otimizada

### 🔄 Próximas Melhorias (Sugestões)

- [ ] Integração com API de envio de email (Resend, SendGrid)
- [ ] Sistema de agendamento de consultas (Calendly)
- [ ] Blog/Artigos sobre visto e Espanha
- [ ] Área de clientes (login)
- [ ] Chat ao vivo (Tawk.to, Crisp)
- [ ] Depoimentos dinâmicos (Trustpilot)
- [ ] Calculadora de custos interativa
- [ ] FAQ expandido com accordion
- [ ] Newsletter (Mailchimp, ConvertKit)
- [ ] Analytics e tracking (GA4, Hotjar)

---

## 📞 Suporte

Para dúvidas sobre o desenvolvimento do site, entre em contato:

- **Email**: dev@nomadway.com
- **WhatsApp**: +351 912 345 678

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🙏 Créditos

Desenvolvido com ❤️ para **NomadWay**

- **Design**: Baseado em padrões BigTech (Airbnb, Stripe, Vercel)
- **Ícones**: React Icons
- **Fontes**: Inter (Google Fonts)
- **Logo**: NomadWay (fornecida pelo cliente)

---

**Made for Nomads** 🌍✈️
