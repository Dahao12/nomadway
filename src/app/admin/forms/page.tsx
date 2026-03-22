'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Map database columns to display names
const FIELD_DISPLAY: Record<string, string> = {
  full_name: 'nome',
  birth_date: 'data_nascimento',
  nationality: 'nacionalidade',
  marital_status: 'estado_civil',
  cpf: 'cpf',
  rg: 'rg',
  passport_number: 'passaporte',
  passport_expiry_date: 'passaporte_validade',
  phone: 'whatsapp',
  email: 'email',
  country: 'pais_residencia',
  profession: 'profissao',
  company_name: 'empresa',
  monthly_income_range: 'renda_mensal',
  has_foreign_link: 'vinculo_estrangeiro',
  is_freelancer: 'freelancer_pj',
  visa_type: 'servico',
  service_value: 'valor',
  payment_method: 'forma_pagamento',
  notes: 'observacoes'
};

interface ClientForm {
  id: string;
  code: string;
  status: 'pending' | 'completed' | 'processed';
  created_at: string;
  submitted_at?: string;
  client_id?: string;
  
  // Database field names (actual columns)
  full_name?: string;
  birth_date?: string;
  nationality?: string;
  marital_status?: string;
  cpf?: string;
  rg?: string;
  passport_number?: string;
  passport_expiry_date?: string;
  phone?: string;
  email?: string;
  country?: string;
  profession?: string;
  company_name?: string;
  monthly_income_range?: string;
  has_foreign_link?: boolean;
  is_freelancer?: boolean;
  visa_type?: string;
  service_value?: string;
  payment_method?: string;
  notes?: string;
  admin_notes?: string;
}

