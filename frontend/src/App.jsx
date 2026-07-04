import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { Component } from 'react'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Layout from './components/Layout'
import LayoutAluno from './pages/aluno/LayoutAluno'
import PageTransition from './components/PageTransition'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Registrar from './pages/Registrar'
import AceitarConvite from './pages/AceitarConvite'
import EsqueciSenha from './pages/EsqueciSenha'
import RedefinirSenha from './pages/RedefinirSenha'
import PerfilPublico from './pages/PerfilPublico'
import Referral from './pages/Referral'
import Analytics from './pages/Analytics'
import RelatorioAluno from './pages/RelatorioAluno'
import Agenda from './pages/Agenda'
import Inativos from './pages/Inativos'
import NutricaoAluno from './pages/aluno/NutricaoAluno'
import Dashboard from './pages/Dashboard'
import Alunos from './pages/Alunos'
import AlunoDetalhe from './pages/AlunoDetalhe'
import TreinoDetalhe from './pages/TreinoDetalhe'
import Exercicios from './pages/Exercicios'
import IA from './pages/IA'
import Convites from './pages/Convites'
import Financeiro from './pages/Financeiro'
import Planos from './pages/Planos'
import Periodizacao from './pages/Periodizacao'
import TreinoHoje from './pages/aluno/TreinoHoje'
import ChatAluno from './pages/aluno/ChatAluno'
import SemanaTreinos from './pages/aluno/SemanaTreinos'
import Conquistas from './pages/aluno/Conquistas'

const qc = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight:'100vh', background:'#070B14', display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center', padding:24 }}>
          <div>
            <div style={{ fontSize:48, marginBottom:16 }}>⚡</div>
            <h1 style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:22, fontWeight:800, color:'#EFF6FF', marginBottom:8 }}>Algo deu errado</h1>
            <p style={{ color:'#4B5768', fontSize:13, marginBottom:8, maxWidth:340, margin:'0 auto 16px' }}>
              {this.state.error?.message || 'Erro desconhecido'}
            </p>
            <button
              onClick={() => { this.setState({ error: null }); window.location.href = '/login' }}
              style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)', color:'white', border:'none', borderRadius:12, padding:'10px 24px', fontWeight:700, cursor:'pointer', fontSize:14 }}
            >
              Voltar ao início
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function P({ children }) {
  return <PageTransition>{children}</PageTransition>
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        {/* Públicas */}
        <Route path="/" element={<P><Landing /></P>} />
        <Route path="/login" element={<P><Login /></P>} />
        <Route path="/registrar" element={<P><Registrar /></P>} />
        <Route path="/registro" element={<P><AceitarConvite /></P>} />
        <Route path="/esqueci-senha" element={<P><EsqueciSenha /></P>} />
        <Route path="/redefinir-senha" element={<P><RedefinirSenha /></P>} />
        <Route path="/p/:code" element={<P><PerfilPublico /></P>} />

        {/* Personal trainer / Admin */}
        <Route element={<ProtectedRoute roles={['personal', 'admin_academia']} />}>
          <Route path="/dashboard" element={<Layout><P><Dashboard /></P></Layout>} />
          <Route path="/alunos" element={<Layout><P><Alunos /></P></Layout>} />
          <Route path="/alunos/:id" element={<Layout><P><AlunoDetalhe /></P></Layout>} />
          <Route path="/treinos/:id" element={<Layout><P><TreinoDetalhe /></P></Layout>} />
          <Route path="/exercicios" element={<Layout><P><Exercicios /></P></Layout>} />
          <Route path="/ia" element={<Layout><P><IA /></P></Layout>} />
          <Route path="/convites" element={<Layout><P><Convites /></P></Layout>} />
          <Route path="/financeiro" element={<Layout><P><Financeiro /></P></Layout>} />
          <Route path="/planos" element={<Layout><P><Planos /></P></Layout>} />
          <Route path="/periodizacao" element={<Layout><P><Periodizacao /></P></Layout>} />
          <Route path="/referral" element={<Layout><P><Referral /></P></Layout>} />
          <Route path="/analytics" element={<Layout><P><Analytics /></P></Layout>} />
          <Route path="/alunos/:id/relatorio" element={<Layout><P><RelatorioAluno /></P></Layout>} />
          <Route path="/agenda" element={<Layout><P><Agenda /></P></Layout>} />
          <Route path="/inativos" element={<Layout><P><Inativos /></P></Layout>} />
        </Route>

        {/* Aluno */}
        <Route element={<ProtectedRoute roles={['aluno']} />}>
          <Route path="/aluno" element={<LayoutAluno><P><TreinoHoje /></P></LayoutAluno>} />
          <Route path="/aluno/semana" element={<LayoutAluno><P><SemanaTreinos /></P></LayoutAluno>} />
          <Route path="/aluno/conquistas" element={<LayoutAluno><P><Conquistas /></P></LayoutAluno>} />
          <Route path="/aluno/chat" element={<LayoutAluno><P><ChatAluno /></P></LayoutAluno>} />
          <Route path="/aluno/nutricao" element={<LayoutAluno><P><NutricaoAluno /></P></LayoutAluno>} />
        </Route>

        <Route path="/unauthorized" element={
          <P>
            <div style={{ minHeight:'100vh', background:'#070B14', display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center', padding:24 }}>
              <div>
                <div style={{ fontSize:48, marginBottom:16 }}>🔒</div>
                <h1 style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:24, fontWeight:800, color:'#EFF6FF', marginBottom:8 }}>Acesso negado</h1>
                <p style={{ color:'#4B5768', marginBottom:24, fontSize:14 }}>Você não tem permissão para acessar esta página.</p>
                <a href="/login" style={{ color:'#818cf8', fontWeight:600, fontSize:14 }}>Voltar ao login</a>
              </div>
            </div>
          </P>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={qc}>
        <AuthProvider>
          <BrowserRouter>
            <AnimatedRoutes />
          </BrowserRouter>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
