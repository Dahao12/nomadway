'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AutoLead {
  id: string;
  group_id: string;
  group_name: string;
  contact_name: string;
  contact_phone: string;
  message: string;
  keywords_matched: string[];
  confidence_score: number;
  category: string;
  status: string;
  priority: string;
  notes: string;
  detected_at: string;
  converted_to_client: string | null;
  converted_to_booking: string | null;
}

export default function AutoLeadsPage() {
  const [leads, setLeads] = useState<AutoLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('new');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    fetchLeads();
  }, [filter, priorityFilter]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      
      const res = await fetch(`/api/auto-leads?${params.toString()}`);
      const data = await res.json();
      setLeads(data.leads || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/auto-leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchLeads();
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

  const convertToClient = async (lead: AutoLead) => {
    if (!confirm('Converter este lead em cliente?')) return;
    
    try {
      await fetch(`/api/auto-leads/${lead.id}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          create_client: true,
          create_booking: true 
        })
      });
      fetchLeads();
    } catch (error) {
      console.error('Error converting lead:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'visa': '🛂 Visto',
      'housing': '🏠 Moradia',
      'work': '💼 Trabalho',
      'general': '📌 Geral'
    };
    return labels[category] || category;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🎯 Leads Capturados</h1>
          <p className="text-gray-600">Leads detectados automaticamente em grupos WhatsApp</p>
        </div>
        <Link 
          href="/admin" 
          className="text-blue-600 hover:text-blue-800"
        >
          ← Voltar ao Dashboard
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex gap-2">
          {['new', 'contacted', 'converted', 'discarded', 'all'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg ${
                filter === status 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'new' ? '🆕 Novos' : 
               status === 'contacted' ? '📞 Contatado' :
               status === 'converted' ? '✅ Convertido' :
               status === 'discarded' ? '🗑️ Descartado' : 'Todos'}
            </button>
          ))}
        </div>
        
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-4 py-2 bg-gray-100 rounded-lg"
        >
          <option value="all">Todas prioridades</option>
          <option value="high">🔴 Alta</option>
          <option value="medium">🟡 Média</option>
          <option value="low">🟢 Baixa</option>
        </select>
      </div>

      {/* Leads List */}
      {loading ? (
        <div className="text-center py-8">Carregando...</div>
      ) : leads.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Nenhum lead encontrado
        </div>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => (
            <div key={lead.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={getPriorityColor(lead.priority)}>
                      {lead.priority === 'high' ? '🔴' : lead.priority === 'medium' ? '🟡' : '🟢'}
                    </span>
                    <span className="font-semibold">{lead.contact_name || 'Nome não identificado'}</span>
                    {lead.contact_phone && (
                      <span className="text-gray-500 text-sm">{lead.contact_phone}</span>
                    )}
                    <span className="bg-gray-100 px-2 py-1 rounded text-sm">
                      {getCategoryLabel(lead.category)}
                    </span>
                  </div>
                  
                  <p className="text-gray-800 mb-2">{lead.message}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {lead.keywords_matched?.map((kw, i) => (
                      <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {kw}
                      </span>
                    ))}
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    <span>📍 {lead.group_name || lead.group_id}</span>
                    <span className="mx-2">•</span>
                    <span>⏱️ {new Date(lead.detected_at).toLocaleString('pt-BR')}</span>
                    <span className="mx-2">•</span>
                    <span>📊 Confiança: {Math.round(lead.confidence_score * 100)}%</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 ml-4">
                  {lead.status === 'new' && (
                    <>
                      <button
                        onClick={() => updateStatus(lead.id, 'contacted')}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                      >
                        📞 Contato
                      </button>
                      <button
                        onClick={() => convertToClient(lead)}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                      >
                        ♻️ Converter
                      </button>
                      <button
                        onClick={() => updateStatus(lead.id, 'discarded')}
                        className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
                      >
                        🗑️ Descartar
                      </button>
                    </>
                  )}
                  
                  {lead.status === 'converted' && lead.converted_to_client && (
                    <Link
                      href={`/admin/clients/${lead.converted_to_client}`}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm text-center"
                    >
                      👁️ Ver Cliente
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}