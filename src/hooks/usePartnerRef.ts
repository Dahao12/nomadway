'use client';

import { useEffect, useState } from 'react';

/**
 * Hook para detectar e salvar código de parceiro
 * 
 * Uso:
 * 1. No layout do site, use esse hook para detectar ?ref=CODIGO
 * 2. Salva em cookie por 30 dias
 * 3. Use getPartnerCode() ao criar booking
 * 
 * Exemplo:
 *   const { getPartnerCode } = usePartnerRef();
 *   const code = getPartnerCode(); // Retorna o código ou null
 */

const COOKIE_NAME = 'nomadway_partner_code';
const COOKIE_DAYS = 30;

interface PartnerRef {
  code: string;
  source: string;
  timestamp: number;
}

export function usePartnerRef() {
  const [partnerRef, setPartnerRef] = useState<PartnerRef | null>(null);

  // Detectar código na URL e salvar
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    const refCode = url.searchParams.get('ref') || url.searchParams.get('partner_code');
    
    if (refCode) {
      // Validar formato do código (ex: EZE01, ELZ01, PARABC)
      if (/^[A-Z]{2,3}[0-9]{2}$/.test(refCode) || /^[A-Z]{3}[A-Z0-9]{3}$/.test(refCode)) {
        const ref: PartnerRef = {
          code: refCode.toUpperCase(),
          source: url.hostname === 'localhost' ? 'localhost' : url.hostname,
          timestamp: Date.now(),
        };
        
        setPartnerRef(ref);
        setCookie(COOKIE_NAME, JSON.stringify(ref), COOKIE_DAYS);
        
        // Limpar URL
        url.searchParams.delete('ref');
        url.searchParams.delete('partner_code');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, []);

  // Carregar do cookie se existir
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    const saved = getCookie(COOKIE_NAME);
    if (saved && !partnerRef) {
      try {
        const parsed = JSON.parse(saved);
        setPartnerRef(parsed);
      } catch (e) {
        // Cookie inválido, ignorar
      }
    }
  }, [partnerRef]);

  /**
   * Retorna o código do parceiro salvo (ou null)
   */
  const getPartnerCode = (): string | null => {
    if (partnerRef) {
      // Verificar se não expirou (30 dias)
      const daysSinceRef = (Date.now() - partnerRef.timestamp) / (1000 * 60 * 60 * 24);
      if (daysSinceRef <= COOKIE_DAYS) {
        return partnerRef.code;
      }
    }
    return null;
  };

  /**
   * Retorna informações completas da referência
   */
  const getPartnerRef = (): PartnerRef | null => {
    if (partnerRef) {
      const daysSinceRef = (Date.now() - partnerRef.timestamp) / (1000 * 60 * 60 * 24);
      if (daysSinceRef <= COOKIE_DAYS) {
        return partnerRef;
      }
    }
    return null;
  };

  /**
   * Limpa o código salvo
   */
  const clearPartnerCode = () => {
    setPartnerRef(null);
    deleteCookie(COOKIE_NAME);
  };

  return {
    getPartnerCode,
    getPartnerRef,
    clearPartnerCode,
    hasPartnerCode: !!getPartnerCode(),
  };
}

// Helpers de cookie
function setCookie(name: string, value: string, days: number) {
  if (typeof document === 'undefined') return;
  
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === name) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

export default usePartnerRef;