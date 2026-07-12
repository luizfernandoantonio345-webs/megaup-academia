'use client'
import dynamic from 'next/dynamic'
const Termos = dynamic(() => import('@/page-components/Termos'), { ssr: false })
export default Termos
