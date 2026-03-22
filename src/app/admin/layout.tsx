'use client';

import Link from "next/link";
import Image from "next/image";
import { ReactNode, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

interface UserData {
  name: string;
  email: string;
  role: string;
}

// Navigation items with icons and descriptions
const navItems = [
  { 
    href: '/admin', 
    label: 'Dashboard', 
    icon: '📊',
    description: 'Visão geral',
    exact: true,
    roles: ['super_admin', 'admin', 'operacional', 'viewer']
  },
  { 
    href: '/admin/kanban', 
    label: 'Pipeline', 
    icon: '📈',
    description: 'Leads e clientes',
    roles: ['super_admin', 'admin', 'operacional', 'viewer']
  },
  { 
    href: '/admin/bookings', 
    label: 'Agendamentos', 
    icon: '📅',
    description: 'Calendário',
    roles: ['super_admin', 'admin', 'operacional', 'viewer']
  },
  { 
    href: '/admin/clients', 
    label: 'Clientes', 
    icon: '👥',
    description: 'Gerenciar',
    roles: ['super_admin', 'admin', 'operacional', 'viewer']
  },
  { 
    href: '/admin/partners', 
    label: 'Parceiros', 
    icon: '🤝',
    description: 'Afiliados',
    roles: ['super_admin', 'admin', 'operacional', 'viewer']
  },
  { 
    href: '/admin/forms', 
    label: 'Formulários', 
    icon: '📝',
    description: 'Documentos',
    roles: ['super_admin', 'admin', 'operacional', 'viewer']
  },
  { 
    href: '/admin/whatsapp-leads', 
    label: 'Leads WA', 
    icon: '🎯',
    description: 'Capturados automaticamente',
    roles: ['super_admin', 'admin', 'operacional', 'viewer']
  },
  { 
    href: '/admin/finance', 
    label: 'Financeiro', 
    icon: '💰',
    description: 'Receitas e despesas',
    roles: ['super_admin', 'admin']
  },
  { 
    href: '/admin/statement', 
    label: 'Extrato', 
    icon: '📄',
    description: 'Extratos financeiros',
    roles: ['super_admin', 'admin']
  },
  { 
    href: '/admin/settings', 
    label: 'Configurações', 
    icon: '⚙️',
    description: 'Sistema',
    roles: ['super_admin', 'admin']
  },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    checkAuth();
    // Load sidebar preference
    const collapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    setSidebarCollapsed(collapsed);
  }, []);

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/check');
      const data = await res.json();
      if (!data.authenticated) {
        router.push('/admin/login');
        return;
      }
      setUser(data.user);
    } catch {
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/login', { method: 'DELETE' });
    router.push('/admin/login');
  }

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'A';

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', String(newState));
  };

  // Check if item is active
  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => {
    if (!user?.role) return false;
    const itemRoles = item.roles || ['super_admin', 'admin'];
    return itemRoles.includes(user.role);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              <Image src="/logo.png" alt="NomadWay" width={32} height={32} className="object-contain" />
            </div>
            <span className="font-bold text-gray-900">NomadWay</span>
          </Link>
          
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
            {initials}
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop static, Mobile fixed */}
      <aside className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:relative
        fixed top-0 left-0 h-full z-50
        ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}
        w-64
        bg-white border-r border-gray-200
        transition-all duration-300 ease-in-out
        flex flex-col flex-shrink-0
      `}>
        {/* Logo Section */}
        <div className={`p-4 border-b border-gray-100 ${sidebarCollapsed ? 'lg:flex lg:justify-center' : ''}`}>
          <Link href="/admin" className="flex items-center justify-center">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg bg-white flex items-center justify-center flex-shrink-0">
              <Image src="/logo.png" alt="NomadWay" width={40} height={40} className="object-contain" />
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const active = isActive(item);
            return (
              <button
                key={item.href}
                onClick={() => {
                  router.push(item.href);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group
                  ${sidebarCollapsed ? 'lg:justify-center' : ''}
                  ${active
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-purple-500/20'
                    : 'text-gray-600 hover:bg-gray-50'
                  }
                `}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <span className={`text-xl flex-shrink-0 ${active ? '' : 'group-hover:scale-110'} transition-transform`}>
                  {item.icon}
                </span>
                <div className={`text-left min-w-0 ${sidebarCollapsed ? 'hidden' : ''}`}>
                  <div className="font-medium truncate">{item.label}</div>
                  <div className={`text-xs ${active ? 'text-white/70' : 'text-gray-400'}`}>
                    {item.description}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Collapse Toggle (Desktop) */}
        <div className="hidden lg:block p-2 border-t border-gray-100">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <svg className={`w-5 h-5 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            {!sidebarCollapsed && <span className="text-sm hidden lg:inline">Recolher</span>}
          </button>
        </div>

        {/* User Section */}
        <div className="p-3 border-t border-gray-100">
          <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'lg:justify-center' : ''}`}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
              {initials}
            </div>
            <div className={`flex-1 min-w-0 ${sidebarCollapsed ? 'hidden' : ''}`}>
              <p className="font-medium text-gray-900 truncate text-sm">{user?.name || 'Admin'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            {!sidebarCollapsed && (
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                title="Sair"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen lg:min-h-0">
        {/* Desktop Top Bar */}
        <div className="hidden lg:block sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200">
          <div className="px-6 py-4 flex items-center justify-between">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Admin</span>
              {pathname !== '/admin' && (
                <>
                  <span>/</span>
                  <span className="text-gray-900 font-medium">
                    {navItems.find(item => isActive(item))?.label || 'Página'}
                  </span>
                </>
              )}
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 pt-20 lg:pt-6">
          {children}
        </main>
      </div>
    </div>
  );
}