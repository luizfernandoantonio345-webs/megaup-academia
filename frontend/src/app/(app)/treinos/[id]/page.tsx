'use client'
import dynamic from 'next/dynamic'
const TreinoDetalhe = dynamic(() => import('@/page-components/TreinoDetalhe'), { ssr: false })
export default TreinoDetalhe
