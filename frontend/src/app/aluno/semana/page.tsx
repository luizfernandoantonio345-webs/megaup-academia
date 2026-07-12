'use client'
import dynamic from 'next/dynamic'
const SemanaTreinos = dynamic(() => import('@/page-components/aluno/SemanaTreinos'), { ssr: false })
export default SemanaTreinos
