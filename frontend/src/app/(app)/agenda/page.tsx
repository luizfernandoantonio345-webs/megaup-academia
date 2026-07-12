'use client'
import dynamic from 'next/dynamic'
const Agenda = dynamic(() => import('@/page-components/Agenda'), { ssr: false })
export default Agenda
