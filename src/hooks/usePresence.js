import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const PRESENCE_KEY = 'arma-dilo-presence'

// Guarda "vista por última vez" para un usuario dado
export function usePresence(currentUser) {
  useEffect(() => {
    if (!currentUser) return
    const data = JSON.parse(localStorage.getItem(PRESENCE_KEY) || '{}')
    data[currentUser] = new Date().toISOString()
    localStorage.setItem(PRESENCE_KEY, JSON.stringify(data))

    // Actualizar cada 60 segundos mientras la pestaña está abierta
    const interval = setInterval(() => {
      const d = JSON.parse(localStorage.getItem(PRESENCE_KEY) || '{}')
      d[currentUser] = new Date().toISOString()
      localStorage.setItem(PRESENCE_KEY, JSON.stringify(d))
    }, 60_000)

    return () => clearInterval(interval)
  }, [currentUser])
}

// Lee las presencias guardadas
export function getPresence() {
  try {
    return JSON.parse(localStorage.getItem(PRESENCE_KEY) || '{}')
  } catch {
    return {}
  }
}
