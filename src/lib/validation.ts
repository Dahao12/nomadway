/**
 * Zod validation schemas for NomadWay API endpoints
 * Centralized validation to ensure data integrity
 */

import { z } from 'zod';

// ============================================
// Client Schemas
// ============================================

export const clientCreateSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(200, 'Nome muito longo'),
  email: z.string()
    .email('Email inválido')
    .max(255, 'Email muito longo'),
  phone: z.string()
    .transform(val => {
      // Remove tudo que não é dígito
      const cleaned = (val || '').replace(/\D/g, '');
      // Se começar com código do Brasil (55), manter
      // Se não, assume que é telefone brasileiro sem código
      if (cleaned.length === 0) return '';
      if (cleaned.startsWith('55') && cleaned.length <= 13) return '+' + cleaned;
      if (cleaned.length === 11) return '+55' + cleaned; // Celular sem código
      if (cleaned.length === 10) return '+55' + cleaned; // Fixo sem código
      if (cleaned.length > 11) return '+' + cleaned; // Já tem código
      return '+55' + cleaned; // Default para Brasil
    })
    .refine(val => {
      if (!val || val === '') return true; // Phone is optional
      // Validar formato internacional: +[country][number]
      return /^\+\d{10,15}$/.test(val);
    }, 'Telefone inválido. Use formato internacional (+XX...) ou brasileiro (11 99999-9999)')
    .optional()
    .or(z.literal('')),
  visa_type: z.string()
    .max(100)
    .default('Digital Nomad Visa'),
  notes: z.string()
    .max(5000, 'Notas muito longas')
    .optional()
    .or(z.literal('')),
});

export const clientUpdateSchema = z.object({
  client_id: z.string().uuid('ID inválido'),
  name: z.string().min(2).max(200).optional(),
  email: z.string().email().max(255).optional(),
  phone: z.string()
    .transform(val => {
      if (!val) return '';
      const cleaned = val.replace(/\D/g, '');
      if (cleaned.length === 0) return '';
      if (cleaned.startsWith('55') && cleaned.length <= 13) return '+' + cleaned;
      if (cleaned.length === 11) return '+55' + cleaned;
      if (cleaned.length === 10) return '+55' + cleaned;
      if (cleaned.length > 11) return '+' + cleaned;
      return '+55' + cleaned;
    })
    .refine(val => {
      if (!val || val === '') return true;
      return /^\+\d{10,15}$/.test(val);
    }, 'Telefone inválido. Use formato internacional (+XX...) ou brasileiro (11 99999-9999)')
    .optional(),
  visa_type: z.string().max(100).optional(),
  status: z.enum(['new', 'active', 'in_progress', 'completed', 'cancelled', 'documentation', 'analysis', 'submission', 'tracking', 'approved', 'paused']).optional(),
  notes: z.string().max(5000).optional().or(z.literal('')),
});

export type ClientCreate = z.infer<typeof clientCreateSchema>;
export type ClientUpdate = z.infer<typeof clientUpdateSchema>;

// ============================================
// Booking Schemas
// ============================================

export const bookingCreateSchema = z.object({
  customer_name: z.string()
    .min(2, 'Nome é obrigatório')
    .max(200, 'Nome muito longo'),
  customer_email: z.string()
    .email('Email inválido')
    .max(255, 'Email muito longo'),
  customer_phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Telefone inválido')
    .optional()
    .or(z.literal('')),
  service_name: z.string()
    .max(100)
    .default('Digital Nomad Visa'),
  service_price: z.number()
    .positive('Preço deve ser positivo')
    .max(100000, 'Preço muito alto')
    .default(1499.90),
  booking_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (use YYYY-MM-DD)')
    .optional(),
  booking_time: z.string()
    .regex(/^\d{2}:\d{2}$/, 'Horário inválido (use HH:MM)')
    .optional(),
  notes: z.string()
    .max(2000, 'Notas muito longas')
    .optional()
    .or(z.literal('')),
  source: z.string()
    .max(50)
    .default('website'),
});

export const bookingUpdateSchema = z.object({
  booking_id: z.string().min(1, 'ID é obrigatório'),
  status: z.enum(['pending', 'confirmed', 'form_sent', 'completed', 'cancelled']),
  send_whatsapp: z.boolean().optional(),
  notes: z.string().max(2000).optional().or(z.literal('')),
});

export type BookingCreate = z.infer<typeof bookingCreateSchema>;
export type BookingUpdate = z.infer<typeof bookingUpdateSchema>;

// ============================================
// Form Schemas
// ============================================

