'use client'
import dynamic from 'next/dynamic'
const Planos = dynamic(() => import('@/page-components/Planos'), { ssr: false })
export default Planos
