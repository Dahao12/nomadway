'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Lead {
  id: string;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  source?: string;
  status: string;
  converted_to_client: boolean;
  notes?: string;
  created_at: string;
}

export default function LeadsClient() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code') || 'EZE01';
  const partnerId = searchParams.get('partner_id');
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (partnerId) {
      fetchLeads(partnerId);
    } else {
      fetchPartnerAndLeads();
    }
  }, [partnerId, code]);

  const fetchPartnerAndLeads = async () => {
    try {
      // Buscar parceiro pelo código
      const partnerRes = await fetch(`/api/partners?code=${code}`);
      const partnerData = await partnerRes.json();
      
      if (partnerData.partners?.[0]?.id) {
        await fetchLeads(partnerData.partners[0].id);
      }
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeads = async (pid: string) => {
    try {
      const res = await fetch(`/api/partner-leads?partner_id=${pid}&limit=100`);
      const data = await res.json();
      setLeads(data.leads || []);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-100 text-blue-700 border-blue-200',
      contacted: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      qualified: 'bg-purple-100 text-purple-700 border-purple-200',
      converted: 'bg-green-100 text-green-700 border-green-200',
      lost: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      new: 'Novo',
      contacted: 'Contatado',
      qualified: 'Qualificado',
      converted: 'Convertido',
      lost: 'Perdido',
    };
    return labels[status] || status;
  };

  const filteredLeads = leads.filter(lead => {
    if (filter === 'all') return true;
    return lead.status === filter;
  });

  const counts = {
    all: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    converted: leads.filter(l => l.status === 'converted').length,
    lost: leads.filter(l => l.status === 'lost').length,
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Seus Leads</h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'all', label: 'Todos', count: counts.all },
            { key: 'new', label: 'Novos', count: counts.new },
            { key: 'contacted', label: 'Contatados', count: counts.contacted },
            { key: 'qualified', label: 'Qualificados', count: counts.qualified },
            { key: 'converted', label: 'Convertidos', count: counts.converted },
            { key: 'lost', label: 'Perdidos', count: counts.lost },
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

        {/* Leads List */}
        {filteredLeads.length === 0 ? (
          <div className="bg-white rounded-xl p-8 shadow-sm text-center">
            <p className="text-gray-500">Nenhum lead encontrado</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLeads.map((lead) => (
              <div key={lead.id} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {lead.client_name || lead.client_email || 'Lead sem nome'}
                    </h3>
                    {lead.client_email && (
                      <p className="text-sm text-gray-500">{lead.client_email}</p>
                    )}
                    {lead.client_phone && (
                      <p className="text-sm text-gray-500">{lead.client_phone}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(lead.status)}`}>
                    {getStatusLabel(lead.status)}
                  </span>
                </div>
                
                <div className="flex gap-4 text-sm text-gray-500 mb-4">
                  <span>📍 {lead.source || 'Desconhecido'}</span>
                  <span>📅 {formatDate(lead.created_at)}</span>
                </div>

                {lead.notes && (
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mb-4">
                    📝 {lead.notes}
                  </p>
                )}

                <div className="flex gap-2">
                  {lead.client_phone && (
                    <a
                      href={`https://wa.me/${lead.client_phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
                    >
                      WhatsApp
                    </a>
                  )}
                  {lead.client_email && (
                    <a
                      href={`mailto:${lead.client_email}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                    >
                      Email
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}