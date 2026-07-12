'use client'
import dynamic from 'next/dynamic'
const Exercicios = dynamic(() => import('@/page-components/Exercicios'), { ssr: false })
export default Exercicios
