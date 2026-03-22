'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface FormData {
  // Dados Pessoais
  full_name: string;
  birth_date: string;
  nationality: string;
  marital_status: string;
  cpf: string;
  rg: string;
  email: string;
  phone: string;
  
  // Passaporte
  passport_number: string;
  passport_issue_date: string;
  passport_expiry_date: string;
  passport_country: string;
  
  // Endereço
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  
  // Dados Profissionais
  profession: string;
  work_type: string;
  company_name: string;
  cnpj: string;
  work_area: string;
  experience_years: string;
  monthly_income_range: string;
  linkedin_url: string;
  
  // Clientes/Fontes de Renda
  client1_name: string;
  client1_value: string;
  client2_name: string;
  client2_value: string;
  client3_name: string;
  client3_value: string;
  
  // Visto
  visa_type: string;
  destination_city: string;
  planned_move_date: string;
  has_previous_visa: boolean;
  
  // Documentos
  has_passport: boolean;
  has_cpf: boolean;
  has_rg: boolean;
  has_marriage_cert: boolean;
  has_birth_cert: boolean;
  has_income_proof: boolean;
  has_work_contract: boolean;
  has_resume: boolean;
  has_diploma: boolean;
  has_health_insurance: boolean;
  has_criminal_record: boolean;
  has_address_proof: boolean;
  
  // Observações
  notes: string;
  source: string;
  
  // Acompanhantes
  companions: Companion[];
}

interface Companion {
  name: string;
  relationship: string;
  birth_date: string;
  passport_number: string;
}

const initialFormData: FormData = {
  full_name: '',
  birth_date: '',
  nationality: 'Brasileira',
  marital_status: '',
  cpf: '',
  rg: '',
  email: '',
  phone: '',
  
  passport_number: '',
  passport_issue_date: '',
  passport_expiry_date: '',
  passport_country: 'Brasil',
  
  address: '',
  city: '',
  state: '',
  postal_code: '',
  country: 'Brasil',
  
  profession: '',
  work_type: '',
  company_name: '',
  cnpj: '',
  work_area: '',
  experience_years: '',
  monthly_income_range: '',
  linkedin_url: '',
  
  client1_name: '',
  client1_value: '',
  client2_name: '',
  client2_value: '',
  client3_name: '',
  client3_value: '',
  
  visa_type: 'digital_nomad',
  destination_city: '',
  planned_move_date: '',
  has_previous_visa: false,
  
  has_passport: false,
  has_cpf: false,
  has_rg: false,
  has_marriage_cert: false,
  has_birth_cert: false,
  has_income_proof: false,
  has_work_contract: false,
  has_resume: false,
  has_diploma: false,
  has_health_insurance: false,
  has_criminal_record: false,
  has_address_proof: false,
  
  notes: '',
  source: '',
  
  companions: [],
};

