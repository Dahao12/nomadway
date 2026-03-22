import { NextRequest, NextResponse } from 'next/server';
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

interface StatementData {
  client_name: string;
  client_address: string;
  client_city: string;
  client_country: string;
  client_cep: string;
  period_start: string;
  period_end: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 35,
    fontSize: 9,
    fontFamily: 'Helvetica',
    lineHeight: 1.35,
    backgroundColor: '#FFFFFF',
  },
  
  // Header - simple text, no styling
  header: {
    marginBottom: 20,
  },
  companyName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  companyAddress: {
    fontSize: 8,
    color: '#555555',
    lineHeight: 1.3,
  },
  
  // Title
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 15,
    marginBottom: 6,
  },
  period: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  generated: {
    fontSize: 9,
    color: '#555555',
    marginBottom: 15,
  },
  
  // Account info
  accountLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 3,
  },
  accountValue: {
    fontSize: 9,
    color: '#333333',
    marginBottom: 2,
  },
  accountSection: {
    marginBottom: 20,
  },
  
  // Balance
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#DEDEDE',
  },
  balanceLeft: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  balanceRight: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  
  // Table
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#DEDEDE',
    marginBottom: 8,
  },
  thDesc: { width: '55%', fontSize: 9, fontWeight: 'bold' },
  thIn: { width: '15%', fontSize: 9, fontWeight: 'bold', textAlign: 'right' },
  thOut: { width: '15%', fontSize: 9, fontWeight: 'bold', textAlign: 'right' },
  thVal: { width: '15%', fontSize: 9, fontWeight: 'bold', textAlign: 'right' },
  
  row: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5E5',
  },
  descCell: { width: '55%' },
  inCell: { width: '15%', textAlign: 'right', fontSize: 9 },
  outCell: { width: '15%', textAlign: 'right', fontSize: 9 },
  valCell: { width: '15%', textAlign: 'right', fontSize: 9 },
  
  descText: {
    fontSize: 9,
    color: '#1A1A1A',
    marginBottom: 2,
  },
  metaText: {
    fontSize: 7,
    color: '#666666',
  },
  
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 35,
    right: 35,
  },
  footerText: {
    fontSize: 7,
    color: '#555555',
    textAlign: 'center',
    lineHeight: 1.5,
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerRef: {
    fontSize: 6,
    color: '#999999',
  },
  footerPage: {
    fontSize: 7,
    color: '#888888',
  },
});

function genRef(): string {
  const c = '0123456789abcdef';
  let r = '';
  for (let i = 0; i < 8; i++) r += c[Math.floor(Math.random() * c.length)];
  r += '-';
  for (let i = 0; i < 4; i++) r += c[Math.floor(Math.random() * c.length)];
  r += '-';
  for (let i = 0; i < 4; i++) r += c[Math.floor(Math.random() * c.length)];
  r += '-';
  for (let i = 0; i < 4; i++) r += c[Math.floor(Math.random() * c.length)];
  r += '-';
  for (let i = 0; i < 12; i++) r += c[Math.floor(Math.random() * c.length)];
  return r;
}

function genTx(): string {
  return String(Math.floor(Math.random() * 5000000000));
}

