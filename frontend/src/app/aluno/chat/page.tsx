'use client'
import dynamic from 'next/dynamic'
const ChatAluno = dynamic(() => import('@/page-components/aluno/ChatAluno'), { ssr: false })
export default ChatAluno
