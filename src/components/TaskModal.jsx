import { useState } from 'react'
import { X, MessageSquare, User, Calendar, Tag, CheckCircle2, RotateCcw, Clock, AlertOctagon, Link, Plus, Trash2, ExternalLink } from 'lucide-react'
import { TEAM_MEMBERS, STATUSES, PRIORITIES } from '../data/initialData'
import { Avatar } from './Avatar'
import { StatusBadge, PriorityBadge, CategoryBadge } from './Badge'
import { format, parseISO, differenceInDays, isPast, isToday } from 'date-fns'
import { es } from 'date-fns/locale'

const ACTION_ICONS = {
  'Tarea creada': '✅',
  'Tarea actualizada': '✏️',
  'Tarea eliminada': '🗑️',
  'Comentario añadido': '💬',
}

function DaysChip({ dueDate, status }) {
  if (!dueDate || status === 'DONE') return null
  const date = parseISO(dueDate)
  const days = differenceInDays(date, new Date())
  if (isPast(date) && !isToday(date))
    return <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Vencida</span>
  if (isToday(date))
    return <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">¡Hoy!</span>
  if (days <= 3)
    return <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">{days}d restantes</span>
  return <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{days}d restantes</span>
}

export function TaskModal({ task, currentUser, taskHistory = [], onClose, onUpdate, onComment }) {
  const [tab, setTab] = useState('detail')
  const [editing, setEditing] = useState(false)
  const [comment, setComment] = useState('')
  const [form, setForm] = useState({ ...task })
  const [newLink, setNewLink] = useState({ url: '', label: '' })
  const [showAddLink, setShowAddLink] = useState(false)

  if (!task) return null

  const handleSave = () => {
    onUpdate(task.id, form, currentUser)
    setEditing(false)
  }

  const handleAddLink = () => {
    if (!newLink.url.trim()) return
    const url = newLink.url.startsWith('http') ? newLink.url : `https://${newLink.url}`
    const links = [...(task.links || []), { id: Date.now(), url, label: newLink.label || url }]
    onUpdate(task.id, { links }, currentUser)
    setNewLink({ url: '', label: '' })
    setShowAddLink(false)
  }

  const handleRemoveLink = (linkId) => {
    const links = (task.links || []).filter((l) => l.id !== linkId)
    onUpdate(task.id, { links }, currentUser)
  }

  const handleToggleDone = () => {
    const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE'
    onUpdate(task.id, { status: newStatus }, currentUser)
    onClose()
  }

  const handleComment = () => {
    if (!comment.trim()) return
    onComment(task.id, comment.trim(), currentUser)
    setComment('')
  }

  const assignee = TEAM_MEMBERS.find((m) => m.id === task.assignee_id)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100 shrink-0">
          <div className="flex-1 mr-4">
            {editing ? (
              <input
                className="w-full text-xl font-bold text-gray-900 border-b-2 border-indigo-400 focus:outline-none pb-1"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            ) : (
              <h2 className="text-xl font-bold text-gray-900">{task.title}</h2>
            )}
            {/* Days chip under title */}
            <div className="mt-1.5">
              <DaysChip dueDate={task.due_date} status={task.status} />
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X size={22} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6 shrink-0">
          <button
            onClick={() => setTab('detail')}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              tab === 'detail' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Detalle
          </button>
          <button
            onClick={() => setTab('history')}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              tab === 'history' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Clock size={14} />
            Historial
            {taskHistory.length > 0 && (
              <span className="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">{taskHistory.length}</span>
            )}
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {/* ── TAB: DETALLE ── */}
          {tab === 'detail' && (
            <div className="p-6 space-y-6">
              {/* Meta info */}
              <div className="flex flex-wrap gap-3">
                {editing ? (
                  <>
                    <select
                      className="text-xs border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                    >
                      {Object.entries(STATUSES).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                    <select
                      className="text-xs border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    >
                      {Object.entries(PRIORITIES).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                    <select
                      className="text-xs border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      value={form.assignee_id}
                      onChange={(e) => setForm({ ...form, assignee_id: Number(e.target.value) })}
                    >
                      {TEAM_MEMBERS.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                    <input
                      type="date"
                      className="text-xs border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      value={form.due_date}
                      onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                    />
                  </>
                ) : (
                  <>
                    <StatusBadge status={task.status} />
                    <PriorityBadge priority={task.priority} />
                    <CategoryBadge category={task.category} />
                  </>
                )}
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-sm">
                  <User size={15} className="text-gray-400" />
                  <span className="text-gray-500">Responsable:</span>
                  <Avatar memberId={task.assignee_id} size="sm" />
                  <span className="text-gray-700 font-medium text-xs">{assignee?.name.split(' ')[0]}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={15} className="text-gray-400" />
                  <span className="text-gray-500">Límite:</span>
                  <span className="text-gray-700 font-medium">
                    {task.due_date
                      ? format(parseISO(task.due_date), "d 'de' MMM", { locale: es })
                      : 'Sin fecha'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm col-span-2">
                  <Tag size={15} className="text-gray-400" />
                  <span className="text-gray-500">Categoría:</span>
                  <span className="text-gray-700 font-medium">{task.category}</span>
                </div>
              </div>

              {/* Blocked reason */}
              {task.status === 'BLOCKED' && task.blocked_reason && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                  <AlertOctagon size={15} className="text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-red-700 mb-0.5">Motivo del bloqueo</p>
                    <p className="text-sm text-red-600">{task.blocked_reason}</p>
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Descripción</h3>
                {editing ? (
                  <textarea
                    className="w-full border rounded-xl p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                    rows={4}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                ) : (
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {task.description || 'Sin descripción.'}
                  </p>
                )}
              </div>

              {/* Links */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Link size={14} /> Links adjuntos
                  </h3>
                  <button
                    onClick={() => setShowAddLink(!showAddLink)}
                    className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <Plus size={12} /> Agregar
                  </button>
                </div>

                {showAddLink && (
                  <div className="flex flex-col gap-2 mb-3 bg-gray-50 rounded-xl p-3">
                    <input
                      className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      placeholder="URL (ej. https://figma.com/...)"
                      value={newLink.url}
                      onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
                    />
                    <input
                      className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      placeholder="Etiqueta (ej. Figma, Drive, GitHub...)"
                      value={newLink.label}
                      onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
                    />
                    <div className="flex gap-2">
                      <button onClick={handleAddLink}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">
                        Guardar link
                      </button>
                      <button onClick={() => { setShowAddLink(false); setNewLink({ url: '', label: '' }) }}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {(task.links || []).length === 0 && !showAddLink && (
                  <p className="text-xs text-gray-400 italic">Sin links adjuntos. Agrega Figma, Drive, GitHub, etc.</p>
                )}

                <div className="flex flex-wrap gap-2">
                  {(task.links || []).map((link) => (
                    <div key={link.id} className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-1.5 group">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-medium text-indigo-700 hover:text-indigo-900 transition-colors"
                      >
                        <ExternalLink size={11} />
                        {link.label}
                      </a>
                      <button
                        onClick={() => handleRemoveLink(link.id)}
                        className="text-indigo-300 hover:text-red-500 transition-colors ml-1 opacity-0 group-hover:opacity-100"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-wrap gap-2">
                {!editing && (
                  <>
                    <button
                      onClick={handleToggleDone}
                      className={`flex items-center gap-2 font-medium text-sm px-4 py-2 rounded-lg transition-colors
                        ${task.status === 'DONE'
                          ? 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                    >
                      {task.status === 'DONE'
                        ? <><RotateCcw size={15} /> Marcar como pendiente</>
                        : <><CheckCircle2 size={15} /> Marcar como hecha</>
                      }
                    </button>
                    <button
                      onClick={() => onUpdate(task.id, {
                        status: task.status === 'BLOCKED' ? 'TODO' : 'BLOCKED',
                        blocked_reason: task.status === 'BLOCKED' ? null : (prompt('¿Por qué está bloqueada?') || 'Sin especificar')
                      }, currentUser)}
                      className={`flex items-center gap-2 font-medium text-sm px-4 py-2 rounded-lg transition-colors
                        ${task.status === 'BLOCKED'
                          ? 'bg-red-100 hover:bg-red-200 text-red-700'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                        }`}
                    >
                      <AlertOctagon size={15} />
                      {task.status === 'BLOCKED' ? 'Desbloquear' : 'Marcar bloqueada'}
                    </button>
                  </>
                )}
                {editing ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                      Guardar cambios
                    </button>
                    <button
                      onClick={() => { setEditing(false); setForm({ ...task }) }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    Editar tarea
                  </button>
                )}
              </div>

              {/* Comments */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <MessageSquare size={15} />
                  Comentarios ({task.comments?.length || 0})
                </h3>
                <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                  {(task.comments || []).length === 0 && (
                    <p className="text-sm text-gray-400 italic">Sin comentarios aún.</p>
                  )}
                  {(task.comments || []).map((c) => {
                    const author = TEAM_MEMBERS.find((m) => m.id === c.author_id)
                    return (
                      <div key={c.id} className="flex gap-3">
                        <Avatar memberId={c.author_id} size="sm" />
                        <div className="flex-1 bg-gray-50 rounded-xl p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-gray-700">{author?.name.split(' ')[0]}</span>
                            <span className="text-xs text-gray-400">
                              {format(new Date(c.created_at), 'd MMM HH:mm', { locale: es })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{c.text}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="flex gap-2">
                  <input
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    placeholder="Escribe un comentario..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                  />
                  <button
                    onClick={handleComment}
                    disabled={!comment.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                  >
                    Enviar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: HISTORIAL ── */}
          {tab === 'history' && (
            <div className="p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Clock size={15} />
                Historial de esta tarea
              </h3>
              {taskHistory.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <Clock size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Sin cambios registrados aún.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {taskHistory.map((entry) => {
                    const icon = ACTION_ICONS[entry.action] || '📌'
                    return (
                      <div key={entry.id} className="flex items-start gap-3">
                        <span className="text-lg mt-0.5 shrink-0">{icon}</span>
                        <div className="flex-1 bg-gray-50 rounded-xl p-3">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <Avatar memberId={entry.author_id} size="sm" />
                            <span className="text-xs font-semibold text-gray-700">
                              {TEAM_MEMBERS.find((m) => m.id === entry.author_id)?.name.split(' ')[0]}
                            </span>
                            <span className="text-xs text-gray-500">{entry.action}</span>
                            <span className="ml-auto text-xs text-gray-400">
                              {format(new Date(entry.created_at), "d MMM 'a las' HH:mm", { locale: es })}
                            </span>
                          </div>
                          {entry.details && (
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{entry.details}</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
