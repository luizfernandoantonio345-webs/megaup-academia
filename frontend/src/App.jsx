import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { Component } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Layout from './components/Layout'
import LayoutAluno from './pages/aluno/LayoutAluno'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Registrar from './pages/Registrar'
import AceitarConvite from './pages/AceitarConvite'
import Referral from './pages/Referral'
import Analytics from './pages/Analytics'
import RelatorioAluno from './pages/RelatorioAluno'
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

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={qc}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Públicas */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registrar" element={<Registrar />} />
              <Route path="/registro" element={<AceitarConvite />} />

              {/* Personal trainer / Admin */}
              <Route element={<ProtectedRoute roles={['personal', 'admin_academia']} />}>
                <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
                <Route path="/alunos" element={<Layout><Alunos /></Layout>} />
                <Route path="/alunos/:id" element={<Layout><AlunoDetalhe /></Layout>} />
                <Route path="/treinos/:id" element={<Layout><TreinoDetalhe /></Layout>} />
                <Route path="/exercicios" element={<Layout><Exercicios /></Layout>} />
                <Route path="/ia" element={<Layout><IA /></Layout>} />
                <Route path="/convites" element={<Layout><Convites /></Layout>} />
                <Route path="/financeiro" element={<Layout><Financeiro /></Layout>} />
                <Route path="/planos" element={<Layout><Planos /></Layout>} />
                <Route path="/periodizacao" element={<Layout><Periodizacao /></Layout>} />
                <Route path="/referral" element={<Layout><Referral /></Layout>} />
                <Route path="/analytics" element={<Layout><Analytics /></Layout>} />
                <Route path="/alunos/:id/relatorio" element={<Layout><RelatorioAluno /></Layout>} />
              </Route>

              {/* Aluno */}
              <Route element={<ProtectedRoute roles={['aluno']} />}>
                <Route path="/aluno" element={<LayoutAluno><TreinoHoje /></LayoutAluno>} />
                <Route path="/aluno/semana" element={<LayoutAluno><SemanaTreinos /></LayoutAluno>} />
                <Route path="/aluno/conquistas" element={<LayoutAluno><Conquistas /></LayoutAluno>} />
                <Route path="/aluno/chat" element={<LayoutAluno><ChatAluno /></LayoutAluno>} />
              </Route>

              <Route path="/unauthorized" element={
                <div style={{ minHeight:'100vh', background:'#070B14', display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center', padding:24 }}>
                  <div>
                    <div style={{ fontSize:48, marginBottom:16 }}>🔒</div>
                    <h1 style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:24, fontWeight:800, color:'#EFF6FF', marginBottom:8 }}>Acesso negado</h1>
                    <p style={{ color:'#4B5768', marginBottom:24, fontSize:14 }}>Você não tem permissão para acessar esta página.</p>
                    <a href="/login" style={{ color:'#818cf8', fontWeight:600, fontSize:14 }}>Voltar ao login</a>
                  </div>
                </div>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
