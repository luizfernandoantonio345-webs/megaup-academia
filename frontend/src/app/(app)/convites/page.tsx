'use client'
import dynamic from 'next/dynamic'
const Convites = dynamic(() => import('@/page-components/Convites'), { ssr: false })
export default Convites
