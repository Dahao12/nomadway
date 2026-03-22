'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

interface ContractData {
  client_name: string;
  client_email?: string;
  client_phone?: string;
  client_cpf?: string;
  client_rg?: string;
  client_passport?: string;
  client_passport_expiry?: string;
  client_nationality?: string;
  client_birth_date?: string;
  client_address?: string;
  client_city?: string;
  client_country?: string;
  client_cep?: string;
  visa_type?: string;
  service_value?: string;
  payment_method?: string;
}

function ContractPDFGenerator() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'generating' | 'showing' | 'done' | 'error'>('loading');
  const [error, setError] = useState('');
  const [visaInfo, setVisaInfo] = useState<{ name: string; type: string } | null>(null);

  useEffect(() => {
    const formData = searchParams.get('data');
    console.log('📄 Contrato - dados recebidos:', formData);
    if (!formData) {
      setStatus('error');
      setError('Dados não fornecidos');
      return;
    }

    try {
      const data: ContractData = JSON.parse(decodeURIComponent(formData));
      console.log('📄 Contrato - visa_type:', data.visa_type);
      console.log('📄 Contrato - dados parseados:', data);
      
      // Parse visa type and show before generating
      const visaType = data.visa_type || 'Visto de Nômade Digital';
      const visaTypeNames: Record<string, string> = {
        'nomad-visa': 'Visto de Nômade Digital',
        'nomad_visa': 'Visto de Nômade Digital',
        'digital_nomad': 'Visto de Nômade Digital',
        'estancia-estudos': 'Visto de Estância de Estudos',
        'estancia_estudos': 'Visto de Estância de Estudos',
        'student': 'Visto de Estudante',
        'estudante': 'Visto de Estudante',
        'beckham': 'Lei Beckham',
        'work': 'Visto de Trabalho',
        'golden': 'Visto Ouro',
      };
      const visaTypeName = visaTypeNames[visaType.toLowerCase()] || visaType;
      
      setVisaInfo({ name: data.client_name || 'Cliente', type: visaTypeName });
      setStatus('showing');
      
      // Wait 2 seconds then generate PDF
      setTimeout(() => {
        generatePDF(data);
      }, 2000);
    } catch (e) {
      setStatus('error');
      setError('Erro ao processar dados');
    }
  }, [searchParams]);

  const generatePDF = async (data: ContractData) => {
    setStatus('generating');
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

      const today = new Date();
      const dateStr = today.toLocaleDateString('pt-BR');
      const valueNum = parseFloat(data.service_value || '1499.90');
      const valueFormatted = `€${valueNum.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      
      // Tipo de visto formatado
      const visaType = data.visa_type || 'Visto de Nômade Digital';
      console.log('📄 PDF - visa_type recebido:', data.visa_type);
      console.log('📄 PDF - visaType processado:', visaType);
      
      // Mapear tipos para nomes mais legíveis
      const visaTypeNames: Record<string, string> = {
        'nomad-visa': 'Visto de Nômade Digital',
        'nomad_visa': 'Visto de Nômade Digital',
        'digital_nomad': 'Visto de Nômade Digital',
        'estancia-estudos': 'Visto de Estância de Estudos',
        'estancia_estudos': 'Visto de Estância de Estudos',
        'student': 'Visto de Estudante',
        'estudante': 'Visto de Estudante',
        'beckham': 'Lei Beckham',
        'work': 'Visto de Trabalho',
        'golden': 'Visto Ouro',
      };
      const visaTypeName = visaTypeNames[visaType.toLowerCase()] || visaType;
      console.log('📄 PDF - visaTypeName:', visaTypeName);
      
      // Descrição do serviço para cláusulas
      const serviceDescriptions: Record<string, string> = {
        'nomad-visa': 'solicitação de Visto de Nômade Digital e residência para trabalho remoto internacional na Espanha',
        'nomad_visa': 'solicitação de Visto de Nômade Digital e residência para trabalho remoto internacional na Espanha',
        'digital_nomad': 'solicitação de Visto de Nômade Digital e residência para trabalho remoto internacional na Espanha',
        'estancia-estudos': 'solicitação de Visto de Estância de Estudos e residência para estudos na Espanha',
        'estancia_estudos': 'solicitação de Visto de Estância de Estudos e residência para estudos na Espanha',
        'student': 'solicitação de Visto de Estudante e residência para estudos na Espanha',
        'estudante': 'solicitação de Visto de Estudante e residência para estudos na Espanha',
        'beckham': 'aplicação da Lei Beckham e regularização fiscal na Espanha',
        'work': 'solicitação de Visto de Trabalho e residência para trabalho presencial na Espanha',
        'golden': 'solicitação de Visto Ouro (Golden Visa) e residência por investimento na Espanha',
      };
      const serviceDesc = serviceDescriptions[visaType.toLowerCase()] || 'solicitação de visto e residência na Espanha';

      // Helper functions
      const drawHeader = (pageNumber: number) => {
        // Logo
        doc.setFillColor(30, 41, 59);
        doc.roundedRect(15, 10, 30, 12, 2, 2, 'F');
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('NOMADWAY', 30, 18, { align: 'center' });
        
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        doc.text('CONTRATO DE PRESTAÇÃO DE SERVIÇOS', 195, 15, { align: 'right' });
        doc.text(visaTypeName, 195, 20, { align: 'right' });
      };

      const drawFooter = (pageNumber: number) => {
        doc.setFontSize(6);
        doc.setTextColor(100, 116, 139);
        doc.text(`NomadWay © 2026 — Documento Confidencial — Página ${pageNumber}`, 105, 285, { align: 'center' });
      };

      const drawSectionTitle = (y: number, num: string, title: string) => {
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'bold');
        
        // Number circle
        doc.setFillColor(59, 130, 246);
        doc.roundedRect(15, y, 8, 8, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.text(num, 19, y + 5.5, { align: 'center' });
        
        // Title
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(11);
        const titleUpper = title.toUpperCase();
        doc.text(titleUpper, 26, y + 6);
        
        return y + 14;
      };

      const drawField = (label: string, value: string, x: number, y: number): number => {
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        doc.text(label, x, y);
        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'bold');
        doc.text(value || '_______________', x, y + 4);
        return y + 10;
      };

      // ===== PAGE 1 - COVER =====
      // Background
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 297, 'F');

      // Logo
      doc.setFillColor(59, 130, 246);
      doc.roundedRect(75, 80, 60, 20, 3, 3, 'F');
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('NOMADWAY', 105, 92, { align: 'center' });

      // Title
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      const title1 = 'CONTRATO DE PRESTAÇÃO';
      const title2 = 'DE SERVIÇOS';
      doc.text(title1, 105, 130, { align: 'center' });
      doc.text(title2, 105, 140, { align: 'center' });

      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184);
      doc.text('Assessoria em Visto', 105, 160, { align: 'center' });
      doc.text(visaTypeName + ' — Espanha', 105, 168, { align: 'center' });

      // Client card
      doc.setFillColor(30, 41, 59);
      doc.roundedRect(40, 200, 130, 45, 4, 4, 'F');
      
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('CONTRATANTE', 50, 212);
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text(data.client_name || '[NOME COMPLETO]', 50, 225);

      // Date and Validity
      doc.setFillColor(30, 41, 59);
      doc.roundedRect(40, 255, 60, 25, 3, 3, 'F');
      doc.roundedRect(110, 255, 60, 25, 3, 3, 'F');
      
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text('DATA', 70, 265, { align: 'center' });
      doc.text('VALIDADE', 140, 265, { align: 'center' });
      
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text(dateStr || '[DATA]', 70, 273, { align: 'center' });
      doc.text('Até conclusão', 140, 273, { align: 'center' });

      drawFooter(1);

      // ===== PAGE 2 - PARTES =====
      doc.addPage();
      drawHeader(2);
      
      let y = 40;
      y = drawSectionTitle(y, '1', 'Partes');

      // CONTRATANTE
      doc.setFillColor(249, 250, 251);
      doc.roundedRect(15, y, 180, 65, 3, 3, 'F');
      doc.setFontSize(9);
      doc.setTextColor(30, 64, 175);
      doc.setFont('helvetica', 'bold');
      doc.text('CONTRATANTE', 20, y + 7);
      
      doc.setFontSize(7);
      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'normal');
      
      y += 15;
      doc.text(`Nome: ${data.client_name || '[NOME COMPLETO]'}`, 20, y);
      doc.text(`Nacionalidade: ${data.client_nationality || '[NACIONALIDADE]'}`, 120, y);
      y += 7;
      doc.text(`Data de nascimento: ${data.client_birth_date ? new Date(data.client_birth_date).toLocaleDateString('pt-BR') : '[DATA DE NASCIMENTO]'}`, 20, y);
      y += 7;
      doc.text(`Passaporte: ${data.client_passport || '[NÚMERO DO PASSAPORTE]'} (validade: ${data.client_passport_expiry || '[VALIDADE]'})`, 20, y);
      y += 7;
      doc.text(`CPF: ${data.client_cpf || '[CPF]'}`, 20, y);
      doc.text(`RG: ${data.client_rg || '[RG]'}`, 120, y);
      y += 7;
      doc.text(`Endereço: ${data.client_address || '[ENDEREÇO COMPLETO]'}`, 20, y);
      y += 7;
      doc.text(`Cidade: ${data.client_city || '[CIDADE]'}`, 20, y);
      doc.text(`País: ${data.client_country || '[PAÍS]'}`, 80, y);
      doc.text(`CEP: ${data.client_cep || '[CEP]'}`, 140, y);
      y += 7;
      doc.text(`Telefone: ${data.client_phone || '[TELEFONE]'}`, 20, y);
      doc.text(`E-mail: ${data.client_email || '[EMAIL]'}`, 100, y);
      
      y += 15;

      // CONTRATADA
      doc.setFillColor(254, 242, 242);
      doc.roundedRect(15, y, 180, 55, 3, 3, 'F');
      doc.setFontSize(9);
      doc.setTextColor(220, 38, 38);
      doc.setFont('helvetica', 'bold');
      doc.text('CONTRATADA', 20, y + 7);
      
      doc.setFontSize(7);
      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.text('NOMADWAY', 20, y + 17);
      
      doc.setFont('helvetica', 'normal');
      doc.text('Representante Legal: Edmar Candido Braga', 20, y + 25);
      doc.text('CPF: 023.711.176-41', 120, y + 25);
      y += 7;
      doc.text('Endereço:', 20, y + 25);
      doc.text('Rua Londrina, 230', 20, y + 32);
      doc.text('Jardim Canadá', 20, y + 39);
      doc.text('Pouso Alegre – MG', 80, y + 32);
      doc.text('CEP: 37558-753', 80, y + 39);
      doc.text('E-mail: contato@nomadway.com.br', 140, y + 32);
      y += 7;
      doc.text('Dados bancários:', 140, y + 25);
      doc.text('Banco: Bradesco', 140, y + 32);
      doc.text('Agência: 1497-4', 140, y + 39);
      doc.text('Conta: 008561-5', 140, y + 46);
      doc.text('PIX: edbraga20@gmail.com', 140, y + 53);

      y += 65;
      y = drawSectionTitle(y, '2', 'Objeto');
      
      doc.setFillColor(249, 250, 251);
      doc.roundedRect(15, y, 180, 16, 3, 3, 'F');
      doc.setFontSize(7);
      doc.setTextColor(30, 41, 59);
      doc.text(`Prestação de serviços especializados de assessoria estratégica, documental e informativa para ${serviceDesc}.`, 20, y + 10);

      y += 25;
      y = drawSectionTitle(y, '3', 'Escopo');
      
      const escopoItems = [
        'Análise de elegibilidade migratória',
        'Planejamento estratégico do processo',
        'Lista personalizada de documentos',
        'Modelos de declarações e contratos',
        'Revisão documental técnica',
        'Orientação para solicitação do visto',
        'Acompanhamento consultivo durante o processo'
      ];
      
      escopoItems.forEach((item, i) => {
        doc.setFillColor(236, 253, 245);
        doc.roundedRect(15, y + i * 7, 180, 6, 1, 1, 'F');
        doc.setTextColor(16, 185, 129);
        doc.text('✓', 18, y + i * 7 + 4.5);
        doc.setTextColor(30, 41, 59);
        doc.text(item, 23, y + i * 7 + 4.5);
      });

      drawFooter(2);

      // ===== PAGE 3 =====
      doc.addPage();
      drawHeader(3);
      y = 40;

      y = drawSectionTitle(y, '4', 'Natureza da Prestação');
      doc.setFillColor(254, 243, 199);
      doc.roundedRect(15, y, 180, 14, 3, 3, 'F');
      doc.setFontSize(7);
      doc.setTextColor(146, 64, 14);
      doc.text('A prestação constitui assessoria privada documental e estratégica.', 20, y + 5);
      doc.text('Não há garantia de aprovação do visto, pois a decisão final pertence exclusivamente às autoridades migratórias competentes.', 20, y + 10);

      y += 22;
      y = drawSectionTitle(y, '5', 'Prazo');
      doc.setFillColor(249, 250, 251);
      doc.roundedRect(15, y, 180, 10, 3, 3, 'F');
      doc.setFontSize(7);
      doc.setTextColor(30, 41, 59);
      doc.text('A vigência deste contrato permanece válida até a conclusão do processo administrativo do visto.', 20, y + 6);

      y += 18;
      y = drawSectionTitle(y, '6', 'Valor e Pagamento');
      
      // Value box
      doc.setFillColor(220, 252, 231);
      doc.roundedRect(15, y, 85, 25, 4, 4, 'F');
      doc.setFillColor(16, 185, 129);
      doc.rect(15, y, 4, 25, 'F');
      doc.setFontSize(8);
      doc.setTextColor(22, 101, 52);
      doc.text('VALOR TOTAL DO SERVIÇO', 22, y + 8);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(valueFormatted, 22, y + 20);

      // Payment methods
      doc.setFillColor(249, 250, 251);
      doc.roundedRect(105, y, 90, 25, 3, 3, 'F');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text('PAGAMENTO À VISTA', 110, y + 8);
      doc.setTextColor(30, 41, 59);
      doc.text('Pagamento único no ato da assinatura', 110, y + 14);
      doc.text('do contrato.', 110, y + 19);

      y += 32;
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text('FORMAS DE PAGAMENTO:', 15, y);
      y += 5;
      
      doc.setFillColor(239, 246, 255);
      doc.roundedRect(15, y, 55, 8, 2, 2, 'F');
      doc.roundedRect(75, y, 55, 8, 2, 2, 'F');
      doc.roundedRect(135, y, 55, 8, 2, 2, 'F');
      doc.setTextColor(30, 64, 175);
      doc.text('PIX', 42.5, y + 5.5, { align: 'center' });
      doc.text('Wise', 102.5, y + 5.5, { align: 'center' });
      doc.text('Remessa', 162.5, y + 5.5, { align: 'center' });

      y += 18;
      y = drawSectionTitle(y, '7', 'Obrigações da Contratada');
      
      const obrContratada = [
        'Fornecer orientação estratégica e documental',
        'Disponibilizar materiais e modelos necessários',
        'Auxiliar na organização do processo',
        'Manter confidencialidade das informações'
      ];
      
      obrContratada.forEach((item, i) => {
        doc.setFillColor(236, 253, 245);
        doc.roundedRect(15, y + i * 7, 180, 6, 1, 1, 'F');
        doc.setTextColor(16, 185, 129);
        doc.text('✓', 18, y + i * 7 + 4.5);
        doc.setTextColor(30, 41, 59);
        doc.text(item, 23, y + i * 7 + 4.5);
      });

      y += 35;
      y = drawSectionTitle(y, '8', 'Obrigações do Contratante');
      
      const obrContratante = [
        'Fornecer documentos verdadeiros',
        'Cumprir prazos solicitados',
        'Efetuar pagamentos conforme acordado',
        'Responsabilizar-se pela veracidade das informações'
      ];
      
      obrContratante.forEach((item, i) => {
        doc.setFillColor(254, 242, 242);
        doc.roundedRect(15, y + i * 7, 180, 6, 1, 1, 'F');
        doc.setTextColor(220, 38, 38);
        doc.text('✓', 18, y + i * 7 + 4.5);
        doc.setTextColor(30, 41, 59);
        doc.text(item, 23, y + i * 7 + 4.5);
      });

      drawFooter(3);

      // ===== PAGE 4 =====
      doc.addPage();
      drawHeader(4);
      y = 40;

      y = drawSectionTitle(y, '9', 'Limitação de Responsabilidade');
      doc.setFillColor(254, 243, 199);
      doc.roundedRect(15, y, 180, 16, 3, 3, 'F');
      doc.setFillColor(245, 158, 11);
      doc.rect(15, y, 3, 16, 'F');
      doc.setFontSize(7);
      doc.setTextColor(146, 64, 14);
      doc.text('O CONTRATANTE reconhece que a aprovação do visto depende exclusivamente das autoridades governamentais competentes.', 22, y + 5);
      doc.text('Nenhuma assessoria pode garantir resultado positivo.', 22, y + 10);
      doc.text('Prazos e exigências podem mudar a qualquer momento.', 22, y + 14);

      y += 24;
      y = drawSectionTitle(y, '10', 'Política de Cancelamento');
      doc.setFillColor(254, 242, 242);
      doc.roundedRect(15, y, 180, 28, 3, 3, 'F');
      doc.setFillColor(220, 38, 38);
      doc.rect(15, y, 3, 28, 'F');
      doc.setFontSize(7);
      doc.setTextColor(127, 29, 29);
      doc.text('Após o início dos trâmites não haverá possibilidade de reembolso total ou parcial.', 22, y + 5);
      doc.text('Considera-se iniciado quando ocorrer:', 22, y + 11);
      doc.setTextColor(30, 41, 59);
      doc.text('• Envio da lista de documentos', 22, y + 17);
      doc.text('• Primeira análise estratégica', 95, y + 17);
      doc.text('• Entrega de modelos personalizados', 22, y + 23);
      doc.text('• Início do acompanhamento do processo', 95, y + 23);

      y += 38;
      y = drawSectionTitle(y, '11', 'Proteção de Dados');
      doc.setFillColor(249, 250, 251);
      doc.roundedRect(15, y, 180, 16, 3, 3, 'F');
      doc.setFontSize(7);
      doc.setTextColor(30, 41, 59);
      doc.text('Base legal: LGPD (Lei 13.709/2018) e GDPR (Regulamento UE 2016/679).', 20, y + 5);
      doc.text('Os dados serão utilizados exclusivamente para execução do serviço contratado.', 20, y + 10);
      doc.text('Prazo de retenção: 5 anos após conclusão do serviço.', 20, y + 14);

      y += 24;
      y = drawSectionTitle(y, '12', 'Confidencialidade');
      doc.setFillColor(249, 250, 251);
      doc.roundedRect(15, y, 180, 10, 3, 3, 'F');
      doc.setFontSize(7);
      doc.text('Todas as informações fornecidas pelo CONTRATANTE serão tratadas como estritamente confidenciais.', 20, y + 6);

      y += 18;
      y = drawSectionTitle(y, '13', 'Propriedade Intelectual');
      doc.setFillColor(249, 250, 251);
      doc.roundedRect(15, y, 180, 10, 3, 3, 'F');
      doc.setFontSize(7);
      doc.text('Materiais, métodos e estratégias utilizados pertencem à NOMADWAY e são de uso exclusivo do CONTRATANTE.', 20, y + 6);

      y += 18;
      y = drawSectionTitle(y, '14', 'Relação entre as Partes');
      doc.setFillColor(249, 250, 251);
      doc.roundedRect(15, y, 180, 10, 3, 3, 'F');
      doc.setFontSize(7);
      doc.text('Este contrato não estabelece vínculo empregatício, sociedade ou representação legal entre as partes.', 20, y + 6);

      y += 18;
      y = drawSectionTitle(y, '15', 'Força Maior');
      doc.setFillColor(249, 250, 251);
      doc.roundedRect(15, y, 180, 10, 3, 3, 'F');
      doc.setFontSize(7);
      doc.text('A CONTRATADA não se responsabiliza por atrasos decorrentes de mudanças legislativas, decisões governamentais ou crises administrativas.', 20, y + 6);

      y += 18;
      y = drawSectionTitle(y, '16', 'Legislação e Foro');
      doc.setFillColor(249, 250, 251);
      doc.roundedRect(15, y, 180, 10, 3, 3, 'F');
      doc.setFontSize(7);
      doc.text('Este contrato é regido pelas leis brasileiras. Fica eleito o foro da comarca de Pouso Alegre – MG.', 20, y + 6);

      drawFooter(4);

      // ===== PAGE 5 =====
      doc.addPage();
      drawHeader(5);
      y = 40;

      y = drawSectionTitle(y, '17', 'Assinatura Digital');
      doc.setFillColor(239, 246, 255);
      doc.roundedRect(15, y, 180, 10, 3, 3, 'F');
      doc.setFontSize(7);
      doc.setTextColor(30, 64, 175);
      doc.text('As partes concordam que este contrato poderá ser assinado digitalmente e terá validade jurídica plena.', 20, y + 6);

      y += 18;
      y = drawSectionTitle(y, '18', 'Declaração Final');
      doc.setFillColor(254, 242, 242);
      doc.roundedRect(15, y, 180, 22, 3, 3, 'F');
      doc.setFillColor(220, 38, 38);
      doc.rect(15, y, 3, 22, 'F');
      doc.setFontSize(7);
      doc.setTextColor(127, 29, 29);
      doc.setFont('helvetica', 'bold');
      doc.text('O CONTRATANTE declara que:', 22, y + 5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      doc.text('(I) compreende integralmente o serviço contratado', 22, y + 11);
      doc.text('(II) está ciente de que não há garantia de aprovação', 22, y + 15);
      doc.text('(III) concorda com todos os termos deste contrato', 22, y + 19);

      y += 32;
      
      // ASSINATURAS
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.text('ASSINATURAS', 105, y, { align: 'center' });
      
      y += 15;
      
      // Contratante
      doc.setDrawColor(100, 116, 139);
      doc.setLineWidth(0.3);
      doc.line(20, y + 25, 100, y + 25);
      
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.text('CONTRATANTE', 60, y + 32, { align: 'center' });
      
      doc.setFillColor(249, 250, 251);
      doc.roundedRect(20, y + 38, 80, 35, 3, 3, 'F');
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text(data.client_name || '[NOME COMPLETO]', 25, y + 45);
      doc.setTextColor(100, 116, 139);
      doc.text(`CPF: ${data.client_cpf || '[CPF]'}`, 25, y + 52);
      doc.text(`Data: ${dateStr}`, 25, y + 59);
      doc.text('Assinatura:', 25, y + 66);

      // Contratada
      doc.setDrawColor(220, 38, 38);
      doc.setLineWidth(0.5);
      doc.line(110, y + 25, 190, y + 25);
      
      doc.setFontSize(9);
      doc.setTextColor(220, 38, 38);
      doc.setFont('helvetica', 'bold');
      doc.text('CONTRATADA', 150, y + 32, { align: 'center' });
      
      doc.setFillColor(254, 242, 242);
      doc.roundedRect(110, y + 38, 80, 35, 3, 3, 'F');
      doc.setFontSize(7);
      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.text('NOMADWAY', 115, y + 45);
      doc.setFont('helvetica', 'normal');
      doc.text('Edmar Candido Braga', 115, y + 52);
      doc.setTextColor(100, 116, 139);
      doc.text('Representante Legal', 115, y + 59);
      doc.text('CPF: 023.711.176-41', 115, y + 66);
      doc.text(`Data: ${dateStr}`, 115, y + 73);

      // TESTEMUNHAS
      y += 120;
      
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.text('TESTEMUNHAS (OPCIONAL)', 105, y + 10, { align: 'center' });
      
      y += 15;
      
      // Testemunha 1
      doc.setDrawColor(100, 116, 139);
      doc.setLineWidth(0.3);
      doc.line(20, y + 20, 100, y + 20);
      doc.setFillColor(249, 250, 251);
      doc.roundedRect(20, y + 25, 80, 15, 2, 2, 'F');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text('Nome: _________________________', 25, y + 32);
      doc.text('CPF: _________________________', 25, y + 38);
      
      // Testemunha 2
      doc.line(110, y + 20, 190, y + 20);
      doc.setFillColor(249, 250, 251);
      doc.roundedRect(110, y + 25, 80, 15, 2, 2, 'F');
      doc.text('Nome: _________________________', 115, y + 32);
      doc.text('CPF: _________________________', 115, y + 38);

      drawFooter(5);

      // Save
      const filename = `contrato-${(data.client_name || 'cliente').toLowerCase().replace(/\s+/g, '-')}.pdf`;
      console.log('📄 PDF - Salvando arquivo:', filename);
      console.log('📄 PDF - Tipo de visto FINAL:', visaTypeName);
      console.log('📄 PDF - Descrição do serviço:', serviceDesc);
      alert(`PDF gerado!\n\nTipo de Visto: ${visaTypeName}\n\nO download começará automaticamente.`);
      doc.save(filename);
      setStatus('done');

    } catch (err) {
      console.error('Error generating PDF:', err);
      setStatus('error');
      setError('Erro ao gerar PDF. Tente novamente.');
    }
  };

  if (status === 'loading' || status === 'generating') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <span className="text-3xl animate-pulse">📄</span>
          </div>
          <p className="text-white text-lg">{status === 'loading' ? 'Carregando...' : 'Gerando PDF...'}</p>
          <p className="text-gray-400 text-sm mt-2">O download começará automaticamente</p>
        </div>
      </div>
    );
  }

  if (status === 'showing' && visaInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
            <span className="text-3xl">🛂</span>
          </div>
          <p className="text-white text-xl font-semibold mb-2">{visaInfo.name}</p>
          <p className="text-blue-400 text-2xl font-bold mb-4">{visaInfo.type}</p>
          <p className="text-gray-400 text-sm mt-4">Gerando PDF em 2 segundos...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl">❌</span>
          </div>
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button onClick={() => window.close()} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
            Fechar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
          <span className="text-3xl">✅</span>
        </div>
        <p className="text-white text-lg mb-2">PDF gerado com sucesso!</p>
        <p className="text-gray-400 text-sm mb-4">O download começará automaticamente</p>
        <button onClick={() => window.close()} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
          Fechar
        </button>
      </div>
    </div>
  );
}

export default function ContractPDFPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center animate-pulse">
          <span className="text-3xl text-white">📄</span>
        </div>
      </div>
    }>
      <ContractPDFGenerator />
    </Suspense>
  );
}