'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface WhatsAppLead {
  id: string;
  phone: string;
  name: string;
  group_name: string;
  keywords: string[];
  first_message: string;
  last_message: string;
  first_seen: string;
  last_seen: string;
  message_count: number;
  source: string;
  sender_jid: string;
  status: string;
  created_at: string;
  updated_at: string;
  notes: string | null;
}

export default function WhatsAppLeadsPage() {
  const [leads, setLeads] = useState<WhatsAppLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [total, setTotal] = useState(0);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<WhatsAppLead | null>(null);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, [filter]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      
      const res = await fetch(`/api/leads-from-whatsapp?${params.toString()}`);
      const data = await res.json();
      setLeads(data.leads || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/leads-from-whatsapp/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchLeads();
      }
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

  const openMessageModal = (lead: WhatsAppLead) => {
    setSelectedLead(lead);
    setMessageText(`Olá ${lead.name}! Vi sua mensagem sobre visto de nômade digital. Como posso ajudar?`);
    setShowMessageModal(true);
  };

  const openWhatsAppLink = (lead: WhatsAppLead) => {
    // Use phone number (remove + and non-digits)
    const phone = (lead.phone || '').replace(/\D/g, '');
    const message = encodeURIComponent("Olá! Vi sua mensagem sobre visto. Como posso ajudar?");
    const waLink = `https://wa.me/${phone}?text=${message}`;
    window.open(waLink, '_blank');
  };

  const sendMessage = async () => {
    if (!selectedLead || !messageText.trim()) return;
    
    setSending(true);
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: selectedLead.sender_jid,
          message: messageText
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert('✅ Mensagem enviada com sucesso!');
        // Update status to contacted
        await updateStatus(selectedLead.id, 'contacted');
        setShowMessageModal(false);
      } else {
        alert('❌ Erro ao enviar: ' + (data.error || 'Erro desconhecido'));
      }
    } catch (error) {
      alert('❌ Erro ao enviar mensagem');
    }
    setSending(false);
  };

  const copyLid = (lid: string) => {
    navigator.clipboard.writeText(lid);
    alert('LID copiado: ' + lid);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    converted: 'bg-green-100 text-green-800',
    lost: 'bg-red-100 text-red-800',
  };

  const statusLabels: Record<string, string> = {
    new: 'Novo',
    contacted: 'Contatado',
    converted: 'Convertido',
    lost: 'Perdido',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="text-gray-500 hover:text-gray-700">
                ← Voltar
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                Leads WhatsApp
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Total: {total} leads
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex space-x-2">
          {['all', 'new', 'contacted', 'converted', 'lost'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {s === 'all' ? 'Todos' : statusLabels[s] || s}
            </button>
          ))}
        </div>
      </div>

      {/* Leads List */}
      <main className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📱</div>
            <h2 className="text-xl font-medium text-gray-900">Nenhum lead encontrado</h2>
            <p className="text-gray-500 mt-2">
              Leads capturados automaticamente de grupos do WhatsApp aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="bg-white rounded-lg shadow-sm border p-4 hover:border-green-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium text-gray-900">{lead.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[lead.status]}`}>
                        {statusLabels[lead.status] || lead.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">📱 Telefone:</span> {lead.phone || 'Não informado'}
                      </div>
                      <div>
                        <span className="font-medium">Grupo:</span> {lead.group_name}
                      </div>
                      <div>
                        <span className="font-medium">Mensagens:</span> {lead.message_count}
                      </div>
                      <div>
                        <span className="font-medium">Primeiro contato:</span> {formatDate(lead.first_seen)}
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-sm text-gray-700 bg-gray-50 rounded p-2">
                        💬 "{lead.last_message || lead.first_message}"
                      </p>
                    </div>
                    
                    {lead.keywords && lead.keywords.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {lead.keywords.map((kw, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4 flex flex-col space-y-2">
                    <button
                      onClick={() => openWhatsAppLink(lead)}
                      className="text-sm bg-green-600 text-white rounded px-3 py-2 hover:bg-green-700 flex items-center justify-center space-x-2"
                    >
                      <span>📱</span>
                      <span>Abrir WhatsApp</span>
                    </button>
                    <select
                      value={lead.status}
                      onChange={(e) => updateStatus(lead.id, e.target.value)}
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="new">Novo</option>
                      <option value="contacted">Contatado</option>
                      <option value="converted">Convertido</option>
                      <option value="lost">Perdido</option>
                    </select>
                    <button
                      onClick={() => copyLid(lead.sender_jid)}
                      className="text-xs bg-gray-200 text-gray-700 rounded px-2 py-1 hover:bg-gray-300"
                    >
                      📋 Copiar LID
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Message Modal */}
      {showMessageModal && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">
              💬 Enviar WhatsApp para {selectedLead.name}
            </h2>
            
            <div className="mb-4 p-3 bg-gray-50 rounded text-sm">
              <div><strong>ID:</strong> {selectedLead.sender_jid}</div>
              <div><strong>Mensagem original:</strong></div>
              <div className="text-gray-600 mt-1">"{selectedLead.last_message || selectedLead.first_message}"</div>
            </div>
            
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full border rounded-lg p-3 mb-4 h-32"
              placeholder="Digite sua mensagem..."
            />
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowMessageModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={sendMessage}
                disabled={sending || !messageText.trim()}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {sending ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}