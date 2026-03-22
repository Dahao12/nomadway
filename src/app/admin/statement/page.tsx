'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ymmdygffzkpduxudsfls.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltbWR5Z2ZmemtwZHV4dWRzZmxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NzQ5OTcsImV4cCI6MjA1MzQ1MDk5N30.e-mBQxLgQOqgB9AqAqAqAqAqAqAqAqAqAqAqAqAqAqA';

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  address?: string;
  city?: string;
  country?: string;
  cep?: string;
}

export default function StatementGenerator() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Search clients
  const searchClients = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, email, phone, cpf, address, city, country, cep')
        .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,cpf.ilike.%${searchTerm}%`)
        .order('name')
        .limit(20);
      
      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error searching clients:', error);
      alert('Erro ao buscar clientes');
    } finally {
      setLoading(false);
    }
  };

  // Generate statement
  const generateStatement = async () => {
    if (!selectedClient) {
      alert('Selecione um cliente');
      return;
    }

    // Parse month to get period
    const [year, monthNum] = month.split('-').map(Number);
    const endDate = new Date(year, monthNum, 0); // Last day of selected month
    const startDate = new Date(year, monthNum - 1, 1); // First day of previous month

    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    const statementData = {
      client_name: selectedClient.name,
      client_address: selectedClient.address || 'Endereço não informado',
      client_city: selectedClient.city || 'Cidade não informada',
      client_country: selectedClient.country || 'Brasil',
      client_cep: selectedClient.cep || '00000-000',
      period_start: formatDate(startDate),
      period_end: formatDate(endDate),
    };

    // Open PDF in new tab
    const url = `/api/admin/statement/pdf?data=${encodeURIComponent(JSON.stringify(statementData))}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Gerador de Extratos Wise
        </h1>

        {/* Month Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mês de Referência (fim do período)
          </label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            O extrato cobrirá 2 meses (mês anterior + mês selecionado)
          </p>
        </div>

        {/* Client Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buscar Cliente
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchClients()}
              placeholder="Nome, email ou CPF..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={searchClients}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>

          {/* Client List */}
          {clients.length > 0 && (
            <div className="mt-4 space-y-2">
              {clients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={`w-full text-left p-3 rounded-md border transition-colors ${
                    selectedClient?.id === client.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">{client.name}</div>
                  <div className="text-sm text-gray-600">
                    {client.email} {client.cpf && `• CPF: ${client.cpf}`}
                  </div>
                  {client.address && (
                    <div className="text-xs text-gray-500 mt-1">
                      {client.city && `${client.city}, `}{client.country || 'Brasil'}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Client Preview */}
        {selectedClient && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Dados do Cliente
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Nome:</span>
                <p className="font-medium">{selectedClient.name}</p>
              </div>
              <div>
                <span className="text-gray-500">Email:</span>
                <p className="font-medium">{selectedClient.email}</p>
              </div>
              <div>
                <span className="text-gray-500">Endereço:</span>
                <p className="font-medium">{selectedClient.address || 'Não informado'}</p>
              </div>
              <div>
                <span className="text-gray-500">Cidade:</span>
                <p className="font-medium">{selectedClient.city || 'Não informado'}</p>
              </div>
              <div>
                <span className="text-gray-500">País:</span>
                <p className="font-medium">{selectedClient.country || 'Brasil'}</p>
              </div>
              <div>
                <span className="text-gray-500">CEP:</span>
                <p className="font-medium">{selectedClient.cep || 'Não informado'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={generateStatement}
          disabled={!selectedClient}
          className="w-full py-3 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {selectedClient ? 'Gerar Extrato Wise (PDF)' : 'Selecione um cliente para gerar o extrato'}
        </button>

        {/* Instructions */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-yellow-800 mb-2">📋 Instruções</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• O extrato simula o formato da Wise com uma página</li>
            <li>• Contém uma transação principal de R$ 18.000-20.000</li>
            <li>• Transações menores são geradas automaticamente</li>
            <li>• Cada extrato tem um ID único no rodapé</li>
            <li>• Clique em "Gerar Extrato" para baixar o PDF</li>
          </ul>
        </div>
      </div>
    </div>
  );
}