import { useEffect } from 'react'

export function useDocumentTitle(tasks) {
  useEffect(() => {
    if (!tasks || tasks.length === 0) return
    const done  = tasks.filter((t) => t.status === 'DONE').length
    const total = tasks.length
    document.title = `[${done}/${total}] Panel Arma-dilo`
  }, [tasks])
}
