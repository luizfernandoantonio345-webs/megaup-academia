'use client'
import dynamic from 'next/dynamic'
const Conquistas = dynamic(() => import('@/page-components/aluno/Conquistas'), { ssr: false })
export default Conquistas
