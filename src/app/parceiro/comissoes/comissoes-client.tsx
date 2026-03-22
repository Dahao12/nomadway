'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Commission {
  id: string;
  client_name: string;
  client_email?: string;
  service_type?: string;
  amount_cents: number;
  status: string;
  source?: string;
  notes?: string;
  created_at: string;
  paid_at?: string;
}

interface Partner {
  id: string;
  code: string;
  name: string;
  total_earnings_cents: number;
  total_paid_cents: number;
}

export default function ComissoesClient() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code') || 'EZE01';
  
  const [partner, setPartner] = useState<Partner | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPartnerData();
  }, [code]);

  const fetchPartnerData = async () => {
    try {
      // Buscar parceiro
      const partnerRes = await fetch(`/api/partners?code=${code}`);
      const partnerData = await partnerRes.json();
      
      if (partnerData.partners?.[0]) {
        const p = partnerData.partners[0];
        setPartner(p);
        
        // Buscar comissões
        const commissionsRes = await fetch(`/api/commissions?partner_id=${p.id}&limit=100`);
        const commissionsData = await commissionsRes.json();
        setCommissions(commissionsData.commissions || []);
      }
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return `€${(cents / 100).toFixed(0)}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      approved: 'bg-blue-100 text-blue-700 border-blue-200',
      paid: 'bg-green-100 text-green-700 border-green-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendente',
      approved: 'Aprovado',
      paid: 'Pago',
      cancelled: 'Cancelado',
    };
    return labels[status] || status;
  };

  const filteredCommissions = commissions.filter(c => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  const counts = {
    all: commissions.length,
    pending: commissions.filter(c => c.status === 'pending').length,
    approved: commissions.filter(c => c.status === 'approved').length,
    paid: commissions.filter(c => c.status === 'paid').length,
    cancelled: commissions.filter(c => c.status === 'cancelled').length,
  };

  const totals = {
    pending: commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.amount_cents, 0),
    approved: commissions.filter(c => c.status === 'approved').reduce((sum, c) => sum + c.amount_cents, 0),
    paid: commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.amount_cents, 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href={`/parceiro?code=${code}`} className="inline-flex items-center text-blue-600 hover:text-blue-700">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Voltar ao Dashboard
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Suas Comissões</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Pendente</p>
            <p className="text-3xl font-bold text-yellow-600">{formatCurrency(totals.pending)}</p>
            <p className="text-sm text-gray-400">{counts.pending} comissões</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Aprovado</p>
            <p className="text-3xl font-bold text-blue-600">{formatCurrency(totals.approved)}</p>
            <p className="text-sm text-gray-400">{counts.approved} comissões</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Recebido</p>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(totals.paid)}</p>
            <p className="text-sm text-gray-400">{counts.paid} comissões</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'all', label: 'Todas', count: counts.all },
            { key: 'pending', label: 'Pendentes', count: counts.pending },
            { key: 'approved', label: 'Aprovadas', count: counts.approved },
            { key: 'paid', label: 'Pagas', count: counts.paid },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>

        {/* Commissions List */}
        {filteredCommissions.length === 0 ? (
          <div className="bg-white rounded-xl p-8 shadow-sm text-center">
            <p className="text-gray-500">Nenhuma comissão encontrada</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serviço</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCommissions.map((commission) => (
                  <tr key={commission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{commission.client_name}</p>
                      {commission.client_email && (
                        <p className="text-sm text-gray-500">{commission.client_email}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {commission.service_type || 'Nomad Visa'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(commission.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-gray-900">{formatCurrency(commission.amount_cents)}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(commission.status)}`}>
                        {getStatusLabel(commission.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Payment Info */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="font-bold text-blue-900 mb-2">💰 Informações de Pagamento</h3>
          <p className="text-blue-800 text-sm mb-2">
            Comissões são processadas dia <strong>15 de cada mês</strong>.
          </p>
          <p className="text-blue-800 text-sm">
            Você tem <strong>{formatCurrency(totals.pending + totals.approved)}</strong> em comissões pendentes de aprovação/pagamento.
          </p>
        </div>
      </main>
    </div>
  );
}