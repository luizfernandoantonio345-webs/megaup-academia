'use client'
import dynamic from 'next/dynamic'
const Periodizacao = dynamic(() => import('@/page-components/Periodizacao'), { ssr: false })
export default Periodizacao
