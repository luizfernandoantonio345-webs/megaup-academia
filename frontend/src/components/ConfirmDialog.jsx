import { X, AlertTriangle } from 'lucide-react'
import { useEffect } from 'react'

export default function ConfirmDialog({
  open, title, message,
  confirmLabel = 'Confirmar', cancelLabel = 'Cancelar',
  onConfirm, onCancel, danger = false,
}) {
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onCancel?.() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onCancel])

  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} onClick={onCancel} />
      <div className="modal-sheet animate-scale-in" style={{ position: 'relative', zIndex: 1, maxWidth: 380, width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: message ? 10 : 20 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, flexShrink: 0,
            background: danger ? 'var(--color-danger-muted)' : 'var(--bg-elevated)',
            border: `1px solid ${danger ? 'var(--color-danger-border)' : 'var(--border)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AlertTriangle style={{ width: 16, height: 16, color: danger ? 'var(--color-danger)' : 'var(--text-muted)' }} />
          </div>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0, flex: 1 }}>{title}</h2>
          <button onClick={onCancel} style={{ width: 26, height: 26, borderRadius: 5, background: 'transparent', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <X style={{ width: 13, height: 13 }} />
          </button>
        </div>
        {message && <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 20, marginLeft: 48 }}>{message}</p>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={onCancel}>{cancelLabel}</button>
          <button className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
