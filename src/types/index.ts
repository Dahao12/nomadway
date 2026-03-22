// NomadWay Portal Types

// Client Status
export type ClientStatus = 'active' | 'paused' | 'completed' | 'cancelled';

// Stage Status
export type StageStatus = 'pending' | 'in_progress' | 'awaiting_client' | 'in_review' | 'blocked' | 'completed';

// Document Status
export type DocumentStatus = 'pending' | 'uploaded' | 'approved' | 'rejected';

// Payment Status
export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'refunded';

// Actor Type
export type ActorType = 'client' | 'admin';

// Client
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  country_origin: string;
  visa_type: string;
  status: ClientStatus;
  assigned_to: string | null;
  workspace_slug: string;
  avatar_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Process Stage
export interface ProcessStage {
  id: string;
  client_id: string;
  stage_type: StageType;
  stage_name: string;
  stage_order: number;
  status: StageStatus;
  progress_percent: number;
  notes_internal: string | null;
  notes_client: string | null;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Stage Types
export type StageType =
  | 'onboarding'
  | 'profile'
  | 'strategy'
  | 'documentation'
  | 'translations'
  | 'apostille'
  | 'review'
  | 'application'
  | 'follow_up'
  | 'approval'
  | 'post_approval'
  | 'relocation';

// Default Stages Configuration
export const DEFAULT_STAGES: { type: StageType; name: string; order: number }[] = [
  { type: 'onboarding', name: 'Onboarding', order: 1 },
  { type: 'profile', name: 'Análise de Perfil', order: 2 },
  { type: 'strategy', name: 'Planejamento Estratégico', order: 3 },
  { type: 'documentation', name: 'Documentação', order: 4 },
  { type: 'translations', name: 'Traduções', order: 5 },
  { type: 'apostille', name: 'Apostilamento', order: 6 },
  { type: 'review', name: 'Revisão Jurídica', order: 7 },
  { type: 'relocation', name: 'Mudança para Espanha', order: 8 },
  { type: 'application', name: 'Aplicação do Visto', order: 9 },
  { type: 'follow_up', name: 'Acompanhamento', order: 10 },
  { type: 'approval', name: 'Aprovação', order: 11 },
  { type: 'post_approval', name: 'Pós-Aprovação', order: 12 },
];

// Stage Status Labels
export const STAGE_STATUS_LABELS: Record<StageStatus, string> = {
  pending: 'Pendente',
  in_progress: 'Em Andamento',
  awaiting_client: 'Aguardando Cliente',
  in_review: 'Em Revisão',
  blocked: 'Bloqueado',
  completed: 'Concluído',
};

// Document
export interface Document {
  id: string;
  client_id: string;
  stage_id: string | null;
  name: string;
  type: string | null;
  status: DocumentStatus;
  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
  uploaded_by: ActorType | null;
  uploaded_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  rejection_reason: string | null;
  created_at: string;
}

// Timeline Event
export interface TimelineEvent {
  id: string;
  client_id: string;
  stage_id: string | null;
  event_type: EventType;
  title: string;
  description: string | null;
  actor_name: string;
  actor_type: ActorType;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export type EventType =
  | 'stage_started'
  | 'stage_completed'
  | 'document_uploaded'
  | 'document_approved'
  | 'document_rejected'
  | 'status_changed'
  | 'message_sent'
  | 'note_added';

// Stage Message
export interface StageMessage {
  id: string;
  client_id: string;
  stage_id: string;
  sender_type: ActorType;
  sender_id: string | null;
  sender_name: string;
  message: string;
  read_at: string | null;
  created_at: string;
}

// Payment
export interface Payment {
  id: string;
  client_id: string;
  amount_cents: number;
  currency: string;
  status: PaymentStatus;
  description: string | null;
  due_date: string | null;
  paid_at: string | null;
  payment_method: string | null;
  invoice_url: string | null;
  created_at: string;
}

// Dashboard Stats
export interface DashboardStats {
  total_clients: number;
  active_clients: number;
  pending_documents: number;
  delayed_stages: number;
  revenue_this_month: number;
  clients_by_stage: Record<StageType, number>;
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Auth User
export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'client';
  name: string;
  client_id?: string;
}