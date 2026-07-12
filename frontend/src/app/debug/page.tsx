'use client'
import dynamic from 'next/dynamic'
const Debug = dynamic(() => import('@/page-components/Debug'), { ssr: false })
export default Debug
