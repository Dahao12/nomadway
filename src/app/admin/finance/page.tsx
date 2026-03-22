"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Currency exchange rates (approximate)
const EXCHANGE_RATES: Record<string, number> = {
  EUR: 1,
  USD: 1.08,
  BRL: 5.35, // Real
  GBP: 0.85, // Libra
};

const CURRENCIES = [
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'USD', name: 'Dólar', symbol: '$' },
  { code: 'BRL', name: 'Real', symbol: 'R$' },
  { code: 'GBP', name: 'Libra', symbol: '£' },
];

// Default categories
const DEFAULT_CATEGORIES = {
  income: [
    { name: 'Visto Digital Nomad', emoji: '🛂', color: '#10B981' },
    { name: 'Consulta', emoji: '💬', color: '#3B82F6' },
    { name: 'Pacote Completo', emoji: '📦', color: '#8B5CF6' },
    { name: 'Serviço Extra', emoji: '⚡', color: '#F59E0B' },
    { name: 'Outros', emoji: '💰', color: '#6B7280' },
  ],
  expense: [
    { name: 'Marketing', emoji: '📢', color: '#EF4444' },
    { name: 'Software', emoji: '💻', color: '#3B82F6' },
    { name: 'Impostos', emoji: '📄', color: '#F59E0B' },
    { name: 'Viagens', emoji: '✈️', color: '#EC4899' },
    { name: 'Escritório', emoji: '🏢', color: '#6B7280' },
    { name: 'Pessoal', emoji: '👤', color: '#8B5CF6' },
    { name: 'Outros', emoji: '💸', color: '#94A3B8' },
  ],
};

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  currency: string;
  amount_eur: number;
  description: string;
  category_id: string | null;
  category?: { name: string; emoji: string; color: string };
  client_id: string | null;
  client?: { full_name: string };
  transaction_date: string;
  payment_method: string | null;
  invoice_number: string | null;
  notes: string | null;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  emoji: string;
  color: string;
}

