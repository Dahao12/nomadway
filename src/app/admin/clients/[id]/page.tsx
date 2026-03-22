"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import DocumentUpload from "@/components/DocumentUpload";

interface Document {
  id: string;
  name: string;
  type: string | null;
  status: string;
  file_url: string | null;
  file_name: string | null;
  created_at: string;
  rejection_reason?: string | null;
}

interface TimelineEvent {
  id: string;
  event_type: string;
  title: string;
  description: string | null;
  created_at: string;
  actor_name: string | null;
}

interface Client {
  id: string;
  client_code: string;
  full_name: string;
  name?: string;
  email: string;
  phone: string | null;
  visa_type: string;
  status: string;
  service_value: number | null;
  discount_percent: number | null;
  discount_value: number | null;
  workspace_slug: string;
  created_at: string;
  process_stages?: Array<{
    id: string;
    stage_type: string;
    stage_name: string;
    stage_order: number;
    status: string;
    progress_percent: number;
  }>;
}

// Client form data from ficha cadastral
interface ClientForm {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  nationality: string;
  birth_date: string;
  cpf: string;
  rg: string;
  passport_number: string;
  passport_expiry_date: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

// Client Status (simplified - synced with Kanban)
const STATUS_CONFIG: Record<string, { label: string; className: string; icon: string }> = {
  new: { label: "Novo", className: "bg-gray-100 text-gray-700", icon: "📥" },
  in_progress: { label: "Em Andamento", className: "bg-blue-100 text-blue-700", icon: "🔄" },
  approved: { label: "Aprovado", className: "bg-green-100 text-green-700", icon: "✅" },
  rejected: { label: "Rejeitado", className: "bg-red-100 text-red-700", icon: "❌" },
  paused: { label: "Pausado", className: "bg-orange-100 text-orange-700", icon: "⏸️" },
  cancelled: { label: "Cancelado", className: "bg-red-100 text-red-700", icon: "❌" },
};

// Process Stages (12 stages - synced with client portal)
const PROCESS_STAGES = [
  { key: 'onboarding', name: 'Onboarding', icon: '👋' },
  { key: 'profile', name: 'Análise de Perfil', icon: '🔍' },
  { key: 'strategy', name: 'Planejamento Estratégico', icon: '📋' },
  { key: 'documentation', name: 'Documentação', icon: '📄' },
  { key: 'translations', name: 'Traduções', icon: '🌐' },
  { key: 'apostille', name: 'Apostilamento', icon: '📜' },
  { key: 'review', name: 'Revisão Jurídica', icon: '⚖️' },
  { key: 'relocation', name: 'Mudança para Espanha', icon: '✈️' },
  { key: 'application', name: 'Aplicação do Visto', icon: '📝' },
  { key: 'follow_up', name: 'Acompanhamento', icon: '👁️' },
  { key: 'approval', name: 'Aprovação', icon: '✅' },
  { key: 'post_approval', name: 'Pós-Aprovação', icon: '🎉' },
];

const DOC_STATUS_CONFIG: Record<string, { label: string; icon: string; className: string }> = {
  pending: { label: "Pendente", icon: "⏳", className: "bg-yellow-50 border-yellow-200 text-yellow-800" },
  uploaded: { label: "Enviado", icon: "📤", className: "bg-blue-50 border-blue-200 text-blue-800" },
  approved: { label: "Aprovado", icon: "✅", className: "bg-green-50 border-green-200 text-green-800" },
  rejected: { label: "Rejeitado", icon: "❌", className: "bg-red-50 border-red-200 text-red-800" },
};

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [form, setForm] = useState<ClientForm | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [stages, setStages] = useState<Array<{ id: string; stage_type: string; stage_name: string; stage_order: number; status: string; progress_percent: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info");
  const [addDocOpen, setAddDocOpen] = useState(false);
  const [newDocName, setNewDocName] = useState("");
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ name: "", email: "", phone: "", visa_type: "" });
  const [clientNotes, setClientNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clientRes, docsRes, timelineRes] = await Promise.all([
        fetch(`/api/clients/${clientId}`),
        fetch(`/api/documents?client_id=${clientId}`),
        fetch(`/api/timeline?client_id=${clientId}`),
      ]);

      if (clientRes.ok) {
        const data = await clientRes.json();
        setClient(data.client);
        setForm(data.form || null); // Load form data for contract generation
        setStages(data.stages || []);
        setEditData({
          name: data.client.full_name || data.client.name || "",
          email: data.client.email || "",
          phone: data.client.phone || "",
          visa_type: data.client.visa_type || "",
        });
        setClientNotes(data.client.notes || "");
      }
      if (docsRes.ok) {
        const data = await docsRes.json();
        setDocuments(data.documents || []);
      }
      if (timelineRes.ok) {
        const data = await timelineRes.json();
        setTimeline(data.events || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) fetchData();
  }, [clientId]);

  const handleAddDocument = async () => {
    if (!newDocName.trim()) return;

    try {
      await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          name: newDocName.trim(),
          type: "document",
        }),
      });
      setNewDocName("");
      setAddDocOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error adding document:", error);
    }
  };

  const handleApproveDocument = async (documentId: string) => {
    try {
      await fetch("/api/documents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document_id: documentId,
          status: "approved",
        }),
      });
      fetchData();
    } catch (error) {
      console.error("Error approving document:", error);
    }
  };

  const handleOpenRejectModal = (documentId: string) => {
    setSelectedDocId(documentId);
    setRejectionReason("");
    setRejectModalOpen(true);
  };

  const handleRejectDocument = async () => {
    if (!selectedDocId || !rejectionReason.trim()) return;

    try {
      await fetch("/api/documents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document_id: selectedDocId,
          status: "rejected",
          rejection_reason: rejectionReason.trim(),
        }),
      });
      setRejectModalOpen(false);
      setSelectedDocId(null);
      setRejectionReason("");
      fetchData();
    } catch (error) {
      console.error("Error rejecting document:", error);
    }
  };

  const handleUpdateClient = async () => {
    try {
      await fetch(`/api/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      setEditMode(false);
      fetchData();
    } catch (error) {
      console.error("Error updating client:", error);
    }
  };

  const handleSaveNotes = async () => {
    if (!clientNotes.trim()) return;
    setSavingNotes(true);
    try {
      await fetch(`/api/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: clientNotes }),
      });
      setSavingNotes(false);
      fetchData();
    } catch (error) {
      console.error("Error saving notes:", error);
      setSavingNotes(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!confirm(`Tem certeza que deseja excluir o cliente "${client?.full_name || client?.name}"?`)) return;

    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/admin/clients");
      }
    } catch (error) {
      console.error("Error deleting client:", error);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      await fetch("/api/clients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId, status: newStatus }),
      });
      fetchData();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Update individual process stage
  const handleUpdateStage = async (stageId: string, newStatus: string) => {
    try {
      await fetch(`/api/stages/${stageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchData();
    } catch (error) {
      console.error("Error updating stage:", error);
    }
  };

  // Stage status config
  const STAGE_STATUS_CONFIG: Record<string, { label: string; className: string; icon: string }> = {
    pending: { label: "Pendente", className: "bg-gray-100 text-gray-700", icon: "⏳" },
    in_progress: { label: "Em Andamento", className: "bg-blue-100 text-blue-700", icon: "🔄" },
    completed: { label: "Concluído", className: "bg-green-100 text-green-700", icon: "✅" },
  };

  // Calculate progress
  const completedStages = stages.filter(s => s.status === "completed").length;
  const progress = stages.length > 0 ? Math.round((completedStages / stages.length) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <div className="text-gray-500">Carregando...</div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-5xl mb-4">🔍</div>
        <div className="text-xl font-semibold text-gray-900 mb-2">Cliente não encontrado</div>
        <Link href="/admin/kanban" className="text-blue-600 hover:underline">
          Voltar para pipeline
        </Link>
      </div>
    );
  }

  const displayName = client.full_name || client.name || "Sem nome";
  const statusConfig = STATUS_CONFIG[client.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.new;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/kanban" className="text-gray-500 hover:text-gray-700">
              ← Pipeline
            </Link>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
              {displayName.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span>{client.client_code}</span>
                <span>•</span>
                <span>{client.visa_type}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={handleDeleteClient} className="text-red-600 hover:text-red-700 hover:bg-red-50">
              Excluir
            </Button>
            <Button variant="outline" onClick={() => setEditMode(!editMode)}>
              {editMode ? "Cancelar" : "Editar"}
            </Button>
            <Button asChild className="bg-gradient-to-r from-blue-500 to-blue-600">
              <Link href={`/portal/${client.workspace_slug}`} target="_blank">
                Ver Portal
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-4 gap-4">
          <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-4">
              <div className="text-sm text-gray-500 mb-1">Status</div>
              <div className="flex items-center gap-2">
                <Badge className={statusConfig.className}>{statusConfig.icon} {statusConfig.label}</Badge>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-white">
            <CardContent className="p-4">
              <div className="text-sm text-gray-500 mb-1">Progresso</div>
              <div className="flex items-end gap-2">
                <div className="text-2xl font-bold text-green-600">{progress}%</div>
                <Progress value={progress} className="flex-1 h-2" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md bg-gradient-to-br from-amber-50 to-white">
            <CardContent className="p-4">
              <div className="text-sm text-gray-500 mb-1">Documentos</div>
              <div className="text-2xl font-bold text-amber-600">
                {documents.filter(d => d.status === "approved").length}/{documents.length}
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="p-4">
              <div className="text-sm text-gray-500 mb-1">Valor</div>
              {client.discount_percent || client.discount_value ? (
                <div>
                  <div className="text-sm text-gray-400 line-through">
                    €{(client.service_value || 1499.90).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-purple-600">
                      €{(() => {
                        const original = client.service_value || 1499.90;
                        const discount = client.discount_percent
                          ? original * (client.discount_percent / 100)
                          : (client.discount_value || 0);
                        return (original - discount).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
                      })()}
                    </span>
                    <span className="text-xs text-red-500 font-medium">
                      -{client.discount_percent ? `${client.discount_percent}%` : `€${(client.discount_value || 0).toFixed(0)}`}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-2xl font-bold text-purple-600">
                  €{(client.service_value || 1499.90).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Status Update */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-500 mr-2">Mudar status:</span>
              {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                <button
                  key={status}
                  onClick={() => handleUpdateStatus(status)}
                  className={`px-3 py-1 text-xs rounded-full transition-all ${
                    client.status === status
                      ? `${config.className} ring-2 ring-offset-1`
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {config.icon} {config.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Process Stages - 12 Etapas */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-xl">📊</span> Etapas do Processo
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="font-medium text-blue-600">{completedStages}/{stages.length || 12}</span>
                <span>concluídas</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {PROCESS_STAGES.map((stage, index) => {
              const stageData = stages.find(s => s.stage_name === stage.name || s.stage_type === stage.key);
              const stageStatus = stageData?.status || "pending";
              const statusConfig = STAGE_STATUS_CONFIG[stageStatus as keyof typeof STAGE_STATUS_CONFIG] || STAGE_STATUS_CONFIG.pending;
              
              return (
                <div 
                  key={stage.key}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-sm shadow-sm">
                      {index + 1}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{stage.icon}</span>
                      <span className="font-medium text-gray-800">{stage.name}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {stageData ? (
                      Object.entries(STAGE_STATUS_CONFIG).map(([status, config]) => (
                        <button
                          key={status}
                          onClick={() => handleUpdateStage(stageData.id, status)}
                          className={`px-2 py-1 text-xs rounded-full transition-all ${
                            stageStatus === status
                              ? `${config.className} ring-2 ring-offset-1 font-medium`
                              : "bg-white text-gray-400 hover:bg-gray-200"
                          }`}
                          title={config.label}
                        >
                          {config.icon}
                        </button>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">Não iniciado</span>
                    )}
                  </div>
                </div>
              );
            })}
            
            {stages.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📋</div>
                <p>Nenhuma etapa iniciada</p>
                <p className="text-sm">As etapas serão criadas automaticamente</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Anotações dos Operadores */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-xl">📝</span> Anotações do Caso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <textarea
                value={clientNotes}
                onChange={(e) => setClientNotes(e.target.value)}
                placeholder="Adicione anotações sobre este caso. Ex: Cliente tem passaporte vencendo em 6 meses, aguardando documento X..."
                className="w-full h-32 p-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {savingNotes ? "Salvando..." : "Salvar Anotações"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            {[
              { id: "info", label: "📋 Informações" },
              { id: "documents", label: "📄 Documentos" },
              { id: "timeline", label: "📜 Timeline" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-medium transition-all ${
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Info Tab */}
          {activeTab === "info" && (
            <div className="p-6 space-y-4">
              {editMode ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                    <Input
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <Input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                    <Input
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Visto</label>
                    <Input
                      value={editData.visa_type}
                      onChange={(e) => setEditData({ ...editData, visa_type: e.target.value })}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Button onClick={handleUpdateClient} className="bg-gradient-to-r from-blue-500 to-blue-600">
                      Salvar Alterações
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-500">Nome completo</div>
                      <div className="font-medium text-gray-900">{displayName}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Email</div>
                      <div className="font-medium text-gray-900">{client.email || "—"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Telefone</div>
                      <div className="font-medium text-gray-900">{client.phone || "—"}</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-500">Tipo de Visto</div>
                      <div className="font-medium text-gray-900">{client.visa_type}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Código</div>
                      <div className="font-medium text-gray-900">{client.client_code}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Data de Cadastro</div>
                      <div className="font-medium text-gray-900">
                        {new Date(client.created_at).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === "documents" && (
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Documentos ({documents.length})</h3>
                <Button onClick={() => setAddDocOpen(true)} className="bg-gradient-to-r from-blue-500 to-blue-600">
                  + Adicionar
                </Button>
              </div>

              {addDocOpen && (
                <Card className="border-2 border-blue-200 bg-blue-50/50">
                  <CardContent className="p-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Nome do documento"
                        value={newDocName}
                        onChange={(e) => setNewDocName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddDocument()}
                        className="flex-1"
                      />
                      <Button onClick={handleAddDocument} className="bg-gradient-to-r from-blue-500 to-blue-600">
                        Adicionar
                      </Button>
                      <Button variant="outline" onClick={() => setAddDocOpen(false)}>Cancelar</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-3">
                {documents.length === 0 ? (
                  <Card className="border-0 shadow-md">
                    <CardContent className="py-12 text-center text-gray-500">
                      Nenhum documento. Clique em "Adicionar" para solicitar.
                    </CardContent>
                  </Card>
                ) : (
                  documents.map((doc) => {
                    const docStatus = DOC_STATUS_CONFIG[doc.status as keyof typeof DOC_STATUS_CONFIG] || DOC_STATUS_CONFIG.pending;
                    return (
                      <Card key={doc.id} className="border-0 shadow-md">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="text-2xl">{docStatus.icon}</div>
                              <div>
                                <div className="font-semibold text-gray-900">{doc.name}</div>
                                <div className="text-sm text-gray-500">
                                  {doc.file_name || "Nenhum arquivo"} • {new Date(doc.created_at).toLocaleDateString("pt-BR")}
                                </div>
                                {doc.status === "rejected" && doc.rejection_reason && (
                                  <div className="text-sm text-red-600 mt-1 bg-red-50 px-2 py-1 rounded">
                                    <strong>Motivo:</strong> {doc.rejection_reason}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <DocumentUpload
                                clientId={clientId}
                                documentId={doc.id}
                                documentName={doc.name}
                                currentFileUrl={doc.file_url || undefined}
                                currentFileName={doc.file_name || undefined}
                                status={doc.status}
                                onUploadComplete={fetchData}
                              />
                              {doc.status === "uploaded" && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleApproveDocument(doc.id)}
                                    className="bg-green-500 hover:bg-green-600 text-white"
                                  >
                                    ✓ Aprovar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleOpenRejectModal(doc.id)}
                                  >
                                    ✗ Rejeitar
                                  </Button>
                                </>
                              )}
                              <Badge className={docStatus.className}>{docStatus.label}</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === "timeline" && (
            <div className="p-6">
              {timeline.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  Nenhum evento registrado ainda.
                </div>
              ) : (
                <div className="space-y-4">
                  {timeline.map((event) => (
                    <div key={event.id} className="flex gap-4 items-start">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{event.title}</div>
                        {event.description && (
                          <div className="text-sm text-gray-600">{event.description}</div>
                        )}
                        <div className="text-sm text-gray-500">
                          {event.actor_name} • {new Date(event.created_at).toLocaleString("pt-BR")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Links */}
        <div className="flex flex-wrap gap-2 justify-center">
          <Button
            variant="outline"
            onClick={() => {
              const link = `${window.location.origin}/form/${client.client_code}`;
              navigator.clipboard.writeText(link);
              alert(`Link copiado!\n\n${link}`);
            }}
          >
            📋 Copiar Link da Ficha
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const link = `${window.location.origin}/portal/${client.workspace_slug}`;
              navigator.clipboard.writeText(link);
              alert(`Link copiado!\n\n${link}`);
            }}
          >
            🔗 Copiar Link do Portal
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              // Build contract data with all available fields
              const contractData: Record<string, string | number | null> = {
                // Dados pessoais (do formulário ou do cliente)
                client_name: form?.full_name || displayName,
                client_email: form?.email || client.email || '',
                client_phone: form?.phone || client.phone || '',
                client_nationality: form?.nationality || 'Brasileira',
                client_birth_date: form?.birth_date || '',
                client_cpf: form?.cpf || '',
                client_rg: form?.rg || '',
                
                // Passaporte
                client_passport: form?.passport_number || '',
                client_passport_expiry: form?.passport_expiry_date || '',
                
                // Endereço completo
                client_address: form?.address || '',
                client_city: form?.city || '',
                client_state: form?.state || '',
                client_country: form?.country || 'Brasil',
                client_cep: form?.postal_code || '',
                
                // Serviço
                visa_type: client.visa_type || "Visto de Nômade Digital",
                service_value: client.service_value?.toString() || "1499.90",
                discount_percent: client.discount_percent?.toString() || null,
                discount_value: client.discount_value?.toString() || null,
              };
              
              // Debug no console
              console.log('📄 Gerando contrato para:', client.full_name || client.name);
              console.log('📄 Tipo de visto:', client.visa_type);
              console.log('📄 Dados do contrato:', contractData);
              
              // Adicionar versão para quebrar cache
              const version = Date.now();
              window.open(`/api/admin/contracts/pdf?data=${encodeURIComponent(JSON.stringify(contractData))}&v=${version}`, "_blank");
            }}
          >
            📄 Gerar Contrato
          </Button>
        </div>
      </div>

      {/* Modal de Rejeição */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-0 shadow-xl">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rejeitar Documento</h3>
              <p className="text-sm text-gray-600 mb-4">
                Informe o motivo da rejeição. O cliente verá esta mensagem.
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Ex: Documento ilegível, página faltando, formato incorreto..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setRejectModalOpen(false);
                    setSelectedDocId(null);
                    setRejectionReason("");
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleRejectDocument}
                  disabled={!rejectionReason.trim()}
                  className="flex-1"
                >
                  Rejeitar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}