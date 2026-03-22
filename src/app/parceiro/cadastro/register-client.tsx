'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PartnerRegisterClient() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    payment_method: 'pix',
    pix_key: '',
    pix_name: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [partnerCode, setPartnerCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validações
    if (formData.password && formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    if (formData.payment_method === 'pix' && (!formData.pix_key || !formData.pix_name)) {
      setError('Preencha a chave PIX e nome do favorecido');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password || undefined,
          payment_method: formData.payment_method,
          payment_info: formData.payment_method === 'pix' 
            ? { pix_key: formData.pix_key, pix_name: formData.pix_name }
            : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erro ao criar conta');
        return;
      }

      setPartnerCode(data.partner.code);
      setSuccess(true);

    } catch (err) {
      setError('Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Cadastro Realizado!</h1>
            <p className="text-gray-600 mb-6">
              Sua conta de parceiro foi criada com sucesso.
            </p>
            
            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-600 mb-2">Seu código de parceiro:</p>
              <p className="text-3xl font-mono font-bold text-blue-600">{partnerCode}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
              <h3 className="font-medium text-gray-900 mb-2">📋 Próximos passos:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Compartilhe seu link: <span className="font-mono text-blue-600">nomadway.com.br/agendamento?ref={partnerCode}</span></li>
                <li>• Cada cliente que agendar através do seu link será vinculado a você</li>
                <li>• Você receberá €100 por cliente (€150 após 10 clientes)</li>
              </ul>
            </div>

            <button
              onClick={() => router.push(`/parceiro?code=${partnerCode}`)}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition"
            >
              Acessar Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Cadastro de Parceiro</h1>
          <p className="text-gray-600 mt-2">NomadWay</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Benefits */}
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <h3 className="font-medium text-blue-900 mb-2">💰 Como funciona:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• €100 por cliente indicado (1º ao 9º)</li>
              <li>• €150 por cliente (do 10º em diante)</li>
              <li>• Acompanhe suas comissões pelo portal</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Personal Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome completo *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Seu nome"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone / WhatsApp
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Mínimo 6 caracteres"
              />
              <p className="text-xs text-gray-500 mt-1">
                Se não definir senha, poderá acessar apenas com o código.
              </p>
            </div>

            {formData.password && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar senha
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Repita a senha"
                />
              </div>
            )}

            {/* Payment Info */}
            <div className="pt-4 border-t">
              <h3 className="font-medium text-gray-900 mb-3">💳 Dados de Pagamento</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Forma de recebimento
                </label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pix">PIX</option>
                  <option value="wise">Wise</option>
                  <option value="paypal">PayPal</option>
                  <option value="bank">Transferência Bancária</option>
                </select>
              </div>

              {formData.payment_method === 'pix' && (
                <>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chave PIX *
                    </label>
                    <input
                      type="text"
                      value={formData.pix_key}
                      onChange={(e) => setFormData({ ...formData, pix_key: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="CPF, CNPJ, email, telefone ou chave aleatória"
                    />
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome do favorecido *
                    </label>
                    <input
                      type="text"
                      value={formData.pix_name}
                      onChange={(e) => setFormData({ ...formData, pix_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nome completo conforme cadastrado no banco"
                    />
                  </div>
                </>
              )}
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50"
            >
              {loading ? 'Criando conta...' : 'Criar Conta de Parceiro'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              Já tem uma conta?{' '}
              <a href="/parceiro/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Entrar
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}