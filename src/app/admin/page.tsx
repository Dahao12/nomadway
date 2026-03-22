'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Stats {
  clients: { total: number; new: number; approved: number };
  bookings: { pending: number; today: number; week: number };
  revenue: { month: number; pending: number };
  leads: { hot: number; warm: number; cold: number };
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    clients: { total: 0, new: 0, approved: 0 },
    bookings: { pending: 0, today: 0, week: 0 },
    revenue: { month: 0, pending: 0 },
    leads: { hot: 0, warm: 0, cold: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    setLoading(true);
    try {
      // Fetch clients
      const clientsRes = await fetch('/api/clients-unified');
      const clientsData = await clientsRes.json();

      // Fetch bookings
      const bookingsRes = await fetch('/api/webhooks/booking?status=pending');
      const bookingsData = await bookingsRes.json();

      if (clientsData.clients) {
        const clients = clientsData.clients;
        setStats(prev => ({
          ...prev,
          clients: {
            total: clients.length,
            new: clients.filter((c: any) => c.status === 'new').length,
            approved: clients.filter((c: any) => c.status === 'approved').length
          }
        }));
      }

      if (bookingsData.bookings) {
        const bookings = bookingsData.bookings;
        const today = new Date().toISOString().split('T')[0];
        const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        setStats(prev => ({
          ...prev,
          bookings: {
            pending: bookings.length,
            today: bookings.filter((b: any) => b.booking_date === today).length,
            week: bookings.filter((b: any) => 
              b.booking_date >= today && b.booking_date <= weekFromNow
            ).length
          },
          leads: {
            hot: bookings.filter((b: any) => b.lead_temperature === 'hot').length,
            warm: bookings.filter((b: any) => b.lead_temperature === 'warm').length,
            cold: bookings.filter((b: any) => b.lead_temperature === 'cold').length
          }
        }));

        setRecentBookings(bookings.slice(0, 5));
      }
    } catch (error) {
      // Log only in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching stats:', error);
      }
    }
    setLoading(false);
  }

  const statCards = [
    {
      label: 'Clientes Total',
      value: stats.clients.total,
      change: `+${stats.clients.new} novos`,
      changeType: 'positive',
      icon: '👥',
      color: 'from-blue-500 to-cyan-500',
      onClick: () => router.push('/admin/clients')
    },
    {
      label: 'Leads Pendentes',
      value: stats.bookings.pending,
      change: `${stats.leads.hot} hot`,
      changeType: 'neutral',
      icon: '📋',
      color: 'from-amber-500 to-orange-500',
      onClick: () => router.push('/admin/kanban')
    },
    {
      label: 'Agendamentos Semana',
      value: stats.bookings.week,
      change: `${stats.bookings.today} hoje`,
      changeType: 'neutral',
      icon: '📅',
      color: 'from-purple-500 to-pink-500',
      onClick: () => router.push('/admin/bookings')
    },
    {
      label: 'Aprovados',
      value: stats.clients.approved,
      change: 'Sucesso',
      changeType: 'positive',
      icon: '✅',
      color: 'from-green-500 to-emerald-500',
      onClick: () => router.push('/admin/clients?status=approved')
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral do NomadWay</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-white text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 border border-gray-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m0 0V11" />
            </svg>
            Atualizar
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {statCards.map((card, i) => (
          <button
            key={i}
            onClick={card.onClick}
            className="bg-white rounded-xl border border-gray-200 p-4 lg:p-5 text-left hover:shadow-lg hover:border-gray-300 transition-all group"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-500 mb-1 truncate">{card.label}</p>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900">{loading ? '...' : card.value}</p>
              </div>
              <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-xl lg:text-2xl shadow-lg group-hover:scale-110 transition-transform flex-shrink-0`}>
                {card.icon}
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className={`text-sm font-medium ${
                card.changeType === 'positive' ? 'text-green-600' : 
                card.changeType === 'negative' ? 'text-red-600' : 
                'text-gray-500'
              }`}>
                {card.change}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Novo Lead', icon: '➕', href: '/admin/bookings?action=new' },
            { label: 'Pipeline', icon: '📈', href: '/admin/kanban' },
            { label: 'Clientes', icon: '👥', href: '/admin/clients' },
            { label: 'Financeiro', icon: '💰', href: '/admin/finance' },
          ].map((action, i) => (
            <button
              key={i}
              onClick={() => router.push(action.href)}
              className="flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{action.icon}</span>
              <span className="font-medium text-gray-700">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Agendamentos Recentes</h2>
            <button 
              onClick={() => router.push('/admin/bookings')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Ver todos →
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="p-6 text-center text-gray-400">
                <div className="animate-pulse flex space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ) : recentBookings.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl">
                  📅
                </div>
                <p className="text-gray-500">Nenhum agendamento pendente</p>
              </div>
            ) : (
              recentBookings.map((booking: any) => (
                <div 
                  key={booking.id}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => router.push('/admin/kanban')}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-xl">
                      {booking.lead_temperature === 'hot' ? '🔥' : 
                       booking.lead_temperature === 'warm' ? '🌡️' : '❄️'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{booking.customer_name}</div>
                      <div className="text-sm text-gray-500">{booking.service_name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(booking.booking_date).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="text-xs text-gray-400">{booking.booking_time?.substring(0, 5)}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Lead Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Distribuição de Leads</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-center gap-8">
              {[
                { label: 'Hot', value: stats.leads.hot, color: 'bg-red-500', emoji: '🔥' },
                { label: 'Warm', value: stats.leads.warm, color: 'bg-amber-500', emoji: '🌡️' },
                { label: 'Cold', value: stats.leads.cold, color: 'bg-blue-500', emoji: '❄️' },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className={`w-20 h-20 ${item.color} rounded-full flex items-center justify-center text-3xl mx-auto mb-2 shadow-lg`}>
                    {item.emoji}
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{loading ? '-' : item.value}</div>
                  <div className="text-sm text-gray-500">{item.label}</div>
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="h-3 rounded-full bg-gray-100 overflow-hidden flex">
                {stats.leads.hot > 0 && (
                  <div 
                    className="bg-red-500 h-full transition-all"
                    style={{ width: `${(stats.leads.hot / (stats.leads.hot + stats.leads.warm + stats.leads.cold || 1)) * 100}%` }}
                  />
                )}
                {stats.leads.warm > 0 && (
                  <div 
                    className="bg-amber-500 h-full transition-all"
                    style={{ width: `${(stats.leads.warm / (stats.leads.hot + stats.leads.warm + stats.leads.cold || 1)) * 100}%` }}
                  />
                )}
                {stats.leads.cold > 0 && (
                  <div 
                    className="bg-blue-500 h-full transition-all"
                    style={{ width: `${(stats.leads.cold / (stats.leads.hot + stats.leads.warm + stats.leads.cold || 1)) * 100}%` }}
                  />
                )}
              </div>
            </div>

            <div className="mt-4 text-center text-sm text-gray-500">
              Total: {stats.leads.hot + stats.leads.warm + stats.leads.cold} leads pendentes
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="text-4xl">💡</div>
          <div>
            <h3 className="font-semibold text-lg mb-1">Dica do dia</h3>
            <p className="text-white/90">
              Leads marcados como "Hot" têm 3x mais chances de conversão. Priorize entrar em contato com eles nas primeiras 24 horas!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}