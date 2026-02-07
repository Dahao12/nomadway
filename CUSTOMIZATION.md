# 🎨 Guia de Customização - NomadWay

Este guia mostra como personalizar diferentes aspectos do site sem precisar ser desenvolvedor.

---

## 📝 1. Editar Textos (Conteúdo)

### Localização:
```
src/dictionaries/pt.json  (Português)
src/dictionaries/en.json  (Inglês)
```

### Como editar:

1. **Abra o arquivo** no editor de texto
2. **Encontre a seção** que quer editar (ex: `"hero"`, `"services"`, `"pricing"`)
3. **Edite o texto** entre as aspas
4. **Salve o arquivo**
5. **Atualize o navegador** (Ctrl+F5)

### Exemplo:

**Antes:**
```json
"hero": {
  "title": "Realize seu Sonho de Viver na Espanha",
  "subtitle": "Consultoria especializada..."
}
```

**Depois:**
```json
"hero": {
  "title": "SEU NOVO TÍTULO AQUI",
  "subtitle": "Sua nova descrição aqui..."
}
```

**💡 Dica**: Use um validador JSON online se não tiver certeza da formatação.

---

## 🎨 2. Mudar Cores

### Localização:
```
tailwind.config.js
```

### Como editar:

1. **Abra** `tailwind.config.js`
2. **Encontre** a seção `colors`
3. **Edite** os valores hexadecimais

### Exemplo:

**Cores atuais (Espanha):**
```javascript
primary: {
  600: '#dc2626',  // Vermelho
  700: '#b91c1c',
},
secondary: {
  500: '#eab308',  // Amarelo
  600: '#ca8a04',
}
```

**Para mudar (exemplo: azul/verde):**
```javascript
primary: {
  600: '#2563eb',  // Azul
  700: '#1d4ed8',
},
secondary: {
  500: '#10b981',  // Verde
  600: '#059669',
}
```

