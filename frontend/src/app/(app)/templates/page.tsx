'use client'
import dynamic from 'next/dynamic'
const Templates = dynamic(() => import('@/page-components/Templates'), { ssr: false })
export default Templates
