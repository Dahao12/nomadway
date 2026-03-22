'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ProcessStage {
  id: string;
  stage_type: string;
  stage_name: string;
  stage_order: number;
  status: string;
  progress_percent: number;
}

interface Client {
  id: string;
  client_code: string;
  full_name: string | null;
  name?: string | null;
  email: string;
  phone: string | null;
  visa_type: string;
  status: string;
  lead_temperature: string;
  service_value: number | null;
  discount_percent: number | null;
  discount_value: number | null;
  created_at: string;
  notes: string | null;
  process_stages?: ProcessStage[];
}

// Process Stages - synced with client portal (types/index.ts)
const PROCESS_STAGES = [
  { key: 'onboarding', name: 'Onboarding', icon: '👋' },
  { key: 'profile', name: 'Análise de Perfil', icon: '🔍' },
  { key: 'strategy', name: 'Planejamento Estratégico', icon: '📋' },
  { key: 'documentation', name: 'Documentação', icon: '📄' },
  { key: 'translations', name: 'Traduções', icon: '🌐' },
  { key: 'apostille', name: 'Apostilamento', icon: '📜' },
  { key: 'review', name: 'Revisão Jurídica', icon: '⚖️' },
  { key: 'relocation', name: 'Mudança para Espanha', icon: '✈️' },
  { key: 'application', name: 'Aplicação do Visto', icon: '📝' },
  { key: 'follow_up', name: 'Acompanhamento', icon: '👁️' },
  { key: 'approval', name: 'Aprovação', icon: '✅' },
  { key: 'post_approval', name: 'Pós-Aprovação', icon: '🎉' },
];

// Client status (simplified)
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  new: { label: 'Novo', color: 'text-gray-700', bg: 'bg-gray-100', icon: '📥' },
  in_progress: { label: 'Em Andamento', color: 'text-blue-700', bg: 'bg-blue-50', icon: '🔄' },
  approved: { label: 'Aprovado', color: 'text-green-700', bg: 'bg-green-50', icon: '✅' },
  rejected: { label: 'Rejeitado', color: 'text-red-700', bg: 'bg-red-50', icon: '❌' },
  paused: { label: 'Pausado', color: 'text-orange-700', bg: 'bg-orange-50', icon: '⏸️' },
  cancelled: { label: 'Cancelado', color: 'text-red-700', bg: 'bg-red-50', icon: '❌' },
};

const TEMP_ICON: Record<string, string> = {
  hot: '🔥',
  warm: '🌡️',
  cold: '❄️'
};

// Stages in Portuguese (simplified view)
const STAGES_PT: Record<string, string> = {
  new: 'Novo',
  documentation: 'Documentação',
  analysis: 'Análise',
  preparation: 'Preparação',
  submission: 'Submissão',
  tracking: 'Acompanhamento',
  approved: 'Aprovado',
};

