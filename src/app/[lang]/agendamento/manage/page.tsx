'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function ManageBookingContent() {
  const searchParams = useSearchParams()
  const code = searchParams.get('code')
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  useEffect(() => {
    if (code) {
      fetchBooking()
    } else {
      setLoading(false)
      setError('Código do agendamento não informado')
    }
  }, [code])

  const fetchBooking = async () => {
    try {
      const res = await fetch(`https://nomadway-api.vercel.app/api/booking/${code}`)
      const data = await res.json()
      
      if (data.success) {
        setBooking(data.booking)
      } else {
        setError('Agendamento não encontrado')
      }
    } catch (err) {
      setError('Erro ao carregar agendamento')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    setShowCancelConfirm(false)
    setCancelling(true)
    setError('')
    
    try {
      const res = await fetch(`https://nomadway-api.vercel.app/api/booking/${code}/cancel`, {
        method: 'POST'
      })
      const data = await res.json()
      
      if (data.success) {
        setSuccess('Agendamento cancelado com sucesso!')
        setBooking({ ...booking, status: 'cancelled' })
      } else {
        setError(data.error || 'Erro ao cancelar')
      }
    } catch (err) {
      setError('Erro ao cancelar agendamento')
    } finally {
      setCancelling(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00')
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
    return `${days[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`
  }

  const getStatusInfo = (status: string) => {
    const info: Record<string, { label: string; color: string; bg: string; border: string; icon: string; description: string }> = {
      pending: {
        label: 'Pendente',
        color: 'text-yellow-700',
        bg: 'bg-gradient-to-r from-yellow-50 to-amber-50',
        border: 'border-yellow-200',
        icon: '⏳',
        description: 'Aguardando confirmação'
      },
      confirmed: {
        label: 'Confirmado',
        color: 'text-green-700',
        bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
        border: 'border-green-200',
        icon: '✅',
        description: 'Tudo certo! Vejo você em breve.'
      },
      cancelled: {
        label: 'Cancelado',
        color: 'text-red-700',
        bg: 'bg-gradient-to-r from-red-50 to-rose-50',
        border: 'border-red-200',
        icon: '❌',
        description: 'Este agendamento foi cancelado'
      },
      completed: {
        label: 'Concluído',
        color: 'text-blue-700',
        bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
        border: 'border-blue-200',
        icon: '🎉',
        description: 'Sessão realizada com sucesso!'
      }
    }
    return info[status] || info.pending
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Carregando seu agendamento...</p>
        </div>
      </div>
    )
  }

  // Error state - booking not found
  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center animate-fade-in">
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🔍</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Agendamento não encontrado</h1>
          <p className="text-gray-600 mb-8">{error || 'Verifique se o código está correto'}</p>
          <a 
            href="https://nomadway.com.br" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            <span>←</span>
            Voltar para o site
          </a>
        </div>
      </div>
    )
  }

  const statusInfo = getStatusInfo(booking?.status)
  const canCancel = booking?.status === 'pending' || booking?.status === 'confirmed'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="max-w-lg mx-auto relative">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm mb-4">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-600">Gerenciar Agendamento</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-xl overflow-hidden border border-white/50 animate-fade-in">
          {/* Status Header */}
          <div className={`${statusInfo.bg} ${statusInfo.border} border-b px-6 py-5`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{statusInfo.icon}</span>
                <div>
                  <p className={`font-bold text-lg ${statusInfo.color}`}>{statusInfo.label}</p>
                  <p className="text-sm text-gray-600">{statusInfo.description}</p>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur px-3 py-1.5 rounded-lg">
                <p className="text-xs text-gray-500 font-mono">{booking?.code}</p>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 px-6 py-4 animate-slide-in">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600">✓</span>
                </div>
                <p className="text-green-700 font-medium">{success}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-rose-50 border-b border-red-200 px-6 py-4 animate-slide-in">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600">⚠</span>
                </div>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Booking Details */}
          <div className="p-6">
            {/* Service Card */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-5 text-white mb-6 shadow-lg shadow-blue-500/30">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-blue-100 text-sm mb-1">Serviço</p>
                  <p className="font-bold text-xl">{booking?.service}</p>
                </div>
                <div className="bg-white/20 backdrop-blur px-3 py-1.5 rounded-lg">
                  <p className="text-sm font-medium">{booking?.price || 'Grátis'}</p>
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid gap-4">
              {/* Date */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📅</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-500 mb-0.5">Data</p>
                  <p className="font-semibold text-gray-900">{booking?.date && formatDate(booking.date)}</p>
                </div>
              </div>

              {/* Time */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🕐</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-500 mb-0.5">Horário</p>
                  <p className="font-semibold text-gray-900">{booking?.time?.substring(0, 5)} <span className="text-gray-500 font-normal">(Horário de Madrid)</span></p>
                </div>
              </div>

              {/* Duration hint */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">⏱️</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-500 mb-0.5">Duração</p>
                  <p className="font-semibold text-gray-900">{booking?.duration || '30-60'} minutos</p>
                </div>
              </div>
            </div>

            {/* Info box for confirmed */}
            {booking?.status === 'confirmed' && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div className="flex items-start gap-3">
                  <span className="text-xl">💡</span>
                  <div>
                    <p className="font-medium text-gray-900 mb-1">Dica</p>
                    <p className="text-sm text-gray-600">
                      No horário combinado, entraremos em contato via email. Certifique-se de estar em um local tranquilo.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          {canCancel && (
            <div className="border-t border-gray-100 px-6 py-5 space-y-3 bg-gray-50/50">
              <button
                onClick={() => window.location.href = 'https://nomadway.com.br/pt/agendamento/booking'}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
              >
                <span>📅</span>
                Reagendar para outro horário
              </button>
              
              <button
                onClick={() => setShowCancelConfirm(true)}
                disabled={cancelling}
                className="w-full bg-white hover:bg-red-50 text-red-600 font-medium py-3 px-6 rounded-xl border border-red-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {cancelling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    Cancelando...
                  </>
                ) : (
                  <>
                    <span>❌</span>
                    Cancelar este agendamento
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <div className="bg-white/80 backdrop-blur rounded-2xl p-5 border border-white/50 shadow-sm">
            <p className="text-gray-600 mb-3">Precisa de ajuda?</p>
            <a
              href="mailto:contato@nomadway.com.br"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                📧
              </span>
              contato@nomadway.com.br
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <a href="https://nomadway.com.br" className="text-sm text-gray-500 hover:text-gray-700">
            ← Voltar para nomadway.com.br
          </a>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-slide-up">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Cancelar agendamento?</h3>
              <p className="text-gray-600 mb-6">
                Esta ação não pode ser desfeita. Você precisará fazer um novo agendamento se mudar de ideia.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="py-3 px-4 rounded-xl border border-gray-200 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Manter agendamento
                </button>
                <button
                  onClick={handleCancel}
                  className="py-3 px-4 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                >
                  Sim, cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // Add CSS animations
  const style = document.createElement('style')
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(-10px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    .animate-slide-in { animation: slideIn 0.3s ease-out; }
    .animate-slide-up { animation: slideUp 0.3s ease-out; }
  `
  if (!document.head.querySelector('style[data-animations]')) {
    style.setAttribute('data-animations', 'true')
    document.head.appendChild(style)
  }

  return null
}

export default function ManageBookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Carregando...</p>
        </div>
      </div>
    }>
      <ManageBookingContent />
    </Suspense>
  )
}