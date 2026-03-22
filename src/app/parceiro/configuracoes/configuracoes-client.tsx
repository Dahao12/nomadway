'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Partner {
  id: string;
  name: string;
  email: string;
  phone?: string;
  code: string;
  payment_method?: string;
  password_hash?: string;
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
}

export default function ConfiguracoesClient() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code') || 'EZE01';
  
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Form state
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [paymentInfo, setPaymentInfo] = useState({
    pix_key: '',
    pix_name: '',
    wise_email: '',
    paypal_email: '',
    bank_name: '',
    bank_agency: '',
    bank_account: '',
    bank_holder: '',
  });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hasPassword, setHasPassword] = useState(false);

  useEffect(() => {
    fetchPartner();
  }, [code]);

  const fetchPartner = async () => {
    try {
      const res = await fetch(`/api/partners?code=${code}`);
      const data = await res.json();
      
      if (data.partners?.[0]) {
        const p = data.partners[0];
        setPartner(p);
        setPaymentMethod(p.payment_method || 'pix');
        setHasPassword(!!p.password_hash);
        if (p.payment_info) {
          setPaymentInfo({
            pix_key: p.payment_info.pix_key || '',
            pix_name: p.payment_info.pix_name || '',
            wise_email: p.payment_info.wise_email || '',
            paypal_email: p.payment_info.paypal_email || '',
            bank_name: p.payment_info.bank_name || '',
            bank_agency: p.payment_info.bank_agency || '',
            bank_account: p.payment_info.bank_account || '',
            bank_holder: p.payment_info.bank_holder || '',
          });
        }
      }
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!partner) return;
    
    // Validar senha se estiver preenchida
    if (password && password !== confirmPassword) {
      alert('As senhas não coincidem');
      return;
    }
    
    setSaving(true);
    setSaved(false);
    
    try {
      const updateData: any = {
        payment_method: paymentMethod,
        payment_info: paymentInfo,
      };
      
      // Adicionar senha se preenchida
      if (password && password.length >= 6) {
        updateData.password = password;
      }
      
      const res = await fetch(`/api/partners/${partner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      
      if (res.ok) {
        setSaved(true);
        setPassword('');
        setConfirmPassword('');
        if (password) setHasPassword(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setSaving(false);
    }
  };

  const paymentMethods = [
    { value: 'pix', label: 'PIX', icon: '💳' },
    { value: 'wise', label: 'Wise (Transfer)', icon: '🌍' },
    { value: 'paypal', label: 'PayPal', icon: '💙' },
    { value: 'bank', label: 'Conta Bancária (Brasil)', icon: '🏦' },
  ];

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
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link href={`/parceiro?code=${code}`} className="inline-flex items-center text-blue-600 hover:text-blue-700">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Voltar ao Dashboard
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Configurações de Pagamento</h1>

        {/* Info Banner */}
        <div className="bg-blue-50 rounded-xl p-4 mb-6">
          <p className="text-blue-800 text-sm">
            💰 <strong>Importante:</strong> As comissões são pagas dia 15 de cada mês. 
            Configure seus dados de pagamento para receber suas comissões sem atraso.
          </p>
        </div>

        {/* Payment Method Selection */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="font-bold text-gray-900 mb-4">Forma de Recebimento</h2>
          
          <div className="grid grid-cols-2 gap-3">
            {paymentMethods.map((method) => (
              <button
                key={method.value}
                onClick={() => setPaymentMethod(method.value)}
                className={`p-4 rounded-xl border-2 transition text-left ${
                  paymentMethod === method.value
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl mb-2 block">{method.icon}</span>
                <span className="font-medium text-gray-900">{method.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* PIX Form */}
        {paymentMethod === 'pix' && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="font-bold text-gray-900 mb-4">Dados PIX</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Chave PIX
                </label>
                <select
                  value={paymentInfo.pix_key?.startsWith('+') ? 'phone' : 
                         paymentInfo.pix_key?.includes('@') ? 'email' : 
                         paymentInfo.pix_key?.length === 14 ? 'cnpj' : 'cpf'}
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, pix_key: '' })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cpf">CPF</option>
                  <option value="cnpj">CNPJ</option>
                  <option value="email">Email</option>
                  <option value="phone">Telefone</option>
                  <option value="random">Chave Aleatória</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chave PIX *
                </label>
                <input
                  type="text"
                  value={paymentInfo.pix_key}
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, pix_key: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="CPF, CNPJ, email, telefone ou chave aleatória"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Favorecido *
                </label>
                <input
                  type="text"
                  value={paymentInfo.pix_name}
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, pix_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome completo como está na conta"
                />
              </div>
            </div>
          </div>
        )}

        {/* Wise Form */}
        {paymentMethod === 'wise' && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="font-bold text-gray-900 mb-4">Dados Wise</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email da Conta Wise *
                </label>
                <input
                  type="email"
                  value={paymentInfo.wise_email}
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, wise_email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="seu@email.com"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Transferência será enviada para este email
                </p>
              </div>
            </div>
          </div>
        )}

        {/* PayPal Form */}
        {paymentMethod === 'paypal' && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="font-bold text-gray-900 mb-4">Dados PayPal</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email PayPal *
                </label>
                <input
                  type="email"
                  value={paymentInfo.paypal_email}
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, paypal_email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="seu@email.com"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Conta PayPal precisa estar verificada
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bank Form */}
        {paymentMethod === 'bank' && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="font-bold text-gray-900 mb-4">Dados Bancários</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Banco *
                </label>
                <input
                  type="text"
                  value={paymentInfo.bank_name}
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, bank_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome do banco"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Agência *
                  </label>
                  <input
                    type="text"
                    value={paymentInfo.bank_agency}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, bank_agency: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Conta *
                  </label>
                  <input
                    type="text"
                    value={paymentInfo.bank_account}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, bank_account: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="00000-0"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Titular *
                </label>
                <input
                  type="text"
                  value={paymentInfo.bank_holder}
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, bank_holder: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome completo"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Conta precisa estar no mesmo CPF/CNPJ da chave PIX
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Password Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="font-bold text-gray-900 mb-2">🔐 Senha de Acesso</h2>
          <p className="text-sm text-gray-500 mb-4">
            {hasPassword 
              ? 'Você já tem uma senha configurada. Deixe em branco para manter a atual.'
              : 'Defina uma senha para proteger seu painel. Opcional, mas recomendado para mais privacidade.'}
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {hasPassword ? 'Nova Senha' : 'Criar Senha'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
            
            {password && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Senha
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-sm text-red-500 mt-1">As senhas não coincidem</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full py-3 rounded-xl font-medium text-white transition ${
            saving
              ? 'bg-gray-400 cursor-not-allowed'
              : saved
              ? 'bg-green-600'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {saving ? 'Salvando...' : saved ? '✓ Salvo com Sucesso!' : 'Salvar Configurações'}
        </button>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Precisa de ajuda? Entre em contato pelo WhatsApp</p>
          <a href="https://wa.me/34612459582" className="text-blue-600 hover:underline">
            +34 612 459 582
          </a>
        </div>
      </main>
    </div>
  );
}