'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'Geral', icon: '⚙️' },
    { id: 'notifications', label: 'Notificações', icon: '🔔' },
    { id: 'integrations', label: 'Integrações', icon: '🔗' },
    { id: 'profile', label: 'Perfil', icon: '👤' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-500">Gerencie as configurações do sistema</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="bg-white rounded-xl border border-gray-200 p-2 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Site Info */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações do Site</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Site</label>
                    <input
                      type="text"
                      value="NomadWay"
                      disabled
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">URL do Site</label>
                    <input
                      type="text"
                      value="https://nomadway.com.br"
                      disabled
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500"
                    />
                  </div>
                </div>
              </div>

              {/* API Keys */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">API Keys</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value="https://nomadway-portal.vercel.app/api/webhooks/booking"
                        disabled
                        className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 font-mono text-sm"
                      />
                      <button className="px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                        Copiar
                      </button>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Use esta URL para receber agendamentos externos (site, Calendly, etc.)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notificações</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <div className="font-medium text-gray-900">Novos Leads</div>
                    <div className="text-sm text-gray-500">Receber notificação quando um novo lead chegar</div>
                  </div>
                  <button className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium">
                    Ativo
                  </button>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <div className="font-medium text-gray-900">Mudança de Status</div>
                    <div className="text-sm text-gray-500">Alertar quando cliente mudar de etapa</div>
                  </div>
                  <button className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium">
                    Ativo
                  </button>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-medium text-gray-900">WhatsApp para Cliente</div>
                    <div className="text-sm text-gray-500">Enviar confirmação automática por WhatsApp</div>
                  </div>
                  <button className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium">
                    Ativo
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Integrações</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-4 px-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">📊</div>
                    <div>
                      <div className="font-medium text-gray-900">Supabase</div>
                      <div className="text-sm text-gray-500">Banco de dados</div>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    Conectado
                  </span>
                </div>
                <div className="flex items-center justify-between py-4 px-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">💬</div>
                    <div>
                      <div className="font-medium text-gray-900">WhatsApp</div>
                      <div className="text-sm text-gray-500">Notificações automáticas</div>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    Conectado
                  </span>
                </div>
                <div className="flex items-center justify-between py-4 px-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">🌐</div>
                    <div>
                      <div className="font-medium text-gray-900">Site</div>
                      <div className="text-sm text-gray-500">nomadway.com.br</div>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    Conectado
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Seu Perfil</h2>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                    M
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Marlon</div>
                    <div className="text-sm text-gray-500">Administrador</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                    <input
                      type="text"
                      value="Marlon"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value="admin@nomadway.com"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <button className="px-6 py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors">
                  Salvar Alterações
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}