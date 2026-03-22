import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { loginSchema, validateBody } from '@/lib/validation';
import { rateLimitMiddleware } from '@/lib/rate-limit';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// ⚠️ CRITICAL: No fallback password - must be set in environment
const SUPER_ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const SUPER_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Validate environment variables at startup
if (!SUPER_ADMIN_EMAIL || !SUPER_ADMIN_PASSWORD) {
  console.error('⚠️ ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment');
}

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_KEY);
}

// Verify password against stored hash (PBKDF2 with SHA512)
function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}

// Hash password for storage
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 attempts per 15 minutes (brute force protection)
    const rateLimitResponse = rateLimitMiddleware(request, 'login');
    if (rateLimitResponse) return rateLimitResponse;

    // Validate input
    const body = await request.json();
    const validation = loginSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          details: validation.error.issues.map(i => ({
            field: i.path.join('.'),
            message: i.message
          }))
        },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;
    const emailLower = email.toLowerCase();

    // Check super admin (env credentials - must be set)
    if (SUPER_ADMIN_EMAIL && SUPER_ADMIN_PASSWORD) {
      if (emailLower === SUPER_ADMIN_EMAIL.toLowerCase() && password === SUPER_ADMIN_PASSWORD) {
        const cookieStore = await cookies();
        cookieStore.set('admin_session', 'authenticated', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict', // More secure than 'lax'
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        const userInfo = { email: SUPER_ADMIN_EMAIL, name: 'Admin', role: 'super_admin' };
        cookieStore.set('admin_user', encodeURIComponent(JSON.stringify(userInfo)), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 60 * 60 * 24 * 7,
        });

        return NextResponse.json({ 
          success: true, 
          user: userInfo 
        });
      }
    }

    // Check database users
    const supabase = getSupabase();
    
    const { data: user, error } = await supabase
      .from('admin_users')
      .select('id, email, password, name, role')
      .eq('email', emailLower)
      .single();

    if (error || !user) {
      // Use generic message to prevent enumeration
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Verify password
    if (!verifyPassword(password, user.password)) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Update last login (async, don't wait)
    void (async () => {
      try {
        await supabase
          .from('admin_users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', user.id);
      } catch {}
    })();

    // Set session cookies
    const cookieStore = await cookies();
    cookieStore.set('admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
    });

    const userInfo = { email: user.email, name: user.name, role: user.role };
    cookieStore.set('admin_user', encodeURIComponent(JSON.stringify(userInfo)), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ 
      success: true, 
      user: userInfo 
    });

  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Erro ao autenticar' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
  cookieStore.delete('admin_user');
  return NextResponse.json({ success: true });
}