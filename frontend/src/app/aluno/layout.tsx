'use client'

import { type ReactNode } from 'react'
import { AlunoGuard } from '@/app/(app)/aluno-layout'
import dynamic from 'next/dynamic'

const LayoutAluno = dynamic(() => import('@/page-components/aluno/LayoutAluno'), { ssr: false })

export default function AlunoLayout({ children }: { children: ReactNode }) {
  return (
    <AlunoGuard>
      <LayoutAluno>{children}</LayoutAluno>
    </AlunoGuard>
  )
}