export const formSubmitSchema = z.object({
  full_name: z.string()
    .min(2, 'Nome completo é obrigatório')
    .max(200),
  email: z.string()
    .email('Email inválido')
    .max(255),
  phone: z.string()
    .transform(val => {
      if (!val) return '';
      const cleaned = val.replace(/\D/g, '');
      if (cleaned.length === 0) return '';
      if (cleaned.startsWith('55') && cleaned.length <= 13) return '+' + cleaned;
      if (cleaned.length === 11) return '+55' + cleaned;
      if (cleaned.length === 10) return '+55' + cleaned;
      if (cleaned.length > 11) return '+' + cleaned;
      return '+55' + cleaned;
    })
    .refine(val => {
      if (!val || val === '') return true;
      return /^\+\d{10,15}$/.test(val);
    }, 'Telefone inválido. Use formato internacional (+XX...) ou brasileiro (11 99999-9999)')
    .optional()
    .or(z.literal('')),
  visa_type: z.string().max(100).optional(),
  nationality: z.string().max(100).optional().or(z.literal('')),
  birth_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .or(z.literal('')),
  passport_number: z.string().max(50).optional().or(z.literal('')),
  passport_expiry: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .or(z.literal('')),
  current_country: z.string().max(100).optional().or(z.literal('')),
  current_city: z.string().max(100).optional().or(z.literal('')),
  profession: z.string().max(200).optional().or(z.literal('')),
  company: z.string().max(200).optional().or(z.literal('')),
  monthly_income: z.number().positive().optional(),
  remote_work: z.boolean().optional(),
  intended_arrival: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .or(z.literal('')),
  notes: z.string().max(5000).optional().or(z.literal('')),
});

export type FormSubmit = z.infer<typeof formSubmitSchema>;

// ============================================
// Auth Schemas
// ============================================

export const loginSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .max(255),
  password: z.string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(100, 'Senha muito longa'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ============================================
// Document Schemas
// ============================================

export const documentCreateSchema = z.object({
  client_id: z.string().uuid('ID do cliente inválido'),
  name: z.string()
    .min(2, 'Nome do documento é obrigatório')
    .max(200, 'Nome muito longo'),
  type: z.enum(['document', 'certificate', 'contract', 'other']).default('document'),
  required: z.boolean().default(true),
});

export const documentUpdateSchema = z.object({
  document_id: z.string().uuid('ID inválido'),
  status: z.enum(['pending', 'uploaded', 'approved', 'rejected']).optional(),
  rejection_reason: z.string().max(500).optional(),
});

export type DocumentCreate = z.infer<typeof documentCreateSchema>;
export type DocumentUpdate = z.infer<typeof documentUpdateSchema>;

// ============================================
// Stage Schemas
// ============================================

export const stageCreateSchema = z.object({
  client_id: z.string().uuid('ID do cliente inválido'),
  stage_name: z.string()
    .min(2, 'Nome da etapa é obrigatório')
    .max(100, 'Nome muito longo'),
  stage_type: z.string().max(50).optional(),
  stage_order: z.number().int().positive().optional(),
  notes: z.string().max(2000).optional(),
});

export const stageUpdateSchema = z.object({
  stage_id: z.string().uuid('ID inválido'),
  status: z.enum(['pending', 'in_progress', 'awaiting_client', 'in_review', 'blocked', 'completed']).optional(),
  progress_percent: z.number().int().min(0).max(100).optional(),
  notes: z.string().max(2000).optional(),
});

export type StageCreate = z.infer<typeof stageCreateSchema>;
export type StageUpdate = z.infer<typeof stageUpdateSchema>;

// ============================================
// Message Schemas
// ============================================

export const messageCreateSchema = z.object({
  client_id: z.string().uuid('ID do cliente inválido'),
  stage_id: z.string().uuid('ID da etapa inválido').optional().nullable(),
  sender_type: z.enum(['admin', 'client', 'system']),
  sender_name: z.string().max(100),
  message: z.string()
    .min(1, 'Mensagem não pode estar vazia')
    .max(5000, 'Mensagem muito longa'),
});

export type MessageCreate = z.infer<typeof messageCreateSchema>;

// ============================================
// Notification Schemas
// ============================================

export const notificationCreateSchema = z.object({
  recipient_type: z.enum(['admin', 'client']),
  recipient_id: z.string().uuid().optional(),
  type: z.string().max(50),
  title: z.string().max(200),
  message: z.string().max(1000),
  client_id: z.string().uuid().optional(),
  booking_id: z.string().uuid().optional(),
  form_id: z.string().uuid().optional(),
});

export type NotificationCreate = z.infer<typeof notificationCreateSchema>;

// ============================================
// Validation Helper
// ============================================

import { NextRequest, NextResponse } from 'next/server';

/**
 * Validate request body against schema
 * Returns validated data or error response
 */
export function validateBody<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<{ data: T } | { error: NextResponse }> {
  return request.json()
    .then(body => {
      const result = schema.safeParse(body);
      if (result.success) {
        return { data: result.data };
      }
      return {
        error: NextResponse.json(
          { 
            error: 'Dados inválidos', 
            details: result.error.issues.map(i => ({
              field: i.path.join('.'),
              message: i.message
            }))
          },
          { status: 400 }
        )
      };
    })
    .catch(() => ({
      error: NextResponse.json(
        { error: 'Erro ao processar requisição' },
        { status: 400 }
      )
    }));
}