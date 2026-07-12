'use client'
import dynamic from 'next/dynamic'
const IA = dynamic(() => import('@/page-components/IA'), { ssr: false })
export default IA
