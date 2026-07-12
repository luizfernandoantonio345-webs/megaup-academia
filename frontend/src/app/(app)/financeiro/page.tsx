'use client'
import dynamic from 'next/dynamic'
const Financeiro = dynamic(() => import('@/page-components/Financeiro'), { ssr: false })
export default Financeiro
