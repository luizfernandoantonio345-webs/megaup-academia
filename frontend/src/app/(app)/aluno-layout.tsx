'use client'

import { useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

function Spinner() {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page)' }}>
      <div style={{ width: 28, height: 28, border: '2px solid var(--border)', borderTopColor: '#E8342B', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  )
}

export function AlunoGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, authReady, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authReady) return
    if (!isAuthenticated) { router.replace('/login'); return }
    if (user?.role !== 'aluno') { router.replace('/dashboard'); return }
  }, [authReady, isAuthenticated, user?.role, router])

  if (!authReady || !isAuthenticated || user?.role !== 'aluno') return <Spinner />
  return <>{children}</>
}
