'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createServerClient } from '@/lib/supabase';

// Types
interface Client {
  id: string;
  client_code: string;
  full_name: string;
  email: string;
  phone: string | null;
  visa_type: string;
  status: string;
  lead_temperature: string;
  service_value: number | null;
  created_at: string;
  notes: string | null;
}

interface Booking {
  id: string;
  booking_code: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_name: string;
  price_cents: number;
  booking_date: string;
  booking_time: string;
  status: string;
  lead_temperature: string;
  created_at: string;
  notes: string | null;
  cold_since: string | null;
  archived_at: string | null;
  archive_reason: string | null;
  discount_percent: number | null;
  discount_value: number | null;
  partner_code: string | null;
  referral_source: string | null;
}

// Stage configuration - Simplified for Kanban (3 columns)
const STAGES = [
  { id: 'new', name: 'Novo', icon: '📥' },
  { id: 'in_progress', name: 'Em Andamento', icon: '🔄' },
  { id: 'approved', name: 'Aprovado', icon: '✅' },
];

// Temperature emoji
const TEMPERATURE_EMOJI: Record<string, string> = {
  hot: '🔥',
  warm: '🌡️',
  cold: '❄️'
};

export default function KanbanV2Page() {
  const router = useRouter();
  const [stages, setStages] = useState<Record<string, Client[]>>({});
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [search, setSearch] = useState('');
  const [draggedItem, setDraggedItem] = useState<Client | null>(null);
  const [dragSourceStage, setDragSourceStage] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });
  const [showArchived, setShowArchived] = useState(false);
  const [archivedLeads, setArchivedLeads] = useState<Booking[]>([]);
  const [archivedCount, setArchivedCount] = useState(0);
  const [discountType, setDiscountType] = useState<'percent' | 'value'>('percent');
  const [discountAmount, setDiscountAmount] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/check');
      if (!res.ok) {
        router.push('/admin/login');
        return;
      }
      fetchData();
    } catch {
      router.push('/admin/login');
    }
  }

  async function fetchData() {
    setLoading(true);
    try {
      // Fetch clients
      const clientsRes = await fetch('/api/clients-unified');
      const clientsData = await clientsRes.json();

      // Fetch bookings (all statuses except cancelled)
      const bookingsRes = await fetch('/api/webhooks/booking');
      const bookingsData = await bookingsRes.json();

      if (clientsData.clients) {
        // Group by status
        const grouped: Record<string, Client[]> = {};
        STAGES.forEach(stage => {
          grouped[stage.id] = clientsData.clients
            .filter((c: Client) => c.status === stage.id)
            .filter((c: Client) => {
              if (!search) return true;
              const q = search.toLowerCase();
              return c.full_name?.toLowerCase().includes(q) ||
                     c.email?.toLowerCase().includes(q) ||
                     c.client_code?.toLowerCase().includes(q);
            });
        });
        setStages(grouped);
        
        // Stats
        setStats({
          total: clientsData.clients.length,
          pending: clientsData.clients.filter((c: Client) => c.status !== 'approved').length,
          completed: clientsData.clients.filter((c: Client) => c.status === 'approved').length
        });
      }

      if (bookingsData.bookings) {
        setBookings(bookingsData.bookings.filter((b: Booking) => {
          // Exclude cancelled bookings from display
          if (b.status === 'cancelled') return false;
          if (!search) return true;
          const q = search.toLowerCase();
          return b.customer_name?.toLowerCase().includes(q) ||
                 b.customer_email?.toLowerCase().includes(q);
        }));
      }

      // Fetch archived count
      const archivedRes = await fetch('/api/admin/bookings?status=archived');
      const archivedData = await archivedRes.json();
      if (archivedData.bookings) {
        setArchivedCount(archivedData.bookings.length);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  }

  // Drag & Drop handlers
  const handleDragStart = useCallback((client: Client, stageId: string) => {
    setDraggedItem(client);
    setDragSourceStage(stageId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(async (targetStage: string) => {
    if (!draggedItem || dragSourceStage === targetStage) {
      setDraggedItem(null);
      setDragSourceStage(null);
      return;
    }

    try {
      // Update in database
      const res = await fetch('/api/clients-unified', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          client_id: draggedItem.id, 
          status: targetStage 
        })
      });

      if (!res.ok) throw new Error('Failed to update status');

      // Update local state
      setStages(prev => {
        const newStages = { ...prev };
        // Remove from source
        if (dragSourceStage && newStages[dragSourceStage]) {
          newStages[dragSourceStage] = newStages[dragSourceStage].filter(c => c.id !== draggedItem.id);
        }
        // Add to target
        if (!newStages[targetStage]) newStages[targetStage] = [];
        newStages[targetStage] = [...newStages[targetStage], { ...draggedItem, status: targetStage }];
        return newStages;
      });

      // Show notification
      const stageName = STAGES.find(s => s.id === targetStage)?.name || targetStage;
      console.log(`✅ ${draggedItem.full_name} movido para ${stageName}`);
      
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Erro ao atualizar status');
    }

    setDraggedItem(null);
    setDragSourceStage(null);
  }, [draggedItem, dragSourceStage]);

  async function updateBookingTemperature(booking: Booking, temperature: 'hot' | 'warm' | 'cold') {
    try {
      await fetch('/api/webhooks/booking', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          booking_code: booking.booking_code, 
          lead_temperature: temperature 
        })
      });

      setBookings(prev => prev.map(b => 
        b.booking_code === booking.booking_code 
          ? { ...b, lead_temperature: temperature } 
          : b
      ));

      if (selectedBooking?.booking_code === booking.booking_code) {
        setSelectedBooking({ ...selectedBooking, lead_temperature: temperature });
      }
    } catch (error) {
      console.error('Error updating temperature:', error);
    }
  }

  async function updateBookingStatus(booking: Booking, status: string) {
    try {
      await fetch('/api/webhooks/booking', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          booking_code: booking.booking_code, 
          status: status 
        })
      });

      setBookings(prev => prev.map(b => 
        b.booking_code === booking.booking_code 
          ? { ...b, status: status } 
          : b
      ));

      if (selectedBooking?.booking_code === booking.booking_code) {
        setSelectedBooking({ ...selectedBooking, status: status });
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  }

  async function deleteBooking(booking: Booking) {
    if (!confirm(`Tem certeza que deseja excluir o agendamento de "${booking.customer_name}"?`)) return;

    try {
      await fetch(`/api/webhooks/booking?booking_code=${booking.booking_code}`, {
        method: 'DELETE'
      });

      setBookings(prev => prev.filter(b => b.booking_code !== booking.booking_code));
      setSelectedBooking(null);
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Erro ao excluir agendamento');
    }
  }

  async function createClientFromBooking(booking: Booking) {
    try {
      const res = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: booking.customer_name,
          email: booking.customer_email,
          phone: booking.customer_phone,
          visa_type: booking.service_name,
          service_value: booking.price_cents ? booking.price_cents / 100 : null,
          discount_percent: booking.discount_percent || null,
          discount_value: booking.discount_value ? booking.discount_value / 100 : null,
          booking_code: booking.booking_code
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao criar cliente');
      }

      alert(`Cliente criado com sucesso! Código: ${data.client?.client_code || 'N/A'}`);
      
      // Update booking status to completed
      await updateBookingStatus(booking, 'completed');
      
      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Error creating client:', error);
      alert(error instanceof Error ? error.message : 'Erro ao criar cliente');
    }
  }

  function calculateFinalPrice(booking: Booking): { original: number; discount: number; final: number } {
    const original = booking.price_cents || 0;
    let discount = 0;
    
    if (booking.discount_percent) {
      discount = Math.round(original * (booking.discount_percent / 100));
    } else if (booking.discount_value) {
      discount = booking.discount_value;
    }
    
    const final = Math.max(0, original - discount);
    return { original, discount, final };
  }

  async function updateBookingDiscount(booking: Booking, discountType: 'percent' | 'value', amount: number) {
    try {
      const updateData: Record<string, any> = {};
      
      if (discountType === 'percent') {
        updateData.discount_percent = amount;
        updateData.discount_value = null;
      } else {
        updateData.discount_value = amount;
        updateData.discount_percent = null;
      }

      await fetch('/api/webhooks/booking', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          booking_code: booking.booking_code,
          ...updateData
        })
      });

      // Update local state
      const updatedBooking = {
        ...booking,
        discount_percent: discountType === 'percent' ? amount : null,
        discount_value: discountType === 'value' ? amount : null
      };

      setBookings(prev => prev.map(b => 
        b.booking_code === booking.booking_code ? updatedBooking : b
      ));

      if (selectedBooking?.booking_code === booking.booking_code) {
        setSelectedBooking(updatedBooking);
      }
    } catch (error) {
      console.error('Error updating discount:', error);
      alert('Erro ao aplicar desconto');
    }
  }

  // Group bookings by temperature (excluding archived)
  const hotLeads = bookings.filter(b => b.lead_temperature === 'hot' && b.status !== 'archived' && b.status !== 'cancelled');
  const warmLeads = bookings.filter(b => b.lead_temperature === 'warm' && b.status !== 'archived' && b.status !== 'cancelled');
  const coldLeads = bookings.filter(b => b.lead_temperature === 'cold' && b.status !== 'archived' && b.status !== 'cancelled');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Image src="/logo.png" alt="NomadWay" width={64} height={64} className="rounded-xl shadow-lg" />
          </div>
          <p className="text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-lg">
                <Image src="/logo.png" alt="NomadWay" width={40} height={40} className="object-contain" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900 text-sm sm:text-base">NomadWay</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Pipeline v2</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Stats - Hidden on mobile */}
              <div className="hidden md:flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-gray-600">{stats.total} clientes</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <span className="text-gray-600">{stats.pending} pendentes</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-gray-600">{stats.completed} aprovados</span>
                </div>
              </div>

              {/* Search - Smaller on mobile */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); fetchData(); }}
                  className="w-28 sm:w-48 px-3 py-1.5 sm:px-4 sm:py-2 pl-8 sm:pl-10 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <svg className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <button onClick={() => router.push('/admin')} className="hidden sm:block px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg">
                ← Voltar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Back Button */}
      <div className="sm:hidden px-4 py-2 bg-gray-50 border-b border-gray-100">
        <button onClick={() => router.push('/admin')} className="text-sm text-gray-600 hover:text-gray-900">
          ← Voltar ao Admin
        </button>
      </div>

      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Leads Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
            📋 Leads
            <span className="text-xs sm:text-sm font-normal text-gray-500">({bookings.length})</span>
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {/* Hot Leads */}
            <div className="bg-red-50 rounded-xl p-4 border border-red-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🔥</span>
                <h3 className="font-medium text-red-700">Hot ({hotLeads.length})</h3>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {hotLeads.map(booking => (
                  <div
                    key={booking.id}
                    className="bg-white rounded-lg p-3 shadow-sm border border-red-100"
                  >
                    <div onClick={() => setSelectedBooking(booking)} className="cursor-pointer hover:shadow-md transition-all">
                      <div className="font-medium text-gray-900">{booking.customer_name}</div>
                      <div className="text-sm text-gray-500">{booking.service_name}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        📅 {new Date(booking.booking_date).toLocaleDateString('pt-BR')} às {booking.booking_time?.substring(0, 5)}
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); createClientFromBooking(booking); }}
                      className="mt-2 w-full text-xs bg-green-500 hover:bg-green-600 text-white py-1 px-2 rounded transition-colors"
                    >
                      + Criar Cliente
                    </button>
                  </div>
                ))}
                {hotLeads.length === 0 && (
                  <div className="text-center py-4 text-gray-400 text-sm">Nenhum lead hot</div>
                )}
              </div>
            </div>

            {/* Warm Leads */}
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🌡️</span>
                <h3 className="font-medium text-amber-700">Warm ({warmLeads.length})</h3>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {warmLeads.map(booking => (
                  <div
                    key={booking.id}
                    className="bg-white rounded-lg p-3 shadow-sm border border-amber-100"
                  >
                    <div onClick={() => setSelectedBooking(booking)} className="cursor-pointer hover:shadow-md transition-all">
                      <div className="font-medium text-gray-900">{booking.customer_name}</div>
                      <div className="text-sm text-gray-500">{booking.service_name}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        📅 {new Date(booking.booking_date).toLocaleDateString('pt-BR')} às {booking.booking_time?.substring(0, 5)}
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); createClientFromBooking(booking); }}
                      className="mt-2 w-full text-xs bg-green-500 hover:bg-green-600 text-white py-1 px-2 rounded transition-colors"
                    >
                      + Criar Cliente
                    </button>
                  </div>
                ))}
                {warmLeads.length === 0 && (
                  <div className="text-center py-4 text-gray-400 text-sm">Nenhum lead warm</div>
                )}
              </div>
            </div>

            {/* Cold Leads */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">❄️</span>
                <h3 className="font-medium text-blue-700">Cold ({coldLeads.length})</h3>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {coldLeads.map(booking => {
                  const daysCold = booking.cold_since 
                    ? Math.floor((Date.now() - new Date(booking.cold_since).getTime()) / (1000 * 60 * 60 * 24))
                    : 0;
                  const isWarning = daysCold >= 5 && daysCold < 7;
                  const isDanger = daysCold >= 7;
                  
                  return (
                    <div
                      key={booking.id}
                      className={`bg-white rounded-lg p-3 shadow-sm border ${
                        isDanger ? 'border-red-300 ring-1 ring-red-200' :
                        isWarning ? 'border-amber-300' : 'border-blue-100'
                      }`}
                    >
                      <div onClick={() => setSelectedBooking(booking)} className="cursor-pointer hover:shadow-md transition-all">
                        <div className="flex items-start justify-between">
                          <div className="font-medium text-gray-900">{booking.customer_name}</div>
                          {daysCold > 0 && (
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              isDanger ? 'bg-red-100 text-red-700' :
                              isWarning ? 'bg-amber-100 text-amber-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {daysCold}d frio
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{booking.service_name}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          📅 {new Date(booking.booking_date).toLocaleDateString('pt-BR')} às {booking.booking_time?.substring(0, 5)}
                        </div>
                        {isDanger && (
                          <div className="text-xs text-red-600 mt-1 font-medium">
                            ⚠️ Será arquivado automaticamente
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); createClientFromBooking(booking); }}
                        className="mt-2 w-full text-xs bg-green-500 hover:bg-green-600 text-white py-1 px-2 rounded transition-colors"
                      >
                        + Criar Cliente
                      </button>
                    </div>
                  );
                })}
                {coldLeads.length === 0 && (
                  <div className="text-center py-4 text-gray-400 text-sm">Nenhum lead cold</div>
                )}
              </div>
            </div>
          </div>

          {/* Archive Section */}
          {archivedCount > 0 && (
            <div className="mt-4">
              <button
                onClick={async () => {
                  if (!showArchived) {
                    // Fetch archived leads
                    try {
                      const res = await fetch('/api/admin/bookings?status=archived');
                      const data = await res.json();
                      if (data.bookings) {
                        setArchivedLeads(data.bookings);
                      }
                    } catch (error) {
                      console.error('Error fetching archived leads:', error);
                    }
                  }
                  setShowArchived(!showArchived);
                }}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
              >
                📁 Arquivo ({archivedCount})
                <span className="text-xs">{showArchived ? '▲' : '▼'}</span>
              </button>
            </div>
          )}

          {/* Archived Leads Expanded */}
          {showArchived && archivedLeads.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-700">Leads Arquivados</h4>
                <span className="text-sm text-gray-500">{archivedLeads.length} leads</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {archivedLeads.map(booking => (
                  <div
                    key={booking.id}
                    onClick={() => setSelectedBooking(booking)}
                    className="bg-white rounded-lg p-3 shadow-sm cursor-pointer hover:shadow-md transition-all border border-gray-200 opacity-75"
                  >
                    <div className="font-medium text-gray-700">{booking.customer_name}</div>
                    <div className="text-sm text-gray-500">{booking.service_name}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      📁 Arquivado em {booking.archived_at ? new Date(booking.archived_at).toLocaleDateString('pt-BR') : '?'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Kanban Board */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          👥 Pipeline de Clientes
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 overflow-x-auto pb-4">
          {STAGES.map(stage => {
            const clients = stages[stage.id] || [];
            const totalValue = clients.reduce((sum, c) => sum + (c.service_value || 0), 0);

            return (
              <div
                key={stage.id}
                className="bg-gray-100 rounded-xl p-4 min-w-[280px] h-fit"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(stage.id)}
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{stage.icon}</span>
                    <h3 className="font-semibold text-gray-700">{stage.name}</h3>
                  </div>
                  <span className="text-sm font-medium bg-white px-2.5 py-1 rounded-full shadow-sm">
                    {clients.length}
                  </span>
                </div>

                {/* Value */}
                {totalValue > 0 && (
                  <div className="text-sm text-green-600 mb-3 font-medium">
                    €{totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                  </div>
                )}

                {/* Clients */}
                <div className="space-y-2 min-h-[100px]">
                  {clients.map(client => (
                    <div
                      key={client.id}
                      draggable
                      onDragStart={() => handleDragStart(client, stage.id)}
                      onClick={() => setSelectedClient(client)}
                      className="bg-white rounded-lg p-3 shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">{client.full_name || client.client_code}</div>
                          <div className="text-sm text-gray-500 truncate">{client.email}</div>
                        </div>
                        {client.service_value && (
                          <div className="text-sm font-medium text-green-600 ml-2">
                            €{(client.service_value / 1000).toFixed(0)}k
                          </div>
                        )}
                      </div>
                      
                      {/* Temperature indicator */}
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="text-sm">{TEMPERATURE_EMOJI[client.lead_temperature] || '🌡️'}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(client.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {clients.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                      {draggedItem ? 'Solte aqui' : 'Arraste clientes'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedBooking(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedBooking.customer_name}</h2>
                <p className="text-sm text-gray-500">{selectedBooking.booking_code}</p>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="space-y-2 text-sm mb-6">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Email</span>
                <span className="font-medium">{selectedBooking.customer_email}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Telefone</span>
                <span className="font-medium">{selectedBooking.customer_phone}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Serviço</span>
                <span className="font-medium">{selectedBooking.service_name}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Data</span>
                <span className="font-medium">
                  {new Date(selectedBooking.booking_date).toLocaleDateString('pt-BR')} às {selectedBooking.booking_time?.substring(0, 5)}
                </span>
              </div>
              {selectedBooking.price_cents > 0 && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Valor Original</span>
                  <span className="font-medium text-green-600">
                    €{(selectedBooking.price_cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              {selectedBooking.discount_percent && selectedBooking.discount_percent > 0 && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Desconto</span>
                  <span className="font-medium text-red-500">
                    -{selectedBooking.discount_percent}%
                  </span>
                </div>
              )}
              {selectedBooking.partner_code && (
                <div className="flex justify-between py-2 border-b bg-purple-50 -mx-3 px-3 rounded">
                  <span className="text-purple-700 font-medium">🔗 Parceiro</span>
                  <span className="font-bold text-purple-900 font-mono">{selectedBooking.partner_code}</span>
                </div>
              )}
              {selectedBooking.referral_source && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Origem</span>
                  <span className="font-medium text-gray-700">{selectedBooking.referral_source}</span>
                </div>
              )}
              {selectedBooking.discount_value && selectedBooking.discount_value > 0 && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Desconto</span>
                  <span className="font-medium text-red-500">
                    -€{(selectedBooking.discount_value / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              {(selectedBooking.discount_percent || selectedBooking.discount_value) && selectedBooking.price_cents > 0 && (
                <div className="flex justify-between py-2 border-b bg-green-50 -mx-3 px-3 rounded">
                  <span className="text-gray-700 font-medium">Valor Final</span>
                  <span className="font-bold text-green-600">
                    €{(calculateFinalPrice(selectedBooking).final / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>

            {/* Discount */}
            {selectedBooking.price_cents > 0 && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <label className="block text-sm font-medium text-blue-800 mb-2">💰 Aplicar Desconto</label>
                <div className="flex gap-2">
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as 'percent' | 'value')}
                    className="px-2 py-2 border border-blue-200 rounded-lg text-sm bg-white"
                  >
                    <option value="percent">% Porcentagem</option>
                    <option value="value">€ Valor Fixo</option>
                  </select>
                  <input
                    type="number"
                    placeholder={discountType === 'percent' ? '0-100' : '0'}
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    className="flex-1 px-3 py-2 border border-blue-200 rounded-lg text-sm"
                    min="0"
                    max={discountType === 'percent' ? '100' : undefined}
                  />
                  <button
                    onClick={() => {
                      const amount = parseFloat(discountAmount);
                      if (isNaN(amount) || amount <= 0) {
                        alert('Digite um valor válido');
                        return;
                      }
                      const discountValue = discountType === 'percent' 
                        ? amount 
                        : Math.round(amount * 100); // Convert to cents
                      updateBookingDiscount(selectedBooking, discountType, discountValue);
                      setDiscountAmount('');
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600"
                  >
                    Aplicar
                  </button>
                </div>
                {(selectedBooking.discount_percent || selectedBooking.discount_value) && (
                  <button
                    onClick={() => {
                      updateBookingDiscount(selectedBooking, 'percent', 0);
                    }}
                    className="mt-2 text-sm text-red-600 hover:text-red-700"
                  >
                    ✕ Remover desconto
                  </button>
                )}
              </div>
            )}

            {/* Status */}

            {/* Archive Warning */}
            {selectedBooking.status === 'archived' && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-sm text-gray-600">
                  📁 Lead arquivado
                  {selectedBooking.archived_at && (
                    <span className="text-gray-500 ml-1">
                      em {new Date(selectedBooking.archived_at).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    updateBookingStatus(selectedBooking, 'pending');
                    updateBookingTemperature(selectedBooking, 'warm');
                  }}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  ↑ Recuperar Lead (voltar para Pendente/Warm)
                </button>
              </div>
            )}

            {/* Temperature */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Temperatura do Lead</label>
              <div className="flex gap-2">
                {['hot', 'warm', 'cold'].map(temp => (
                  <button
                    key={temp}
                    onClick={() => updateBookingTemperature(selectedBooking, temp as 'hot' | 'warm' | 'cold')}
                    className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${
                      selectedBooking.lead_temperature === temp
                        ? temp === 'hot' ? 'bg-red-500 text-white shadow-lg shadow-red-200' :
                          temp === 'warm' ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' :
                          'bg-blue-500 text-white shadow-lg shadow-blue-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {TEMPERATURE_EMOJI[temp]} {temp === 'hot' ? 'Hot' : temp === 'warm' ? 'Warm' : 'Cold'}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={async () => {
                  if (confirm('Criar formulário para este lead?')) {
                    try {
                      const res = await fetch('/api/forms', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ booking_code: selectedBooking.booking_code })
                      });
                      const data = await res.json();
                      if (data.success) {
                        alert(`Formulário criado: ${data.form_code}`);
                        fetchData();
                      }
                    } catch (error) {
                      console.error('Error creating form:', error);
                    }
                  }
                }}
                className="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all"
              >
                📝 Criar Form
              </button>
              <a
                href={`https://wa.me/${selectedBooking.customer_phone?.replace(/\D/g, '')}`}
                target="_blank"
                className="px-4 py-2.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-all flex items-center gap-1"
              >
                💬 WhatsApp
              </a>
            </div>

            {/* Generate Contract Button */}
            {selectedBooking.price_cents > 0 && (
              <div className="mb-4">
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch(`/api/admin/generate-contract?booking_code=${selectedBooking.booking_code}`);
                      const data = await res.json();
                      
                      if (data.contract_data) {
                        const v = data.values;
                        let msg = `📄 Dados para Contrato\n\n`;
                        msg += `👤 Cliente: ${data.contract_data.client_name}\n`;
                        msg += `🎯 Serviço: ${data.contract_data.service}\n`;
                        msg += `📅 Data: ${data.contract_data.date}\n`;
                        msg += `\n💰 Valor Original: €${v.original_eur.toFixed(2)}\n`;
                        if (v.discount_cents > 0) {
                          msg += `🏷️ Desconto: -€${v.discount_eur.toFixed(2)}`;
                          if (v.discount_percent) msg += ` (${v.discount_percent}%)`;
                          msg += `\n`;
                        }
                        msg += `✨ Valor Final: €${v.final_eur.toFixed(2)}\n\n`;
                        msg += `Código: ${data.contract_data.booking_code}`;
                        
                        alert(msg);
                        
                        // Copy to clipboard
                        navigator.clipboard.writeText(msg);
                      }
                    } catch (error) {
                      console.error('Error:', error);
                      alert('Erro ao gerar contrato');
                    }
                  }}
                  className="w-full px-4 py-2.5 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-all"
                >
                  📄 Gerar Contrato
                </button>
              </div>
            )}

            {/* Delete Button */}
            <button
              onClick={() => deleteBooking(selectedBooking)}
              className="w-full px-4 py-2.5 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-all border border-red-200"
            >
              🗑️ Excluir Agendamento
            </button>
          </div>
        </div>
      )}

      {/* Client Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedClient(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedClient.full_name}</h2>
                <p className="text-sm text-gray-500">{selectedClient.client_code}</p>
              </div>
              <button onClick={() => setSelectedClient(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="space-y-2 text-sm mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Email</span>
                  <span className="font-medium truncate">{selectedClient.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Telefone</span>
                  <span className="font-medium">{selectedClient.phone || '—'}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Visto</span>
                  <span className="font-medium">{selectedClient.visa_type}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Valor</span>
                  <span className="font-medium text-green-600">
                    {selectedClient.service_value ? `€${selectedClient.service_value.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}` : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/admin/clients/${selectedClient.id}`)}
                className="flex-1 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-all"
              >
                Ver Detalhes
              </button>
              <a
                href={`https://wa.me/${selectedClient.phone?.replace(/\D/g, '')}`}
                target="_blank"
                className="px-4 py-2.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-all"
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