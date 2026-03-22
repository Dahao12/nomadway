'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

interface Partner {
  id: string;
  name: string;
  email: string;
  phone?: string;
  code: string;
  status: string;
  total_clients: number;
  total_earnings_cents: number;
  total_paid_cents: number;
  password_hash?: string;
}

interface Lead {
  id: string;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  source?: string;
  status: string;
  created_at: string;
}

interface Commission {
  id: string;
  client_name: string;
  service_type?: string;
  amount_cents: number;
  status: string;
  created_at: string;
}

export default function PartnerDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get('code') || '';
  
  const [partner, setPartner] = useState<Partner | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Verificar sessão primeiro
    checkAuth();
  }, []);

  useEffect(() => {
    if (authChecked && code && partner) {
      fetchPartnerData();
    }
  }, [authChecked, code, partner?.id]);

  const checkAuth = async () => {
    try {
      // Verificar se há sessão válida pelo cookie
      const authRes = await fetch('/api/partners/auth');
      const authData = await authRes.json();
      
      if (authData.authenticated) {
        // Sessão válida - usar o código da sessão
        const sessionCode = authData.partner?.code || code;
        if (sessionCode) {
          const partnerRes = await fetch(`/api/partners?code=${sessionCode}`);
          const partnerData = await partnerRes.json();
          if (partnerData.partners?.[0]) {
            setPartner(partnerData.partners[0]);
          }
        }
        setAuthChecked(true);
        return;
      }
      
      // Sem sessão - verificar se tem código na URL
      if (!code) {
        // Sem código e sem sessão - redirecionar para login
        router.push('/parceiro/login');
        return;
      }
      
      // Buscar parceiro pelo código
      const partnerRes = await fetch(`/api/partners?code=${code}`);
      const partnerData = await partnerRes.json();
      
      if (!partnerData.partners?.[0]) {
        // Parceiro não encontrado
        setLoading(false);
        setAuthChecked(true);
        return;
      }
      
      const foundPartner = partnerData.partners[0];
      
      // Se tem senha, precisa fazer login
      if (foundPartner.password_hash) {
        router.push(`/parceiro/login?code=${code}`);
        return;
      }
      
      // Sem senha - permitir acesso direto
      setPartner(foundPartner);
      setAuthChecked(true);
      
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      router.push('/parceiro/login');
    }
  };

  const fetchPartnerData = async () => {
    if (!partner?.id) return;
    
    try {
      // Buscar leads do parceiro
      const leadsRes = await fetch(`/api/partner-leads?partner_id=${partner.id}&limit=5`);
      const leadsData = await leadsRes.json();
      setLeads(leadsData.leads || []);
      
      // Buscar comissões do parceiro
      const commissionsRes = await fetch(`/api/commissions?partner_id=${partner.id}&limit=5`);
      const commissionsData = await commissionsRes.json();
      setCommissions(commissionsData.commissions || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return `€${(cents / 100).toFixed(0)}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-100 text-blue-700',
      contacted: 'bg-yellow-100 text-yellow-700',
      qualified: 'bg-purple-100 text-purple-700',
      converted: 'bg-green-100 text-green-700',
      lost: 'bg-gray-100 text-gray-700',
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-blue-100 text-blue-700',
      paid: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
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
      pending: 'Pendente',
      approved: 'Aprovado',
      paid: 'Pago',
      cancelled: 'Cancelado',
    };
    return labels[status] || status;
  };

  if (loading || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Parceiro não encontrado</h1>
          <p className="text-gray-600">O código <span className="font-mono font-bold">{code}</span> não foi encontrado.</p>
          <p className="text-gray-500 mt-4">Entre em contato com o suporte.</p>
          <a href="/parceiro/login" className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Entrar com outro código
          </a>
        </div>
      </div>
    );
  }

  const pendingEarnings = partner.total_earnings_cents - partner.total_paid_cents;
  const progressPercent = Math.min((partner.total_clients / 50) * 100, 100);
  const clientsToNextTier = Math.max(0, 10 - partner.total_clients);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-blue-600">NomadWay</span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600">Parceiros</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-700">{partner.name}</span>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
              {partner.name.charAt(0)}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white mb-8">
          <h1 className="text-3xl font-bold mb-2">Olá, {partner.name}!</h1>
          <p className="text-blue-100">Seu código de parceiro: <span className="font-mono font-bold bg-white/20 px-3 py-1 rounded-lg">{partner.code}</span></p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-gray-500 text-sm mb-1">Total de Clientes</p>
            <p className="text-3xl font-bold text-gray-900">{partner.total_clients}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-gray-500 text-sm mb-1">Comissões Pendentes</p>
            <p className="text-3xl font-bold text-yellow-600">{leads.filter(l => l.status === 'new').length}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-gray-500 text-sm mb-1">A Receber</p>
            <p className="text-3xl font-bold text-blue-600">{formatCurrency(pendingEarnings)}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-gray-500 text-sm mb-1">Recebido</p>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(partner.total_paid_cents)}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600 font-medium">Seu Progresso</span>
            <span className="text-gray-900 font-bold">{partner.total_clients}/50 clientes</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-500" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          {clientsToNextTier > 0 && (
            <p className="text-gray-500 text-sm">
              Faltam <span className="font-bold text-blue-600">{clientsToNextTier}</span> clientes para chegar a €150/cliente
            </p>
          )}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Leads Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Leads Recentes (7 dias)</h2>
              <Link href={`/parceiro/leads?code=${partner.code}`} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Ver todos →
              </Link>
            </div>
            
            {leads.length === 0 ? (
              <div className="bg-white rounded-xl p-6 shadow-sm text-center">
                <p className="text-gray-500">Nenhum lead recente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leads.map((lead) => (
                  <div key={lead.id} className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{lead.client_name || lead.client_email || 'Lead sem nome'}</p>
                        <p className="text-gray-500 text-sm">{lead.client_email}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                        {getStatusLabel(lead.status)}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-2 text-xs text-gray-400">
                      <span>{lead.source}</span>
                      <span>•</span>
                      <span>{formatDate(lead.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Commissions Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Últimas Comissões</h2>
              <Link href={`/parceiro/comissoes?code=${partner.code}`} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Ver todas →
              </Link>
            </div>
            
            {commissions.length === 0 ? (
              <div className="bg-white rounded-xl p-6 shadow-sm text-center">
                <p className="text-gray-500">Nenhuma comissão registrada</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Cliente</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Data</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Valor</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {commissions.map((commission) => (
                      <tr key={commission.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{commission.client_name}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{formatDate(commission.created_at)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">{formatCurrency(commission.amount_cents)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(commission.status)}`}>
                            {getStatusLabel(commission.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Referral Link */}
        <div className="bg-white rounded-xl p-6 shadow-sm mt-8">
          <h3 className="font-bold text-gray-900 mb-3">Seu Link de Indicação</h3>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={`nomadway.com.br/agendamento?ref=${partner.code}`}
              className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-mono"
            />
            <button 
              onClick={() => navigator.clipboard.writeText(`https://nomadway.com.br/agendamento?ref=${partner.code}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Copiar
            </button>
          </div>
          <p className="text-gray-500 text-sm mt-2">Compartilhe nas redes sociais! Cada cliente que agendar através do seu link será vinculado à você.</p>
        </div>

        {/* Settings Link */}
        <div className="mt-8 flex justify-center">
          <Link
            href={`/parceiro/configuracoes?code=${partner.code}`}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
          >
            ⚙️ Configurar Dados de Pagamento
          </Link>
        </div>
      </main>
    </div>
  );
}