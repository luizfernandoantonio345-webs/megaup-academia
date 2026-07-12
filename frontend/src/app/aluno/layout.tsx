'use client'

import { type ReactNode } from 'react'
import { AlunoGuard } from '@/app/(app)/aluno-layout'

export default function AlunoLayout({ children }: { children: ReactNode }) {
  return <AlunoGuard>{children}</AlunoGuard>
}
