'use client'
import dynamic from 'next/dynamic'
const AceitarConvite = dynamic(() => import('@/page-components/AceitarConvite'), { ssr: false })
export default AceitarConvite
