'use client'
import dynamic from 'next/dynamic'
const PerfilPublico = dynamic(() => import('@/page-components/PerfilPublico'), { ssr: false })
export default PerfilPublico
