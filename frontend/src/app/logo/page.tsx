'use client'
import dynamic from 'next/dynamic'
const LogoDesigner = dynamic(() => import('@/page-components/LogoDesigner'), { ssr: false })
export default LogoDesigner
