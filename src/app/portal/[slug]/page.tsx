"use client";

import { useState, useEffect } from "react";

interface Stage {
  id: string;
  stage_name: string;
  stage_order: number;
  status: string;
  notes_client?: string;
}

interface Document {
  id: string;
  name: string;
  status: string;
  file_url?: string;
  file_name?: string;
  rejection_reason?: string;
}

interface Message {
  id: string;
  sender_type: "admin" | "client";
  sender_name: string;
  message: string;
  created_at: string;
}

interface ClientData {
  id: string;
  name: string;
  email: string;
  visa_type: string;
  status: string;
  workspace_slug: string;
}

export default function ClientPortalPage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<ClientData | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [progress, setProgress] = useState(0);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [activeTab, setActiveTab] = useState<"process" | "documents">("process");

  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  const fetchData = async () => {
    if (!slug) return;
    try {
      const response = await fetch(`/api/portal/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setClient(data.client);
        setStages((data.stages || []).sort((a: Stage, b: Stage) => a.stage_order - b.stage_order));
        setDocuments(data.documents || []);
        setMessages(data.messages || []);
        setProgress(data.progress || 0);
      }
    } catch (error) {
      console.error("Error loading portal:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [slug]);

  // Auto-scroll chat
  useEffect(() => {
    const chatContainer = document.getElementById("chat-messages");
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !client || sendingMessage) return;
    setSendingMessage(true);
    try {
      const stageId = stages[0]?.id;
      
      await fetch(`/api/portal/${slug}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: client.id,
          stage_id: stageId,
          sender_type: "client",
          sender_name: client.name,
          message: newMessage.trim(),
        }),
      });
      setNewMessage("");
      fetchData();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleFileUpload = async (docId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("client_id", client!.id);
    formData.append("document_id", docId);
    formData.append("name", documents.find((d) => d.id === docId)?.name || "Documento");

    try {
      await fetch("/api/documents", { method: "POST", body: formData });
      fetchData();
    } catch (error) {
      console.error("Error uploading:", error);
    }
  };

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
        <a href="mailto:contato@nomadway.com.br" className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/30">
          Fale conosco
        </a>
      </div>
    );
  }

  const completedStages = stages.filter((s) => s.status === "completed").length;
  const pendingDocs = documents.filter((d) => d.status === "pending" || d.status === "rejected").length;

  const getStageConfig = (status: string) => {
    const configs: Record<string, { icon: string; bg: string; text: string; label: string }> = {
      pending: { icon: "○", bg: "bg-gray-200", text: "text-gray-600", label: "Pendente" },
      in_progress: { icon: "🚀", bg: "bg-blue-500", text: "text-white", label: "Em Progresso" },
      awaiting_client: { icon: "⚠️", bg: "bg-amber-500", text: "text-white", label: "Aguardando Você" },
      completed: { icon: "✓", bg: "bg-green-500", text: "text-white", label: "Concluído" },
    };
    return configs[status] || configs.pending;
  };

  const getDocStatusConfig = (status: string) => {
    const configs: Record<string, { icon: string; bg: string; text: string; label: string }> = {
      pending: { icon: "⏳", bg: "bg-amber-50 border-amber-200", text: "text-amber-700", label: "Aguardando envio" },
      uploaded: { icon: "📤", bg: "bg-blue-50 border-blue-200", text: "text-blue-700", label: "Enviado" },
      approved: { icon: "✅", bg: "bg-green-50 border-green-200", text: "text-green-700", label: "Aprovado" },
      rejected: { icon: "❌", bg: "bg-red-50 border-red-200", text: "text-red-700", label: "Precisa reenviar" },
    };
    return configs[status] || configs.pending;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full opacity-20 blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold shadow-lg shadow-blue-500/30">
                N
              </div>
              <div>
                <span className="text-lg font-bold text-gray-900">NomadWay</span>
                <span className="hidden sm:inline text-gray-400 ml-2">Portal do Cliente</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-gray-900">{client.name}</div>
                <div className="text-xs text-gray-500">{client.visa_type}</div>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg">
                <span className="text-sm font-bold text-white">{client.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 relative space-y-6">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Olá, {client.name.split(" ")[0]}! 👋</h1>
            <p className="text-white/90">Seu processo de visto está em andamento.</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-white text-sm backdrop-blur-sm">
                <span>🇪🇸</span>
                <span>{client.visa_type}</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/30 rounded-full text-white text-sm">
                <span>📊</span>
                <span>{progress}% completo</span>
              </div>
              {pendingDocs > 0 && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/30 rounded-full text-white text-sm animate-pulse">
                  <span>⚠️</span>
                  <span>{pendingDocs} documento{pendingDocs > 1 ? "s" : ""} pendente{pendingDocs > 1 ? "s" : ""}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white/90 backdrop-blur rounded-2xl p-5 border border-white/50 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Progresso Geral</h3>
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{progress}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-sm text-gray-500 mt-2">{completedStages} de {stages.length} etapas concluídas</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button onClick={() => setActiveTab("process")} className={`px-5 py-3 rounded-xl font-medium transition-all ${activeTab === "process" ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30" : "bg-white/90 text-gray-600 hover:bg-white border border-gray-200"}`}>
            🎯 Meu Processo
          </button>
          <button onClick={() => setActiveTab("documents")} className={`px-5 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${activeTab === "documents" ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30" : "bg-white/90 text-gray-600 hover:bg-white border border-gray-200"}`}>
            📄 Documentos {pendingDocs > 0 && <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pendingDocs}</span>}
          </button>
        </div>

        {/* Process Tab */}
        {activeTab === "process" && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Stages Timeline */}
            <div className="bg-white/90 backdrop-blur rounded-2xl p-6 border border-white/50 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Etapas do Processo</h3>
              {stages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📋</div>
                  <p className="text-gray-400">Nenhuma etapa cadastrada</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stages.map((stage) => {
                    const config = getStageConfig(stage.status);
                    return (
                      <div key={stage.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${config.bg} ${config.text}`}>
                          {stage.status === "completed" ? "✓" : stage.stage_order}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-gray-900 truncate">{stage.stage_name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.text}`}>{config.label}</span>
                          </div>
                          {stage.notes_client && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{stage.notes_client}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Single Chat */}
            <div className="bg-white/90 backdrop-blur rounded-2xl border border-white/50 shadow-sm flex flex-col h-[500px]">
              <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <span>💬</span> Chat
                </h3>
                <p className="text-blue-100 text-sm">Tire suas dúvidas com nossa equipe</p>
              </div>
              <div id="chat-messages" className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-3">💬</div>
                    <p className="text-gray-400 font-medium">Nenhuma mensagem ainda</p>
                    <p className="text-gray-400 text-sm">Envie uma mensagem para começar</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender_type === "client" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl ${msg.sender_type === "client" ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-md" : "bg-gray-100 text-gray-900 rounded-bl-md"}`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        <p className={`text-xs mt-1 ${msg.sender_type === "client" ? "text-blue-100" : "text-gray-400"}`}>
                          {msg.sender_name} • {new Date(msg.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-4 border-t border-gray-100">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button onClick={handleSendMessage} disabled={!newMessage.trim() || sendingMessage} className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                    {sendingMessage ? "..." : "Enviar"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === "documents" && (
          <div className="space-y-4">
            {documents.length === 0 ? (
              <div className="bg-white/90 backdrop-blur rounded-2xl p-12 text-center border border-white/50 shadow-sm">
                <div className="text-5xl mb-4">📂</div>
                <p className="text-gray-400 font-medium">Nenhum documento solicitado ainda</p>
              </div>
            ) : (
              documents.map((doc) => {
                const config = getDocStatusConfig(doc.status);
                const needsUpload = doc.status === "pending" || doc.status === "rejected";

                return (
                  <div key={doc.id} className={`rounded-2xl p-5 border ${config.bg}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">{config.icon}</div>
                        <div>
                          <div className="font-semibold text-gray-900">{doc.name}</div>
                          <div className={`text-sm ${config.text}`}>{config.label}</div>
                          {doc.status === "rejected" && doc.rejection_reason && (
                            <div className="mt-2 text-sm text-red-700 bg-red-50 p-2 rounded-lg">⚠️ {doc.rejection_reason}</div>
                          )}
                          {doc.status === "approved" && doc.file_name && (
                            <a href={doc.file_url || "#"} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
                              📎 Ver arquivo enviado
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {needsUpload && (
                          <label className="cursor-pointer block">
                            <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileUpload(doc.id, file); }} />
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/30">
                              <span>📤</span>
                              <span>Enviar</span>
                            </span>
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Footer */}
        <div className="pt-6 text-center border-t border-gray-200">
          <p className="text-gray-500 mb-3">Dúvidas? Entre em contato</p>
          <a href="mailto:contato@nomadway.com.br" className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full hover:shadow-lg hover:shadow-blue-500/30 transition-all text-sm">
            <span>📧</span>
            <span>contato@nomadway.com.br</span>
          </a>
        </div>
      </main>
    </div>
  );
}