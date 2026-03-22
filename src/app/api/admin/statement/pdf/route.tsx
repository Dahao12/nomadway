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
    padding: 30,
    fontSize: 8,
    fontFamily: 'Helvetica',
    lineHeight: 1.3,
    backgroundColor: '#FFFFFF',
  },
  header: {
    marginBottom: 15,
  },
  logoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00B9FF',
  },
  logoSubtext: {
    fontSize: 7,
    color: '#333',
    marginTop: 2,
  },
  address: {
    fontSize: 7,
    color: '#666',
    marginTop: 8,
    lineHeight: 1.4,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 7,
    color: '#666',
    marginBottom: 10,
  },
  
  accountInfo: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 4,
  },
  accountRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  accountLabel: {
    fontSize: 7,
    color: '#666',
    width: 100,
  },
  accountValue: {
    fontSize: 8,
    color: '#333',
    fontWeight: 'bold',
  },
  
  balanceBox: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 4,
    padding: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 7,
    color: '#4CAF50',
    letterSpacing: 1,
  },
  balanceValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 4,
  },
  balanceDate: {
    fontSize: 6,
    color: '#666',
    marginTop: 2,
  },
  
  transactionTable: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
  },
  tableHeaderCell: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#333',
  },
  colDesc: { width: '45%' },
  colDate: { width: '20%' },
  colRef: { width: '20%', textAlign: 'right' },
  colAmount: { width: '15%', textAlign: 'right' },
  
  tableRow: {
    flexDirection: 'row',
    padding: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: '#EEE',
  },
  tableCell: {
    fontSize: 7,
    color: '#333',
  },
  tableCellRight: {
    fontSize: 7,
    color: '#333',
    textAlign: 'right',
  },
  
  income: {
    color: '#2E7D32',
  },
  expense: {
    color: '#D32F2F',
  },
  
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopColor: '#DDD',
    paddingTop: 8,
  },
  footerText: {
    fontSize: 6,
    color: '#666',
    textAlign: 'center',
    lineHeight: 1.5,
  },
  footerId: {
    fontSize: 6,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
    fontFamily: 'Courier',
  },
});

// Generate random but realistic transaction ID
function generateTransactionId(): string {
  const prefix = 'TRANSFER-';
  const num = Math.floor(Math.random() * 2000000000) + 1800000000;
  return `${prefix}${num}`;
}

// Generate unique statement ID
function generateStatementId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

// Format currency
function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Format EUR
function formatEUR(value: number): string {
  return value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Parse date
function parseDate(dateStr: string): Date {
  const [year, month] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, 1);
}

// Format date for display
function formatDateBR(date: Date): string {
  return date.toLocaleDateString('pt-BR');
}

