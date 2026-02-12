'use client'

import { useEffect } from 'react'

export default function TypebotEmbed() {
  useEffect(() => {
    // Inject Typebot script
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/@typebot.io/js'
    script.type = 'module'
    document.body.appendChild(script)

    // Initialize Typebot
    const initTypebot = () => {
      if ((window as any).Typebot) {
        (window as any).Typebot.init({
          typebot: 'nomadway-bot',
          apiHost: 'https://bot.nomadway.app',
          theme: {
            button: {
              backgroundColor: '#FF6B35',
              size: 'large',
            },
            chatWindow: {
              welcomeMessage: '',
              backgroundColor: '#1a1a2e',
            },
          },
        })
      }
    }

    // Wait for script to load
    script.onload = initTypebot

    // Cleanup
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  return null // Component renders nothing (self-initializing)
}