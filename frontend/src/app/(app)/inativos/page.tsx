'use client'
import dynamic from 'next/dynamic'
const Inativos = dynamic(() => import('@/page-components/Inativos'), { ssr: false })
export default Inativos