function StatementDocument({ data }: { data: StatementData }) {
  const startDate = parseDate(data.period_start);
  const endDate = parseDate(data.period_end);
  
  // Generate unique IDs
  const statementId = generateStatementId();
  
  // Calculate balance progression (ending around 10k-15k)
  const mainIncome = 18000 + Math.floor(Math.random() * 2000); // 18-20k
  const finalBalance = 10000 + Math.floor(Math.random() * 5000); // 10-15k
  
  // Generate transactions (one main income, several smaller)
  const transactions: Array<{
    date: Date;
    description: string;
    type: 'income' | 'expense' | 'conversion';
    amount: number;
    reference: string;
  }> = [];
  
  // Main income transaction (from M&A)
  const incomeDate = new Date(startDate);
  incomeDate.setDate(10 + Math.floor(Math.random() * 5)); // 10-15 of month
  transactions.push({
    date: incomeDate,
    description: 'Recebeu dinheiro de M&A - M A C LTDA com a referência "Servicos de comunicacao"',
    type: 'income',
    amount: mainIncome,
    reference: generateTransactionId(),
  });
  
  // Generate smaller outgoing transactions
  const numTransactions = 6 + Math.floor(Math.random() * 4); // 6-10 transactions
  
  let runningBalance = mainIncome;
  let currentDate = new Date(startDate);
  
  for (let i = 0; i < numTransactions; i++) {
    // Advance date
    currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + Math.floor((i + 1) * (28 / numTransactions)));
    if (currentDate > endDate) {
      currentDate = new Date(endDate);
      currentDate.setDate(currentDate.getDate() - Math.floor(Math.random() * 5));
    }
    
    const isExpense = Math.random() > 0.3;
    const isConversion = !isExpense && Math.random() > 0.5;
    
    if (isConversion) {
      // EUR conversion
      const brlAmount = 100 + Math.floor(Math.random() * 900); // 100-1000 BRL
      const eurAmount = brlAmount / 6.5; // Approximate rate
      runningBalance -= brlAmount;
      transactions.push({
        date: currentDate,
        description: `${formatBRL(brlAmount)} BRL convertidos para ${formatEUR(eurAmount)} EUR`,
        type: 'conversion',
        amount: brlAmount,
        reference: `BALANCE-${Math.floor(Math.random() * 5000000000)}`,
      });
    } else if (isExpense) {
      // Transfer out
      const amount = 100 + Math.floor(Math.random() * 500);
      runningBalance -= amount;
      transactions.push({
        date: currentDate,
        description: `Enviou dinheiro para ${data.client_name.split(' ')[0].toUpperCase()} ${data.client_name.split(' ').slice(1).map((n: string) => n.toUpperCase()).join(' ')}`,
        type: 'expense',
        amount: amount,
        reference: generateTransactionId(),
      });
    } else {
      // Small income
      const amount = 200 + Math.floor(Math.random() * 800);
      runningBalance += amount;
      transactions.push({
        date: currentDate,
        description: `Recebeu dinheiro de ${data.client_name.split(' ')[0].toUpperCase()} ${data.client_name.split(' ').slice(1).map((n: string) => n.toUpperCase()).join(' ')} com a referência ""`,
        type: 'income',
        amount: amount,
        reference: generateTransactionId(),
      });
    }
  }
  
  // Add cashback
  const cashbackDate = new Date(startDate);
  cashbackDate.setDate(2 + Math.floor(Math.random() * 5));
  const cashbackAmount = 50 + Math.floor(Math.random() * 100);
  transactions.push({
    date: cashbackDate,
    description: 'Cashback',
    type: 'income',
    amount: cashbackAmount,
    reference: `BALANCE_CASHBACK-${generateStatementId().toLowerCase()}-${generateStatementId().toLowerCase()}-${generateStatementId().toLowerCase()}`,
  });
  
  // Sort transactions by date (newest first)
  transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
  
  // Adjust final balance
  const balanceDisplay = formatBRL(finalBalance);
  
  // Format dates for header
  const periodStartStr = startDate.toLocaleDateString('pt-BR');
  const periodEndStr = endDate.toLocaleDateString('pt-BR');
  const generatedStr = new Date().toLocaleDateString('pt-BR');
  
  // Generate account number
  const accountNumber = Math.floor(Math.random() * 90000000) + 10000000;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logoText}>Wise</Text>
          <Text style={styles.logoSubtext}>Brasil Instituição de Pagamento Ltda.</Text>
          <Text style={styles.address}>
            Rua Girassol, 555, 1º andar, Vila Madalena{'\n'}
            São Paulo - SP CEP 05.433-001 Brazil
          </Text>
        </View>
        
        <Text style={styles.title}>Extrato em BRL</Text>
        <Text style={styles.subtitle}>
          {periodStartStr} [GMT+01:00] - {periodEndStr} [GMT+01:00]{'\n'}
          Gerado em: {generatedStr}
        </Text>
        
        {/* Account Info */}
        <View style={styles.accountInfo}>
          <View style={styles.accountRow}>
            <Text style={styles.accountLabel}>Titular da Conta</Text>
            <Text style={styles.accountValue}>{data.client_name.toUpperCase()}</Text>
          </View>
          <View style={styles.accountRow}>
            <Text style={styles.accountLabel}>Endereço</Text>
            <Text style={styles.accountValue}>{data.client_address.toUpperCase()}</Text>
          </View>
          <View style={styles.accountRow}>
            <Text style={styles.accountLabel}>Cidade/CEP</Text>
            <Text style={styles.accountValue}>{data.client_city.toUpperCase()} - {data.client_country.toUpperCase()} {data.client_cep}</Text>
          </View>
          <View style={styles.accountRow}>
            <Text style={styles.accountLabel}>Número da conta</Text>
            <Text style={styles.accountValue}>{accountNumber}</Text>
          </View>
        </View>
        
        {/* Balance */}
        <View style={styles.balanceBox}>
          <Text style={styles.balanceLabel}>BRL em {periodEndStr} [GMT+01:00]</Text>
          <Text style={styles.balanceValue}>R$ {balanceDisplay}</Text>
        </View>
        
        {/* Transaction Table */}
        <View style={styles.transactionTable}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colDesc]}>Descrição</Text>
            <Text style={[styles.tableHeaderCell, styles.colDate]}>Data</Text>
            <Text style={[styles.tableHeaderCell, styles.colRef]}>Referência</Text>
            <Text style={[styles.tableHeaderCell, styles.colAmount]}>Valor</Text>
          </View>
          
          {transactions.map((tx, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.colDesc]}>
                {tx.description.length > 60 ? tx.description.substring(0, 57) + '...' : tx.description}
              </Text>
              <Text style={[styles.tableCell, styles.colDate]}>
                {formatDateBR(tx.date)}
              </Text>
              <Text style={[styles.tableCell, styles.colRef]}>
                {tx.reference.substring(0, 15)}...
              </Text>
              <Text style={[styles.tableCellRight, styles.colAmount, tx.type === 'income' ? styles.income : styles.expense]}>
                {tx.type === 'income' ? '' : '-'}R$ {formatBRL(tx.amount)}
              </Text>
            </View>
          ))}
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            A Wise Brasil Pagamentos LTDA é uma Instituição de Pagamentos em processo de autorização{'\n'}
            pelo Banco Central do Brasil, com o CNPJ 40.571.694/0001-31 e registrada sob o endereço{'\n'}
            Rua Girassol, 555, Andar 1, Vila Madalena, São Paulo - SP, CEP 05.433-001.{'\n'}
            Tel: 0800 878 1204. Contato da Ouvidoria: 0800 878 2802 wise@ouvidoria.com{'\n'}
            Precisa de ajuda? Visite wise.com/help
          </Text>
          <Text style={styles.footerId}>
            ID: {statementId}-{Date.now().toString(36).toUpperCase()}
          </Text>
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

    const data: StatementData = JSON.parse(decodeURIComponent(dataParam));
    
    // Set default period if not provided
    if (!data.period_start || !data.period_end) {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      data.period_start = startDate.toISOString().split('T')[0];
      data.period_end = endDate.toISOString().split('T')[0];
    }
    
    const filename = `extrato-wise-${(data.client_name || 'cliente').toLowerCase().replace(/\s+/g, '-')}.pdf`;
    
    const pdfBuffer = await renderToBuffer(<StatementDocument data={data} />);
    
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
    
  } catch (error) {
    console.error('Error generating statement PDF:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar extrato', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}