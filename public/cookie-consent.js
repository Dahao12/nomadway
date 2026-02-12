/**
 * Cookie Consent - NomadWay (Simplified 2-button version + Centralized Logo)
 * Padrão GDPR - Estilo NomadWay
 */

(function() {
    'use strict';

    const COOKIE_CONSENT_KEY = 'nomadway_cookie_consent';
    const COOKIE_CONSENT_VERSION = '2.2';
    const DOMAINS = ['nomadway.com.br', 'www.nomadway.com.br'];

    let consentState = {
        necessary: true,  // Sempre true
        marketing: false,
        analytics: false,
        functional: false,
        version: COOKIE_CONSENT_VERSION
    };

    let banner, settingsModal;

    // Traduções
    const i18n = {
        pt: {
            title: 'Cookies & Privacidade',
            description: 'Usamos cookies para melhorar sua experiência. Selecione:',
            necessary: 'Necessários',
            necessary_desc: 'Essenciais para o funcionamento do site',
            marketing: 'Marketing',
            marketing_desc: 'Personalização de anúncios e conteúdo',
            analytics: 'Analytics',
            analytics_desc: 'Análise de tráfego e comportamento',
            functional: 'Funcionais',
            functional_desc: 'Recursos adicionais do site',
            acceptAll: 'Aceitar Tudo',
            rejectAll: 'Apenas Necessários',
            personalize: 'Personalizar',
            savePreferences: 'Salvar Preferências',
            close: 'Fechar',
            settingsTitle: 'Personalizar Cookies',
            settingsDesc: 'Selecione as categorias de cookies que deseja permitir:',
            acceptSelected: 'Salvar Seleção'
        },
        en: {
            title: 'Cookies & Privacy',
            description: 'We use cookies to improve your experience. Select:',
            necessary: 'Necessary',
            necessary_desc: 'Essential for site functionality',
            marketing: 'Marketing',
            marketing_desc: 'Personalized ads and content',
            analytics: 'Analytics',
            analytics_desc: 'Traffic and behavior analysis',
            functional: 'Functional',
            functional_desc: 'Additional site features',
            acceptAll: 'Accept All',
            rejectAll: 'Only Necessary',
            personalize: 'Personalize',
            savePreferences: 'Save Preferences',
            close: 'Close',
            settingsTitle: 'Personalize Cookies',
            settingsDesc: 'Select the cookie categories you want to allow:',
            acceptSelected: 'Save Selection'
        }
    };

    function detectLanguage() {
        const path = window.location.pathname;
        if (path.startsWith('/en/')) return 'en';
        if (path.startsWith('/pt/')) return 'pt';
        const browserLang = navigator.language || navigator.userLanguage;
        return browserLang.startsWith('en') ? 'en' : 'pt';
    }

    const lang = detectLanguage();
    const t = i18n[lang];

    function createBanner() {
        banner = document.createElement('div');
        banner.id = 'nomadway-cookie-banner';
        banner.innerHTML = `
            <div class="cookie-banner-content">
                <div class="cookie-banner-header">
                    <div class="cookie-logo">
                        <img src="/logo.png" alt="NomadWay">
                    </div>
                    <h3>${t.title}</h3>
                    <p>${t.description}</p>
                </div>
                <div class="cookie-buttons">
                    <button class="cookie-btn cookie-btn-secondary" id="cookie-personalize">${t.personalize}</button>
                    <button class="cookie-btn cookie-btn-primary" id="cookie-accept-all">${t.acceptAll}</button>
                </div>
            </div>
        `;

        const styles = document.createElement('style');
        styles.textContent = `
            #nomadway-cookie-banner {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                color: #f8fafc;
                padding: 24px;
                z-index: 10000;
                box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.4);
                animation: slideUp 0.3s ease-out;
            }

            @keyframes slideUp {
                from { transform: translateY(100%); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }

            .cookie-banner-content {
                max-width: 700px;
                margin: 0 auto;
            }

            .cookie-banner-header {
                text-align: center;
                margin-bottom: 24px;
                display: flex;
                flex-direction: column;
                align-items: center;
            }

            .cookie-logo {
                margin-bottom: 16px;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .cookie-logo img {
                height: 48px;
                width: auto;
                filter: brightness(0) invert(1);
                opacity: 0.9;
            }

            .cookie-banner-header h3 {
                font-size: 1.5rem;
                font-weight: 700;
                margin: 0 0 12px 0;
                color: #38bdf8;
            }

            .cookie-banner-header p {
                font-size: 1rem;
                color: #94a3b8;
                margin: 0;
                line-height: 1.5;
            }

            .cookie-buttons {
                display: flex;
                gap: 16px;
                justify-content: center;
                flex-wrap: wrap;
            }

            .cookie-btn {
                padding: 14px 36px;
                border-radius: 8px;
                font-weight: 600;
                font-size: 1rem;
                cursor: pointer;
                transition: all 0.2s ease;
                border: none;
                min-width: 180px;
            }

            .cookie-btn-primary {
                background: #38bdf8;
                color: #0f172a;
            }

            .cookie-btn-primary:hover {
                background: #7dd3fc;
                transform: translateY(-2px);
            }

            .cookie-btn-secondary {
                background: transparent;
                color: #94a3b8;
                border: 2px solid rgba(148, 163, 184, 0.4);
            }

            .cookie-btn-secondary:hover {
                color: #f8fafc;
                border-color: #94a3b8;
            }

            #nomadway-cookie-settings-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                z-index: 10001;
                display: flex;
                justify-content: center;
                align-items: center;
                animation: fadeIn 0.2s ease-out;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            .cookie-settings-content {
                background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                color: #f8fafc;
                padding: 32px;
                border-radius: 12px;
                max-width: 600px;
                width: 90%;
                max-height: 85vh;
                overflow-y: auto;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
            }

            .cookie-settings-header {
                text-align: center;
                margin-bottom: 24px;
                padding-bottom: 20px;
                border-bottom: 1px solid rgba(148, 163, 184, 0.2);
            }

            .cookie-settings-header h2 {
                font-size: 1.75rem;
                font-weight: 700;
                margin: 0 0 8px 0;
                color: #38bdf8;
            }

            .cookie-settings-header p {
                font-size: 1rem;
                color: #94a3b8;
                margin: 0;
            }

            .cookie-option {
                display: flex;
                align-items: flex-start;
                padding: 16px;
                margin-bottom: 12px;
                border: 1px solid rgba(148, 163, 184, 0.2);
                border-radius: 8px;
                background: rgba(15, 23, 42, 0.3);
                cursor: ${consentState.necessary ? 'not-allowed' : 'default'};
            }

            .cookie-option:hover {
                background: rgba(15, 23, 42, 0.5);
            }

            .cookie-option-input {
                margin: 3px 16px 0 0;
                min-width: 20px;
                height: 20px;
                border-radius: 4px;
                border: 2px solid rgba(56, 189, 248, 0.5);
                background: rgba(15, 23, 42, 0.5);
                cursor: ${consentState.necessary ? 'not-allowed' : 'default'};
            }

            .cookie-option-input:checked {
                background: #38bdf8;
                border-color: #38bdf8;
            }

            .cookie-option-text {
                flex: 1;
            }

            .cookie-option-title {
                font-weight: 700;
                margin-bottom: 4px;
                color: #f8fafc;
            }

            .cookie-option-desc {
                font-size: 0.875rem;
                color: #94a3b8;
                margin: 0;
                line-height: 1.4;
            }

            .cookie-settings-buttons {
                display: flex;
                gap: 12px;
                justify-content: center;
                margin-top: 24px;
                padding-top: 20px;
                border-top: 1px solid rgba(148, 163, 184, 0.2);
            }

            .cookie-setting-close {
                position: absolute;
                top: 20px;
                right: 20px;
                background: transparent;
                border: none;
                color: #94a3b8;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 4px;
                line-height: 1;
            }

            .cookie-setting-close:hover {
                color: #f8fafc;
            }

            @media (min-width: 768px) {
                .cookie-btn {
                    min-width: 200px;
                }
            }

            @media (max-width: 480px) {
                #nomadway-cookie-banner {
                    padding: 16px;
                }

                .cookie-buttons {
                    flex-direction: column;
                }

                .cookie-btn {
                    width: 100%;
                    min-width: unset;
                }
            }
        `;
        document.head.appendChild(styles);
        banner.appendChild(styles);
        document.body.appendChild(banner);

        document.getElementById('cookie-accept-all').addEventListener('click', () => {
            consentState.marketing = true;
            consentState.analytics = true;
            consentState.functional = true;
            saveConsent();
            hideBanner();
        });

        document.getElementById('cookie-personalize').addEventListener('click', showSettingsModal);
    }

    function showSettingsModal() {
        if (settingsModal) return;

        settingsModal = document.createElement('div');
        settingsModal.id = 'nomadway-cookie-settings-modal';
        settingsModal.innerHTML = `
            <div class="cookie-settings-content">
                <button class="cookie-setting-close" id="cookie-settings-close">&times;</button>
                <div class="cookie-settings-header">
                    <h2>${t.settingsTitle}</h2>
                    <p>${t.settingsDesc}</p>
                </div>
                <div id="cookie-options"></div>
                <div class="cookie-settings-buttons">
                    <button class="cookie-btn cookie-btn-primary" id="cookie-save-selected">${t.acceptSelected}</button>
                </div>
            </div>
        `;

        const optionsContainer = settingsModal.querySelector('#cookie-options');
        const options = [
            { key: 'necessary', title: t.necessary, desc: t.necessary_desc, disabled: true },
            { key: 'marketing', title: t.marketing, desc: t.marketing_desc, disabled: false },
            { key: 'analytics', title: t.analytics, desc: t.analytics_desc, disabled: false },
            { key: 'functional', title: t.functional, desc: t.functional_desc, disabled: false }
        ];

        options.forEach(option => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'cookie-option';
            optionDiv.innerHTML = `
                <input type="checkbox" 
                       class="cookie-option-input" 
                       id="cookie-${option.key}" 
                       ${consentState[option.key] ? 'checked' : ''} 
                       ${option.disabled ? 'disabled' : ''}>
                <div class="cookie-option-text">
                    <div class="cookie-option-title">${option.title}</div>
                    <p class="cookie-option-desc">${option.desc}</p>
                </div>
            `;
            optionsContainer.appendChild(optionDiv);
        });

        document.body.appendChild(settingsModal);

        settingsModal.querySelector('#cookie-settings-close').addEventListener('click', hideSettingsModal);
        settingsModal.querySelector('#cookie-save-selected').addEventListener('click', () => {
            consentState.marketing = document.getElementById('cookie-marketing').checked;
            consentState.analytics = document.getElementById('cookie-analytics').checked;
            consentState.functional = document.getElementById('cookie-functional').checked;
            saveConsent();
            hideSettingsModal();
            hideBanner();
        });

        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                hideSettingsModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                hideSettingsModal();
            }
        });
    }

    function hideSettingsModal() {
        if (settingsModal) {
            settingsModal.remove();
            settingsModal = null;
        }
    }

    function hideBanner() {
        if (banner) {
            banner.style.animation = 'slideUp 0.3s ease-out reverse';
            setTimeout(() => {
                if (banner) banner.remove();
                banner = null;
            }, 300);
        }
    }

    function saveConsent() {
        const json = JSON.stringify(consentState);
        document.cookie = `${COOKIE_CONSENT_KEY}=${json}; max-age=${365 * 24 * 60 * 60}; path=/; SameSite=Strict`;
        
        // Dispara evento para integração
        const event = new CustomEvent('cookieConsentChanged', {
            detail: { state: consentState }
        });
        window.dispatchEvent(event);
    }

    function loadConsent() {
        const cookies = document.cookie.split(';').map(c => c.trim());
        const cookie = cookies.find(c => c.startsWith(`${COOKIE_CONSENT_KEY}=`));
        
        if (cookie) {
            try {
                const saved = JSON.parse(cookie.split('=')[1]);
                if (saved && saved.version === COOKIE_CONSENT_VERSION) {
                    consentState = { ...consentState, ...saved };
                    return true;
                }
            } catch (e) {
                console.error('Error parsing cookie consent:', e);
            }
        }
        return false;
    }

    // API pública
    window.NomadwayCookieConsent = {
        getState: () => ({ ...consentState }),
        reset: () => {
            document.cookie = `${COOKIE_CONSENT_KEY}=; max-age=0; path=/`;
            location.reload();
        }
    };

    // Inicializa
    if (!loadConsent()) {
        // Aguarda DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', createBanner);
        } else {
            createBanner();
        }
    }
})();