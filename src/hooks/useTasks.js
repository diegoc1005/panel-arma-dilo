import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useTasks() {
  const [tasks, setTasks] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  // Carga inicial
  useEffect(() => {
    async function load() {
      const [tasksResult, historyResult] = await Promise.all([
        supabase.from('tasks').select('*').order('created_at', { ascending: true }),
        supabase.from('history').select('*').order('created_at', { ascending: false }),
      ])

      if (tasksResult.error) {
        console.error('[Supabase] Error al cargar tasks:', tasksResult.error)
      } else {
        console.log('[Supabase] Tasks cargadas:', tasksResult.data?.length)
      }

      if (historyResult.error) {
        console.error('[Supabase] Error al cargar history:', historyResult.error)
      }

      setTasks(tasksResult.data ?? [])
      setHistory(historyResult.data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  // Tiempo real — tareas
  useEffect(() => {
    const channel = supabase
      .channel('tasks-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tasks' }, (payload) => {
        setTasks((prev) => {
          if (prev.find((t) => t.id === payload.new.id)) return prev
          return [...prev, payload.new]
        })
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tasks' }, (payload) => {
        setTasks((prev) => prev.map((t) => (t.id === payload.new.id ? payload.new : t)))
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'tasks' }, (payload) => {
        setTasks((prev) => prev.filter((t) => t.id !== payload.old.id))
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  // Tiempo real — historial
  useEffect(() => {
    const channel = supabase
      .channel('history-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'history' }, (payload) => {
        setHistory((prev) => {
          if (prev.find((h) => h.id === payload.new.id)) return prev
          return [payload.new, ...prev]
        })
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const addHistoryEntry = useCallback(async (taskId, action, details, authorId) => {
    await supabase.from('history').insert({
      task_id: taskId,
      action,
      details,
      author_id: authorId,
    })
  }, [])

  const updateTask = useCallback(
    async (taskId, updates, authorId) => {
      const task = tasks.find((t) => t.id === taskId)
      if (!task) return

      const changed = Object.keys(updates)
        .filter((k) => JSON.stringify(task[k]) !== JSON.stringify(updates[k]))
        .map((k) => `${k}: "${task[k]}" → "${updates[k]}"`)
        .join(', ')

      await supabase
        .from('tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', taskId)

      if (changed) {
        await addHistoryEntry(taskId, 'Tarea actualizada', changed, authorId)
      }
    },
    [tasks, addHistoryEntry]
  )

  const addTask = useCallback(
    async (task, authorId) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert({ ...task, comments: [] })
        .select()
        .single()

      if (!error && data) {
        await addHistoryEntry(data.id, 'Tarea creada', `"${task.title}"`, authorId)
      }
    },
    [addHistoryEntry]
  )

  const deleteTask = useCallback(
    async (taskId, authorId) => {
      const task = tasks.find((t) => t.id === taskId)
      if (task) {
        await addHistoryEntry(taskId, 'Tarea eliminada', `"${task.title}"`, authorId)
      }
      await supabase.from('tasks').delete().eq('id', taskId)
    },
    [tasks, addHistoryEntry]
  )

  const addComment = useCallback(
    async (taskId, text, authorId) => {
      const task = tasks.find((t) => t.id === taskId)
      if (!task) return

      const comment = {
        id: Date.now(),
        text,
        author_id: authorId,
        created_at: new Date().toISOString(),
      }

      const updatedComments = [...(task.comments ?? []), comment]

      await supabase
        .from('tasks')
        .update({ comments: updatedComments, updated_at: new Date().toISOString() })
        .eq('id', taskId)

      await addHistoryEntry(
        taskId,
        'Comentario añadido',
        `"${text.slice(0, 60)}${text.length > 60 ? '...' : ''}"`,
        authorId
      )
    },
    [tasks, addHistoryEntry]
  )

  return { tasks, history, loading, updateTask, addTask, deleteTask, addComment }
}
