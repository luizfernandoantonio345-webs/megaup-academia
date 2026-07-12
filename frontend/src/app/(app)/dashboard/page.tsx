'use client'
import dynamic from 'next/dynamic'
const Dashboard = dynamic(() => import('@/page-components/Dashboard'), { ssr: false })
export default Dashboard
