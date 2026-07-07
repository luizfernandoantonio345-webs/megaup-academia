import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'
  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
      title={isDark ? 'Tema claro' : 'Tema escuro'}
      style={{
        width: 30, height: 30, borderRadius: 6,
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-muted)',
        flexShrink: 0,
        transition: 'border-color 0.1s, background 0.1s, color 0.1s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
    >
      {isDark
        ? <Sun  style={{ width: 14, height: 14 }} />
        : <Moon style={{ width: 14, height: 14 }} />
      }
    </button>
  )
}
