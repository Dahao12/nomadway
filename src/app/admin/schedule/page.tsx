"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
  notes: string;
  created_at: string;
}

interface BlockedSlot {
  id: string;
  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  form_sent: 'bg-purple-100 text-purple-700 border-purple-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
  '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'
];

// Quick block presets
const QUICK_BLOCKS = [
  { label: '🌞 Almoço', startTime: '12:00', endTime: '14:00', reason: 'Almoço' },
  { label: '📅 Feriado', reason: 'Feriado', fullDay: true },
  { label: '🏖️ Férias', reason: 'Férias', fullDay: true },
  { label: '🚫 Folga', reason: 'Folga', fullDay: true },
  { label: '📞 Reunião', startTime: '10:00', endTime: '12:00', reason: 'Reunião' },
];

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function SchedulePage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  // Multi-select for dragging
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<string | null>(null);
  const [dragEnd, setDragEnd] = useState<string | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  
  // Time slot multi-select
  const [timeDragStart, setTimeDragStart] = useState<string | null>(null);
  const [selectedTimes, setSelectedTimes] = useState<Set<string>>(new Set());
  
  // Modal states
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [blockForm, setBlockForm] = useState({
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    reason: ''
  });
  
  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchData();
    }
  }, [selectedDate]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setToast({ message, type });
  }

  function checkAuth() {
    fetch('/api/auth/check')
      .then(res => res.json())
      .then(data => {
        if (!data.authenticated) {
          router.push('/admin/login');
          return;
        }
        fetchData();
      })
      .catch(() => router.push('/admin/login'));
  }

  async function fetchData() {
    setLoading(true);
    try {
      const [bookingsRes, blocksRes] = await Promise.all([
        fetch(`/api/admin/bookings?date=${selectedDate || new Date().toISOString().split('T')[0]}`),
        fetch('/api/admin/blocks')
      ]);

      if (bookingsRes.ok) {
        const data = await bookingsRes.json();
        setBookings(data.bookings || data || []);
      }
      
      if (blocksRes.ok) {
        const data = await blocksRes.json();
        setBlockedSlots(data.blocks || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  }

  // Date string helper
  function dateStr(date: Date) {
    return date.toISOString().split('T')[0];
  }

  // Calendar helpers
  function getDaysInMonth(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    const startPadding = firstDay.getDay();
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  }

  function getBookingsForDate(date: string) {
    return bookings.filter(b => b.booking_date === date);
  }

  function isDateBlocked(date: string) {
    return blockedSlots.some(block => 
      date >= block.start_date && date <= block.end_date && !block.start_time
    );
  }

  function isTimeSlotBlocked(date: string, time: string) {
    return blockedSlots.some(block =>
      date >= block.start_date && date <= block.end_date &&
      block.start_time && block.end_time &&
      time >= block.start_time && time <= block.end_time
    );
  }

  function formatPrice(cents: number) {
    return `€${(cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  }

  // ===== INTERACTIVE BLOCKING =====

  // Quick block - predefined actions
  async function handleQuickBlock(preset: typeof QUICK_BLOCKS[0]) {
    if (!selectedDate) return;

    setSaving(true);
    try {
      let startTime = preset.startTime || null;
      let endTime = preset.endTime || null;
      
      // If time slots are selected, use them instead
      if (selectedTimes.size > 0) {
        const sortedTimes = TIME_SLOTS.filter(t => selectedTimes.has(t));
        startTime = sortedTimes[0];
        endTime = sortedTimes[sortedTimes.length - 1];
      }

      const res = await fetch('/api/admin/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: selectedDate,
          endDate: selectedDate,
          startTime,
          endTime,
          reason: preset.reason
        })
      });

      if (res.ok) {
        showToast(`${preset.label} bloqueado com sucesso!`, 'success');
        setSelectedTimes(new Set());
        fetchData();
      }
    } catch (error) {
      showToast('Erro ao bloquear', 'error');
    }
    setSaving(false);
  }

  // Toggle single time slot
  async function toggleTimeSlot(date: string, time: string) {
    const isBlocked = isTimeSlotBlocked(date, time);
    
    if (isBlocked) {
      // Find and delete the block
      const block = blockedSlots.find(b =>
        date >= b.start_date && date <= b.end_date &&
        b.start_time && b.end_time &&
        time >= b.start_time && time <= b.end_time
      );
      
      if (block && confirm('Desbloquear este horário?')) {
        await fetch(`/api/admin/blocks?id=${block.id}`, { method: 'DELETE' });
        showToast('Horário desbloqueado!', 'success');
        fetchData();
      }
    } else {
      // Add to selected times
      setSelectedTimes(prev => {
        const next = new Set(prev);
        if (next.has(time)) {
          next.delete(time);
        } else {
          next.add(time);
        }
        return next;
      });
    }
  }

  // Handle time slot drag start
  function handleTimeDragStart(time: string) {
    setTimeDragStart(time);
    setSelectedTimes(new Set([time]));
  }

  // Handle time slot drag over
  function handleTimeDragOver(time: string) {
    if (!timeDragStart) return;
    
    // Select all slots between start and current
    const startIndex = TIME_SLOTS.indexOf(timeDragStart);
    const currentIndex = TIME_SLOTS.indexOf(time);
    
    const start = Math.min(startIndex, currentIndex);
    const end = Math.max(startIndex, currentIndex);
    
    const newSelected = new Set<string>();
    for (let i = start; i <= end; i++) {
      newSelected.add(TIME_SLOTS[i]);
    }
    setSelectedTimes(newSelected);
  }

  // Handle time slot drag end
  function handleTimeDragEnd() {
    setTimeDragStart(null);
    // Keep selected slots for user to confirm
  }

  // Confirm bulk time block
  async function confirmBulkTimeBlock(reason: string = 'Indisponível') {
    if (selectedTimes.size === 0 || !selectedDate) return;
    
    setSaving(true);
    const sortedTimes = TIME_SLOTS.filter(t => selectedTimes.has(t));
    const startTime = sortedTimes[0];
    const endTime = sortedTimes[sortedTimes.length - 1];
    
    try {
      const res = await fetch('/api/admin/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: selectedDate,
          endDate: selectedDate,
          startTime,
          endTime,
          reason
        })
      });

      if (res.ok) {
        showToast('Horários bloqueados!', 'success');
        setSelectedTimes(new Set());
        fetchData();
      }
    } catch (error) {
      showToast('Erro ao bloquear', 'error');
    }
    setSaving(false);
  }

  // Cancel time selection
  function cancelTimeSelection() {
    setSelectedTimes(new Set());
  }

  // Block entire day
  async function blockEntireDay(date: string, reason: string = 'Indisponível') {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: date,
          endDate: date,
          reason
        })
      });

      if (res.ok) {
        showToast('Dia bloqueado!', 'success');
        fetchData();
      }
    } catch (error) {
      showToast('Erro ao bloquear', 'error');
    }
    setSaving(false);
  }

  // Unblock entire day
  async function unblockEntireDay(date: string) {
    const dayBlocks = blockedSlots.filter(b =>
      date >= b.start_date && date <= b.end_date
    );
    
    if (dayBlocks.length === 0) return;
    
    if (!confirm(`Desbloquear todos os ${dayBlocks.length} bloqueios deste dia?`)) return;
    
    setSaving(true);
    try {
      await Promise.all(
        dayBlocks.map(block =>
          fetch(`/api/admin/blocks?id=${block.id}`, { method: 'DELETE' })
        )
      );
      showToast('Dia desbloqueado!', 'success');
      fetchData();
    } catch (error) {
      showToast('Erro ao desbloquear', 'error');
    }
    setSaving(false);
  }

  // Original block slot handlers
  async function handleBlockSlot(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    
    try {
      const res = await fetch('/api/admin/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: blockForm.startDate,
          endDate: blockForm.endDate || blockForm.startDate,
          startTime: blockForm.startTime || null,
          endTime: blockForm.endTime || null,
          reason: blockForm.reason || null
        })
      });

      if (res.ok) {
        setShowBlockModal(false);
        setBlockForm({ startDate: '', endDate: '', startTime: '', endTime: '', reason: '' });
        showToast('Bloqueio criado!', 'success');
        fetchData();
      }
    } catch (error) {
      showToast('Erro ao criar bloqueio', 'error');
    }
    setSaving(false);
  }

  async function handleDeleteBlock(blockId: string) {
    if (!confirm('Remover este bloqueio?')) return;
    
    try {
      await fetch(`/api/admin/blocks?id=${blockId}`, { method: 'DELETE' });
      showToast('Bloqueio removido!', 'success');
      fetchData();
    } catch (error) {
      showToast('Erro ao remover', 'error');
    }
  }

  async function handleUpdateStatus(bookingId: string, newStatus: string) {
    try {
      await fetch('/api/admin/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId, status: newStatus })
      });
      showToast('Status atualizado!', 'success');
      fetchData();
      setShowBookingModal(false);
    } catch (error) {
      showToast('Erro ao atualizar', 'error');
    }
  }

  // Navigation
  function prevMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  }

  function goToToday() {
    setCurrentDate(new Date());
    setSelectedDate(new Date().toISOString().split('T')[0]);
  }

  // Get selected date bookings
  const selectedDateBookings = selectedDate 
    ? bookings.filter(b => b.booking_date === selectedDate)
    : [];

  // Get selected date blocks
  const selectedDateBlocks = selectedDate
    ? blockedSlots.filter(block => 
        selectedDate >= block.start_date && selectedDate <= block.end_date
      )
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-xl shadow-lg animate-in slide-in-from-right ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg">
                <Image src="/logo.png" alt="NomadWay" width={40} height={40} className="object-contain" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900">NomadWay</h1>
                <p className="text-xs text-gray-500">Agenda Interativa</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => router.push('/admin/bookings')} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg">
                📋 Lista
              </button>
              <button onClick={() => router.push('/admin/kanban')} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg">
                📊 Pipeline
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="px-3 py-2 hover:bg-gray-100 rounded-lg transition-all">
                  ← Anterior
                </button>
                <div className="text-center">
                  <h2 className="text-lg font-semibold">{MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                  <button onClick={goToToday} className="text-sm text-blue-600 hover:underline">
                    Ir para hoje
                  </button>
                </div>
                <button onClick={nextMonth} className="px-3 py-2 hover:bg-gray-100 rounded-lg transition-all">
                  Próximo →
                </button>
              </div>

              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {WEEKDAYS.map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth(currentDate).map((date, idx) => {
                  if (!date) {
                    return <div key={idx} className="aspect-square" />;
                  }

                  const dateStrVal = dateStr(date);
                  const dayBookings = getBookingsForDate(dateStrVal);
                  const blocked = isDateBlocked(dateStrVal);
                  const hasTimeBlocks = blockedSlots.some(b =>
                    dateStrVal >= b.start_date && dateStrVal <= b.end_date && b.start_time
                  );
                  const isToday = dateStrVal === dateStr(new Date());
                  const isSelected = dateStrVal === selectedDate;
                  const isSunday = date.getDay() === 0;

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(dateStrVal)}
                      onDoubleClick={() => {
                        if (!isSunday && !blocked) {
                          blockEntireDay(dateStrVal);
                        } else if (blocked) {
                          unblockEntireDay(dateStrVal);
                        }
                      }}
                      disabled={isSunday}
                      className={`aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all ${
                        isSunday
                          ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                          : isSelected
                          ? 'bg-blue-500 text-white ring-2 ring-blue-300 scale-105'
                          : isToday
                          ? 'bg-blue-50 text-blue-700 ring-2 ring-blue-200'
                          : blocked
                          ? 'bg-red-100 text-red-600 hover:bg-red-200'
                          : hasTimeBlocks
                          ? 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                          : dayBookings.length > 0
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'hover:bg-gray-50 border border-transparent hover:border-gray-200'
                      }`}
                    >
                      <span className="text-sm font-medium">{date.getDate()}</span>
                      {dayBookings.length > 0 && !isSunday && (
                        <span className={`text-xs ${isSelected ? 'text-white/80' : 'text-green-600'}`}>
                          {dayBookings.length}
                        </span>
                      )}
                      {blocked && !isSunday && (
                        <span className="text-xs absolute bottom-1">🚫</span>
                      )}
                      {hasTimeBlocks && !blocked && !isSunday && (
                        <span className="text-xs absolute bottom-1">🕐</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-50"></div>
                  <span className="text-gray-600">Com agendamentos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-100"></div>
                  <span className="text-gray-600">Dia bloqueado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-orange-50"></div>
                  <span className="text-gray-600">Horários bloqueados</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-50"></div>
                  <span className="text-gray-600">Hoje</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 italic">
                  💡 Duplo clique para bloquear/desbloquear dia
                </div>
              </div>
            </div>
          </div>

          {/* Day Detail */}
          <div className="space-y-4">
            {/* Date Header with Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">
                  {selectedDate 
                    ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
                    : 'Selecione uma data'
                  }
                </h3>
                {selectedDate && !isDateBlocked(selectedDate) && (
                  <div className="relative">
                    <button
                      onClick={() => setShowQuickActions(!showQuickActions)}
                      className="text-sm px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                    >
                      ⚡ Ações Rápidas
                    </button>
                    
                    {showQuickActions && (
                      <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-100 z-10 min-w-[180px] p-2 space-y-1">
                        {QUICK_BLOCKS.map((preset, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              handleQuickBlock(preset);
                              setShowQuickActions(false);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg text-sm"
                          >
                            {preset.label}
                            {preset.fullDay ? ' (dia inteiro)' : ` (${preset.startTime} - ${preset.endTime})`}
                          </button>
                        ))}
                        <div className="border-t my-2 pt-2">
                          <button
                            onClick={() => {
                              setShowBlockModal(true);
                              setBlockForm({
                                startDate: selectedDate || '',
                                endDate: selectedDate || '',
                                startTime: '',
                                endTime: '',
                                reason: ''
                              });
                              setShowQuickActions(false);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg text-sm text-red-600"
                          >
                            🚫 Bloqueio personalizado
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected Time Slots Actions */}
              {selectedTimes.size > 0 && (
                <div className="mb-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-orange-800">
                      {selectedTimes.size} horário{selectedTimes.size > 1 ? 's' : ''} selecionado{selectedTimes.size > 1 ? 's' : ''}
                    </span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Motivo (opcional)"
                        className="text-sm px-2 py-1 border border-orange-200 rounded-lg w-32"
                        id="blockReason"
                      />
                      <button
                        onClick={() => {
                          const reason = (document.getElementById('blockReason') as HTMLInputElement)?.value || 'Indisponível';
                          confirmBulkTimeBlock(reason);
                        }}
                        disabled={saving}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 disabled:opacity-50"
                      >
                        {saving ? 'Salvando...' : 'Bloquear'}
                      </button>
                      <button
                        onClick={cancelTimeSelection}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Time Slots */}
              {selectedDate && (
                <div className="space-y-1 max-h-[400px] overflow-y-auto">
                  {TIME_SLOTS.map(time => {
                    const booking = selectedDateBookings.find(b => b.booking_time === time);
                    const blocked = isTimeSlotBlocked(selectedDate, time);
                    const isSelected = selectedTimes.has(time);
                    const dayBlocked = isDateBlocked(selectedDate);

                    return (
                      <div
                        key={time}
                        className={`p-2 rounded-lg border transition-all cursor-pointer ${
                          dayBlocked
                            ? 'bg-gray-100 border-gray-200 opacity-50'
                            : isSelected
                            ? 'bg-orange-100 border-orange-300 ring-2 ring-orange-400'
                            : blocked
                            ? 'bg-red-50 border-red-200 hover:bg-red-100'
                            : booking
                            ? `${STATUS_COLORS[booking.status]} hover:opacity-80`
                            : 'bg-gray-50 border-gray-100 hover:bg-gray-100 hover:border-gray-200'
                        }`}
                        onClick={() => {
                          if (dayBlocked) return;
                          if (booking) {
                            setSelectedBooking(booking);
                            setShowBookingModal(true);
                          } else {
                            toggleTimeSlot(selectedDate, time);
                          }
                        }}
                        onMouseDown={() => {
                          if (!dayBlocked && !booking) {
                            handleTimeDragStart(time);
                          }
                        }}
                        onMouseEnter={() => {
                          if (timeDragStart && !dayBlocked && !booking) {
                            handleTimeDragOver(time);
                          }
                        }}
                        onMouseUp={() => {
                          if (timeDragStart) {
                            handleTimeDragEnd();
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{time}</span>
                          {dayBlocked && <span className="text-xs text-gray-400">Dia bloqueado</span>}
                          {blocked && !dayBlocked && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteBlock(blockedSlots.find(b =>
                                  selectedDate >= b.start_date && selectedDate <= b.end_date &&
                                  b.start_time && b.end_time &&
                                  time >= b.start_time && time <= b.end_time
                                )?.id || '');
                              }}
                              className="text-xs text-red-500 hover:text-red-700"
                            >
                              ✕ Desbloquear
                            </button>
                          )}
                          {booking && !dayBlocked && !blocked && (
                            <span className="text-xs">
                              {booking.customer_name.split(' ')[0]}
                            </span>
                          )}
                          {isSelected && !booking && !blocked && (
                            <span className="text-xs text-orange-600 font-medium">Selecionado</span>
                          )}
                        </div>
                        {booking && !dayBlocked && !blocked && (
                          <div className="text-xs opacity-75 mt-1">
                            {booking.service_name} • {formatPrice(booking.price_cents || 149990)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Quick tips */}
              <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500 space-y-1">
                <p>💡 <strong>Clique</strong> em um horário vazio para selecionar</p>
                <p>💡 <strong>Arraste</strong> para selecionar múltiplos horários</p>
                <p>💡 <strong>Clique</strong> em um bloqueio para remover</p>
                <p>💡 <strong>Duplo clique</strong> no dia para bloquear/desbloquear tudo</p>
              </div>

              {/* Blocked slots for this date */}
              {selectedDateBlocks.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Bloqueios neste dia</h4>
                  {selectedDateBlocks.map(block => (
                    <div key={block.id} className="flex items-center justify-between py-1 px-2 bg-red-50 rounded-lg mb-1">
                      <span className="text-sm text-red-700">
                        {block.start_time || 'Dia inteiro'}
                        {block.end_time && block.start_time && ` - ${block.end_time}`}
                        {block.reason && ` (${block.reason})`}
                      </span>
                      <button
                        onClick={() => handleDeleteBlock(block.id)}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Blocked Dates List */}
            {blockedSlots.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <h4 className="font-medium text-gray-900 mb-3">📅 Todos os Bloqueios</h4>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {blockedSlots.slice(0, 10).map(block => (
                    <div key={block.id} className="flex items-center justify-between py-2 px-3 bg-red-50 rounded-lg">
                      <div>
                        <div className="text-sm font-medium text-red-700">
                          {new Date(block.start_date).toLocaleDateString('pt-BR')}
                          {block.end_date !== block.start_date && (
                            <> - {new Date(block.end_date).toLocaleDateString('pt-BR')}</>
                          )}
                        </div>
                        {block.start_time && (
                          <div className="text-xs text-red-600">{block.start_time} - {block.end_time}</div>
                        )}
                        {block.reason && (
                          <div className="text-xs text-red-600">{block.reason}</div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteBlock(block.id)}
                        className="text-red-400 hover:text-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {blockedSlots.length > 10 && (
                    <div className="text-center text-sm text-gray-500 pt-2">
                      +{blockedSlots.length - 10} mais bloqueios
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Block Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowBlockModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">🚫 Bloqueio Personalizado</h3>
            <form onSubmit={handleBlockSlot} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
                  <input
                    type="date"
                    value={blockForm.startDate}
                    onChange={e => setBlockForm({ ...blockForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
                  <input
                    type="date"
                    value={blockForm.endDate}
                    onChange={e => setBlockForm({ ...blockForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horário Início (opcional)</label>
                  <select
                    value={blockForm.startTime}
                    onChange={e => setBlockForm({ ...blockForm, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Dia inteiro</option>
                    {TIME_SLOTS.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horário Fim</label>
                  <select
                    value={blockForm.endTime}
                    onChange={e => setBlockForm({ ...blockForm, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!blockForm.startTime}
                  >
                    <option value="">-</option>
                    {TIME_SLOTS.filter(t => t >= (blockForm.startTime || '00:00')).map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo (opcional)</label>
                <input
                  type="text"
                  value={blockForm.reason}
                  onChange={e => setBlockForm({ ...blockForm, reason: e.target.value })}
                  placeholder="Ex: Feriado, Férias, Compromisso..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 transition-all"
                >
                  {saving ? 'Salvando...' : 'Bloquear'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBlockModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booking Detail Modal */}
      {showBookingModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowBookingModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedBooking.customer_name}</h3>
                <p className="text-sm text-gray-500">{selectedBooking.booking_code}</p>
              </div>
              <button onClick={() => setShowBookingModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">Data/Horário</span>
                <span className="font-medium">
                  {new Date(selectedBooking.booking_date).toLocaleDateString('pt-BR')} às {selectedBooking.booking_time}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">Serviço</span>
                <span className="font-medium">{selectedBooking.service_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">Valor</span>
                <span className="font-medium text-green-600">{formatPrice(selectedBooking.price_cents || 149990)}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">Status</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_COLORS[selectedBooking.status]}`}>
                  {selectedBooking.status}
                </span>
              </div>
            </div>

            {/* Status Change */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Alterar Status</label>
              <div className="flex flex-wrap gap-2">
                {['pending', 'confirmed', 'form_sent', 'completed', 'cancelled'].map(status => (
                  <button
                    key={status}
                    onClick={() => handleUpdateStatus(selectedBooking.id, status)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium ${
                      selectedBooking.status === status
                        ? 'ring-2 ring-blue-500 '
                        : ''
                    }${STATUS_COLORS[status]}`}
                  >
                    {status === 'pending' ? '⏳ Pendente' :
                     status === 'confirmed' ? '✓ Confirmado' :
                     status === 'form_sent' ? '📝 Form Enviado' :
                     status === 'completed' ? '✅ Concluído' :
                     '❌ Cancelado'}
                  </button>
                ))}
              </div>
            </div>

            {/* WhatsApp Link */}
            <a
              href={`https://wa.me/${selectedBooking.customer_phone?.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${selectedBooking.customer_name?.split(' ')[0]}!`)}`}
              target="_blank"
              className="block w-full text-center px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600"
            >
              💬 Abrir WhatsApp
            </a>
          </div>
        </div>
      )}
    </div>
  );
}