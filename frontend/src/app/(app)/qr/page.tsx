'use client'
import dynamic from 'next/dynamic'
const Qr = dynamic(() => import('@/page-components/Qr'), { ssr: false })
export default Qr
