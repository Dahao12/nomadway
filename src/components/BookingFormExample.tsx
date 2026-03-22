/**
 * EXEMPLO: Como usar o hook usePartnerRef no formulário de agendamento
 * 
 * Este arquivo mostra como integrar o sistema de parceiros
 * no site de agendamento ou no portal do cliente.
 */

'use client';

import { usePartnerRef } from '@/hooks/usePartnerRef';

interface BookingFormData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  booking_date: string;
  booking_time: string;
  service_id: string;
  service_name: string;
  partner_code?: string;
  referral_source?: string;
}

export function BookingFormExample() {
  const { getPartnerCode, getPartnerRef } = usePartnerRef();

  const handleSubmit = async (formData: Omit<BookingFormData, 'partner_code' | 'referral_source'>) => {
    // Adicionar código do parceiro se existir
    const partnerCode = getPartnerCode();
    const partnerRef = getPartnerRef();

    const bookingData: BookingFormData = {
      ...formData,
      // Adicionar código do parceiro
      partner_code: partnerCode || undefined,
      referral_source: partnerRef?.source || undefined,
    };

    console.log('Enviando booking com dados:', bookingData);

    // Enviar para API
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Booking criado:', result.booking);
      // Partner code será salvo automaticamente no booking
      // Lead será criado automaticamente se tiver partner_code
    }
  };

  return (
    <div>
      {/* Exemplo de uso */}
      <p>Este é um exemplo de como integrar o usePartnerRef no formulário.</p>
    </div>
  );
}

/**
 * INTEGRAÇÃO COMPLETA:
 * 
 * 1. No layout do site, adicione <PartnerRefDetector />
 * 
 * 2. No formulário de agendamento:
 *    - Importe usePartnerRef
 *    - Use getPartnerCode() para obter o código
 *    - Envie partner_code no POST para /api/bookings
 * 
 * 3. Backend (já implementado em /api/bookings):
 *    - Se tiver partner_code, cria lead automaticamente
 * 
 * 4. Quando confirmar booking (/api/admin/confirm-booking):
 *    - Se tiver partner_code, cria comissão automaticamente
 *    - Atualiza totais do parceiro
 */