'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface Stage {
  id: string;
  stage_name: string;
  stage_order: number;
  stage_key: string;
  status: string;
  progress_percent: number;
  notes_client: string | null;
}

interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  status: string;
  file_url: string | null;
  file_name: string | null;
  rejection_reason: string | null;
  uploaded_at: string | null;
}

interface Message {
  id: string;
  sender_type: string;
  sender_name: string;
  message: string;
  created_at: string;
}

interface ClientData {
  id: string;
  client_code: string;
  full_name: string;
  email: string;
  visa_type: string;
  status: string;
  workspace_slug: string;
}

const STAGE_CONFIG: Record<string, { icon: string; color: string }> = {
  documentation: { icon: '📄', color: 'blue' },
  analysis: { icon: '🔍', color: 'purple' },
  preparation: { icon: '📝', color: 'amber' },
  submission: { icon: '📤', color: 'orange' },
  tracking: { icon: '👁️', color: 'cyan' },
  approval: { icon: '✅', color: 'green' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Aguardando', color: 'text-gray-600', bg: 'bg-gray-100' },
  in_progress: { label: 'Em andamento', color: 'text-blue-600', bg: 'bg-blue-50' },
  completed: { label: 'Concluído', color: 'text-green-600', bg: 'bg-green-50' },
  blocked: { label: 'Bloqueado', color: 'text-red-600', bg: 'bg-red-50' },
};

const DOCUMENT_TYPES = [
  { id: 'passport', name: 'Passaporte', category: 'personal' },
  { id: 'cpf', name: 'CPF', category: 'personal' },
  { id: 'rg', name: 'RG', category: 'personal' },
  { id: 'proof_income', name: 'Comprovante de Renda', category: 'financial' },
  { id: 'bank_statement', name: 'Extrato Bancário (últimos 3 meses)', category: 'financial' },
  { id: 'employment_letter', name: 'Carta da Empresa', category: 'professional' },
  { id: 'health_insurance', name: 'Seguro Saúde', category: 'other' },
];

export default function ClientPortalPage() {
  const params = useParams();
  const slug = params?.slug as string;
  
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<ClientData | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'process' | 'documents' | 'chat'>('process');

  useEffect(() => {
    if (slug) fetchData();
  }, [slug]);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/portal/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setClient(data.client);
        setStages((data.stages || []).sort((a: Stage, b: Stage) => a.stage_order - b.stage_order));
        setDocuments(data.documents || []);
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error loading portal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !client || sendingMessage) return;
    setSendingMessage(true);
    
    try {
      await fetch(`/api/portal/${slug}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: client.id,
          sender_type: 'client',
          sender_name: client.full_name,
          message: newMessage.trim()
        })
      });
      setNewMessage('');
      fetchData();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleFileUpload = async (docId: string, file: File) => {
    setUploadingDoc(docId);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('client_id', client!.id);
    formData.append('document_id', docId);

    try {
      await fetch('/api/documents', { method: 'POST', body: formData });
      fetchData();
    } catch (error) {
      console.error('Error uploading:', error);
    } finally {
      setUploadingDoc(null);
    }
  };

  // Calculate progress
  const totalProgress = stages.length > 0 
    ? Math.round(stages.filter(s => s.status === 'completed').length / stages.length * 100)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Carregando seu portal...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col items-center justify-center gap-6 p-4">
        <div className="text-8xl">🔍</div>
        <div className="text-2xl font-bold text-gray-900">Portal não encontrado</div>
        <p className="text-gray-500 text-center max-w-md">Verifique se o link está correto ou entre em contato conosco</p>
        <a href="https://wa.me/5535999810000" className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/30">
          Fale conosco
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <div>
                <h1 className="font-bold text-gray-900">NomadWay</h1>
                <p className="text-xs text-gray-500">Portal do Cliente</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">{client.full_name}</p>
              <p className="text-xs text-gray-500">{client.client_code}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Overview */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Progresso do Processo</h2>
            <span className="text-2xl font-bold text-blue-600">{totalProgress}%</span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
          
          {/* Stages */}
          <div className="grid grid-cols-6 gap-2 mt-6">
            {stages.map((stage, index) => {
              const config = STAGE_CONFIG[stage.stage_key] || { icon: '📋', color: 'gray' };
              const statusConfig = STATUS_CONFIG[stage.status] || STATUS_CONFIG.pending;
              const isActive = stage.status === 'in_progress';
              const isCompleted = stage.status === 'completed';
              
              return (
                <div key={stage.id} className="text-center">
                  <div className={`w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center text-xl ${
                    isCompleted ? 'bg-green-100 text-green-600' :
                    isActive ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-300' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {config.icon}
                  </div>
                  <p className={`text-xs font-medium ${
                    isCompleted ? 'text-green-600' :
                    isActive ? 'text-blue-600' :
                    'text-gray-400'
                  }`}>
                    {stage.stage_name}
                  </p>
                  {stage.notes_client && (
                    <p className="text-xs text-gray-500 mt-1">{stage.notes_client}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex gap-1 p-1 mt-6 bg-gray-100 rounded-xl">
          <button
            onClick={() => setActiveTab('process')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'process' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
            }`}
          >
            📋 Processo
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'documents' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
            }`}
          >
            📄 Documentos
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'chat' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
            }`}
          >
            💬 Chat
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Process Tab */}
        {activeTab === 'process' && (
          <div className="space-y-4">
            {stages.map((stage, index) => {
              const config = STAGE_CONFIG[stage.stage_key] || { icon: '📋', color: 'gray' };
              const statusConfig = STATUS_CONFIG[stage.status] || STATUS_CONFIG.pending;
              
              return (
                <div key={stage.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                      statusConfig.bg
                    }`}>
                      {config.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{stage.stage_name}</h3>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusConfig.bg} ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                      {stage.notes_client && (
                        <p className="text-sm text-gray-600">{stage.notes_client}</p>
                      )}
                      {stage.progress_percent > 0 && stage.progress_percent < 100 && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Progresso</span>
                            <span>{stage.progress_percent}%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${stage.progress_percent}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="grid gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-700">
                📋 Envie os documentos necessários para prosseguir com seu processo.
                Aceitamos PDF, JPG e PNG (máx. 10MB).
              </p>
            </div>
            
            {DOCUMENT_TYPES.map((docType) => {
              const existingDoc = documents.find(d => d.type === docType.id);
              const isUploading = uploadingDoc === docType.id;
              
              return (
                <div key={docType.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        existingDoc?.status === 'approved' ? 'bg-green-100' :
                        existingDoc?.status === 'rejected' ? 'bg-red-100' :
                        existingDoc?.status === 'uploaded' ? 'bg-amber-100' :
                        'bg-gray-100'
                      }`}>
                        {existingDoc?.status === 'approved' ? '✅' :
                         existingDoc?.status === 'rejected' ? '❌' :
                         existingDoc?.status === 'uploaded' ? '⏳' : '📄'}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{docType.name}</h4>
                        <p className="text-xs text-gray-500">
                          {existingDoc?.status === 'approved' ? 'Aprovado' :
                           existingDoc?.status === 'rejected' ? existingDoc.rejection_reason || 'Rejeitado' :
                           existingDoc?.status === 'uploaded' ? 'Em análise' :
                           'Aguardando envio'}
                        </p>
                      </div>
                    </div>
                    
                    {!existingDoc || existingDoc.status === 'rejected' ? (
                      <label className={`px-4 py-2 rounded-xl font-medium cursor-pointer transition-colors ${
                        isUploading 
                          ? 'bg-gray-100 text-gray-400' 
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}>
                        {isUploading ? 'Enviando...' : 'Enviar'}
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(docType.id, file);
                          }}
                          disabled={isUploading}
                        />
                      </label>
                    ) : existingDoc.status === 'uploaded' ? (
                      <span className="text-sm text-amber-600">⏳ Em análise</span>
                    ) : (
                      <span className="text-sm text-green-600">✅ Aprovado</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-96 overflow-y-auto p-4 space-y-3" id="chat-messages">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <p>Nenhuma mensagem ainda. Comece a conversa!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_type === 'client' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                      msg.sender_type === 'client'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-xs opacity-70 mb-1">{msg.sender_name}</p>
                      <p className="text-sm">{msg.message}</p>
                      <p className="text-xs opacity-50 mt-1">
                        {new Date(msg.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="border-t p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendingMessage}
                  className="px-6 py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingMessage ? '...' : 'Enviar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 py-8 mt-8 border-t">
        <div className="text-center text-sm text-gray-500">
          <p>Precisa de ajuda? Entre em contato:</p>
          <a href="https://wa.me/5535999810000" className="text-blue-600 hover:underline">
            💬 WhatsApp: +55 35 99981-0000
          </a>
          <p className="mt-2">📧 contato@nomadway.com.br</p>
        </div>
      </footer>
    </div>
  );
}