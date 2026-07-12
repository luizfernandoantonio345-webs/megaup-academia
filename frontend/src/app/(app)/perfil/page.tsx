'use client'
import dynamic from 'next/dynamic'
const Perfil = dynamic(() => import('@/page-components/Perfil'), { ssr: false })
export default Perfil
