import { useState } from 'react'
import { Pin, Trash2, Plus, Edit2, Check, X } from 'lucide-react'
import { useNotes } from '../hooks/useNotes'
import { TEAM_MEMBERS } from '../data/initialData'
import { Avatar } from '../components/Avatar'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function Notes({ currentUser }) {
  const { notes, addNote, updateNote, deleteNote, togglePin } = useNotes()
  const [newText, setNewText] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')

  const handleAdd = async () => {
    if (!newText.trim()) return
    await addNote(newText.trim(), currentUser)
    setNewText('')
  }

  const startEdit = (note) => {
    setEditingId(note.id)
    setEditText(note.content)
  }

  const saveEdit = async (id) => {
    if (!editText.trim()) return
    await updateNote(id, { content: editText.trim() })
    setEditingId(null)
  }

  const pinned = notes.filter((n) => n.pinned)
  const unpinned = notes.filter((n) => !n.pinned)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notas del equipo</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Decisiones, acuerdos, links y recordatorios compartidos
        </p>
      </div>

      {/* Nueva nota */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
        <textarea
          className="w-full text-sm text-gray-800 dark:text-gray-100 bg-transparent resize-none focus:outline-none placeholder-gray-400"
          rows={3}
          placeholder="Escribe una nota, decisión, link o acuerdo del equipo... (Enter para nueva línea, Ctrl+Enter para guardar)"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) handleAdd() }}
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handleAdd}
            disabled={!newText.trim()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            <Plus size={15} />
            Agregar nota
          </button>
        </div>
      </div>

      {notes.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">📝</p>
          <p className="text-sm mt-2">Sin notas aún. ¡Agrega la primera!</p>
        </div>
      )}

      {/* Notas fijadas */}
      {pinned.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
            <Pin size={12} /> Fijadas
          </p>
          <div className="space-y-3">
            {pinned.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                currentUser={currentUser}
                editing={editingId === note.id}
                editText={editText}
                onEditText={setEditText}
                onStartEdit={() => startEdit(note)}
                onSaveEdit={() => saveEdit(note.id)}
                onCancelEdit={() => setEditingId(null)}
                onDelete={() => deleteNote(note.id)}
                onTogglePin={() => togglePin(note)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Notas normales */}
      {unpinned.length > 0 && (
        <div>
          {pinned.length > 0 && (
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Recientes</p>
          )}
          <div className="space-y-3">
            {unpinned.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                currentUser={currentUser}
                editing={editingId === note.id}
                editText={editText}
                onEditText={setEditText}
                onStartEdit={() => startEdit(note)}
                onSaveEdit={() => saveEdit(note.id)}
                onCancelEdit={() => setEditingId(null)}
                onDelete={() => deleteNote(note.id)}
                onTogglePin={() => togglePin(note)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function NoteCard({ note, currentUser, editing, editText, onEditText,
                    onStartEdit, onSaveEdit, onCancelEdit, onDelete, onTogglePin }) {
  const author = TEAM_MEMBERS.find((m) => m.id === note.author_id)
  const isOwn  = note.author_id === currentUser

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl border shadow-sm p-4 transition-all
      ${note.pinned
        ? 'border-amber-200 dark:border-amber-700 bg-amber-50/40 dark:bg-amber-900/10'
        : 'border-gray-100 dark:border-gray-700'}`}
    >
      {editing ? (
        <div className="space-y-2">
          <textarea
            autoFocus
            className="w-full text-sm text-gray-800 dark:text-gray-100 bg-transparent border border-indigo-300 rounded-xl p-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
            rows={4}
            value={editText}
            onChange={(e) => onEditText(e.target.value)}
          />
          <div className="flex gap-2 justify-end">
            <button onClick={onSaveEdit}
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg">
              <Check size={13} /> Guardar
            </button>
            <button onClick={onCancelEdit}
              className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs font-medium px-3 py-1.5 rounded-lg">
              <X size={13} /> Cancelar
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap mb-3">
            {note.content}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar memberId={note.author_id} size="sm" />
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  {author?.name.split(' ').slice(0, 2).join(' ')}
                </p>
                <p className="text-xs text-gray-400">
                  {format(new Date(note.created_at), "d MMM HH:mm", { locale: es })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={onTogglePin}
                title={note.pinned ? 'Desfijar' : 'Fijar nota'}
                className={`p-1.5 rounded-lg transition-colors ${note.pinned ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/30' : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'}`}
              >
                <Pin size={14} />
              </button>
              {isOwn && (
                <button
                  onClick={onStartEdit}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors"
                >
                  <Edit2 size={14} />
                </button>
              )}
              {isOwn && (
                <button
                  onClick={onDelete}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
