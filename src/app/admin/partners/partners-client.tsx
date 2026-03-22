'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Partner {
  id: string;
  name: string;
  email: string;
  phone?: string;
  code: string;
  status: string;
  commission_tier: number;
  total_clients: number;
  total_earnings_cents: number;
  total_paid_cents: number;
  created_at: string;
}

interface Commission {
  id: string;
  partner_id: string;
  client_name: string;
  client_email?: string;
  service_type?: string;
  amount_cents: number;
  status: string;
  partner?: { name: string; code: string };
  created_at: string;
}

export default function AdminPartners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'partners' | 'commissions' | 'new'>('partners');
  const [selectedCommission, setSelectedCommission] = useState<string[]>([]);
  
  // Form state
  const [newPartner, setNewPartner] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [partnersRes, commissionsRes] = await Promise.all([
        fetch('/api/partners'),
        fetch('/api/commissions?status=pending'),
      ]);

      const partnersData = await partnersRes.json();
      const commissionsData = await commissionsRes.json();

      setPartners(partnersData.partners || []);
      setCommissions(commissionsData.commissions || []);
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
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPartner),
      });

      if (res.ok) {
        setNewPartner({ name: '', email: '', phone: '', password: '' });
        fetchData();
        setActiveTab('partners');
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const handleApproveCommissions = async () => {
    if (selectedCommission.length === 0) return;

    try {
      await Promise.all(
        selectedCommission.map(id =>
          fetch(`/api/commissions/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'approved' }),
          })
        )
      );

      setSelectedCommission([]);
      fetchData();
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const toggleCommissionSelection = (id: string) => {
    setSelectedCommission(prev =>
      prev.includes(id)
        ? prev.filter(cid => cid !== id)
        : [...prev, id]
    );
  };

  const toggleAllCommissions = () => {
    if (selectedCommission.length === commissions.length) {
      setSelectedCommission([]);
    } else {
      setSelectedCommission(commissions.map(c => c.id));
    }
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
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-blue-600 hover:text-blue-700">
              ← Voltar
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Parceiros</h1>
          </div>
          <button
            onClick={() => setActiveTab('new')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + Novo Parceiro
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('partners')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'partners' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'
            }`}
          >
            Parceiros ({partners.length})
          </button>
          <button
            onClick={() => setActiveTab('commissions')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'commissions' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'
            }`}
          >
            Comissões Pendentes ({commissions.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-4">
        {/* Partners List */}
        {activeTab === 'partners' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parceiro</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Clientes</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ganhos</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Pago</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {partners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{partner.name}</p>
                      <p className="text-sm text-gray-500">{partner.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                        {partner.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-semibold">{partner.total_clients}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-green-600">{formatCurrency(partner.total_earnings_cents)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-gray-600">{formatCurrency(partner.total_paid_cents)}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        partner.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {partner.status === 'active' ? 'Ativo' : 'Pausado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        href={`/admin/partners/${partner.id}`}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {partners.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                Nenhum parceiro cadastrado
              </div>
            )}
          </div>
        )}

        {/* Commissions Pending Approval */}
        {activeTab === 'commissions' && (
          <>
            {selectedCommission.length > 0 && (
              <div className="mb-4 flex justify-end">
                <button
                  onClick={handleApproveCommissions}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Aprovar Selecionados ({selectedCommission.length})
                </button>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedCommission.length === commissions.length && commissions.length > 0}
                        onChange={toggleAllCommissions}
                        className="rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parceiro</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serviço</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {commissions.map((commission) => (
                    <tr key={commission.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedCommission.includes(commission.id)}
                          onChange={() => toggleCommissionSelection(commission.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium">{commission.partner?.name}</p>
                        <p className="text-sm text-gray-500 font-mono">{commission.partner?.code}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{commission.client_name}</p>
                        {commission.client_email && (
                          <p className="text-sm text-gray-500">{commission.client_email}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {commission.service_type || 'Nomad Visa'}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {formatDate(commission.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold">
                        {formatCurrency(commission.amount_cents)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => {
                            fetch(`/api/commissions/${commission.id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ status: 'approved' }),
                            }).then(() => fetchData());
                          }}
                          className="text-green-600 hover:text-green-700 mr-2"
                        >
                          Aprovar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {commissions.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  Nenhuma comissão pendente de aprovação
                </div>
              )}
            </div>
          </>
        )}

        {/* New Partner Form */}
        {activeTab === 'new' && (
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Novo Parceiro</h2>
            
            <form onSubmit={handleCreatePartner} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  required
                  value={newPartner.name}
                  onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nome do parceiro"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={newPartner.email}
                  onChange={(e) => setNewPartner({ ...newPartner, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={newPartner.phone}
                  onChange={(e) => setNewPartner({ ...newPartner, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+55 11 99999-9999"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha (opcional)
                </label>
                <input
                  type="password"
                  value={newPartner.password}
                  onChange={(e) => setNewPartner({ ...newPartner, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Senha para acesso do parceiro"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Se não definir, o parceiro pode acessar apenas com o código.
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  O código de parceiro será gerado automaticamente (ex: PARABC).
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Comissão padrão: <strong>€100/cliente</strong> (1º-9º) → <strong>€150/cliente</strong> (10º+)
                </p>
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Criar Parceiro
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}