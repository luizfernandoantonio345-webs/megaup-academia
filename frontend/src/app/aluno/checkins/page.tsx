'use client'
import dynamic from 'next/dynamic'
const MeusCheckins = dynamic(() => import('@/page-components/aluno/MeusCheckins'), { ssr: false })
export default MeusCheckins
