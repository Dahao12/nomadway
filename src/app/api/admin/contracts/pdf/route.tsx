import { NextRequest, NextResponse } from 'next/server';
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

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
  service_value?: string;
  discount_percent?: string;
  discount_value?: string;
  payment_method?: string;
}

const f = (v: string | undefined, p: string) => v || p;

const colors = {
  primary: '#2563EB',
  primaryDark: '#1E40AF',
  accent: '#DC2626',
  success: '#10B981',
  warning: '#F59E0B',
  dark: '#0F172A',
  gray900: '#111827',
  gray700: '#374151',
  gray500: '#6B7280',
  gray300: '#D1D5DB',
  gray100: '#F3F4F6',
  gray50: '#F9FAFB',
  white: '#FFFFFF',
};

const styles = StyleSheet.create({
  page: {
    padding: 35,
    fontSize: 9,
    fontFamily: 'Helvetica',
    lineHeight: 1.4,
    backgroundColor: '#FFFFFF',
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
  },
  headerLogo: {
    backgroundColor: colors.white,
    padding: 6,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 7,
    color: colors.gray500,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 5.5,
    color: colors.gray500,
    marginTop: 1,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 6,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray300,
  },
  sectionNumber: {
    backgroundColor: colors.primary,
    width: 18,
    height: 18,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  sectionNumberText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.dark,
    flex: 1,
  },
  
  block: {
    backgroundColor: colors.gray50,
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.gray300,
  },
  blockClient: {
    borderLeftColor: colors.primary,
    backgroundColor: '#EFF6FF',
  },
  blockCompany: {
    borderLeftColor: colors.accent,
    backgroundColor: '#FEF2F2',
  },
  blockWarning: {
    borderLeftColor: colors.warning,
    backgroundColor: '#FFFBEB',
  },
  blockSuccess: {
    borderLeftColor: colors.success,
    backgroundColor: '#ECFDF5',
  },
  
  blockLabel: {
    fontSize: 7,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  blockLabelAccent: {
    color: colors.accent,
  },
  
  blockText: {
    fontSize: 8.5,
    color: colors.gray900,
    marginBottom: 2,
    lineHeight: 1.35,
  },
  blockTextBold: {
    fontWeight: 'bold',
    fontSize: 9,
  },
  blockTextIndent: {
    fontSize: 8.5,
    color: colors.gray900,
    marginBottom: 2,
    lineHeight: 1.35,
    paddingLeft: 12,
  },
  
  checkGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 6,
  },
  checkItem: {
    width: '48%',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 4,
    padding: 6,
    marginBottom: 3,
  },
  checkText: {
    fontSize: 8,
    color: colors.gray700,
  },
  
  valueBox: {
    backgroundColor: '#ECFDF5',
    borderWidth: 2,
    borderColor: colors.success,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  valueLabel: {
    fontSize: 7,
    color: colors.success,
    letterSpacing: 1,
    marginBottom: 2,
  },
  valueAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#166534',
  },
  
  signatureSection: {
    marginTop: 35,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: colors.gray300,
  },
  signatureTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
    color: colors.dark,
  },
  signatureGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: '45%',
    alignItems: 'center',
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gray500,
    width: '100%',
    marginBottom: 8,
    height: 30,
  },
  signatureLineAccent: {
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
  },
  signatureLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 3,
    color: colors.gray700,
  },
  signatureLabelAccent: {
    color: colors.accent,
  },
  signatureName: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  signatureMuted: {
    fontSize: 7,
    color: colors.gray500,
    marginBottom: 1,
  },
  
  witnessSection: {
    marginTop: 25,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray300,
  },
  witnessTitle: {
    fontSize: 8,
    color: colors.gray500,
    textAlign: 'center',
    marginBottom: 12,
  },
  witnessGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  witnessBox: {
    width: '45%',
    alignItems: 'center',
  },
  witnessLine: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gray300,
    width: '100%',
    marginBottom: 6,
    height: 18,
  },
  
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 35,
    right: 35,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.gray300,
    paddingTop: 8,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 6,
    color: colors.gray500,
  },
  footerRight: {
    fontSize: 6,
    color: colors.gray500,
  },
  
  cover: {
    backgroundColor: colors.dark,
    padding: 50,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  coverLogoWrap: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 16,
    marginBottom: 35,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  coverLogo: {
    width: 140,
    height: 50,
    objectFit: 'contain',
  },
  coverSubtitle: {
    color: colors.gray500,
    fontSize: 9,
    letterSpacing: 3,
    marginBottom: 8,
  },
  coverTitle: {
    color: colors.white,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  coverTitleAccent: {
    color: colors.warning,
    fontSize: 14,
    textAlign: 'center',
  },
  coverClientBox: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 20,
    marginTop: 30,
    marginBottom: 25,
    alignItems: 'center',
    width: '65%',
  },
  coverLabel: {
    color: colors.gray500,
    fontSize: 8,
    letterSpacing: 2,
    marginBottom: 4,
  },
  coverValue: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  coverDatesRow: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 20,
  },
  coverDateBox: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    width: 120,
  },
  coverFooter: {
    position: 'absolute',
    bottom: 35,
    color: colors.gray500,
    fontSize: 8,
    letterSpacing: 1,
  },
  decoLine: {
    width: 60,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginTop: 15,
    marginBottom: 15,
  },
});

