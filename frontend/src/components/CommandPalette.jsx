import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Users, Dumbbell, BarChart2, Calendar, Brain, DollarSign, Gift, UserPlus, X, ArrowRight, LayoutDashboard, Bell } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { listarAlunos, listarExercicios } from '../api'

const STATIC_ITEMS = [
  { id: 'nav-dashboard',    label: 'Dashboard',         icon: LayoutDashboard, to: '/dashboard',   group: 'Páginas' },
  { id: 'nav-alunos',       label: 'Alunos',            icon: Users,           to: '/alunos',      group: 'Páginas' },
  { id: 'nav-analytics',    label: 'Analytics',         icon: BarChart2,       to: '/analytics',   group: 'Páginas' },
  { id: 'nav-agenda',       label: 'Agenda',            icon: Calendar,        to: '/agenda',      group: 'Páginas' },
  { id: 'nav-ia',           label: 'IA — Progressão',   icon: Brain,           to: '/ia',          group: 'Páginas' },
  { id: 'nav-financeiro',   label: 'Financeiro',        icon: DollarSign,      to: '/financeiro',  group: 'Páginas' },
  { id: 'nav-inativos',     label: 'Alunos Inativos',   icon: Bell,            to: '/inativos',    group: 'Páginas' },
  { id: 'nav-convites',     label: 'Convidar Alunos',   icon: UserPlus,        to: '/convites',    group: 'Páginas' },
  { id: 'nav-referral',     label: 'Indique e Ganhe',   icon: Gift,            to: '/referral',    group: 'Páginas' },
]

