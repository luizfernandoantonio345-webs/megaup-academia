'use client'
import dynamic from 'next/dynamic'
const RelatorioAluno = dynamic(() => import('@/page-components/RelatorioAluno'), { ssr: false })
export default RelatorioAluno
