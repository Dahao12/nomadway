'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface FormData {
  nome: string;
  data_nascimento: string;
  nacionalidade: string;
  estado_civil: string;
  cpf: string;
  rg: string;
  passaporte: string;
  passaporte_validade: string;
  whatsapp: string;
  email: string;
  pais_residencia: string;
  profissao: string;
  empresa: string;
  renda_mensal: string;
  vinculo_estrangeiro: boolean;
  freelancer_pj: boolean;
  servico: string;
  valor: string;
  forma_pagamento: string;
  observacoes: string;
}

const initialFormData: FormData = {
  nome: '',
  data_nascimento: '',
  nacionalidade: 'Brasileira',
  estado_civil: '',
  cpf: '',
  rg: '',
  passaporte: '',
  passaporte_validade: '',
  whatsapp: '',
  email: '',
  pais_residencia: 'Brasil',
  profissao: '',
  empresa: '',
  renda_mensal: '',
  vinculo_estrangeiro: false,
  freelancer_pj: false,
  servico: 'digital_nomad',
  valor: '',
  forma_pagamento: 'pix',
  observacoes: ''
};

const SERVICOS = [
  { value: 'estudante', label: 'Estudante', price: '€1.499' },
  { value: 'digital_nomad', label: 'Visto de Nômade Digital — Espanha', price: '€1.499' },
  { value: 'digital_nomad_dependents', label: 'Visto + Dependentes', price: '€1.499 + €279/dep' },
];

export default function FormPage() {
  const params = useParams();
  const code = params?.code as string;
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formExists, setFormExists] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (code) {
      checkForm();
    }
  }, [code]);

  async function checkForm() {
    try {
      const res = await fetch(`/api/forms/${code}`);
      const data = await res.json();
      
      if (data.exists) {
        setFormExists(true);
        if (data.form.status === 'completed') {
          setAlreadySubmitted(true);
        }
      }
    } catch (error) {
      console.error('Error checking form:', error);
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`/api/forms/${code}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
      } else {
        alert(data.error || 'Erro ao enviar formulário');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Erro ao enviar formulário. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!formExists) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md mx-4">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Link Inválido</h1>
          <p className="text-gray-600">Este link de formulário não existe ou expirou.</p>
        </div>
      </div>
    );
  }

  if (alreadySubmitted || success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md mx-4">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Formulário Enviado!</h1>
          <p className="text-gray-600 mb-4">Recebemos seus dados. Em breve entraremos em contato.</p>
          <p className="text-sm text-gray-500">Código: {code}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">N</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Formulário de Dados</h1>
          <p className="text-gray-600 mt-1">Visto de Nômade Digital — Espanha</p>
          <p className="text-sm text-gray-400 mt-2">Código: {code}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. DADOS PESSOAIS */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">1</div>
              <h2 className="text-lg font-bold text-gray-900">Dados Pessoais</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo *</label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de nascimento</label>
                  <input
                    type="date"
                    name="data_nascimento"
                    value={formData.data_nascimento}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nacionalidade</label>
                  <input
                    type="text"
                    name="nacionalidade"
                    value={formData.nacionalidade}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado civil</label>
                  <select
                    name="estado_civil"
                    value={formData.estado_civil}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecione</option>
                    <option value="solteiro">Solteiro(a)</option>
                    <option value="casado">Casado(a)</option>
                    <option value="divorciado">Divorciado(a)</option>
                    <option value="viuvo">Viúvo(a)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 2. DOCUMENTOS */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">2</div>
              <h2 className="text-lg font-bold text-gray-900">Documentos</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                <input
                  type="text"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleChange}
                  placeholder="000.000.000-00"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RG / Documento de Identidade</label>
                <input
                  type="text"
                  name="rg"
                  value={formData.rg}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Passaporte (número)</label>
                <input
                  type="text"
                  name="passaporte"
                  value={formData.passaporte}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Validade do Passaporte</label>
                <input
                  type="date"
                  name="passaporte_validade"
                  value={formData.passaporte_validade}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* 3. CONTATO */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">3</div>
              <h2 className="text-lg font-bold text-gray-900">Contato</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp / Telefone *</label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  placeholder="+55 00 00000-0000"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">País de Residência Atual</label>
                <input
                  type="text"
                  name="pais_residencia"
                  value={formData.pais_residencia}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* 4. DADOS PROFISSIONAIS */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">4</div>
              <h2 className="text-lg font-bold text-gray-900">Dados Profissionais</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profissão / Cargo</label>
                  <input
                    type="text"
                    name="profissao"
                    value={formData.profissao}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Empresa / Instituição</label>
                  <input
                    type="text"
                    name="empresa"
                    value={formData.empresa}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Renda Mensal Comprovada (€)</label>
                <input
                  type="number"
                  name="renda_mensal"
                  value={formData.renda_mensal}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="vinculo_estrangeiro"
                    checked={formData.vinculo_estrangeiro}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Possuo vínculo com empresa estrangeira</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="freelancer_pj"
                    checked={formData.freelancer_pj}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Trabalho como freelancer / PJ</span>
                </label>
              </div>
            </div>
          </div>

          {/* 5. SERVIÇO E PAGAMENTO */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">5</div>
              <h2 className="text-lg font-bold text-gray-900">Serviço e Pagamento</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Serviço Contratado</label>
                <div className="space-y-2">
                  {SERVICOS.map(servico => (
                    <label key={servico.value} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="servico"
                        value={servico.value}
                        checked={formData.servico === servico.value}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{servico.label}</p>
                        <p className="text-sm text-gray-500">{servico.price}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento</label>
                <select
                  name="forma_pagamento"
                  value={formData.forma_pagamento}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pix">📱 PIX — Pagamento à vista</option>
                  <option value="wise">💙 Wise — Transferência em euros</option>
                  <option value="remessa">💰 Remessa Online — Transferência em reais</option>
                </select>
              </div>
            </div>
          </div>

          {/* OBSERVAÇÕES */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">📝</div>
              <h2 className="text-lg font-bold text-gray-900">Observações</h2>
            </div>

            <textarea
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              rows={4}
              placeholder="Informações adicionais, dúvidas, ou observações..."
              className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* SUBMIT */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>🔒 Confidencial</strong> — Seus dados serão tratados conforme LGPD/GDPR e utilizados exclusivamente para o processamento do seu visto.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Enviando...' : 'Enviar Formulário'}
            </button>
          </div>
        </form>

        <div className="text-center mt-8 text-sm text-gray-500">
          <p>NomadWay — Assessoria em Visto de Nômade Digital</p>
          <p>contato@nomadway.com.br | +34 612 45 59 82</p>
        </div>
      </div>
    </div>
  );
}