import { useState } from 'react'
import { X, Link as LinkIcon } from 'lucide-react'
import { TEAM_MEMBERS, STATUSES, PRIORITIES } from '../data/initialData'

const CATEGORIES = [
  'Documentación', 'Gestión', 'Planificación', 'Arquitectura',
  'Diagramas', 'Base de datos', 'Análisis', 'Requerimientos',
  'Diseño', 'Testing', 'Costos', 'Factibilidad', 'Presentación',
  'Entrega', 'General',
]

export function AddTaskModal({ onClose, onAdd, currentUser }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    assignee_id: currentUser,
    status: 'TODO',
    priority: 'MEDIUM',
    due_date: '',
    category: 'General',
  })
  const [linkUrl, setLinkUrl] = useState('')
  const [linkLabel, setLinkLabel] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return

    const links = []
    if (linkUrl.trim()) {
      const url = linkUrl.startsWith('http') ? linkUrl.trim() : `https://${linkUrl.trim()}`
      links.push({ id: Date.now(), url, label: linkLabel.trim() || url })
    }

    onAdd({ ...form, assignee_id: Number(form.assignee_id), links }, currentUser)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Nueva tarea</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="¿Qué hay que hacer?"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
              placeholder="Detalles de la tarea..."
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
              <select
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={form.assignee_id}
                onChange={(e) => setForm({ ...form, assignee_id: e.target.value })}
              >
                {TEAM_MEMBERS.map((m) => (
                  <option key={m.id} value={m.id}>{m.name.split(' ').slice(0, 2).join(' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {Object.entries(STATUSES).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
              <select
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                {Object.entries(PRIORITIES).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha límite</label>
              <input
                type="date"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
              <LinkIcon size={13} className="text-indigo-600" />
              <span>Adjuntar enlace (opcional)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="URL (ej: figma.com/..., drive.google.com/...)"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
              <input
                className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="Nombre (ej: Prototipo Figma, SRS en Drive)"
                value={linkLabel}
                onChange={(e) => setLinkLabel(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-xl transition-colors"
            >
              Crear tarea
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-xl transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
