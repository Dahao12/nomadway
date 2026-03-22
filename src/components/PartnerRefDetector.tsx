'use client';

import { useEffect } from 'react';
import { usePartnerRef } from '@/hooks/usePartnerRef';

/**
 * Componente para detectar código de parceiro na URL
 * 
 * Coloque este componente no layout do site de agendamento
 * para detectar automaticamente ?ref=CODIGO
 * 
 * Exemplo:
 *   <PartnerRefDetector />
 *   <BookingForm />
 */
export function PartnerRefDetector() {
  const { getPartnerCode } = usePartnerRef();

  useEffect(() => {
    const code = getPartnerCode();
    if (code) {
      console.log(`✅ Código de parceiro detectado: ${code}`);
    }
  }, [getPartnerCode]);

  // Não renderiza nada, apenas detecta o código
  return null;
}

export default PartnerRefDetector;