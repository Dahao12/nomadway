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
  payment_method?: string;
  payment_info?: {
    pix_key?: string;
    pix_name?: string;
    wise_email?: string;
    paypal_email?: string;
    bank_name?: string;
    bank_agency?: string;
    bank_account?: string;
    bank_holder?: string;
  };
  notes?: string;
  created_at: string;
}

interface Commission {
  id: string;
  client_name: string;
  client_email?: string;
  service_type?: string;
  amount_cents: number;
  status: string;
  created_at: string;
  paid_at?: string;
}

interface Payment {
  id: string;
  amount_cents: number;
  status: string;
  payment_method?: string;
  payment_reference?: string;
  created_at: string;
  processed_at?: string;
}

interface Props {
  partnerId: string;
}

export default function PartnerDetail({ partnerId }: Props) {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Edit state
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
    password: '',
  });
  
  // New payment state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [newPayment, setNewPayment] = useState({
    amount: '',
    payment_method: 'pix',
    reference: '',
  });

  useEffect(() => {
    fetchData();
  }, [partnerId]);

  const fetchData = async () => {
    try {
      const [partnerRes, commissionsRes, paymentsRes] = await Promise.all([
        fetch(`/api/partners/${partnerId}`),
        fetch(`/api/commissions?partner_id=${partnerId}&limit=50`),
        fetch(`/api/partner-payments?partner_id=${partnerId}&limit=50`),
      ]);

      const partnerData = await partnerRes.json();
      const commissionsData = await commissionsRes.json();
      const paymentsData = await paymentsRes.json();

      if (partnerData.partner) {
        setPartner(partnerData.partner);
        setEditData({
          name: partnerData.partner.name,
          email: partnerData.partner.email,
          phone: partnerData.partner.phone || '',
          notes: partnerData.partner.notes || '',
          password: '',
        });
      }
      setCommissions(commissionsData.commissions || []);
      setPayments(paymentsData.payments || []);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents: number) => `€${(cents / 100).toFixed(0)}`;
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('pt-BR');

  const handleStatusChange = async (newStatus: string) => {
    if (!confirm(`Tem certeza que deseja ${newStatus === 'active' ? 'reativar' : newStatus === 'paused' ? 'pausar' : 'cancelar'} este parceiro?`)) {
      return;
    }

    setSaving(true);
    try {
      await fetch(`/api/partners/${partnerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchData();
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEditSave = async () => {
    setSaving(true);
    try {
      const updateData: Record<string, string | undefined> = {
        name: editData.name,
        email: editData.email,
        phone: editData.phone,
        notes: editData.notes,
      };
      
      // Só envia senha se foi preenchida
      if (editData.password && editData.password.trim()) {
        updateData.password = editData.password;
      }
      
      await fetch(`/api/partners/${partnerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      setEditing(false);
      fetchData();
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCreatePayment = async () => {
    if (!newPayment.amount) return;

    setSaving(true);
    try {
      await fetch('/api/partner-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partner_id: partnerId,
          amount_cents: Math.round(parseFloat(newPayment.amount) * 100),
          payment_method: newPayment.payment_method,
          payment_reference: newPayment.reference,
          status: 'paid',
        }),
      });
      setShowPaymentModal(false);
      setNewPayment({ amount: '', payment_method: 'pix', reference: '' });
      fetchData();
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      paused: 'bg-yellow-100 text-yellow-700',
      inactive: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: 'Ativo',
      paused: 'Pausado',
      inactive: 'Cancelado',
    };
    return labels[status] || status;
  };

  const pendingEarnings = (partner?.total_earnings_cents || 0) - (partner?.total_paid_cents || 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Parceiro não encontrado</p>
          <Link href="/admin/partners" className="text-blue-600 hover:underline">
            Voltar para lista
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/admin/partners" className="text-blue-600 hover:text-blue-700">
            ← Voltar para Parceiros
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Partner Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{partner.name}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(partner.status)}`}>
                  {getStatusLabel(partner.status)}
                </span>
              </div>
              <p className="text-gray-500">{partner.email}</p>
              <p className="text-gray-500 font-mono">{partner.code}</p>
            </div>
            <div className="flex gap-2">
              {partner.status === 'active' && (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleStatusChange('paused')}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                  >
                    Pausar
                  </button>
                </>
              )}
              {partner.status === 'paused' && (
                <>
                  <button
                    onClick={() => handleStatusChange('active')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Reativar
                  </button>
                  <button
                    onClick={() => handleStatusChange('inactive')}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Cancelar
                  </button>
                </>
              )}
              {partner.status === 'inactive' && (
                <button
                  onClick={() => handleStatusChange('active')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Reativar
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Total Clientes</p>
              <p className="text-2xl font-bold">{partner.total_clients}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Total Ganho</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(partner.total_earnings_cents)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Pago</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(partner.total_paid_cents)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">A Receber</p>
              <p className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingEarnings)}</p>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">Dados de Pagamento</h2>
            <span className="text-sm text-gray-500">
              Cadastrado em {formatDate(partner.created_at)}
            </span>
          </div>

          {partner.payment_method ? (
            <div className="space-y-2">
              <p><strong>Forma:</strong> {partner.payment_method.toUpperCase()}</p>
              {partner.payment_method === 'pix' && partner.payment_info?.pix_key && (
                <>
                  <p><strong>Chave PIX:</strong> {partner.payment_info.pix_key}</p>
                  <p><strong>Favorecido:</strong> {partner.payment_info.pix_name}</p>
                </>
              )}
              {partner.payment_method === 'wise' && partner.payment_info?.wise_email && (
                <p><strong>Email Wise:</strong> {partner.payment_info.wise_email}</p>
              )}
              {partner.payment_method === 'paypal' && partner.payment_info?.paypal_email && (
                <p><strong>Email PayPal:</strong> {partner.payment_info.paypal_email}</p>
              )}
              {partner.payment_method === 'bank' && partner.payment_info?.bank_name && (
                <>
                  <p><strong>Banco:</strong> {partner.payment_info.bank_name}</p>
                  <p><strong>Agência:</strong> {partner.payment_info.bank_agency}</p>
                  <p><strong>Conta:</strong> {partner.payment_info.bank_account}</p>
                  <p><strong>Titular:</strong> {partner.payment_info.bank_holder}</p>
                </>
              )}
            </div>
          ) : (
            <p className="text-yellow-600">
              ⚠️ Parceiro ainda não configurou os dados de pagamento
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Ações</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              ✏️ Editar Dados
            </button>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              💰 Registrar Pagamento
            </button>
            <a
              href={`https://wa.me/${partner.phone?.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              📱 WhatsApp
            </a>
            <a
              href={`mailto:${partner.email}`}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              ✉️ Email
            </a>
            <Link
              href={`/parceiro?code=${partner.code}`}
              target="_blank"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              👁️ Ver Portal do Parceiro
            </Link>
          </div>
        </div>

        {/* Status Management */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Gerenciar Status</h2>
          <div className="flex flex-wrap gap-3">
            {partner.status === 'active' && (
              <>
                <button
                  onClick={() => handleStatusChange('paused')}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                >
                  ⏸️ Pausar Parceiro
                </button>
                <button
                  onClick={() => handleStatusChange('inactive')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  🚫 Bloquear Parceiro
                </button>
              </>
            )}
            {partner.status === 'paused' && (
              <>
                <button
                  onClick={() => handleStatusChange('active')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  ✅ Reativar Parceiro
                </button>
                <button
                  onClick={() => handleStatusChange('inactive')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  🚫 Bloquear Parceiro
                </button>
              </>
            )}
            {partner.status === 'inactive' && (
              <button
                onClick={() => handleStatusChange('active')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                ✅ Reativar Parceiro
              </button>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-3">
            <strong>Ativo:</strong> Pode indicar e receber comissões |
            <strong className="ml-2">Pausado:</strong> Não recebe novas comissões |
            <strong className="ml-2">Bloqueado:</strong> Não pode acessar o portal
          </p>
        </div>

        {/* Commissions */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Comissões ({commissions.length})</h2>
          
          {commissions.length === 0 ? (
            <p className="text-gray-500">Nenhuma comissão registrada</p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Cliente</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Data</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Valor</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {commissions.slice(0, 10).map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-2">{c.client_name}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{formatDate(c.created_at)}</td>
                    <td className="px-4 py-2 text-right font-medium">{formatCurrency(c.amount_cents)}</td>
                    <td className="px-4 py-2 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        c.status === 'paid' ? 'bg-green-100 text-green-700' :
                        c.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                        c.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {c.status === 'paid' ? 'Pago' : c.status === 'approved' ? 'Aprovado' : c.status === 'pending' ? 'Pendente' : c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Payments */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Pagamentos Realizados ({payments.length})</h2>
          
          {payments.length === 0 ? (
            <p className="text-gray-500">Nenhum pagamento realizado</p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Data</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Valor</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Forma</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-2">{formatDate(p.created_at)}</td>
                    <td className="px-4 py-2 text-right font-medium">{formatCurrency(p.amount_cents)}</td>
                    <td className="px-4 py-2 text-center">{p.payment_method?.toUpperCase()}</td>
                    <td className="px-4 py-2 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        p.status === 'paid' ? 'bg-green-100 text-green-700' :
                        p.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {p.status === 'paid' ? 'Concluído' : p.status === 'processing' ? 'Processando' : p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Editar Parceiro</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Telefone</label>
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notas</label>
                <textarea
                  value={editData.notes}
                  onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nova Senha
                  <span className="text-xs text-gray-400 ml-2">(deixe em branco para manter a atual)</span>
                </label>
                <input
                  type="password"
                  value={editData.password}
                  onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="••••••••"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Defina uma nova senha para o parceiro acessar o portal.
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setEditing(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleEditSave}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Registrar Pagamento</h3>
            <p className="text-gray-500 text-sm mb-4">
              Saldo pendente: <strong className="text-yellow-600">{formatCurrency(pendingEarnings)}</strong>
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Valor (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Forma de Pagamento</label>
                <select
                  value={newPayment.payment_method}
                  onChange={(e) => setNewPayment({ ...newPayment, payment_method: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="pix">PIX</option>
                  <option value="wise">Wise</option>
                  <option value="paypal">PayPal</option>
                  <option value="bank">Transferência</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Referência (opcional)</label>
                <input
                  type="text"
                  value={newPayment.reference}
                  onChange={(e) => setNewPayment({ ...newPayment, reference: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="ID da transação"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreatePayment}
                disabled={saving || !newPayment.amount}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg"
              >
                {saving ? 'Registrando...' : 'Registrar Pagamento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}