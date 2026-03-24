'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Booking {
  id: string;
  booking_code: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_notes?: string;
  service_name: string;
  price_cents: number;
  booking_date: string;
  booking_time: string;
  status: string;
  lead_temperature: string;
  notes: string;
  created_at: string;
  // Parsed form data
  formData?: {
    visaType?: string;
    familyCount?: string;
    knowsVisas?: string;
    travelTimeline?: string;
    budget?: string;
    profession?: string;
    intendedCity?: string;
    hasTraveledAbroad?: string;
    howFoundUs?: string;
    mainChallenge?: string;
    alreadyInSpain?: string;
    otherQuestions?: string;
  };
}

// Parse customer_notes to extract form data
function parseNotes(notes: string | undefined): Booking['formData'] {
  if (!notes) return undefined;
  
  const formData: Booking['formData'] = {};
  
  const patterns: Record<string, RegExp> = {
    visaType: /Visto: ([^|]+)/,
    familyCount: /Familiares: ([^|]+)/,
    knowsVisas: /Conhece vistos: ([^|]+)/,
    travelTimeline: /Quando: ([^|]+)/,
    budget: /Orçamento: ([^|]+)/,
    profession: /Profissão: ([^|]+)/,
    intendedCity: /Cidade: ([^|]+)/,
    hasTraveledAbroad: /Viajou fora: ([^|]+)/,
    howFoundUs: /Como encontrou: ([^|]+)/,
    mainChallenge: /Desafio: ([^|]+)/,
    alreadyInSpain: /Na Espanha: ([^|]+)/,
    otherQuestions: /Outras: ([^|]+)/
  };
  
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = notes.match(pattern);
    if (match) {
      formData[key as keyof typeof formData] = match[1].trim();
    }
  }
  
  return Object.keys(formData).length > 0 ? formData : undefined;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  pending: { label: 'Pendente', color: 'text-amber-700', bg: 'bg-amber-50', icon: '⏳' },
  confirmed: { label: 'Confirmado', color: 'text-blue-700', bg: 'bg-blue-50', icon: '✓' },
  form_sent: { label: 'Form Enviado', color: 'text-purple-700', bg: 'bg-purple-50', icon: '📝' },
  completed: { label: 'Concluído', color: 'text-green-700', bg: 'bg-green-50', icon: '✅' },
  cancelled: { label: 'Cancelado', color: 'text-red-700', bg: 'bg-red-50', icon: '❌' },
};

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'calendar'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    setLoading(true);
    try {
      const res = await fetch('/api/webhooks/booking');
      const data = await res.json();
      // Parse form data from customer_notes
      const bookingsWithFormData = (data.bookings || []).map((b: Booking) => ({
        ...b,
        formData: parseNotes(b.customer_notes || b.notes)
      }));
      // Sort by date (ascending) then by time (ascending) - oldest first
      const sortedBookings = bookingsWithFormData.sort((a: Booking, b: Booking) => {
        const dateCompare = a.booking_date.localeCompare(b.booking_date);
        if (dateCompare !== 0) return dateCompare;
        return a.booking_time.localeCompare(b.booking_time);
      });
      setBookings(sortedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
    setLoading(false);
  }

  async function updateBookingStatus(bookingId: string, newStatus: string) {
    try {
      const res = await fetch('/api/admin/bookings-unified', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ booking_id: bookingId, status: newStatus }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // Update local state
        setBookings(bookings.map(b => 
          b.id === bookingId ? { ...b, status: newStatus } : b
        ));
        setSelectedBooking(null);
      } else {
        alert(data.error || data.details || 'Erro ao atualizar status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Erro ao atualizar status');
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  function formatTime(timeStr: string) {
    return timeStr?.substring(0, 5) || '';
  }

  function getBookingsForDate(date: string) {
    return bookings.filter(b => b.booking_date === date);
  }

  function getDaysInMonth(year: number, month: number) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];
    
    // Add empty cells for days before first day of month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  }

  function isToday(date: Date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  function hasBookings(date: Date) {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.some(b => b.booking_date === dateStr);
  }

  function getBookingCount(date: Date) {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter(b => b.booking_date === dateStr).length;
  }

  const filteredBookings = bookings.filter(b => {
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchesSearch = !search ||
      b.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.customer_email?.toLowerCase().includes(search.toLowerCase()) ||
      b.booking_code?.toLowerCase().includes(search.toLowerCase());

    // Date filter
    let matchesDateFilter = true;
    if (dateFilter !== 'all') {
      const bookingDate = new Date(b.booking_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());

      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      if (dateFilter === 'today') {
        matchesDateFilter = bookingDate.getTime() === today.getTime();
      } else if (dateFilter === 'week') {
        matchesDateFilter = bookingDate >= startOfWeek;
      } else if (dateFilter === 'month') {
        matchesDateFilter = bookingDate >= startOfMonth;
      } else if (dateFilter === 'upcoming') {
        matchesDateFilter = bookingDate > today;
      } else if (dateFilter === 'past') {
        matchesDateFilter = bookingDate < today;
      }
    }

    return matchesStatus && matchesSearch && matchesDateFilter;
  });

  const selectedDateBookings = selectedDate ? getBookingsForDate(selectedDate) : [];

  // Stats
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Carregando agendamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agendamentos</h1>
          <p className="text-gray-600">Gerencie seus agendamentos</p>
        </div>
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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: '📅', color: 'bg-blue-500' },
          { label: 'Pendentes', value: stats.pending, icon: '⏳', color: 'bg-amber-500' },
          { label: 'Confirmados', value: stats.confirmed, icon: '✓', color: 'bg-green-500' },
          { label: 'Concluídos', value: stats.completed, icon: '✅', color: 'bg-purple-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center text-xl`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'calendar' 
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            📅 Calendário
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'list' 
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            📋 Lista
          </button>
        </div>

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div className="p-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-lg font-semibold text-gray-900">
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {WEEKDAYS.map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth()).map((date, i) => {
                if (!date) {
                  return <div key={`empty-${i}`} className="aspect-square" />;
                }
                
                const dateStr = date.toISOString().split('T')[0];
                const dayBookings = getBookingsForDate(dateStr);
                const hasBookings = dayBookings.length > 0;
                const today = isToday(date);
                const selected = selectedDate === dateStr;

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(selected ? null : dateStr)}
                    className={`aspect-square p-1 rounded-lg text-sm transition-all relative
                      ${today ? 'ring-2 ring-blue-500' : ''}
                      ${selected ? 'bg-blue-100 ring-2 ring-blue-600' : 'hover:bg-gray-100'}
                      ${hasBookings ? 'font-bold' : ''}
                    `}
                  >
                    <span className={today ? 'text-blue-600' : ''}>
                      {date.getDate()}
                    </span>
                    {hasBookings && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                        {dayBookings.slice(0, 3).map((_, j) => (
                          <div key={j} className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        ))}
                        {dayBookings.length > 3 && (
                          <span className="text-xs text-gray-400">+</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Date Details */}
            {selectedDate && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {formatDate(selectedDate)}
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({selectedDateBookings.length} agendamentos)
                  </span>
                </h3>
                
                {selectedDateBookings.length === 0 ? (
                  <p className="text-gray-500 text-sm">Nenhum agendamento neste dia</p>
                ) : (
                  <div className="space-y-2">
                    {selectedDateBookings.map(booking => {
                      const config = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
                      return (
                        <div
                          key={booking.id}
                          onClick={() => setSelectedBooking(booking)}
                          className="bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{config.icon}</span>
                              <div>
                                <p className="font-medium text-gray-900">{booking.customer_name}</p>
                                <p className="text-sm text-gray-500">{formatTime(booking.booking_time)}</p>
                              </div>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${config.bg} ${config.color}`}>
                              {config.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* List Tab */}
        {activeTab === 'list' && (
          <div className="p-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar por nome, email ou código..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">📅 Todas as datas</option>
                <option value="today">📅 Hoje</option>
                <option value="week">📅 Esta semana</option>
                <option value="month">📅 Este mês</option>
                <option value="upcoming">📅 Futuros</option>
                <option value="past">📅 Passados</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos os status</option>
                <option value="pending">Pendente</option>
                <option value="confirmed">Confirmado</option>
                <option value="form_sent">Form Enviado</option>
                <option value="completed">Concluído</option>
              </select>
            </div>

            {/* Bookings List */}
            <div className="space-y-3">
              {filteredBookings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">📅</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {search || statusFilter !== 'all' ? 'Nenhum agendamento encontrado' : 'Nenhum agendamento ainda'}
                  </h3>
                  <p className="text-gray-500">
                    {search || statusFilter !== 'all' ? 'Tente ajustar os filtros' : 'Novos agendamentos aparecerão aqui'}
                  </p>
                </div>
              ) : (
                filteredBookings.map(booking => {
                  const config = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
                  return (
                    <div
                      key={booking.id}
                      onClick={() => setSelectedBooking(booking)}
                      className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{config.icon}</span>
                          <div>
                            <h4 className="font-semibold text-gray-900">{booking.customer_name}</h4>
                            <p className="text-sm text-gray-500">{booking.customer_email}</p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${config.bg} ${config.color}`}>
                          {config.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                        <span>📅 {formatDate(booking.booking_date)}</span>
                        <span>🕐 {formatTime(booking.booking_time)}</span>
                        <span className="text-blue-500">{booking.booking_code}</span>
                      </div>
                      {booking.formData && (
                        <div className="flex flex-wrap gap-1.5">
                          {booking.formData.visaType && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                              {booking.formData.visaType}
                            </span>
                          )}
                          {booking.formData.intendedCity && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                              {booking.formData.intendedCity}
                            </span>
                          )}
                          {booking.formData.travelTimeline && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                              {booking.formData.travelTimeline}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto" onClick={() => setSelectedBooking(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full my-4 sm:my-0 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{selectedBooking.customer_name}</h2>
                <p className="text-xs text-gray-500">{selectedBooking.booking_code}</p>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 text-xl rounded-full hover:bg-gray-100">✕</button>
            </div>

            <div className="p-4 space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Email</span>
                <span className="font-medium text-gray-900 text-right text-xs">{selectedBooking.customer_email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Telefone</span>
                <a href={`tel:${selectedBooking.customer_phone}`} className="font-medium text-blue-600">{selectedBooking.customer_phone}</a>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Data</span>
                <span className="font-medium text-gray-900">{formatDate(selectedBooking.booking_date)} às {formatTime(selectedBooking.booking_time)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Serviço</span>
                <span className="font-medium text-gray-900">{selectedBooking.service_name}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500">Valor</span>
                <span className="font-bold text-green-600">
                  €{(selectedBooking.price_cents / 100 || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Form Data */}
            {selectedBooking.formData && (
              <div className="px-4 pb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span>📋</span> Respostas do Formulário
                </h3>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                  {selectedBooking.formData.visaType && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Visto</span>
                      <span className="font-medium text-gray-900">{selectedBooking.formData.visaType}</span>
                    </div>
                  )}
                  {selectedBooking.formData.familyCount && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Familiares</span>
                      <span className="font-medium text-gray-900">{selectedBooking.formData.familyCount}</span>
                    </div>
                  )}
                  {selectedBooking.formData.knowsVisas && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Conhece vistos</span>
                      <span className="font-medium text-gray-900">{selectedBooking.formData.knowsVisas}</span>
                    </div>
                  )}
                  {selectedBooking.formData.travelTimeline && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Quando muda</span>
                      <span className="font-medium text-gray-900">{selectedBooking.formData.travelTimeline}</span>
                    </div>
                  )}
                  {selectedBooking.formData.budget && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Orçamento</span>
                      <span className="font-medium text-gray-900">{selectedBooking.formData.budget}</span>
                    </div>
                  )}
                  {selectedBooking.formData.profession && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Profissão</span>
                      <span className="font-medium text-gray-900">{selectedBooking.formData.profession}</span>
                    </div>
                  )}
                  {selectedBooking.formData.intendedCity && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Cidade</span>
                      <span className="font-medium text-gray-900">{selectedBooking.formData.intendedCity}</span>
                    </div>
                  )}
                  {selectedBooking.formData.hasTraveledAbroad && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Viajou fora</span>
                      <span className="font-medium text-gray-900">{selectedBooking.formData.hasTraveledAbroad}</span>
                    </div>
                  )}
                  {selectedBooking.formData.howFoundUs && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Como encontrou</span>
                      <span className="font-medium text-gray-900">{selectedBooking.formData.howFoundUs}</span>
                    </div>
                  )}
                  {selectedBooking.formData.mainChallenge && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Maior desafio</span>
                      <span className="font-medium text-gray-900">{selectedBooking.formData.mainChallenge}</span>
                    </div>
                  )}
                  {selectedBooking.formData.alreadyInSpain && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Já na Espanha</span>
                      <span className="font-medium text-gray-900">{selectedBooking.formData.alreadyInSpain}</span>
                    </div>
                  )}
                  {selectedBooking.formData.otherQuestions && (
                    <div className="pt-2 border-t border-gray-200">
                      <span className="text-gray-500 block mb-1">Outras dúvidas</span>
                      <span className="text-gray-900">{selectedBooking.formData.otherQuestions}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Raw Notes (if no parsed data) */}
            {!selectedBooking.formData && (selectedBooking.customer_notes || selectedBooking.notes) && (
              <div className="px-4 pb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Observações</h3>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">
                  {selectedBooking.customer_notes || selectedBooking.notes}
                </p>
              </div>
            )}

            {/* Status */}
            <div className="px-4 pb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Status do Agendamento</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => updateBookingStatus(selectedBooking.id, key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedBooking.status === key
                        ? `${config.bg} ${config.color} ring-2 ring-offset-1 ring-current`
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {config.icon} {config.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="px-4 pb-4 flex gap-2">
              <button
                onClick={() => router.push('/admin/kanban')}
                className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
              >
                Ver no Pipeline
              </button>
              <a
                href={`https://wa.me/${selectedBooking.customer_phone?.replace(/\D/g, '')}`}
                target="_blank"
                className="px-4 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
              >
                💬 WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}