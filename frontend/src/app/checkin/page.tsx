'use client'
import dynamic from 'next/dynamic'
const Checkin = dynamic(() => import('@/page-components/Checkin'), { ssr: false })
export default Checkin
