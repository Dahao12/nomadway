# NomadWay Cookie Consent - Instrução de Instalação

## Arquivos Instalados ✅

1. **cookie-consent.js** - Script do banner de consentimento
   - Instalado em: `/public_html/cookie-consent.js`
   - Instalado em: `/public_html/pt/cookie-consent.js`
   - Instalado em: `/public_html/en/cookie-consent.js`

2. **cookie-injector.html** - Injetor simples (opcional)
   - Local: `/public_html/cookie-injector.html`

## Como Ativar o Cookie Consent

### Opção A: Adicionar em cada página HTML (Recomendado para páginas estáticas)

Adicione este código **ANTES da tag `</body>`** em cada arquivo:

```
<script src="/cookie-consent.js"></script>
```

**Arquivos que precisam editar:**
- `/public_html/index.html` (se existir)
- `/public_html/pt/index.html`
- `/public_html/en/index.html`

### Opção B: Editar o layout do Next.js (Se estiver usando Next.js Source)

Se você tem acesso ao código fonte e usa Next.js, edite o arquivo `layout.tsx` ou `_document.tsx`:

```tsx
// Em layout.tsx ou _document.tsx
<Script src="/cookie-consent.js" strategy="afterInteractive" />
```

Depois recompile e faça upload.

### Opção C: Adicionar via FTP em todas as páginas

Se as páginas são HTML simples, pode usar um script para adicionar automaticamente em todos os arquivos.

## Funcionalidades do Cookie Consent

✅ **Banner moderno** no estilo NomadWay (dark mode)
✅ **Suporte múltiplos idiomas** (PT/EN automático)
✅ **4 categorias de cookies:**
   - Necessários (sempre ativo)
   - Marketing
   - Analytics
   - Funcionais

✅ **Armazenamento local** do consentimento
✅ **Botão de configurações** no footer
✅ **Design responsivo** (mobile-friendly)
✅ **Customizável** via API pública

## API do Cookie Consent

```javascript
// Obter estado atual
window.NomadwayCookieConsent.getState();

// Resetar consentimento (mostrar banner novamente)
window.NomadwayCookieConsent.reset();

// Atualizar consentimento manualmente
window.NomadwayCookieConsent.updateConsent({
    marketing: true,
    analytics: false,
    functional: true
});

// Ouvir mudanças de consentimento
window.addEventListener('cookieConsentChanged', (e) => {
    console.log('Consent changed:', e.detail);
});
```

## Exemplo de Uso com Google Analytics

```html
<script src="/cookie-consent.js"></script>
<script>
window.addEventListener('cookieConsentChanged', function(e) {
    if (e.detail.analytics) {
        // Carregar Google Analytics apenas se consentido
        (function(w,d,s,g,js,fs){
            g=w.gapi||(w.gapi={});g.analytics={q:[],ready:function(f){this.q.push(f);}};
            js=d.createElement(s);fs=d.getElementsByTagName(s)[0];
            js.src='https://www.google-analytics.com/analytics.js';
            fs.parentNode.insertBefore(js,fs);js.onload=function(){g.analytics.ready(function(){g.analytics.create('UA-XXXXX-Y').send('pageview');});};
        }(window,document,'script'));
    }
});
</script>
```

## Testar o Banner

Para testar, abra o console do navegador (F12) e execute:

```javascript
// Resetar consentimento
window.NomadwayCookieConsent.reset();
```

O banner aparecerá novamente na parte inferior da página.

---

**Contato:** Se precisar de ajuda, entre em contato!