**🎨 Ferramentas úteis:**
- [Coolors.co](https://coolors.co/) - Paleta de cores
- [Tailwind Color Generator](https://uicolors.app/) - Gera todas as variações

---

## 🖼️ 3. Trocar Logo

### Localização:
```
public/logo.png
```

### Como trocar:

1. **Prepare sua logo** (PNG com fundo transparente)
2. **Nomeie** como `logo.png`
3. **Substitua** o arquivo em `public/logo.png`
4. **Dimensões recomendadas**: 
   - Largura: 500-1000px
   - Altura: proporcional
   - Fundo: transparente

**💡 Dica**: Se sua logo for muito grande (>1MB), otimize com [TinyPNG](https://tinypng.com/).

---

## 📧 4. Atualizar Contatos

### WhatsApp:

**Localização**: `src/dictionaries/pt.json` e `en.json`

```json
"contact": {
  "info": {
    "whatsapp": "+351 912 345 678"  // ← MUDAR AQUI
  }
}
```

**Formato**: `+[código país] [número]`
- Brasil: `+55 11 98765-4321`
- Portugal: `+351 912 345 678`
- Espanha: `+34 612 345 678`

### Email:

```json
"contact": {
  "info": {
    "email": "contato@nomadway.com"  // ← MUDAR AQUI
  }
}
```

### Redes Sociais:

**Localização**: `src/components/Footer.tsx`

```tsx
<a
  href="https://linkedin.com"  // ← MUDAR AQUI
  target="_blank"
>
```

---

## 💰 5. Atualizar Preços

### Localização:
```
src/dictionaries/pt.json (e en.json)
```

### Como editar:

```json
"pricing": {
  "basic": {
    "price": "€297",  // ← MUDAR VALOR
    "features": [
      "1 sessão de 90 minutos",  // ← ADICIONAR/REMOVER itens
      "Análise de elegibilidade"
    ]
  }
}
```

**💡 Dicas:**
- Mantenha o símbolo € para Euro
- Para adicionar novo item, copie a linha e edite
- Para remover, apague a linha (cuidado com vírgulas!)

---

## 🖼️ 6. Adicionar/Remover Serviços

### Home Page - Seção de Serviços:

**Localização**: `src/app/[lang]/page.tsx`

**Para adicionar um 4º serviço:**

1. **No dicionário** (`pt.json`), adicione:
```json
"services": {
  "title": "Nossos Serviços",
  "seu_novo_servico": {
    "title": "Novo Serviço",
    "description": "Descrição aqui",
    "features": [
      "Feature 1",
      "Feature 2"
    ]
  }
}
```

2. **No código** (`page.tsx`), adicione no array:
```jsx
{ icon: FaIcon, key: 'seu_novo_servico', gradient: 'from-primary-600 to-primary-800' }
```

---

## 👥 7. Editar Depoimentos

### Localização:
```
src/dictionaries/pt.json
```

### Como editar:

```json
"testimonials": {
  "items": [
    {
      "name": "Ana Silva",           // ← Nome do cliente
      "role": "Desenvolvedora",      // ← Profissão
      "text": "Depoimento aqui...",  // ← Feedback
      "location": "Barcelona, ES"     // ← Localização
    },
    // Adicionar mais itens aqui
  ]
}
```

**💡 Para adicionar mais depoimentos:**
1. Copie um bloco completo `{ name: "...", ... }`
2. Cole abaixo (com vírgula antes)
3. Edite as informações

---

## 📱 8. Adicionar Novas Páginas

### Exemplo: Criar página "Sobre"

1. **Crie a pasta e arquivo:**
```
src/app/[lang]/about/page.tsx
```

2. **Use este template:**
```tsx
import { getDictionary } from '@/lib/getDictionary'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  return {
    title: 'Sobre - NomadWay',
    description: 'Conheça a NomadWay',
  }
}

export default async function AboutPage({ params }: { params: { lang: string } }) {
  const dict = await getDictionary(params.lang as 'pt' | 'en')

  return (
    <section className="pt-24 sm:pt-32 pb-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-6">Sobre Nós</h1>
        <p className="text-lg text-gray-600">Seu conteúdo aqui...</p>
      </div>
    </section>
  )
}
```

3. **Adicione no menu** (`src/components/Header.tsx`):
```tsx
<Link href={`/${locale}/about`}>Sobre</Link>
```

---

## 🌐 9. Adicionar Novo Idioma (ex: Espanhol)

1. **Crie** `src/dictionaries/es.json` (copie de `pt.json`)

2. **Edite** `src/config/i18n.ts`:
```typescript
export const locales = ['pt', 'en', 'es'] as const  // Adicionar 'es'
```

3. **Edite** `src/lib/getDictionary.ts`:
```typescript
const dictionaries = {
  pt: () => import('./dictionaries/pt.json').then((module) => module.default),
  en: () => import('./dictionaries/en.json').then((module) => module.default),
  es: () => import('./dictionaries/es.json').then((module) => module.default),  // Novo
}
```

4. **Traduza** todo o conteúdo em `es.json`

---

## 🎯 10. Formulário de Contato (Email Real)

### Opção A: Integrar com Resend (Recomendado)

1. **Instale**:
```bash
npm install resend
```

2. **Crie** `src/app/api/contact/route.ts`:
```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  const { name, email, message } = await request.json()
  
  await resend.emails.send({
    from: 'contato@nomadway.com',
    to: 'seu-email@gmail.com',
    subject: `Novo contato: ${name}`,
    html: `<p><strong>Nome:</strong> ${name}</p>
           <p><strong>Email:</strong> ${email}</p>
           <p><strong>Mensagem:</strong> ${message}</p>`
  })
  
  return Response.json({ success: true })
}
```

3. **Atualize** `src/components/ContactForm.tsx`:
```typescript
const response = await fetch('/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData),
})
```

### Opção B: Usar formsubmit.co (Sem código)

1. **Mude o action do form**:
```tsx
<form action="https://formsubmit.co/seu-email@gmail.com" method="POST">
  <input type="hidden" name="_next" value="https://nomadway.com/obrigado">
  {/* seus campos */}
</form>
```

---

## 📊 11. Adicionar Google Analytics

1. **Obtenha seu ID** (ex: `G-XXXXXXXXXX`)

2. **Edite** `src/app/layout.tsx`:
```tsx
<head>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX" />
  <script dangerouslySetInnerHTML={{
    __html: `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-XXXXXXXXXX');
    `
  }} />
</head>
```

---

## 🔧 12. Troubleshooting Comum

### Build failing?
```bash
# Limpar cache
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

### Imagens não aparecem?
- Verifique se estão em `public/`
- Use `/nome-imagem.png` (com barra inicial)
- Reinicie o servidor: `npm run dev`

### Mudanças não aparecem?
- Força refresh: `Ctrl+F5` (Windows) ou `Cmd+Shift+R` (Mac)
- Limpe cache do navegador
- Reinicie servidor dev

---

## 🆘 Precisa de Ajuda?

**Recursos:**
- [Documentação Next.js](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

**Suporte:**
- Email: dev@nomadway.com
- GitHub Issues: (seu repositório)

---

**💡 Dica Final**: Sempre teste localmente (`npm run dev`) antes de fazer deploy!

**🎉 Divirta-se customizando!**
