'use client'
import dynamic from 'next/dynamic'
const TreinoHoje = dynamic(() => import('@/page-components/aluno/TreinoHoje'), { ssr: false })
export default TreinoHoje
