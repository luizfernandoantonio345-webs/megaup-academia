'use client'
import dynamic from 'next/dynamic'
const NutricaoAluno = dynamic(() => import('@/page-components/aluno/NutricaoAluno'), { ssr: false })
export default NutricaoAluno
