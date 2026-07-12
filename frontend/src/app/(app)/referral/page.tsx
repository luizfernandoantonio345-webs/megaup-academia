'use client'
import dynamic from 'next/dynamic'
const Referral = dynamic(() => import('@/page-components/Referral'), { ssr: false })
export default Referral
