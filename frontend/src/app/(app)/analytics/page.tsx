'use client'
import dynamic from 'next/dynamic'
const Analytics = dynamic(() => import('@/page-components/Analytics'), { ssr: false })
export default Analytics
