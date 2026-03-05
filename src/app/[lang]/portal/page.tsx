'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ClientLoginPage() {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  
  // Get lang from URL path
  const lang = typeof window !== 'undefined' && window.location.pathname.includes('/en') ? 'en' : 'pt'

  const t = {
    pt: {
      title: 'Área do Cliente',
      subtitle: 'Acesse seu portal com o código recebido',
      placeholder: 'Seu código (ex: NW0219XXXX)',
      button: 'Acessar',
      error: 'Código não encontrado',
      help: 'Não tem seu código? Entre em contato.'
    },
    en: {
      title: 'Client Portal',
      subtitle: 'Access your portal with your code',
      placeholder: 'Your code (ex: NW0219XXXX)',
      button: 'Access',
      error: 'Code not found',
      help: "Don't have your code? Contact us."
    }
  }[lang]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return
    
    setLoading(true)
    setError('')
    
    try {
      const res = await fetch(`https://ymmdygffzkpduxudsfls.supabase.co/rest/v1/clients?client_code=eq.${code.toUpperCase()}&select=workspace_slug`, {
        headers: {
          apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltbWR5Z2ZmemtwZHV4dWRzZmxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNzIzMzMsImV4cCI6MjA4Njg0ODMzM30.dQw6wWYmJwNWvNdVH_BSRNPO1-V0V7DqBzKLPaLHZDk',
        }
      })
      
      const data = await res.json()
      
      if (data && data.length > 0 && data[0].workspace_slug) {
        router.push(`/${lang}/portal/${data[0].workspace_slug}`)
      } else {
        setError(t.error)
      }
    } catch {
      setError(t.error)
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
            <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
            <p className="text-gray-600 mt-2">{t.subtitle}</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder={t.placeholder}
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
              {loading ? '...' : t.button}
            </button>
          </form>
          
          <p className="text-center text-gray-500 text-sm mt-6">
            {t.help}
          </p>
        </div>
      </div>
    </main>
  )
}