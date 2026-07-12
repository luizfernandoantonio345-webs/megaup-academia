'use client'
import dynamic from 'next/dynamic'
const AlunoDetalhe = dynamic(() => import('@/page-components/AlunoDetalhe'), { ssr: false })
export default AlunoDetalhe
