'use client'
import dynamic from 'next/dynamic'
const Registrar = dynamic(() => import('@/page-components/Registrar'), { ssr: false })
export default Registrar
