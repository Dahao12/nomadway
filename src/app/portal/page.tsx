'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PortalLoginPage() {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/validate-code?code=${encodeURIComponent(code)}`)
      const data = await res.json()

      if (data.valid && data.client?.workspace_slug) {
        router.push(`/portal/${data.client.workspace_slug}`)
      } else {
        setError(data.error || 'Código não encontrado')
      }
    } catch {
      setError('Erro ao verificar código')
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
              <span className="text-white text-2xl font-bold">N</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Área do Cliente</h1>
            <p className="text-gray-600 mt-2">Acesse seu portal com o código recebido</p>
          </div>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Seu código (ex: NW0219XXXX)"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-0 outline-none transition-colors text-center text-lg font-mono tracking-wider"
            />

            {error && (
              <p className="text-red-500 text-sm text-center mt-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full mt-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? 'Verificando...' : 'Acessar'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Não tem seu código? Entre em contato pelo{' '}
            <a href="https://wa.me/34612455982" className="text-blue-600 hover:underline">
              WhatsApp
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}