export default function PublicFichaPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientName, setClientName] = useState('');
  const [formData, setFormData] = useState<FormData>(initialFormData);

  useEffect(() => {
    loadClientData();
  }, [slug]);

  async function loadClientData() {
    try {
      const res = await fetch(`/api/ficha/${slug}`);
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Link inválido ou expirado');
        return;
      }
      
      setClientName(data.client_name || '');
      setFormData(prev => ({
        ...prev,
        full_name: data.full_name || '',
        email: data.email || '',
        phone: data.phone || '',
        visa_type: data.visa_type || 'digital_nomad'
      }));
    } catch (err) {
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  }

  function handleCheckboxChange(name: string, checked: boolean) {
    setFormData(prev => ({ ...prev, [name]: checked }));
  }

  function addCompanion() {
    setFormData(prev => ({
      ...prev,
      companions: [...prev.companions, { name: '', relationship: '', birth_date: '', passport_number: '' }]
    }));
  }

  function removeCompanion(index: number) {
    setFormData(prev => ({
      ...prev,
      companions: prev.companions.filter((_, i) => i !== index)
    }));
  }

  function updateCompanion(index: number, field: string, value: string) {
    setFormData(prev => ({
      ...prev,
      companions: prev.companions.map((c, i) => i === index ? { ...c, [field]: value } : c)
    }));
  }

  function formatCPF(value: string) {
    const v = value.replace(/\D/g, '').slice(0, 11);
    return v.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }

  function formatCEP(value: string) {
    const v = value.replace(/\D/g, '').slice(0, 8);
    return v.replace(/(\d{5})(\d)/, '$1-$2');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/ficha/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (res.ok) {
        setSaved(true);
      } else {
        setError(data.error || 'Erro ao salvar ficha');
      }
    } catch {
      setError('Erro ao salvar ficha');
    }
    
    setSaving(false);
  }

  // Calculate progress
  const requiredFields = ['full_name', 'birth_date', 'nationality', 'marital_status', 'cpf', 'rg', 'email', 'phone', 'passport_number', 'passport_issue_date', 'passport_expiry_date', 'address', 'city', 'state', 'postal_code', 'profession', 'work_type', 'work_area', 'experience_years', 'monthly_income_range', 'visa_type', 'destination_city', 'planned_move_date'];
  const filledCount = requiredFields.filter(f => formData[f as keyof FormData]).length;
  const progress = Math.round((filledCount / requiredFields.length) * 100);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white text-2xl font-bold">N</span>
          </div>
          <p className="text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error && !saved) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erro</h1>
          <p className="text-gray-500 mb-6">{error}</p>
          <p className="text-sm text-gray-400">Entre em contato com a NomadWay para obter um novo link.</p>
        </div>
      </div>
    );
  }

  if (saved) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-4xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ficha Enviada!</h1>
          <p className="text-gray-500 mb-6">Obrigado por preencher. Entraremos em contato em breve.</p>
          <div className="p-4 bg-blue-50 rounded-xl text-sm text-blue-700">
            <span className="font-medium">NomadWay</span><br />
            Sua ponte para a Espanha 🇪🇸
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <div>
                <h1 className="font-bold text-gray-900">NomadWay</h1>
                <p className="text-xs text-gray-500">Ficha Cadastral</p>
              </div>
            </div>
            {clientName && (
              <div className="text-right">
                <p className="text-sm text-gray-500">Bem-vindo(a)</p>
                <p className="font-medium text-gray-900">{clientName}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-4 lg:p-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Ficha Cadastral</h2>
              <p className="text-gray-500">Preencha seus dados para elaboração do contrato</p>
            </div>
          </div>

          {/* Progress */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Progresso</span>
              <span className="font-medium text-gray-900">{progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-2">* Campos obrigatórios</p>
          </div>
        </div>

        {/* Form - Mesmo do admin/ficha mas sem sidebar */}
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
          
          {/* Section 1: Dados Pessoais */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 font-semibold flex items-center gap-3">
              <span>👤</span> 1. Dados Pessoais
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                  <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Como está no passaporte" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento *</label>
                  <input type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} required className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nacionalidade *</label>
                  <select name="nationality" value={formData.nationality} onChange={handleChange} required className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="Brasileira">Brasileira</option>
                    <option value="Outra">Outra</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado Civil *</label>
                  <select name="marital_status" value={formData.marital_status} onChange={handleChange} required className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Selecione...</option>
                    <option value="solteiro">Solteiro(a)</option>
                    <option value="casado">Casado(a)</option>
                    <option value="divorciado">Divorciado(a)</option>
                    <option value="viuvo">Viúvo(a)</option>
                    <option value="uniao_estavel">União Estável</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CPF *</label>
                  <input type="text" name="cpf" value={formData.cpf} onChange={(e) => setFormData(prev => ({ ...prev, cpf: formatCPF(e.target.value) }))} required maxLength={14} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="000.000.000-00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RG *</label>
                  <input type="text" name="rg" value={formData.rg} onChange={handleChange} required className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Número e órgão emissor" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="seu@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone/WhatsApp *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="+55 (00) 00000-0000" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Passaporte */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 font-semibold flex items-center gap-3">
              <span>🛂</span> 2. Passaporte
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número *</label>
                  <input type="text" name="passport_number" value={formData.passport_number} onChange={handleChange} required className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="AA0000000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Emissão *</label>
                  <input type="date" name="passport_issue_date" value={formData.passport_issue_date} onChange={handleChange} required className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Validade *</label>
                  <input type="date" name="passport_expiry_date" value={formData.passport_expiry_date} onChange={handleChange} required className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">País de Emissão *</label>
                  <input type="text" name="passport_country" value={formData.passport_country} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
              </div>
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                <span className="mr-2">⚠️</span>
                <strong>Importante:</strong> O passaporte deve ter validade mínima de 12 meses na data da aplicação do visto.
              </div>
            </div>
          </div>

          {/* Section 3: Endereço */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-4 font-semibold flex items-center gap-3">
              <span>📍</span> 3. Endereço Atual
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endereço Completo *</label>
                  <input type="text" name="address" value={formData.address} onChange={handleChange} required className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Rua, número, complemento" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} required className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                  <input type="text" name="state" value={formData.state} onChange={handleChange} required className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="SP, RJ, MG..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CEP *</label>
                  <input type="text" name="postal_code" value={formData.postal_code} onChange={(e) => setFormData(prev => ({ ...prev, postal_code: formatCEP(e.target.value) }))} required maxLength={9} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="00000-000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">País *</label>
                  <input type="text" name="country" value={formData.country} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Dados Profissionais */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 font-semibold flex items-center gap-3">
              <span>💼</span> 4. Dados Profissionais
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profissão *</label>
                  <input type="text" name="profession" value={formData.profession} onChange={handleChange} required className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Ex: Desenvolvedor" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Trabalho *</label>
                  <select name="work_type" value={formData.work_type} onChange={handleChange} required className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Selecione...</option>
                    <option value="freelancer">Freelancer</option>
                    <option value="autonomo">Autônomo</option>
                    <option value="pj">PJ (Pessoa Jurídica)</option>
                    <option value="clt_remoto">CLT Remoto</option>
                    <option value="empresario">Empresário</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa</label>
                  <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Se aplicável" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
                  <input type="text" name="cnpj" value={formData.cnpj} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="00.000.000/0000-00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Área de Atuação *</label>
                  <select name="work_area" value={formData.work_area} onChange={handleChange} required className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Selecione...</option>
                    <option value="tecnologia">Tecnologia / TI</option>
                    <option value="design">Design / Criativo</option>
                    <option value="marketing">Marketing / Publicidade</option>
                    <option value="consultoria">Consultoria</option>
                    <option value="financeiro">Financeiro</option>
                    <option value="educacao">Educação</option>
                    <option value="saude">Saúde</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experiência na Área *</label>
                  <select name="experience_years" value={formData.experience_years} onChange={handleChange} required className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Selecione...</option>
                    <option value="1-2">1-2 anos</option>
                    <option value="3-5">3-5 anos</option>
                    <option value="5-10">5-10 anos</option>
                    <option value="10+">Mais de 10 anos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Renda Mensal (EUR) *</label>
                  <select name="monthly_income_range" value={formData.monthly_income_range} onChange={handleChange} required className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Selecione...</option>
                    <option value="2000-3000">€2.000 - €3.000</option>
                    <option value="3000-5000">€3.000 - €5.000</option>
                    <option value="5000-8000">€5.000 - €8.000</option>
                    <option value="8000-10000">€8.000 - €10.000</option>
                    <option value="10000+">Acima de €10.000</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                  <input type="url" name="linkedin_url" value={formData.linkedin_url} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="https://linkedin.com/in/..." />
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Clientes */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-4 font-semibold flex items-center gap-3">
              <span>👥</span> 5. Clientes / Fontes de Renda
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-4">Para comprovação de renda como trabalhador remoto:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cliente 1 - Nome</label>
                  <input type="text" name="client1_name" value={formData.client1_name} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cliente 1 - Valor (EUR)</label>
                  <input type="text" name="client1_value" value={formData.client1_value} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="€0,00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cliente 2 - Nome</label>
                  <input type="text" name="client2_name" value={formData.client2_name} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cliente 2 - Valor (EUR)</label>
                  <input type="text" name="client2_value" value={formData.client2_value} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="€0,00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cliente 3 - Nome</label>
                  <input type="text" name="client3_name" value={formData.client3_name} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cliente 3 - Valor (EUR)</label>
                  <input type="text" name="client3_value" value={formData.client3_value} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="€0,00" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: Visto */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-4 font-semibold flex items-center gap-3">
              <span>✈️</span> 6. Visto Pretendido
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Visto *</label>
                  <select name="visa_type" value={formData.visa_type} onChange={handleChange} required className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="digital_nomad">Visto Nômade Digital</option>
                    <option value="beckham">Lei Beckham</option>
                    <option value="student">Visto Estudante</option>
                    <option value="work">Visto Trabalho</option>
                    <option value="golden">Visto Ouro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cidade na Espanha *</label>
                  <select name="destination_city" value={formData.destination_city} onChange={handleChange} required className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Selecione...</option>
                    <option value="barcelona">Barcelona</option>
                    <option value="madrid">Madrid</option>
                    <option value="valencia">Valência</option>
                    <option value="malaga">Málaga</option>
                    <option value="sevilla">Sevilla</option>
                    <option value="alicante">Alicante</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Prevista Mudança *</label>
                  <input type="date" name="planned_move_date" value={formData.planned_move_date} onChange={handleChange} required className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Já possui visto?</label>
                  <select name="has_previous_visa" value={formData.has_previous_visa ? 'true' : 'false'} onChange={(e) => handleCheckboxChange('has_previous_visa', e.target.value === 'true')} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="false">Não</option>
                    <option value="true">Sim</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 7: Acompanhantes */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-4 font-semibold flex items-center gap-3">
              <span>👨‍👩‍👧‍👦</span> 7. Acompanhantes (Família)
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-4">Pessoas que irão com você para a Espanha:</p>
              
              <div className="space-y-4">
                {formData.companions.map((companion, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-xl relative">
                    {index > 0 && (
                      <button type="button" onClick={() => removeCompanion(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                        ✕
                      </button>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                        <input type="text" value={companion.name} onChange={(e) => updateCompanion(index, 'name', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Parentesco</label>
                        <select value={companion.relationship} onChange={(e) => updateCompanion(index, 'relationship', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          <option value="">Selecione...</option>
                          <option value="conjuge">Cônjuge</option>
                          <option value="filho">Filho(a)</option>
                          <option value="pai_mae">Pai/Mãe</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                        <input type="date" value={companion.birth_date} onChange={(e) => updateCompanion(index, 'birth_date', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Passaporte</label>
                        <input type="text" value={companion.passport_number} onChange={(e) => updateCompanion(index, 'passport_number', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Número" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button type="button" onClick={addCompanion} className="mt-4 border-2 border-dashed border-gray-300 text-gray-500 py-3 px-4 rounded-xl hover:border-blue-500 hover:text-blue-500 transition-colors">
                <span className="mr-2">+</span> Adicionar Acompanhante
              </button>
            </div>
          </div>

          {/* Section 8: Documentos */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white px-6 py-4 font-semibold flex items-center gap-3">
              <span>📄</span> 8. Documentos Disponíveis
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {[
                  { key: 'has_passport', label: 'Passaporte válido' },
                  { key: 'has_cpf', label: 'CPF' },
                  { key: 'has_rg', label: 'RG' },
                  { key: 'has_marriage_cert', label: 'Certidão Casamento' },
                  { key: 'has_birth_cert', label: 'Certidão Nascimento' },
                  { key: 'has_income_proof', label: 'Comprovante Renda' },
                  { key: 'has_work_contract', label: 'Contrato Trabalho' },
                  { key: 'has_resume', label: 'Currículo' },
                  { key: 'has_diploma', label: 'Diploma' },
                  { key: 'has_health_insurance', label: 'Seguro Saúde' },
                  { key: 'has_criminal_record', label: 'Antecedentes Criminais' },
                  { key: 'has_address_proof', label: 'Comprovante Endereço' },
                ].map(doc => (
                  <label key={doc.key} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <input type="checkbox" checked={formData[doc.key as keyof FormData] as boolean} onChange={(e) => handleCheckboxChange(doc.key, e.target.checked)} className="w-5 h-5 text-blue-600 rounded" />
                    <span className="text-sm">{doc.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Section 9: Observações */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-4 font-semibold flex items-center gap-3">
              <span>💬</span> 9. Observações
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Informações Adicionais</label>
                  <textarea name="notes" value={formData.notes} onChange={handleChange} rows={4} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Qualquer informação relevante..."></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Como conheceu a NomadWay?</label>
                  <select name="source" value={formData.source} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Selecione...</option>
                    <option value="google">Google</option>
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="indicacao">Indicação</option>
                    <option value="youtube">YouTube</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" required className="w-5 h-5 text-blue-600 mt-0.5 rounded" />
                  <span className="text-sm text-gray-700">
                    Declaro que as informações são verdadeiras e autorizo a NomadWay a utilizar estes dados para elaboração do contrato e processamento do visto, em conformidade com a LGPD.
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50 text-lg">
              {saving ? '⏳ Enviando...' : '✅ Enviar Ficha'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}