function highlight(text, query) {
  if (!query) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: 'rgba(99,102,241,0.3)', color: '#a5b4fc', borderRadius: 3, padding: '0 2px' }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const navigate = useNavigate()

  const { data: alunos = [] } = useQuery({ queryKey: ['alunos'], queryFn: () => listarAlunos().then(r => r.data), staleTime: 60_000, enabled: open })
  const { data: exercicios = [] } = useQuery({ queryKey: ['exercicios'], queryFn: () => listarExercicios().then(r => r.data), staleTime: 300_000, enabled: open })

  const openPalette = useCallback(() => { setOpen(true); setQuery(''); setActiveIdx(0) }, [])
  const closePalette = useCallback(() => setOpen(false), [])

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        open ? closePalette() : openPalette()
      }
      if (e.key === 'Escape') closePalette()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, openPalette, closePalette])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30)
  }, [open])

  const alunoItems = alunos
    .filter(a => !query || a.nome?.toLowerCase().includes(query.toLowerCase()) || a.email?.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5)
    .map(a => ({ id: `aluno-${a.id}`, label: a.nome, sub: a.email, icon: Users, to: `/alunos/${a.id}`, group: 'Alunos' }))

  const exercicioItems = exercicios
    .filter(e => query && e.nome?.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 4)
    .map(e => ({ id: `ex-${e.id}`, label: e.nome, sub: e.grupo_muscular, icon: Dumbbell, to: '/exercicios', group: 'Exercícios' }))

  const staticFiltered = STATIC_ITEMS.filter(
    i => !query || i.label.toLowerCase().includes(query.toLowerCase())
  )

  const allItems = query
    ? [...alunoItems, ...exercicioItems, ...staticFiltered]
    : [...staticFiltered, ...alunoItems.slice(0, 3)]

  useEffect(() => { setActiveIdx(0) }, [query])

  const handleSelect = (item) => {
    navigate(item.to)
    closePalette()
  }

  const handleKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, allItems.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)) }
    if (e.key === 'Enter' && allItems[activeIdx]) { handleSelect(allItems[activeIdx]) }
  }

  useEffect(() => {
    const el = listRef.current?.children[activeIdx]
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIdx])

  const groups = allItems.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = []
    acc[item.group].push(item)
    return acc
  }, {})

  let flatIdx = 0

  return (
    <>
      {/* Trigger button — desktop header */}
      <button
        onClick={openPalette}
        aria-label="Abrir busca global (Ctrl+K)"
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12, padding: '7px 14px',
          color: '#71717A', cursor: 'pointer',
          fontSize: 13, fontFamily: 'Inter, sans-serif',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#71717A' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#71717A' }}
      >
        <Search style={{ width: 14, height: 14 }} aria-hidden="true" />
        <span>Buscar...</span>
        <kbd style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 5, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#71717A', fontFamily: 'Inter, sans-serif' }}>
          ⌘K
        </kbd>
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={closePalette}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', zIndex: 70 }}
              aria-hidden="true"
            />

            {/* Palette */}
            <motion.div
              role="dialog"
              aria-label="Busca global"
              aria-modal="true"
              initial={{ opacity: 0, y: -20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'fixed', top: '12vh', left: '50%', transform: 'translateX(-50%)',
                width: '100%', maxWidth: 580, zIndex: 71,
                background: '#111113',
                border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: 20,
                boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.1)',
                overflow: 'hidden',
              }}
            >
              {/* Input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <Search style={{ width: 18, height: 18, color: '#6366f1', flexShrink: 0 }} aria-hidden="true" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Buscar alunos, páginas, exercícios..."
                  aria-label="Buscar"
                  style={{
                    flex: 1, background: 'none', border: 'none', outline: 'none',
                    color: '#F4F4F5', fontSize: 16, fontFamily: 'Inter, sans-serif',
                  }}
                />
                {query && (
                  <button onClick={() => setQuery('')} aria-label="Limpar busca" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717A', padding: 2 }}>
                    <X style={{ width: 14, height: 14 }} />
                  </button>
                )}
                <kbd onClick={closePalette} style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#71717A', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}>
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div ref={listRef} style={{ maxHeight: 420, overflowY: 'auto', padding: '8px 0' }} role="listbox">
                {allItems.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <p style={{ color: '#71717A', fontSize: 14 }}>Nenhum resultado para "<strong style={{ color: '#71717A' }}>{query}</strong>"</p>
                  </div>
                ) : (
                  Object.entries(groups).map(([group, items]) => (
                    <div key={group}>
                      <p style={{ fontSize: 10, fontWeight: 800, color: '#52525B', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '8px 18px 4px', fontFamily: 'Inter, sans-serif' }}>
                        {group}
                      </p>
                      {items.map((item) => {
                        const idx = flatIdx++
                        const isActive = idx === activeIdx
                        return (
                          <div
                            key={item.id}
                            role="option"
                            aria-selected={isActive}
                            onClick={() => handleSelect(item)}
                            onMouseEnter={() => setActiveIdx(idx)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 12,
                              padding: '10px 18px', cursor: 'pointer',
                              background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
                              borderLeft: isActive ? '2px solid #6366f1' : '2px solid transparent',
                              transition: 'all 0.1s',
                            }}
                          >
                            <div style={{ width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: isActive ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)' }}>
                              <item.icon style={{ width: 15, height: 15, color: isActive ? '#818cf8' : '#71717A' }} aria-hidden="true" />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 14, fontWeight: 600, color: isActive ? '#F4F4F5' : '#A1A1AA', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {highlight(item.label, query)}
                              </div>
                              {item.sub && (
                                <div style={{ fontSize: 11, color: '#71717A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>
                                  {item.sub}
                                </div>
                              )}
                            </div>
                            {isActive && <ArrowRight style={{ width: 14, height: 14, color: '#6366f1', flexShrink: 0 }} aria-hidden="true" />}
                          </div>
                        )
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div style={{ padding: '10px 18px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 16, alignItems: 'center' }}>
                {[
                  { keys: ['↑', '↓'], label: 'navegar' },
                  { keys: ['↵'], label: 'selecionar' },
                  { keys: ['ESC'], label: 'fechar' },
                ].map(({ keys, label }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {keys.map(k => (
                      <kbd key={k} style={{ fontSize: 10, padding: '1px 5px', borderRadius: 4, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#71717A', fontFamily: 'Inter, sans-serif' }}>{k}</kbd>
                    ))}
                    <span style={{ fontSize: 11, color: '#52525B' }}>{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
