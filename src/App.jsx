import { useState, useRef, useEffect } from 'react'
import {
  LayoutDashboard, Kanban as KanbanIcon, List, Clock,
  Users, ChevronDown, Menu, CalendarRange, StickyNote, Moon, Sun, Search,
} from 'lucide-react'
import { useTasks } from './hooks/useTasks'
import { useNotes } from './hooks/useNotes'
import { useDarkMode } from './hooks/useDarkMode'
import { usePresence } from './hooks/usePresence'
import { useDocumentTitle } from './hooks/useDocumentTitle'
import { TEAM_MEMBERS } from './data/initialData'
import { Dashboard } from './pages/Dashboard'
import { Kanban } from './pages/Kanban'
import { TaskList } from './pages/TaskList'
import { History } from './pages/History'
import { Team } from './pages/Team'
import { Timeline } from './pages/Timeline'
import { Notes } from './pages/Notes'
import { GlobalSearch } from './components/GlobalSearch'
import { DueReminderBanner } from './components/DueReminderBanner'
import { ErrorBoundary } from './components/ErrorBoundary'

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { key: 'kanban',    label: 'Kanban',      icon: KanbanIcon },
  { key: 'tasks',     label: 'Tareas',      icon: List },
  { key: 'timeline',  label: 'Timeline',    icon: CalendarRange },
  { key: 'history',   label: 'Historial',   icon: Clock },
  { key: 'team',      label: 'Equipo',      icon: Users },
  { key: 'notes',     label: 'Notas',       icon: StickyNote },
]

export default function App() {
  const { tasks, history, loading, updateTask, addTask, deleteTask, addComment } = useTasks()
  const { notes, addNote, updateNote, deleteNote, togglePin } = useNotes()
  const [dark, setDark] = useDarkMode()
  const [page, setPage] = useState('dashboard')
  const [currentUser, setCurrentUser] = useState(1)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [taskFilter, setTaskFilter] = useState('all')
  const menuRef = useRef(null)

  // Hooks de utilidad
  useDocumentTitle(tasks)
  usePresence(currentUser)

  const user = TEAM_MEMBERS.find((m) => m.id === currentUser)
  const doneCount = tasks.filter((t) => t.status === 'DONE').length
  const blockedCount = tasks.filter((t) => t.status === 'BLOCKED').length

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowUserMenu(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Ctrl+K para abrir búsqueda global
  useEffect(() => {
    function handleKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setShowSearch(true)
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold text-lg mx-auto mb-4 animate-pulse">
            AD
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Cargando panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex transition-colors duration-200">

      {/* ── Sidebar ── */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 flex flex-col transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}>

        {/* Logo */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
              AD
            </div>
            <div className="min-w-0">
              <p className="font-bold text-gray-900 dark:text-white text-sm">Arma-dilo</p>
              <p className="text-xs text-gray-400">Equipo 6 · IS</p>
            </div>
            <div className="ml-auto text-right shrink-0">
              <p className="text-xs font-bold text-indigo-600">{doneCount}/{tasks.length}</p>
              <p className="text-xs text-gray-400">tareas ✓</p>
            </div>
          </div>
          {/* Alerta de bloqueadas en sidebar */}
          {blockedCount > 0 && (
            <div className="mt-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2 flex items-center gap-2">
              <span className="text-sm">🚫</span>
              <p className="text-xs text-red-700 dark:text-red-400 font-medium">
                {blockedCount} tarea{blockedCount > 1 ? 's' : ''} bloqueada{blockedCount > 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setPage(key); setSidebarOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                ${page === key
                  ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              <Icon size={18} />
              {label}
              {key === 'notes' && (
                <span className="ml-auto bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 text-xs px-1.5 rounded-full">nuevo</span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 lg:px-8 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700">
              <Menu size={20} />
            </button>
            <span className="font-semibold text-gray-700 dark:text-gray-200 text-sm hidden sm:block">
              {NAV_ITEMS.find((n) => n.key === page)?.label}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Search button */}
            <button
              onClick={() => setShowSearch(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm text-gray-400 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-xl transition-colors"
            >
              <Search size={15} />
              <span className="text-xs">Buscar...</span>
              <kbd className="text-xs bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 px-1.5 py-0.5 rounded">⌃K</kbd>
            </button>
            <button
              onClick={() => setShowSearch(true)}
              className="sm:hidden p-2 rounded-xl text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Search size={18} />
            </button>
            {/* Dark mode toggle */}
            <button
              onClick={() => setDark(!dark)}
              className="p-2 rounded-xl text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={dark ? 'Modo claro' : 'Modo oscuro'}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* User selector */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: user?.color }}>
                  {user?.initials}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 leading-tight">
                    {user?.name.split(' ').slice(0, 2).join(' ')}
                  </p>
                  <p className="text-xs text-gray-400 leading-tight">{user?.role}</p>
                </div>
                <ChevronDown size={14} className={`text-gray-400 shrink-0 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {showUserMenu && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden z-50">
                  <div className="px-3 py-2 border-b border-gray-50 dark:border-gray-700">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Cambiar sesión</p>
                  </div>
                  {TEAM_MEMBERS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => { setCurrentUser(m.id); setShowUserMenu(false) }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                        ${m.id === currentUser ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}`}
                    >
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ backgroundColor: m.color }}>
                        {m.initials}
                      </div>
                      <div className="text-left min-w-0">
                        <p className={`text-sm font-medium truncate ${m.id === currentUser ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-800 dark:text-gray-100'}`}>
                          {m.name.split(' ').slice(0, 2).join(' ')}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{m.role}</p>
                      </div>
                      {m.id === currentUser && <span className="ml-auto text-indigo-500 text-xs font-bold">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Due Reminder Banner */}
        <DueReminderBanner
          tasks={tasks}
          currentUser={currentUser}
          onNavigate={(p, filter) => {
            setPage(p)
            if (filter) setTaskFilter(filter)
          }}
        />

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <ErrorBoundary key={page}>
            {page === 'dashboard' && <Dashboard tasks={tasks} history={history} />}
            {page === 'kanban'    && (
              <Kanban tasks={tasks} history={history} currentUser={currentUser}
                onUpdate={updateTask} onAdd={addTask} onComment={addComment} />
            )}
            {page === 'tasks'    && (
              <TaskList
                key={`${currentUser}-${taskFilter}`}
                tasks={tasks}
                history={history}
                currentUser={currentUser}
                defaultFilterMember={taskFilter}
                onUpdate={updateTask}
                onAdd={addTask}
                onDelete={deleteTask}
                onComment={addComment}
              />
            )}
            {page === 'timeline' && <Timeline tasks={tasks} />}
            {page === 'history'  && <History history={history} tasks={tasks} />}
            {page === 'team'     && <Team tasks={tasks} />}
            {page === 'notes'    && (
              <Notes
                notes={notes}
                currentUser={currentUser}
                onAdd={addNote}
                onUpdate={updateNote}
                onDelete={deleteNote}
                onTogglePin={togglePin}
              />
            )}
          </ErrorBoundary>
        </main>
      </div>

      {/* Global Search */}
      {showSearch && (
        <GlobalSearch
          tasks={tasks}
          notes={notes}
          history={history}
          onNavigate={(p) => setPage(p)}
          onClose={() => setShowSearch(false)}
        />
      )}
    </div>
  )
}
