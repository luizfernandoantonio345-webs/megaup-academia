'use client'
import dynamic from 'next/dynamic'
const EsqueciSenha = dynamic(() => import('@/page-components/EsqueciSenha'), { ssr: false })
export default EsqueciSenha
