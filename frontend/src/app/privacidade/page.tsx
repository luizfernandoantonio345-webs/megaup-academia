'use client'
import dynamic from 'next/dynamic'
const Privacidade = dynamic(() => import('@/page-components/Privacidade'), { ssr: false })
export default Privacidade