const STAGES = ['new', 'documentation', 'analysis', 'preparation', 'submission', 'tracking', 'approved'];

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountType, setDiscountType] = useState<'percent' | 'value'>('percent');
  const [discountAmount, setDiscountAmount] = useState('');
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const totalPages = Math.ceil(totalCount / pageSize);

  useEffect(() => {
    fetchClients();
  }, [page, pageSize]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
    fetchClients();
  }, [search, statusFilter]);

  async function fetchClients() {
    setLoading(true);
    try {
      const offset = (page - 1) * pageSize;
      const params = new URLSearchParams({
        limit: String(pageSize),
        offset: String(offset),
      });
      if (search) params.append('search', search);
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      
      const res = await fetch(`/api/clients-unified?${params}`);
      const data = await res.json();
      setClients(data.clients || []);
      setTotalCount(data.total || 0);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
    setLoading(false);
  }

  function calculateFinalPrice(client: Client): { original: number; discount: number; final: number } {
    const original = client.service_value || 0;
    let discount = 0;
    
    if (client.discount_percent) {
      discount = Math.round(original * (client.discount_percent / 100));
    } else if (client.discount_value) {
      discount = client.discount_value;
    }
    
    const final = Math.max(0, original - discount);
    return { original, discount, final };
  }

  async function updateClientDiscount(client: Client, discountType: 'percent' | 'value', amount: number) {
    try {
      const updateData: Record<string, any> = {};
      
      if (discountType === 'percent') {
        updateData.discount_percent = amount;
        updateData.discount_value = null;
      } else {
        updateData.discount_value = amount;
        updateData.discount_percent = null;
      }

      const res = await fetch('/api/clients-unified', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: client.id,
          ...updateData
        })
      });

      if (res.ok) {
        // Update local state
        setClients(prev => prev.map(c => 
          c.id === client.id 
            ? { ...c, discount_percent: discountType === 'percent' ? amount : null, discount_value: discountType === 'value' ? amount : null }
            : c
        ));
        setShowDiscountModal(false);
        setSelectedClient(null);
        setDiscountAmount('');
      } else {
        const data = await res.json();
        alert('Erro ao aplicar desconto: ' + (data.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Error updating discount:', error);
      alert('Erro ao aplicar desconto');
    }
  }

  // Remove client-side filtering since we're using server-side
  // Stats come from the total counts
  const stats = {
    total: totalCount,
    new: clients.filter(c => c.status === 'new').length,
    inProgress: clients.filter(c => ['documentation', 'analysis', 'preparation', 'submission', 'tracking'].includes(c.status)).length,
    approved: clients.filter(c => c.status === 'approved').length,
  };

  // Use clients directly (already filtered server-side)
  const displayClients = clients;

  // Get stage index
  const getStageIndex = (status: string) => {
    return STAGES.indexOf(status) + 1;
  };

  // Get client name
  const getClientName = (client: Client) => {
    return client.full_name || client.name || 'Sem nome';
  };

  // Get client initials for avatar
  const getClientInitials = (client: Client) => {
    const name = getClientName(client);
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Get client progress (based on process_stages)
  const getClientProgress = (client: Client) => {
    if (!client.process_stages || client.process_stages.length === 0) {
      return { completed: 0, total: 12, percent: 0, currentStage: 'Onboarding' };
    }
    
    const sortedStages = [...client.process_stages].sort((a, b) => a.stage_order - b.stage_order);
    const completed = sortedStages.filter(s => s.status === 'completed').length;
    const currentStage = sortedStages.find(s => s.status === 'in_progress')?.stage_name || 
                         sortedStages.find(s => s.status === 'pending')?.stage_name || 
                         'Aprovação';
    
    return {
      completed,
      total: sortedStages.length,
      percent: Math.round((completed / sortedStages.length) * 100),
      currentStage
    };
  };

  // Delete client
  async function deleteClient(client: Client, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(`Tem certeza que deseja excluir o cliente "${getClientName(client)}"?`)) return;

    try {
      const res = await fetch(`/api/clients/${client.id}`, { method: 'DELETE' });
      if (res.ok) {
        setClients(prev => prev.filter(c => c.id !== client.id));
      } else {
        alert('Erro ao excluir cliente');
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Erro ao excluir cliente');
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // Format phone number
  function formatPhone(phone: string | null): string {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    
    // Brazilian phone: +55 11 99999-9999 or 11999999999
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    if (cleaned.length === 13 && cleaned.startsWith('55')) {
      return `+55 (${cleaned.slice(2, 4)}) ${cleaned.slice(4, 9)}-${cleaned.slice(9)}`;
    }
    if (cleaned.length === 12 && cleaned.startsWith('55')) {
      return `+55 (${cleaned.slice(2, 4)}) ${cleaned.slice(4, 8)}-${cleaned.slice(8)}`;
    }
    
    // Spanish phone: +34 612 345 678
    if (cleaned.length === 11 && cleaned.startsWith('34')) {
      return `+34 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
    }
    if (cleaned.length === 9 && cleaned.startsWith('6')) {
      return `+34 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }
    
    // Portuguese phone: +351 912 345 678
    if (cleaned.length === 12 && cleaned.startsWith('351')) {
      return `+351 ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
    }
    
    // Fallback: return original
    return phone;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Carregando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600">Gerencie seus clientes</p>
        </div>
        <button
          onClick={() => router.push('/admin/clients/new')}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <span>+</span>
          Novo Cliente
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: '👥', color: 'bg-gray-500' },
          { label: 'Novos', value: stats.new, icon: '📥', color: 'bg-blue-500' },
          { label: 'Em Andamento', value: stats.inProgress, icon: '⏳', color: 'bg-amber-500' },
          { label: 'Aprovados', value: stats.approved, icon: '✅', color: 'bg-green-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center text-xl`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por nome, email ou código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os status</option>
            <option value="new">📥 Novo</option>
            <option value="in_progress">🔄 Em Andamento</option>
            <option value="approved">✅ Aprovado</option>
            <option value="rejected">❌ Rejeitado</option>
            <option value="paused">⏸️ Pausado</option>
          </select>

          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('grid')}
              className={`px-3 py-1 rounded-md transition-colors ${view === 'grid' ? 'bg-white shadow-sm' : ''}`}
            >
              ▦
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1 rounded-md transition-colors ${view === 'list' ? 'bg-white shadow-sm' : ''}`}
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* Pipeline Progress */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-500 mb-3">Distribuição por Etapa</h3>
        <div className="flex gap-2">
          {STAGES.map((stage, i) => {
            const config = STATUS_CONFIG[stage];
            const count = clients.filter(c => c.status === stage).length;
            const percentage = clients.length > 0 ? (count / clients.length) * 100 : 0;
            
            return (
              <div key={stage} className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-lg">{config?.icon || '📌'}</span>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${config?.bg || 'bg-gray-200'}`} style={{ width: `${percentage}%` }} />
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">{STAGES_PT[stage] || config?.label || stage}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Clients List/Grid */}
      {displayClients.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {search || statusFilter !== 'all' ? 'Nenhum cliente encontrado' : 'Nenhum cliente ainda'}
          </h3>
          <p className="text-gray-500 mb-6">
            {search || statusFilter !== 'all' 
              ? 'Tente ajustar os filtros' 
              : 'Clientes aparecerão aqui quando forem criados'}
          </p>
          {!search && statusFilter === 'all' && (
            <button
              onClick={() => router.push('/admin/clients/new')}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              + Novo Cliente
            </button>
          )}
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayClients.map(client => {
            const config = STATUS_CONFIG[client.status] || STATUS_CONFIG.new;
            const stageIndex = getStageIndex(client.status);
            
            return (
              <div
                key={client.id}
                onClick={() => router.push(`/admin/clients/${client.id}`)}
                className="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:shadow-lg hover:border-gray-300 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                      {getClientName(client).charAt(0) || '?'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{getClientName(client)}</h3>
                      <p className="text-xs text-gray-400">{client.client_code}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{TEMP_ICON[client.lead_temperature] || '🌡️'}</span>
                    <button
                      onClick={(e) => deleteClient(client, e)}
                      className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="Excluir cliente"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mb-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                    {config.icon} {config.label}
                  </span>
                </div>

                {/* Process Progress Bar */}
                {client.process_stages && client.process_stages.length > 0 && (
                  <div className="mb-3">
                    {(() => {
                      const progress = getClientProgress(client);
                      return (
                        <>
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>{progress.currentStage}</span>
                            <span>{progress.completed}/{progress.total} etapas</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-300"
                              style={{ width: `${progress.percent}%` }}
                            />
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                {/* Info */}
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>📧</span>
                    <span className="truncate">{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <span>📱</span>
                      <span>{formatPhone(client.phone)}</span>
                    </div>
                  )}
                  {client.service_value && (
                    <div className="flex items-center gap-2">
                      <span>💰</span>
                      <div className="flex items-center gap-2">
                        {client.discount_percent ? (
                          <>
                            <span className="line-through text-gray-400 text-xs">
                              €{client.service_value.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                            </span>
                            <span className="text-red-500 text-xs font-medium">-{client.discount_percent}%</span>
                            <span className="text-green-600 font-medium">
                              €{calculateFinalPrice(client).final.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                            </span>
                          </>
                        ) : client.discount_value ? (
                          <>
                            <span className="line-through text-gray-400 text-xs">
                              €{client.service_value.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                            </span>
                            <span className="text-red-500 text-xs font-medium">
                              -€{client.discount_value.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                            </span>
                            <span className="text-green-600 font-medium">
                              €{calculateFinalPrice(client).final.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                            </span>
                          </>
                        ) : (
                          <span className="text-green-600 font-medium">
                            €{client.service_value.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedClient(client);
                            setShowDiscountModal(true);
                          }}
                          className="text-xs text-blue-500 hover:text-blue-700 px-1 py-0.5 rounded bg-blue-50 hover:bg-blue-100"
                        >
                          {client.discount_percent || client.discount_value ? '✏️' : '+Desconto'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                  <span>Criado: {formatDate(client.created_at)}</span>
                  <span>{client.visa_type || 'Visto Digital'}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Progresso</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Valor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayClients.map(client => {
                const config = STATUS_CONFIG[client.status] || STATUS_CONFIG.new;
                const stageIndex = getStageIndex(client.status);
                
                return (
                  <tr
                    key={client.id}
                    onClick={() => router.push(`/admin/clients/${client.id}`)}
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                          {getClientName(client).charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{getClientName(client)}</p>
                          <p className="text-xs text-gray-400">{client.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                        {config.icon} {config.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden flex">
                          {STAGES.map((_, i) => (
                            <div
                              key={i}
                              className={`h-full flex-1 mx-0.5 rounded-full ${i < stageIndex ? 'bg-green-500' : 'bg-gray-200'}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">{stageIndex}/{STAGES.length}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {client.service_value ? (
                        client.discount_percent || client.discount_value ? (
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-green-600">
                              €{calculateFinalPrice(client).final.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                            </span>
                            <span className="text-xs text-red-500">
                              (-{client.discount_percent ? `${client.discount_percent}%` : `€${client.discount_value}`})
                            </span>
                          </div>
                        ) : (
                          <span className="font-medium text-green-600">
                            €{client.service_value.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                          </span>
                        )
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(client.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalCount > pageSize && (
        <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4 mt-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Mostrando</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="border border-gray-300 rounded px-2 py-1"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>de {totalCount} clientes</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              ← Anterior
            </button>
            <span className="px-3 py-1 text-sm">
              Página {page} de {totalPages || 1}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages || 1, p + 1))}
              disabled={page >= (totalPages || 1)}
              className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Próxima →
            </button>
          </div>
        </div>
      )}

      {/* Discount Modal */}
      {showDiscountModal && selectedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              💰 Aplicar Desconto
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Cliente: <strong>{getClientName(selectedClient)}</strong>
            </p>
            
            {selectedClient.service_value && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Valor Original:</span>
                  <span className="font-medium">€{selectedClient.service_value.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</span>
                </div>
                {(selectedClient.discount_percent || selectedClient.discount_value) && (
                  <>
                    <div className="flex justify-between text-sm text-red-500 mt-1">
                      <span>Desconto Atual:</span>
                      <span>-{selectedClient.discount_percent ? `${selectedClient.discount_percent}%` : `€${selectedClient.discount_value}`}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium text-green-600 mt-1">
                      <span>Valor Final:</span>
                      <span>€{calculateFinalPrice(selectedClient).final.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</span>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="space-y-3">
              <div className="flex gap-2">
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as 'percent' | 'value')}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="percent">% Porcentagem</option>
                  <option value="value">€ Valor Fixo</option>
                </select>
                <input
                  type="number"
                  placeholder={discountType === 'percent' ? '0-100' : '0'}
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  min="0"
                  max={discountType === 'percent' ? '100' : undefined}
                />
              </div>

              {discountAmount && selectedClient.service_value && (
                <div className="p-2 bg-green-50 rounded-lg text-sm">
                  <span className="text-gray-600">Novo valor: </span>
                  <span className="font-bold text-green-600">
                    €{discountType === 'percent' 
                      ? Math.round(selectedClient.service_value * (1 - parseFloat(discountAmount) / 100)).toLocaleString('pt-BR')
                      : Math.max(0, selectedClient.service_value - parseFloat(discountAmount)).toLocaleString('pt-BR')
                    }
                  </span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setShowDiscountModal(false);
                    setSelectedClient(null);
                    setDiscountAmount('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                {(selectedClient.discount_percent || selectedClient.discount_value) && (
                  <button
                    onClick={() => updateClientDiscount(selectedClient, 'percent', 0)}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                  >
                    Remover
                  </button>
                )}
                <button
                  onClick={() => {
                    const amount = parseFloat(discountAmount);
                    if (isNaN(amount) || amount <= 0) {
                      alert('Digite um valor válido');
                      return;
                    }
                    const discountValue = discountType === 'percent' 
                      ? amount 
                      : Math.round(amount);
                    updateClientDiscount(selectedClient, discountType, discountValue);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}