interface Client {
  id: string;
  full_name: string;
}

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'add'>('overview');
  
  // Filters
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
  
  // Form
  const [formData, setFormData] = useState({
    type: 'income' as 'income' | 'expense',
    amount: '',
    currency: 'EUR',
    description: '',
    category_id: '',
    client_id: '',
    transaction_date: new Date().toISOString().slice(0, 10),
    payment_method: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [filterMonth]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch transactions for the month
      const startDate = `${filterMonth}-01`;
      const endDate = `${filterMonth}-31`;
      
      const [txRes, catRes, clientRes] = await Promise.all([
        fetch(`/api/finance/transactions?start=${startDate}&end=${endDate}`),
        fetch('/api/finance/categories'),
        fetch('/api/clients?limit=100'),
      ]);

      if (txRes.ok) {
        const data = await txRes.json();
        setTransactions(data.transactions || []);
      }
      
      if (catRes.ok) {
        const data = await catRes.json();
        setCategories(data.categories || []);
      }
      
      if (clientRes.ok) {
        const data = await clientRes.json();
        setClients(data.clients?.map((c: { id: string; full_name?: string; name?: string }) => ({ id: c.id, full_name: c.full_name || c.name })) || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) return;

    setSubmitting(true);
    try {
      const amount = parseFloat(formData.amount);
      const rate = EXCHANGE_RATES[formData.currency] || 1;
      
      const res = await fetch('/api/finance/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount,
          amount_eur: amount * rate,
          category_id: formData.category_id || null,
          client_id: formData.client_id || null,
        }),
      });

      if (res.ok) {
        setFormData({
          type: 'income',
          amount: '',
          currency: 'EUR',
          description: '',
          category_id: '',
          client_id: '',
          transaction_date: new Date().toISOString().slice(0, 10),
          payment_method: '',
          notes: '',
        });
        fetchData();
        setActiveTab('transactions');
      } else {
        const error = await res.json();
        alert(error.error || 'Erro ao salvar transação');
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta transação?')) return;
    
    try {
      await fetch(`/api/finance/transactions?id=${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  // Calculate totals
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount_eur || 0), 0);
  
  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount_eur || 0), 0);
  
  const profit = income - expenses;

  // Get category emoji
  const getCategoryEmoji = (tx: Transaction) => {
    if (tx.category?.emoji) return tx.category.emoji;
    const cat = categories.find(c => c.id === tx.category_id);
    return cat?.emoji || '💰';
  };

  // Get category name
  const getCategoryName = (tx: Transaction) => {
    if (tx.category?.name) return tx.category.name;
    const cat = categories.find(c => c.id === tx.category_id);
    return cat?.name || 'Outros';
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(t => 
    filterType === 'all' || t.type === filterType
  );

  // Export CSV
  const exportCSV = () => {
    const headers = ['Data', 'Tipo', 'Categoria', 'Descrição', 'Valor', 'Moeda', 'Valor EUR', 'Cliente'];
    const rows = filteredTransactions.map(t => [
      t.transaction_date,
      t.type === 'income' ? 'Entrada' : 'Saída',
      getCategoryName(t),
      t.description,
      t.amount,
      t.currency,
      t.amount_eur?.toFixed(2),
      t.client?.full_name || '',
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financeiro-${filterMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get categories for current type
  const availableCategories = formData.type === 'income' 
    ? DEFAULT_CATEGORIES.income 
    : DEFAULT_CATEGORIES.expense;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie receitas e despesas
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={exportCSV}
            disabled={filteredTransactions.length === 0}
          >
            📊 Exportar CSV
          </Button>
          <Button 
            onClick={() => setActiveTab('add')}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            + Nova Transação
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium transition-all ${
            activeTab === 'overview'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          📊 Visão Geral
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2 font-medium transition-all ${
            activeTab === 'transactions'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          📋 Transações
        </button>
        <button
          onClick={() => setActiveTab('add')}
          className={`px-4 py-2 font-medium transition-all ${
            activeTab === 'add'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          + Adicionar
        </button>
      </div>

      {/* Month Filter */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">Mês:</label>
        <input
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid sm:grid-cols-3 gap-4">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-green-600 font-medium">Receitas</span>
                      <span className="text-2xl">📈</span>
                    </div>
                    <div className="text-3xl font-bold text-green-700">
                      €{income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm text-green-600 mt-1">
                      {transactions.filter(t => t.type === 'income').length} transações
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-rose-50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-red-600 font-medium">Despesas</span>
                      <span className="text-2xl">📉</span>
                    </div>
                    <div className="text-3xl font-bold text-red-700">
                      €{expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm text-red-600 mt-1">
                      {transactions.filter(t => t.type === 'expense').length} transações
                    </div>
                  </CardContent>
                </Card>

                <Card className={`border-0 shadow-lg bg-gradient-to-br ${profit >= 0 ? 'from-blue-50 to-cyan-50' : 'from-orange-50 to-amber-50'}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${profit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                        {profit >= 0 ? 'Lucro' : 'Prejuízo'}
                      </span>
                      <span className="text-2xl">{profit >= 0 ? '💰' : '⚠️'}</span>
                    </div>
                    <div className={`text-3xl font-bold ${profit >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                      €{Math.abs(profit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className={`text-sm mt-1 ${profit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                      {profit >= 0 ? '+' : '-'}{((profit / income) * 100 || 0).toFixed(1)}% margem
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Category Breakdown */}
              <div className="grid sm:grid-cols-2 gap-6">
                {/* Income by Category */}
                <Card className="border-0 shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-green-700">Receitas por Categoria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {DEFAULT_CATEGORIES.income.map(cat => {
                      const catTotal = transactions
                        .filter(t => t.type === 'income' && getCategoryName(t) === cat.name)
                        .reduce((sum, t) => sum + (t.amount_eur || 0), 0);
                      const percentage = income > 0 ? (catTotal / income) * 100 : 0;
                      
                      if (catTotal === 0) return null;
                      
                      return (
                        <div key={cat.name} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                          <div className="flex items-center gap-2">
                            <span>{cat.emoji}</span>
                            <span className="text-sm text-gray-700">{cat.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-900">
                              €{catTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                      );
                    })}
                    {income === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        Nenhuma receita este mês
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Expenses by Category */}
                <Card className="border-0 shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-red-700">Despesas por Categoria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {DEFAULT_CATEGORIES.expense.map(cat => {
                      const catTotal = transactions
                        .filter(t => t.type === 'expense' && getCategoryName(t) === cat.name)
                        .reduce((sum, t) => sum + (t.amount_eur || 0), 0);
                      const percentage = expenses > 0 ? (catTotal / expenses) * 100 : 0;
                      
                      if (catTotal === 0) return null;
                      
                      return (
                        <div key={cat.name} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                          <div className="flex items-center gap-2">
                            <span>{cat.emoji}</span>
                            <span className="text-sm text-gray-700">{cat.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-900">
                              €{catTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                      );
                    })}
                    {expenses === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        Nenhuma despesa este mês
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="space-y-4">
              {/* Type Filter */}
              <div className="flex gap-2">
                {['all', 'income', 'expense'].map(type => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type as typeof filterType)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filterType === type
                        ? type === 'income' 
                          ? 'bg-green-100 text-green-700'
                          : type === 'expense'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-200 text-gray-700'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {type === 'all' ? 'Todos' : type === 'income' ? 'Receitas' : 'Despesas'}
                  </button>
                ))}
              </div>

              {/* Transaction List */}
              <Card className="border-0 shadow-md">
                <CardContent className="p-0">
                  {filteredTransactions.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      Nenhuma transação encontrada
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {filteredTransactions
                        .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
                        .map(tx => (
                          <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                                tx.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                              }`}>
                                {getCategoryEmoji(tx)}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{tx.description}</div>
                                <div className="text-sm text-gray-500 flex items-center gap-2">
                                  <span>{getCategoryName(tx)}</span>
                                  {tx.client?.full_name && (
                                    <>
                                      <span>•</span>
                                      <span className="text-blue-600">{tx.client.full_name}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className={`font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                  {tx.type === 'income' ? '+' : '-'}€{(tx.amount_eur || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                                {tx.currency !== 'EUR' && (
                                  <div className="text-xs text-gray-500">
                                    {tx.currency} {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </div>
                                )}
                                <div className="text-xs text-gray-500">
                                  {new Date(tx.transaction_date).toLocaleDateString('pt-BR')}
                                </div>
                              </div>
                              <button
                                onClick={() => handleDelete(tx.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Add Transaction Tab */}
          {activeTab === 'add' && (
            <Card className="border-0 shadow-md max-w-2xl">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Type Toggle */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'income', category_id: '' })}
                        className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                          formData.type === 'income'
                            ? 'bg-green-100 text-green-700 ring-2 ring-green-500'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        📈 Receita
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'expense', category_id: '' })}
                        className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                          formData.type === 'expense'
                            ? 'bg-red-100 text-red-700 ring-2 ring-red-500'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        📉 Despesa
                      </button>
                    </div>
                  </div>

                  {/* Amount and Currency */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Valor</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Moeda</label>
                      <select
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                        className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        {CURRENCIES.map(c => (
                          <option key={c.code} value={c.code}>{c.symbol} {c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                    <Input
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Ex: Pagamento visto nômade digital"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {availableCategories.map(cat => (
                        <button
                          key={cat.name}
                          type="button"
                          onClick={() => setFormData({ ...formData, category_id: cat.name })}
                          className={`px-3 py-2 rounded-lg text-sm transition-all ${
                            formData.category_id === cat.name
                              ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {cat.emoji} {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
                    <Input
                      type="date"
                      value={formData.transaction_date}
                      onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                      required
                    />
                  </div>

                  {/* Client (for income) */}
                  {formData.type === 'income' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cliente (opcional)</label>
                      <select
                        value={formData.client_id}
                        onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                        className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Selecione um cliente...</option>
                        {clients.map(client => (
                          <option key={client.id} value={client.id}>{client.full_name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Forma de Pagamento</label>
                    <select
                      value={formData.payment_method}
                      onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                      className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione...</option>
                      <option value="pix">PIX</option>
                      <option value="transfer">Transferência</option>
                      <option value="card">Cartão</option>
                      <option value="cash">Dinheiro</option>
                      <option value="stripe">Stripe</option>
                      <option value="other">Outro</option>
                    </select>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notas (opcional)</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Observações adicionais..."
                    />
                  </div>

                  {/* Submit */}
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={submitting || !formData.amount || !formData.description}
                      className={`flex-1 ${formData.type === 'income' 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                        : 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700'
                      }`}
                    >
                      {submitting ? 'Salvando...' : (formData.type === 'income' ? '✓ Salvar Receita' : '✓ Salvar Despesa')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab('transactions')}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}