function ContractDocument({ data }: { data: ContractData }) {
  const today = new Date();
  const dateStr = today.toLocaleDateString('pt-BR');
  const originalValue = parseFloat(data.service_value || '1499.90');
  
  // Calculate discount
  let discountValue = 0;
  if (data.discount_percent) {
    discountValue = originalValue * (parseFloat(data.discount_percent) / 100);
  } else if (data.discount_value) {
    discountValue = parseFloat(data.discount_value);
  }
  
  const finalValue = Math.max(0, originalValue - discountValue);
  const valueFormatted = `€${finalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const originalFormatted = `€${originalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const discountFormatted = data.discount_percent 
    ? `${data.discount_percent}%` 
    : discountValue > 0 
      ? `€${discountValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
      : null;
  
  const formatBirth = (d: string | undefined) => d ? new Date(d).toLocaleDateString('pt-BR') : '[DATA]';

  return (
    <Document>
      {/* COVER PAGE */}
      <Page size="A4" style={styles.cover}>
        <View style={styles.coverLogoWrap}>
          <Image 
            src="https://nomadway-portal.vercel.app/logo.png" 
            style={styles.coverLogo}
          />
        </View>
        
        <Text style={styles.coverSubtitle}>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</Text>
        <Text style={styles.coverTitle}>Assessoria em Visto</Text>
        <Text style={styles.coverTitleAccent}>Visado de Nómada Digital — Espanha</Text>
        <View style={styles.decoLine} />
        
        <View style={styles.coverClientBox}>
          <Text style={styles.coverLabel}>CONTRATANTE</Text>
          <Text style={styles.coverValue}>{f(data.client_name, '[NOME COMPLETO]')}</Text>
        </View>
        
        <View style={styles.coverDatesRow}>
          <View style={styles.coverDateBox}>
            <Text style={styles.coverLabel}>DATA</Text>
            <Text style={styles.coverValue}>{dateStr}</Text>
          </View>
          <View style={styles.coverDateBox}>
            <Text style={styles.coverLabel}>VALIDADE</Text>
            <Text style={styles.coverValue} wrap={false}>12 meses</Text>
          </View>
        </View>
        
        <Text style={styles.coverFooter}>DOCUMENTO CONFIDENCIAL — NOMADWAY © 2026</Text>
      </Page>

      {/* CONTENT PAGES */}
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header} fixed>
          <View style={styles.headerLogo}>
            <Image 
              src="https://nomadway-portal.vercel.app/logo.png" 
              style={{ width: 90, height: 28, objectFit: 'contain' }}
            />
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerTitle}>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</Text>
            <Text style={styles.headerSubtitle}>Assessoria em Visado de Nómada Digital — Espanha</Text>
          </View>
        </View>

        {/* 1. PARTES */}
        <View style={styles.sectionHeader} wrap={false}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>1</Text>
          </View>
          <Text style={styles.sectionTitle}>DAS PARTES</Text>
        </View>

        <View style={[styles.block, styles.blockClient]} wrap={false}>
          <Text style={styles.blockLabel}>CONTRATANTE</Text>
          <Text style={[styles.blockText, styles.blockTextBold]}>{f(data.client_name, '[NOME COMPLETO]')}</Text>
          <Text style={styles.blockText}>Nacionalidade: {f(data.client_nationality, '[NACIONALIDADE]')} | Nascimento: {formatBirth(data.client_birth_date)}</Text>
          <Text style={styles.blockText}>Passaporte: {f(data.client_passport, '[Nº PASSAPORTE]')} | Validade: {f(data.client_passport_expiry, '[DATA]')}</Text>
          <Text style={styles.blockText}>CPF: {f(data.client_cpf, '[CPF]')} | RG: {f(data.client_rg, '[RG]')}</Text>
          {data.client_email && <Text style={styles.blockText}>E-mail: {data.client_email}</Text>}
          {data.client_phone && <Text style={styles.blockText}>Telefone: {data.client_phone}</Text>}
        </View>

        <View style={[styles.block, styles.blockCompany]} wrap={false}>
          <Text style={[styles.blockLabel, styles.blockLabelAccent]}>CONTRATADA</Text>
          <Text style={[styles.blockText, styles.blockTextBold]}>NOMADWAY — Assessoria em Vistos</Text>
          <Text style={styles.blockText}>CNPJ: [CNPJ] | Inscrição Estadual: Isento</Text>
          <Text style={styles.blockText}>Endereço: Rua Londrina, 230 — Jardim Canadá — Pouso Alegre – MG | CEP: 37558-753</Text>
          <Text style={styles.blockText}>Representante Legal: Edmar Candido Braga — CPF: 023.711.176-41</Text>
          <Text style={styles.blockText}>Contato: contato@nomadway.com.br | WhatsApp: +55 (35) 99981-0000</Text>
          <Text style={styles.blockText}>Horário de Atendimento: Segunda a sexta, das 09h às 18h (horário de Brasília)</Text>
        </View>

        {/* 2. OBJETO */}
        <View style={styles.sectionHeader} wrap={false}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>2</Text>
          </View>
          <Text style={styles.sectionTitle}>DO OBJETO</Text>
        </View>
        <View style={styles.block}>
          <Text style={styles.blockText}>2.1. O presente contrato tem por objeto a prestação de serviços especializados de assessoria estratégica, documental e informativa para solicitação de Visado de Nómada Digital (Visa for Digital Nomads) junto às autoridades espanholas.</Text>
          <Text style={styles.blockText}>2.2. Os serviços incluem: análise de elegibilidade, planejamento estratégico, elaboração de lista personalizada de documentos, revisão documental técnica, orientação para solicitação do visto e acompanhamento consultivo durante o processo.</Text>
          <Text style={styles.blockText}>2.3. O serviço NÃO inclui: representação legal perante autoridades, pagamento de taxas governamentais, tradução de documentos (salvo se contratado separadamente), despesas com envio de documentos, ou acompanhamento presencial.</Text>
        </View>

        {/* 3. ESCOPO */}
        <View style={styles.sectionHeader} wrap={false}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>3</Text>
          </View>
          <Text style={styles.sectionTitle}>DO ESCOPO DOS SERVIÇOS</Text>
        </View>
        <View style={styles.checkGrid}>
          <View style={styles.checkItem}><Text style={styles.checkText}>✓ Análise de elegibilidade migratória</Text></View>
          <View style={styles.checkItem}><Text style={styles.checkText}>✓ Planejamento estratégico do processo</Text></View>
          <View style={styles.checkItem}><Text style={styles.checkText}>✓ Lista personalizada de documentos</Text></View>
          <View style={styles.checkItem}><Text style={styles.checkText}>✓ Modelos de declarações e cartas</Text></View>
          <View style={styles.checkItem}><Text style={styles.checkText}>✓ Revisão documental técnica</Text></View>
          <View style={styles.checkItem}><Text style={styles.checkText}>✓ Orientação para preenchimento</Text></View>
          <View style={styles.checkItem}><Text style={styles.checkText}>✓ Acompanhamento consultivo</Text></View>
          <View style={styles.checkItem}><Text style={styles.checkText}>✓ Suporte via WhatsApp e e-mail</Text></View>
        </View>

        {/* 4. NATUREZA */}
        <View style={styles.sectionHeader} wrap={false}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>4</Text>
          </View>
          <Text style={styles.sectionTitle}>DA NATUREZA DOS SERVIÇOS</Text>
        </View>
        <View style={[styles.block, styles.blockWarning]}>
          <Text style={styles.blockText}>4.1. Os serviços prestados são de natureza consultiva e documental, configurando assessoria privada, e não representação legal ou advocatícia.</Text>
          <Text style={styles.blockText}>4.2. A CONTRATADA atua como consultora especializada, fornecendo orientação baseada em conhecimento técnico e experience prévia, mas não representa o CONTRATANTE perante autoridades consulares, migratórias ou judiciais.</Text>
          <Text style={styles.blockText}>4.3. O processo de solicitação de visto é de responsabilidade exclusiva do CONTRATANTE, sendo a CONTRATADA apenas uma facilitadora do processo.</Text>
        </View>

        {/* 5. PRAZO */}
        <View style={styles.sectionHeader} wrap={false}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>5</Text>
          </View>
          <Text style={styles.sectionTitle}>DO PRAZO DE VIGÊNCIA</Text>
        </View>
        <View style={styles.block}>
          <Text style={styles.blockText}>5.1. O presente contrato tem vigência de 12 (doze) meses a partir da data de assinatura, ou até a conclusão do processo de solicitação do visto, o que ocorrer primeiro.</Text>
          <Text style={styles.blockText}>5.2. Caso o processo não seja concluído dentro do prazo, o contrato poderá ser renovado por períodos iguais de 6 (seis) meses, mediante acordo entre as partes.</Text>
          <Text style={styles.blockText}>5.3. A renovação não implica novos custos, exceto se houver mudança significativa no escopo ou legislação aplicável.</Text>
        </View>

        {/* 6. VALOR */}
        <View style={styles.sectionHeader} wrap={false}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>6</Text>
          </View>
          <Text style={styles.sectionTitle}>DO VALOR E FORMA DE PAGAMENTO</Text>
        </View>
        <View style={styles.valueBox}>
          <Text style={styles.valueLabel}>VALOR TOTAL DO SERVIÇO</Text>
          <Text style={styles.valueAmount}>{valueFormatted}</Text>
        </View>
        <View style={styles.block}>
          <Text style={styles.blockText}>6.1. O pagamento deve ser realizado à vista, no ato da assinatura deste contrato, em moeda euros (€) ou equivalente em reais (R$) ao câmbio do dia.</Text>
          <Text style={styles.blockText}>6.2. Formas de pagamento aceitas: PIX (Brasil), Transferência Bancária, Wise, ou Remessa Internacional.</Text>
          <Text style={styles.blockText}>6.3. Taxas governamentais, traduções juramentadas, apostilamentos e demais despesas com documentos são de responsabilidade exclusiva do CONTRATANTE, não estando incluídas no valor do serviço.</Text>
          <Text style={styles.blockText}>6.4. Em caso de parcelamento (se acordado), o não pagamento de qualquer parcela implica suspensão imediata dos serviços até a regularização.</Text>
        </View>

        {/* 7. OBRIGAÇÕES DA CONTRATADA */}
        <View style={styles.sectionHeader} wrap={false}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>7</Text>
          </View>
          <Text style={styles.sectionTitle}>DAS OBRIGAÇÕES DA CONTRATADA</Text>
        </View>
        <View style={styles.block}>
          <Text style={styles.blockText}>7.1. Fornecer orientação estratégica e documental baseada em conhecimento técnico atualizado e experiência prévia.</Text>
          <Text style={styles.blockText}>7.2. Disponibilizar materiais, modelos e checklists personalizados para cada etapa do processo.</Text>
          <Text style={styles.blockText}>7.3. Auxiliar na organização e revisão do processo, identificando possíveis problemas antes da submissão.</Text>
          <Text style={styles.blockText}>7.4. Manter confidencialidade absoluta sobre todas as informações compartilhadas pelo CONTRATANTE.</Text>
          <Text style={styles.blockText}>7.5. Responder às solicitações do CONTRATANTE em até 48 (quarenta e oito) horas úteis, via WhatsApp ou e-mail.</Text>
          <Text style={styles.blockText}>7.6. Informar prontamente o CONTRATANTE sobre mudanças em requisitos ou procedimentos que possam afetar o processo.</Text>
        </View>

        {/* 8. OBRIGAÇÕES DO CONTRATANTE */}
        <View style={styles.sectionHeader} wrap={false}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>8</Text>
          </View>
          <Text style={styles.sectionTitle}>DAS OBRIGAÇÕES DO CONTRATANTE</Text>
        </View>
        <View style={[styles.block, styles.blockCompany]} wrap={false}>
          <Text style={styles.blockText}>8.1. Fornecer documentos verdadeiros, completos e atualizados, nas formas e prazos solicitados pela CONTRATADA.</Text>
          <Text style={styles.blockText}>8.2. Cumprir rigorosamente os prazos estabelecidos para envio de documentos e informações.</Text>
          <Text style={styles.blockText}>8.3. Efetuar os pagamentos conforme acordado, no ato da assinatura ou nas datas estipuladas.</Text>
          <Text style={styles.blockText}>8.4. Responsabilizar-se integralmente pela veracidade e precisão de todas as informações fornecidas.</Text>
          <Text style={styles.blockText}>8.5. Informar imediatamente qualquer mudança em sua situação pessoal, profissional ou financeira que possa afetar o processo.</Text>
          <Text style={styles.blockText}>8.6. Arcar com todas as taxas governamentais, traduções, apostilamentos e demais despesas não incluídas no serviço.</Text>
        </View>

        {/* 9. LIMITAÇÃO */}
        <View style={styles.sectionHeader} wrap={false}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>9</Text>
          </View>
          <Text style={styles.sectionTitle}>DA LIMITAÇÃO DE RESPONSABILIDADE</Text>
        </View>
        <View style={[styles.block, styles.blockWarning]}>
          <Text style={styles.blockText}>9.1. O CONTRATANTE declara estar ciente de que a aprovação do Visado de Nómada Digital depende exclusivamente das autoridades consulares e migratórias espanholas.</Text>
          <Text style={styles.blockText}>9.2. Nenhuma assessoria, consultoria ou empresa pode garantir a aprovação do visto. A CONTRATADA fornece orientação técnica baseada em experiência, mas não possui poder de decisão sobre o processo.</Text>
          <Text style={styles.blockText}>9.3. A CONTRATADA não se responsabiliza por: (I) recusas de visto por qualquer motivo; (II) mudanças na legislação espanhola ou da UE; (III) erros ou omissões nas informações fornecidas pelo CONTRATANTE; (IV) atrasos causados por órgãos governamentais ou terceiros.</Text>
          <Text style={styles.blockText}>9.4. Em caso de alterações legislativas que tornem o serviço inviável, a CONTRATADA poderá propor ajustes no escopo ou encerramento do contrato com devolução proporcional.</Text>
        </View>

        {/* 10. CANCELAMENTO */}
        <View style={styles.sectionHeader} wrap={false}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>10</Text>
          </View>
          <Text style={styles.sectionTitle}>DA POLÍTICA DE CANCELAMENTO</Text>
        </View>
        <View style={[styles.block, styles.blockCompany]} wrap={false}>
          <Text style={[styles.blockText, styles.blockTextBold]}>10.1. Após o início dos trâmites, não há reembolso dos valores pagos.</Text>
          <Text style={styles.blockText}>10.2. Considera-se iniciado o serviço a partir de:</Text>
          <Text style={styles.blockTextIndent}>• Envio da lista de documentos personalizada</Text>
          <Text style={styles.blockTextIndent}>• Primeira análise estratégica do perfil do cliente</Text>
          <Text style={styles.blockTextIndent}>• Entrega de modelos e orientações específicas</Text>
          <Text style={styles.blockTextIndent}>• Início do acompanhamento do processo</Text>
          <Text style={styles.blockText}>10.3. O CONTRATANTE pode solicitar cancelamento antes do início, com devolução integral do valor pago em até 7 (sete) dias úteis.</Text>
          <Text style={styles.blockText}>10.4. Caso o CONTRATANTE não forneça os documentos necessários em até 90 (noventa) dias, o contrato será considerado encerrado sem direito a reembolso.</Text>
        </View>

        {/* 11. COMUNICAÇÃO */}
        <View style={styles.sectionHeader} wrap={false}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>11</Text>
          </View>
          <Text style={styles.sectionTitle}>DA COMUNICAÇÃO</Text>
        </View>
        <View style={styles.block}>
          <Text style={styles.blockText}>11.1. Toda a comunicação será realizada preferencialmente via WhatsApp ou e-mail, ficando registrado no histórico do processo.</Text>
          <Text style={styles.blockText}>11.2. A CONTRATADA compromete-se a responder às dúvidas do CONTRATANTE em até 48 (quarenta e oito) horas úteis, exceto em casos de força maior ou períodos de alta demanda (quando o prazo será notificado).</Text>
          <Text style={styles.blockText}>11.3. O CONTRATANTE compromete-se a verificar regularmente suas mensagens e responder em até 5 (cinco) dias úteis às solicitações da CONTRATADA.</Text>
          <Text style={styles.blockText}>11.4. Mudanças de contato (e-mail, telefone) devem ser comunicadas imediatamente pelo CONTRATANTE.</Text>
        </View>

        {/* 12. ALTERAÇÕES */}
        <View style={styles.sectionHeader} wrap={false}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>12</Text>
          </View>
          <Text style={styles.sectionTitle}>DAS ALTERAÇÕES DE ESCOPO</Text>
        </View>
        <View style={styles.block}>
          <Text style={styles.blockText}>12.1. Alterações no escopo do serviço (ex: mudança de país, visto diferente, inclusão de dependentes) serão objetos de contrato adicional, com possível ajuste de valores.</Text>
          <Text style={styles.blockText}>12.2. Mudanças na legislação ou requisitos que impactem o processo podem exigir adaptações, que serão comunicadas e, se necessário, negociadas.</Text>
          <Text style={styles.blockText}>12.3. A CONTRATADA reserva-se o direito de atualizar procedimentos e documentos modelos sem aviso prévio, visando atender às exigências das autoridades.</Text>
        </View>

        {/* 13. PROTEÇÃO DE DADOS */}
        <View style={styles.sectionHeader} wrap={false}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>13</Text>
          </View>
          <Text style={styles.sectionTitle}>DA PROTEÇÃO DE DADOS</Text>
        </View>
        <View style={[styles.block, styles.blockSuccess]}>
          <Text style={styles.blockText}>13.1. Os dados pessoais são tratados conforme a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018) e o Regulamento Geral de Proteção de Dados da UE (GDPR), sendo utilizados exclusivamente para execução do serviço contratado.</Text>
          <Text style={styles.blockText}>13.2. O CONTRATANTE possui os seguintes direitos: (I) acesso aos seus dados; (II) correção de dados incompletos ou incorretos; (III) exclusão dos dados após a conclusão do serviço; (IV) revogação do consentimento.</Text>
          <Text style={styles.blockText}>13.3. Os dados serão armazenados por período de 5 (cinco) anos após a conclusão do serviço, conforme obrigações legais e de guarda documental.</Text>
          <Text style={styles.blockText}>13.4. Dados não serão compartilhados com terceiros sem consentimento, exceto quando exigido por lei.</Text>
        </View>

        {/* 14. CONFIDENCIALIDADE */}
        <View style={styles.sectionHeader} wrap={false}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>14</Text>
          </View>
          <Text style={styles.sectionTitle}>DA CONFIDENCIALIDADE</Text>
        </View>
        <View style={styles.block}>
          <Text style={styles.blockText}>14.1. Todas as informações compartilhadas entre as partes, incluindo dados pessoais, documentos e estratégias, são tratadas como estritamente confidenciais.</Text>
          <Text style={styles.blockText}>14.2. A obrigação de confidencialidade permanece vigente por 5 (cinco) anos após o término do contrato.</Text>
          <Text style={styles.blockText}>14.3. Exceções: (I) informações já de conhecimento público; (II) informações requeridas por ordem judicial ou administrativa; (III) informações necessárias para cumprimento de obrigações legais.</Text>
        </View>

        {/* 15. PROPRIEDADE */}
        <View style={styles.sectionHeader} wrap={false}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>15</Text>
          </View>
          <Text style={styles.sectionTitle}>DA PROPRIEDADE INTELECTUAL</Text>
        </View>
        <View style={styles.block}>
          <Text style={styles.blockText}>15.1. Materiais, métodos, modelos e checklists desenvolvidos pela CONTRATADA são de propriedade exclusiva da NOMADWAY, cedidos ao CONTRATANTE para uso exclusivo durante a vigência do contrato.</Text>
          <Text style={styles.blockText}>15.2. O CONTRATANTE não pode reproduzir, distribuir ou comercializar os materiais recebidos, sob pena de responsabilidade civil e criminal.</Text>
        </View>

        {/* 16. RELAÇÃO */}
        <View style={styles.sectionHeader} wrap={false}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>16</Text>
          </View>
          <Text style={styles.sectionTitle}>DA RELAÇÃO ENTRE AS PARTES</Text>
        </View>
        <View style={styles.block}>
          <Text style={styles.blockText}>16.1. Este contrato não gera vínculo empregatício, sociedade, joint venture ou representação legal entre as partes.</Text>
          <Text style={styles.blockText}>16.2. A CONTRATADA atua como prestadora de serviços independentes, sem exclusividade, podendo atender outros clientes simultaneamente.</Text>
          <Text style={styles.blockText}>16.3. O CONTRATANTE atua como consumidor final, sem poder de representação perante terceiros em nome da CONTRATADA.</Text>
        </View>

        {/* 17. FORÇA MAIOR */}
        <View style={styles.sectionHeader} wrap={false}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>17</Text>
          </View>
          <Text style={styles.sectionTitle}>DA FORÇA MAIOR</Text>
        </View>
        <View style={[styles.block, styles.blockWarning]}>
          <Text style={styles.blockText}>17.1. Nenhuma das partes será responsabilizada por atrasos ou impossibilidades decorrentes de força maior, incluindo: pandemias, guerras, desastres naturais, mudanças legislativas, decisões governamentais, greves, ou eventos externos imprevisíveis e inevitáveis.</Text>
          <Text style={styles.blockText}>17.2. A parte afetada deve notificar a outra em até 5 (cinco) dias úteis, propondo soluções alternativas ou encerramento amigável.</Text>
        </View>

        {/* 18. LEGISLAÇÃO */}
        <View style={styles.sectionHeader} wrap={false}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>18</Text>
          </View>
          <Text style={styles.sectionTitle}>DA LEGISLAÇÃO E FORO</Text>
        </View>
        <View style={styles.block}>
          <Text style={styles.blockText}>18.1. Este contrato é regido pelas leis da República Federativa do Brasil.</Text>
          <Text style={styles.blockText}>18.2. Qualquer controvérsia será submetida ao foro da Comarca de Pouso Alegre – MG, com renúncia expressa a qualquer outro, por mais privilegiado que seja.</Text>
        </View>

        {/* 19. ASSINATURA */}
        <View style={styles.sectionHeader} wrap={false}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>19</Text>
          </View>
          <Text style={styles.sectionTitle}>DA ASSINATURA DIGITAL</Text>
        </View>
        <View style={[styles.block, styles.blockClient]}>
          <Text style={styles.blockText}>19.1. As partes concordam que este contrato pode ser assinado digitalmente, por meio de assinatura eletrônica ou digital, com validade jurídica plena, conforme Lei nº 14.063/2020 e Medida Provisória nº 2.200-2/2001 (ICP-Brasil).</Text>
          <Text style={styles.blockText}>19.2. A assinatura digital possui o mesmo efeito jurídico da assinatura manuscrita, gerando obrigações entre as partes.</Text>
        </View>

        {/* 20. DECLARAÇÃO */}
        <View style={styles.sectionHeader} wrap={false}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>20</Text>
          </View>
          <Text style={styles.sectionTitle}>DA DECLARAÇÃO FINAL</Text>
        </View>
        <View style={[styles.block, styles.blockCompany]} wrap={false}>
          <Text style={[styles.blockText, styles.blockTextBold]}>O CONTRATANTE declara expressamente que:</Text>
          <Text style={styles.blockText}>(I) Leu e compreendeu integralmente todos os termos deste contrato;</Text>
          <Text style={styles.blockText}>(II) Está ciente de que a aprovação do visto não é garantida;</Text>
          <Text style={styles.blockText}>(III) Concorda em fornecer documentos verdadeiros e completos;</Text>
          <Text style={styles.blockText}>(IV) Arcará com taxas governamentais e despesas não incluídas;</Text>
          <Text style={styles.blockText}>(V) Entende que a CONTRATADA atua como consultora, não como representante legal.</Text>
        </View>

        {/* SIGNATURES */}
        <View style={styles.signatureSection} wrap={false}>
          <Text style={styles.signatureTitle}>ASSINATURAS</Text>
          <View style={styles.signatureGrid}>
            <View style={styles.signatureBox}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>CONTRATANTE</Text>
              <Text style={styles.signatureName}>{f(data.client_name, '[NOME]')}</Text>
              <Text style={styles.signatureMuted}>CPF: {f(data.client_cpf, '[CPF]')}</Text>
              <Text style={styles.signatureMuted}>Data: {dateStr}</Text>
            </View>
            <View style={styles.signatureBox}>
              <View style={[styles.signatureLine, styles.signatureLineAccent]} />
              <Text style={[styles.signatureLabel, styles.signatureLabelAccent]}>CONTRATADA</Text>
              <Text style={[styles.signatureName, { color: colors.accent }]}>NOMADWAY</Text>
              <Text style={styles.signatureName}>Edmar Candido Braga</Text>
              <Text style={styles.signatureMuted}>Representante Legal</Text>
              <Text style={styles.signatureMuted}>CPF: 023.711.176-41</Text>
              <Text style={styles.signatureMuted}>Data: {dateStr}</Text>
            </View>
          </View>
        </View>

        {/* WITNESSES */}
        <View style={styles.witnessSection} wrap={false}>
          <Text style={styles.witnessTitle}>TESTEMUNHAS (OPCIONAL)</Text>
          <View style={styles.witnessGrid}>
            <View style={styles.witnessBox}>
              <View style={styles.witnessLine} />
              <Text style={styles.signatureMuted}>Nome: ______________________</Text>
              <Text style={styles.signatureMuted}>CPF: _______________________</Text>
            </View>
            <View style={styles.witnessBox}>
              <View style={styles.witnessLine} />
              <Text style={styles.signatureMuted}>Nome: ______________________</Text>
              <Text style={styles.signatureMuted}>CPF: _______________________</Text>
            </View>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer} fixed>
          <View style={styles.footerLeft}>
            <Text style={styles.footerText}>NomadWay © 2026 — Documento Confidencial</Text>
          </View>
          <Text style={styles.footerRight} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} fixed />
        </View>
      </Page>
    </Document>
  );
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dataParam = searchParams.get('data');
    
    if (!dataParam) {
      return NextResponse.json({ error: 'Dados não fornecidos' }, { status: 400 });
    }

    const data: ContractData = JSON.parse(decodeURIComponent(dataParam));
    const filename = `contrato-${(data.client_name || 'cliente').toLowerCase().replace(/\s+/g, '-')}.pdf`;
    
    const pdfBuffer = await renderToBuffer(<ContractDocument data={data} />);
    
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}