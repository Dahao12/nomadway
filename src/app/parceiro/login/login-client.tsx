'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PartnerLoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code') || '';

  const [mode, setMode] = useState<'email' | 'password'>('email');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [partnerCode, setPartnerCode] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialCheck, setInitialCheck] = useState(!!code);

  // Auto-check if code was passed via URL (compatibilidade)
  useEffect(() => {
    if (code && initialCheck) {
      setPartnerCode(code);
      checkPartnerByCode(code);
    }
  }, [code]);

  const checkPartnerByCode = async (codeToCheck: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/partners?code=${codeToCheck}`);
      const data = await res.json();

      if (data.partners?.length > 0) {
        const partner = data.partners[0];
        if (partner.has_password) {
          setMode('password');
          setPartnerName(partner.name);
          setPartnerEmail(partner.email);
        } else {
          router.push(`/parceiro?code=${codeToCheck}`);
        }
      } else {
        setError('Código não encontrado');
      }
    } catch (err) {
      setError('Erro ao verificar código');
    } finally {
      setLoading(false);
      setInitialCheck(false);
    }
  };

  const checkPartnerByEmail = async (emailToCheck: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/partners?email=${encodeURIComponent(emailToCheck)}`);
      const data = await res.json();

      if (data.partners?.length > 0) {
        const partner = data.partners[0];
        setPartnerCode(partner.code);
        if (partner.has_password) {
          setPartnerName(partner.name);
          setMode('password');
        } else {
          router.push(`/parceiro?code=${partner.code}`);
        }
      } else {
        setError('Email não encontrado');
      }
    } catch (err) {
      setError('Erro ao verificar email');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    checkPartnerByEmail(partnerEmail);
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/partners/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: partnerEmail, password }),
      });

      const data = await res.json();

      if (data.success) {
        router.push(`/parceiro?code=${data.partner.code}`);
      } else {
        setError(data.error || 'Senha incorreta');
      }
    } catch (err) {
      setError('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Portal do Parceiro</h1>
          <p className="text-gray-600 mt-2">NomadWay</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {mode === 'email' ? (
            <form onSubmit={handleEmailLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email cadastrado
                </label>
                <input
                  type="email"
                  value={partnerEmail}
                  onChange={(e) => setPartnerEmail(e.target.value.toLowerCase())}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="seu@email.com"
                  required
                />
              </div>

              {error && (
                <p className="text-red-600 text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !partnerEmail.trim()}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50"
              >
                {loading ? 'Verificando...' : 'Entrar'}
              </button>
            </form>
          ) : (
            <form onSubmit={handlePasswordLogin} className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  Olá, <strong>{partnerName}</strong>! Digite sua senha para continuar.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <p className="text-red-600 text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>

              <button
                type="button"
                onClick={() => setMode('email')}
                className="w-full py-3 text-gray-600 hover:text-gray-800"
              >
                Voltar
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-500">
              Não tem uma conta de parceiro?{' '}
              <a href="/parceiro/cadastro" className="text-blue-600 hover:text-blue-700 font-medium">
                Cadastre-se
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}