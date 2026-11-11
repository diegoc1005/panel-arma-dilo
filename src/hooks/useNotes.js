import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useNotes() {
  const [notes, setNotes] = useState([])

  useEffect(() => {
    supabase
      .from('notes')
      .select('*')
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .then(({ data }) => setNotes(data ?? []))

    const channel = supabase
      .channel('notes-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notes' }, (p) => {
        setNotes((prev) => prev.find((n) => n.id === p.new.id) ? prev : [p.new, ...prev])
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notes' }, (p) => {
        setNotes((prev) => prev.map((n) => n.id === p.new.id ? p.new : n))
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'notes' }, (p) => {
        setNotes((prev) => prev.filter((n) => n.id !== p.old.id))
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const addNote = useCallback(async (content, authorId) => {
    await supabase.from('notes').insert({ content, author_id: authorId, pinned: false })
  }, [])

  const updateNote = useCallback(async (id, updates) => {
    await supabase.from('notes').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id)
  }, [])

  const deleteNote = useCallback(async (id) => {
    await supabase.from('notes').delete().eq('id', id)
  }, [])

  const togglePin = useCallback(async (note) => {
    await supabase.from('notes').update({ pinned: !note.pinned }).eq('id', note.id)
  }, [])

  return { notes, addNote, updateNote, deleteNote, togglePin }
}
