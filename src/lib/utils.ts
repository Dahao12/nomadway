import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 * Used by shadcn/ui components
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Utility functions for NomadWay
 * Centralized to avoid code duplication
 */

/**
 * Generate a workspace slug from a name
 * Format: name-xxxx (lowercase, alphanumeric, 20 chars max)
 */
export function generateWorkspaceSlug(name: string): string {
  const baseSlug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s]/g, '')      // Remove special chars
    .replace(/\s+/g, '-')             // Spaces to dashes
    .substring(0, 20)
    .replace(/^-|-$/g, '');           // Remove leading/trailing dashes
  
  const suffix = Math.random().toString(36).substring(2, 6);
  return `${baseSlug}-${suffix}`;
}

/**
 * Generate a random code with prefix
 * Format: PREFIX-XXXXXX (uppercase alphanumeric)
 */
export function generateRandomCode(prefix: string, length: number = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = `${prefix}-`;
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Format currency for display (EUR)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(value);
}

/**
 * Format date for display (Madrid timezone)
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Europe/Madrid'
  }).format(d);
}

/**
 * Format datetime for display (Madrid timezone)
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Madrid'
  }).format(d);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone format (international)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
}

/**
 * Sanitize string for display (prevent XSS)
 */
export function sanitizeString(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * App URL from environment
 */
export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 
         process.env.VERCEL_URL 
           ? `https://${process.env.VERCEL_URL}` 
           : 'http://localhost:3000';
}

/**
 * Build public URLs
 */
export function getUrls(formCode?: string, workspaceSlug?: string, clientId?: string): {
  form?: string;
  portal?: string;
  admin?: string;
} {
  const baseUrl = getAppUrl();
  const urls: { form?: string; portal?: string; admin?: string } = {};
  
  if (formCode) {
    urls.form = `${baseUrl}/form/${formCode}`;
  }
  if (workspaceSlug) {
    urls.portal = `${baseUrl}/portal/${workspaceSlug}`;
  }
  if (clientId) {
    urls.admin = `${baseUrl}/admin/clients/${clientId}`;
  }
  
  return urls;
}

/**
 * WhatsApp message template for new bookings
 */
export function generateWhatsAppMessage(name: string, formUrl: string): string {
  const firstName = name.split(' ')[0];
  return `🎉 *Olá ${firstName}!*

Seu agendamento foi confirmado! 📅

Para prosseguir, por favor preencha seus dados:

🔗 ${formUrl}

Qualquer dúvida, estamos à disposição!

Equipe NomadWay 🌍`;
}