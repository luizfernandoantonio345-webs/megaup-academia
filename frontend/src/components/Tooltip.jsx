import { useState, useRef } from 'react'

export default function Tooltip({ children, content, delay = 300, placement = 'top' }) {
  const [visible, setVisible] = useState(false)
  const timer = useRef(null)

  const show = () => { timer.current = setTimeout(() => setVisible(true), delay) }
  const hide = () => { clearTimeout(timer.current); setVisible(false) }

  const posStyle = placement === 'bottom'
    ? { top: 'calc(100% + 6px)', bottom: 'auto' }
    : { bottom: 'calc(100% + 6px)', top: 'auto' }

  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}
    >
      {children}
      {visible && content && (
        <span style={{
          position: 'absolute', ...posStyle, left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          borderRadius: 6, padding: '4px 8px',
          fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)',
          whiteSpace: 'nowrap', pointerEvents: 'none',
          boxShadow: 'var(--shadow-md)',
          animation: 'fadeIn 0.1s ease both',
          zIndex: 50,
        }} role="tooltip">
          {content}
        </span>
      )}
    </span>
  )
}