function fmtBRL(v: number): string {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(d: Date): string {
  const m = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  return `${d.getDate()} de ${m[d.getMonth()]} de ${d.getFullYear()}`;
}

function buildTx(fn: string, ln: string, sd: Date, ed: Date): Array<{d: string; dt: Date; r: string; ex?: string; in?: number; out?: number; v: number}> {
  return [
    { d: '89,00 BRL convertidos para 13,71 EUR', dt: new Date(ed.getFullYear(), ed.getMonth(), 31), r: 'BALANCE-4722945850', out: 89.00, v: 10000.65 },
    { d: '100,00 BRL convertidos para 15,42 EUR', dt: new Date(ed.getFullYear(), ed.getMonth(), 28), r: 'BALANCE-4707447389', out: 100.00, v: 10089.65 },
    { d: '100,00 BRL convertidos para 15,45 EUR', dt: new Date(ed.getFullYear(), ed.getMonth(), 22), r: 'BALANCE-4680150867', out: 100.00, v: 10189.65 },
    { d: 'Enviou dinheiro para Priscila Nicolai', dt: new Date(ed.getFullYear(), ed.getMonth(), 22), r: 'TRANSFER-1932609420', ex: '007610', out: 97.39, v: 10289.65 },
    { d: '196,27 BRL convertidos para 30,00 EUR', dt: new Date(ed.getFullYear(), ed.getMonth(), 15), r: 'BALANCE-4643129106', out: 196.27, v: 10387.04 },
    { d: `Recebeu dinheiro de ${fn} ${ln} com a referência ""`, dt: new Date(ed.getFullYear(), ed.getMonth(), 14), r: 'TRANSFER-1920712414', 'in': 380.00, v: 10583.31 },
    { d: '5.900,00 BRL convertidos para 899,61 EUR', dt: new Date(ed.getFullYear(), ed.getMonth(), 6), r: 'BALANCE-4596761509', out: 5900.00, v: 10203.31 },
    { d: 'Cashback', dt: new Date(ed.getFullYear(), ed.getMonth(), 6), r: 'BALANCE_CASHBACK-6e3af1d6-bc32-4a2c-05ad-4fa1f3db3281', 'in': 119.81, v: 16103.31 },
    { d: '3.100,00 BRL convertidos para 462,45 EUR', dt: new Date(ed.getFullYear(), ed.getMonth(), 1), r: 'BALANCE-4571077461', out: 3100.00, v: 15983.50 },
    { d: `Recebeu dinheiro de ${fn} ${ln} com a referência ""`, dt: new Date(ed.getFullYear(), ed.getMonth(), 1), r: 'TRANSFER-1899369929', 'in': 1000.00, v: 19083.50 },
    { d: 'Recebeu dinheiro de M&A - M A C LTDA. com a referência "Servicos de comunicacao"', dt: new Date(sd.getFullYear(), sd.getMonth(), 12), r: 'TRANSFER-1867369925', ex: 'Servicos de comunicacao', 'in': 18000.00, v: 18083.50 },
    { d: '500,00 BRL convertidos para 75,54 EUR', dt: new Date(sd.getFullYear(), sd.getMonth(), 11), r: 'BALANCE-4462666205', out: 500.00, v: 83.50 },
    { d: `Enviou dinheiro para ${fn} ${ln}`, dt: new Date(sd.getFullYear(), sd.getMonth(), 11), r: 'TRANSFER-1865042071', out: 9000.00, v: 583.50 },
    { d: `Enviou dinheiro para ${fn} ${ln}`, dt: new Date(sd.getFullYear(), sd.getMonth(), 10), r: 'TRANSFER-1864167917', out: 9000.00, v: 9583.50 },
    { d: '680,00 BRL convertidos para 101,05 EUR', dt: new Date(sd.getFullYear(), sd.getMonth(), 6), r: 'BALANCE-4436904865', out: 680.00, v: 18583.50 },
    { d: 'Cashback', dt: new Date(sd.getFullYear(), sd.getMonth(), 2), r: 'BALANCE_CASHBACK-6b66fba4-b556-49fc-07b8-90936195ff9a', 'in': 80.65, v: 19263.50 },
    { d: `Enviou dinheiro para ${fn} ${ln}`, dt: new Date(sd.getFullYear(), sd.getMonth(), 1), r: 'TRANSFER-1847768769', out: 1200.00, v: 19182.85 },
  ];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dataParam = searchParams.get('data');
    
    if (!dataParam) {
      return NextResponse.json({ error: 'Dados não fornecidos' }, { status: 400 });
    }

    const data: StatementData = JSON.parse(decodeURIComponent(dataParam));
    
    const startDate = data.period_start ? new Date(data.period_start) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const endDate = data.period_end ? new Date(data.period_end) : new Date();
    const today = new Date();
    
    const ref = genRef();
    const accountNum = '31499690' + Math.floor(Math.random() * 10);
    
    const fn = data.client_name.split(' ')[0].toUpperCase();
    const ln = data.client_name.split(' ').slice(1).join(' ').toUpperCase();
    const transactions = buildTx(fn, ln, startDate, endDate);
    
    const p1t = transactions.slice(0, 10);
    const p2t = transactions.slice(10);
    
    const clientName = data.client_name.toUpperCase();
    const clientAddr = (data.client_address || '').toUpperCase();
    const clientCity = (data.client_city || '').toUpperCase();
    const clientCep = (data.client_cep || '00000000').replace('-', '');
    const clientCountry = (data.client_country || 'BRASIL').toUpperCase();
    
    const periodStartStr = fmtDate(startDate);
    const periodEndStr = fmtDate(endDate);
    const generatedStr = fmtDate(today);

    const pdfBuffer = await renderToBuffer(
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.companyName}>Wise Brasil Instituição de Pagamento Ltda.</Text>
            <Text style={styles.companyAddress}>Rua Girassol, 555, 1º andar, Vila Madalena{'\n'}São Paulo - SP{'\n'}CEP 05.433-001{'\n'}Brazil</Text>
          </View>
          
          <Text style={styles.title}>Extrato em BRL</Text>
          <Text style={styles.period}>{periodStartStr} [GMT+01:00] - {periodEndStr} [GMT+01:00]</Text>
          <Text style={styles.generated}>Gerado em: {generatedStr}</Text>
          
          <View style={styles.accountSection}>
            <Text style={styles.accountLabel}>Titular da Conta</Text>
            <Text style={styles.accountValue}>{clientName}</Text>
            <Text style={styles.accountValue}>{clientAddr}{'\n'}{clientCity}{'\n'}{clientCountry}{'\n'}{clientCep}</Text>
            <Text style={styles.accountLabel}>Número da conta</Text>
            <Text style={styles.accountValue}>{accountNum}</Text>
          </View>
          
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLeft}>BRL em {periodEndStr} [GMT+01:00]</Text>
            <Text style={styles.balanceRight}>  {fmtBRL(10000.65)} BRL</Text>
          </View>
          
          <View style={styles.tableHeader}>
            <Text style={styles.thDesc}>Descrição</Text>
            <Text style={styles.thIn}>Entrada</Text>
            <Text style={styles.thOut}>Saída</Text>
            <Text style={styles.thVal}>Valor</Text>
          </View>
          
          {p1t.map((t, i) => (
            <View key={i} style={styles.row}>
              <View style={styles.descCell}>
                <Text style={styles.descText}>{t.d}</Text>
                <Text style={styles.metaText}>{fmtDate(t.dt)}   Transação: {t.r}{t.ex ? '   Referência: ' + t.ex : ''}</Text>
              </View>
              <Text style={styles.inCell}>{t.in ? fmtBRL(t.in) : ''}</Text>
              <Text style={styles.outCell}>{t.out ? '-' + fmtBRL(t.out) : ''}</Text>
              <Text style={styles.valCell}>  {fmtBRL(t.v)}</Text>
            </View>
          ))}
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>A Wise Brasil Pagamentos LTDA é uma Instituição de Pagamentos em processo de autorização pelo Banco Central do Brasil, com o CNPJ 40.571.694/0001-31 e registrada sob o endereço Rua Girassol, 555, Andar 1, Vila Madalena, São Paulo - SP, CEP 05.433-001. Tel: 0800 878 1204. Contato da Ouvidoria: 0800 878 2802 wise@ouvidoria.com{'\n'}Precisa de ajuda? Visite   wise.com/help</Text>
            <View style={styles.footerRow}>
              <Text style={styles.footerRef}>ref:{ref}   1 / 2</Text>
              <Text style={styles.footerPage}>1 / 2</Text>
            </View>
          </View>
        </Page>
        
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.companyName}>Wise Brasil Instituição de Pagamento Ltda.</Text>
            <Text style={styles.companyAddress}>Rua Girassol, 555, 1º andar, Vila Madalena{'\n'}São Paulo - SP{'\n'}CEP 05.433-001{'\n'}Brazil</Text>
          </View>
          
          <View style={styles.tableHeader}>
            <Text style={styles.thDesc}>Descrição</Text>
            <Text style={styles.thIn}>Entrada</Text>
            <Text style={styles.thOut}>Saída</Text>
            <Text style={styles.thVal}>Valor</Text>
          </View>
          
          {p2t.map((t, i) => (
            <View key={i} style={styles.row}>
              <View style={styles.descCell}>
                <Text style={styles.descText}>{t.d}</Text>
                <Text style={styles.metaText}>{fmtDate(t.dt)}   Transação: {t.r}{t.ex ? '   Referência: ' + t.ex : ''}</Text>
              </View>
              <Text style={styles.inCell}>{t.in ? fmtBRL(t.in) : ''}</Text>
              <Text style={styles.outCell}>{t.out ? '-' + fmtBRL(t.out) : ''}</Text>
              <Text style={styles.valCell}>  {fmtBRL(t.v)}</Text>
            </View>
          ))}
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>A Wise Brasil Pagamentos LTDA é uma Instituição de Pagamentos em processo de autorização pelo Banco Central do Brasil, com o CNPJ 40.571.694/0001-31 e registrada sob o endereço Rua Girassol, 555, Andar 1, Vila Madalena, São Paulo - SP, CEP 05.433-001. Tel: 0800 878 1204. Contato da Ouvidoria: 0800 878 2802 wise@ouvidoria.com{'\n'}Precisa de ajuda? Visite   wise.com/help</Text>
            <View style={styles.footerRow}>
              <Text style={styles.footerRef}>ref:{ref}   2 / 2</Text>
              <Text style={styles.footerPage}>2 / 2</Text>
            </View>
          </View>
        </Page>
      </Document>
    );
    
    const filename = `statement_${accountNum}_BRL_${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}.pdf`;
    
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
    
  } catch (error) {
    console.error('Error generating statement PDF:', error);
    return NextResponse.json({ error: 'Erro ao gerar extrato', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}