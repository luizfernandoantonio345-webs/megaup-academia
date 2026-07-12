'use client'
import dynamic from 'next/dynamic'
const Alunos = dynamic(() => import('@/page-components/Alunos'), { ssr: false })
export default Alunos
