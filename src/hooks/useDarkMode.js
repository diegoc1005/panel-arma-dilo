import { useState, useEffect } from 'react'

export function useDarkMode() {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('arma-dilo-dark') === 'true'
  })

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('arma-dilo-dark', dark)
  }, [dark])

  return [dark, setDark]
}