export default function AdminFormsPage() {
  const router = useRouter();
  const [forms, setForms] = useState<ClientForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedForm, setSelectedForm] = useState<ClientForm | null>(null);
  const [creatingClient, setCreatingClient] = useState(false);
  const [deletingForm, setDeletingForm] = useState<ClientForm | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/check');
      const data = await res.json();
      if (!data.authenticated) {
        router.push('/admin/login');
        return;
      }
      fetchForms();
    } catch {
      router.push('/admin/login');
    }
  }

  async function fetchForms() {
    setLoading(true);
    try {
      const res = await fetch('/api/forms');
      const data = await res.json();
      setForms(data.forms || []);
    } catch (error) {
      console.error('Error fetching forms:', error);
    }
    setLoading(false);
  }

  async function createFormLink() {
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchForms();
        alert(`Link criado: ${window.location.origin}/form/${data.form.code}`);
      } else {
        alert('Erro ao criar link: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating form:', error);
      alert('Erro ao criar link');
    }
  }

  async function sendWhatsAppLink(form: ClientForm) {
    const formUrl = `${window.location.origin}/form/${form.code}`;
    const message = `Olá! 👋

🌍 *Bem-vindo à NomadWay!*

Para iniciarmos seu processo de visto de Nômade Digital, por favor preencha nosso formulário com seus dados:

🔗 ${formUrl}

⏱️ *Importante:* Preencha com atenção pois esses dados serão utilizados para sua documentação.

Qualquer dúvida, estou à disposição!

Equipe NomadWay`;

    // Open WhatsApp - will let user choose contact if no phone provided
    const phone = form.phone?.replace(/\D/g, '') || '';
    const whatsappUrl = phone 
      ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
  }

  // Normalize phone to international format
  function normalizePhone(phone: string | undefined): string {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 0) return '';
    if (cleaned.startsWith('55') && cleaned.length >= 12 && cleaned.length <= 13) {
      return '+' + cleaned;
    }
    if (cleaned.length === 11) return '+55' + cleaned;
    if (cleaned.length === 10) return '+55' + cleaned;
    if (cleaned.length > 11) return '+' + cleaned;
    return '+55' + cleaned;
  }

  async function createClientFromForm(form: ClientForm) {
    if (!confirm('Criar cliente a partir deste formulário?')) return;
    
    setCreatingClient(true);
    try {
      const res = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.full_name,
          email: form.email,
          phone: normalizePhone(form.phone),
          visa_type: form.visa_type || 'digital_nomad',
          source: 'form',
          form_id: form.id,
          // Additional data
          cpf: form.cpf,
          rg: form.rg,
          passport: form.passport_number,
          passport_expiry: form.passport_expiry_date,
          profession: form.profession,
          company: form.company_name,
          monthly_income: form.monthly_income_range,
          marital_status: form.marital_status,
          nationality: form.nationality
        })
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        // Update form status
        await fetch('/api/forms', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: form.code, status: 'processed', client_id: data.client?.id })
        });
        
        alert(`Cliente criado com sucesso!\nCódigo: ${data.client?.client_code}`);
        fetchForms();
        setSelectedForm(null);
      } else {
        alert('Erro ao criar cliente: ' + (data.details || data.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Error creating client:', error);
      alert('Erro ao criar cliente');
    }
    setCreatingClient(false);
  }

  async function generateContract(form: ClientForm) {
    // Build contract data from form
    const contractData = {
      client_name: form.full_name || 'Cliente',
      client_email: form.email,
      client_phone: form.phone,
      client_cpf: form.cpf,
      client_rg: form.rg,
      client_passport: form.passport_number,
      client_passport_expiry: form.passport_expiry_date,
      client_nationality: form.nationality,
      client_birth_date: form.birth_date,
      client_address: '',
      client_city: form.country,
      client_country: form.country,
      client_cep: '',
      service_value: form.service_value || '1499.90',
      payment_method: form.payment_method || 'pix',
      visa_type: form.visa_type || 'Visto de Nômade Digital'
    };
    
    // Download PDF directly from API
    const encodedData = encodeURIComponent(JSON.stringify(contractData));
    window.open(`/api/admin/contracts/pdf?data=${encodedData}`, '_blank');
  }

  async function deleteForm(form: ClientForm) {
    if (!confirm(`Tem certeza que deseja excluir o formulário ${form.code}?\n\nEsta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      const res = await fetch('/api/forms', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: form.code })
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        setForms(prev => prev.filter(f => f.id !== form.id));
        setSelectedForm(null);
        setDeletingForm(null);
        alert('Formulário excluído com sucesso!');
      } else {
        alert('Erro ao excluir: ' + (data.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Error deleting form:', error);
      alert('Erro ao excluir formulário');
    }
  }

  function getStatusConfig(status: string) {
    switch (status) {
      case 'pending':
        return { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Aguardando' };
      case 'completed':
        return { bg: 'bg-green-100', text: 'text-green-700', label: 'Preenchido' };
      case 'processed':
        return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Processado' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', label: status };
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  const filteredForms = forms.filter(form => {
    const matchesFilter = filter === 'all' || form.status === filter;
    const matchesSearch = !search || 
      form.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      form.email?.toLowerCase().includes(search.toLowerCase()) ||
      form.code?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white text-2xl font-bold">N</span>
          </div>
          <p className="text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Formulários</h2>
          <p className="text-gray-500">{forms.length} formulários no total</p>
        </div>
        <button
          onClick={createFormLink}
          className="px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity shadow-lg flex items-center gap-2"
        >
          ➕ Novo Link de Formulário
        </button>
      </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="🔍 Buscar por nome, email ou código..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todos os status</option>
              <option value="pending">Aguardando</option>
              <option value="completed">Preenchido</option>
              <option value="processed">Processado</option>
            </select>
          </div>

          {/* Forms Grid */}
          <div className="grid gap-4">
            {filteredForms.map((form) => {
              const status = getStatusConfig(form.status);
              return (
                <div
                  key={form.id}
                  className="bg-white rounded-xl shadow-sm p-4 border border-transparent hover:border-blue-200 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${
                        form.status === 'pending' ? 'bg-amber-400' :
                        form.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                      }`}>
                        {form.status === 'pending' ? '⏳' : form.status === 'completed' ? '✓' : '✓✓'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{form.full_name || 'Formulário Pendente'}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                            {status.label}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {form.code} • {form.email || 'Sem email'}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Criado em {formatDate(form.created_at)}
                          {form.submitted_at && ` • Enviado em ${formatDate(form.submitted_at)}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {form.status === 'pending' && (
                        <>
                          <button
                            onClick={() => sendWhatsAppLink(form)}
                            className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                          >
                            📱 Enviar WhatsApp
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/form/${form.code}`);
                              alert('Link copiado!');
                            }}
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                          >
                            📋 Copiar Link
                          </button>
                          <button
                            onClick={() => deleteForm(form)}
                            className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                          >
                            🗑️ Excluir
                          </button>
                        </>
                      )}
                      {form.status === 'completed' && (
                        <>
                          <button
                            onClick={() => setSelectedForm(form)}
                            className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                          >
                            👁️ Ver Dados
                          </button>
                          <button
                            onClick={() => createClientFromForm(form)}
                            disabled={creatingClient}
                            className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors disabled:opacity-50"
                          >
                            👤 Criar Cliente
                          </button>
                          <button
                            onClick={() => generateContract(form)}
                            className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors"
                          >
                            📄 Gerar Contrato
                          </button>
                          <button
                            onClick={() => deleteForm(form)}
                            className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                          >
                            🗑️ Excluir
                          </button>
                        </>
                      )}
                      {form.status === 'processed' && (
                        <>
                          <button
                            onClick={() => setSelectedForm(form)}
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                          >
                            👁️ Ver Dados
                          </button>
                          <button
                            onClick={() => deleteForm(form)}
                            className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                          >
                            🗑️ Excluir
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredForms.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400">
                Nenhum formulário encontrado
              </div>
            )}
          </div>

          {/* Detail Modal */}
          {selectedForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Dados do Formulário</h3>
              <button
                onClick={() => setSelectedForm(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Código</p>
                  <p className="font-mono font-medium">{selectedForm.code}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusConfig(selectedForm.status).bg} ${getStatusConfig(selectedForm.status).text}`}>
                    {getStatusConfig(selectedForm.status).label}
                  </span>
                </div>
              </div>
              
              {selectedForm.full_name && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">👤 Dados Pessoais</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-500">Nome:</span> {selectedForm.full_name}</div>
                    <div><span className="text-gray-500">Nascimento:</span> {selectedForm.birth_date || '-'}</div>
                    <div><span className="text-gray-500">Nacionalidade:</span> {selectedForm.nationality || '-'}</div>
                    <div><span className="text-gray-500">Estado civil:</span> {selectedForm.marital_status || '-'}</div>
                  </div>
                </div>
              )}
              
              {selectedForm.cpf && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">📄 Documentos</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-500">CPF:</span> {selectedForm.cpf || '-'}</div>
                    <div><span className="text-gray-500">RG:</span> {selectedForm.rg || '-'}</div>
                    <div><span className="text-gray-500">Passaporte:</span> {selectedForm.passport_number || '-'}</div>
                    <div><span className="text-gray-500">Validade:</span> {selectedForm.passport_expiry_date || '-'}</div>
                  </div>
                </div>
              )}
              
              {selectedForm.email && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">📱 Contato</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-500">Email:</span> {selectedForm.email}</div>
                    <div><span className="text-gray-500">WhatsApp:</span> {selectedForm.phone || '-'}</div>
                    <div><span className="text-gray-500">País:</span> {selectedForm.country || '-'}</div>
                  </div>
                </div>
              )}
              
              {selectedForm.profession && (
                <div className="bg-amber-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">💼 Dados Profissionais</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-500">Profissão:</span> {selectedForm.profession || '-'}</div>
                    <div><span className="text-gray-500">Empresa:</span> {selectedForm.company_name || '-'}</div>
                    <div><span className="text-gray-500">Renda:</span> {selectedForm.monthly_income_range || '-'}</div>
                  </div>
                </div>
              )}
              
              {selectedForm.visa_type && (
                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">📋 Serviço</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-500">Tipo:</span> {selectedForm.visa_type}</div>
                    <div><span className="text-gray-500">Valor:</span> €{selectedForm.service_value || '-'}</div>
                    <div><span className="text-gray-500">Pagamento:</span> {selectedForm.payment_method || '-'}</div>
                  </div>
                </div>
              )}
              
              {selectedForm.notes && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">📝 Observações</h4>
                  <p className="text-sm text-gray-700">{selectedForm.notes}</p>
                </div>
              )}
              
              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  onClick={() => setSelectedForm(null)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Fechar
                </button>
                {selectedForm.status === 'completed' && (
                  <>
                    <button
                      onClick={() => createClientFromForm(selectedForm)}
                      disabled={creatingClient}
                      className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
                    >
                      {creatingClient ? 'Criando...' : 'Criar Cliente'}
                    </button>
                    <button
                      onClick={() => generateContract(selectedForm)}
                      className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                    >
                      Gerar Contrato
                    </button>
                  </>
                )}
                <button
                  onClick={() => deleteForm(selectedForm)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  🗑️ Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}