'use client'
import dynamic from 'next/dynamic'
const RedefinirSenha = dynamic(() => import('@/page-components/RedefinirSenha'), { ssr: false })
export default RedefinirSenha
