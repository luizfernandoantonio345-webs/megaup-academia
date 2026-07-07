import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Layout from './components/Layout'
import LayoutAluno from './pages/aluno/LayoutAluno'
import PageTransition from './components/PageTransition'
import ErrorBoundary from './components/ErrorBoundary'
import { useKeepAlive } from './hooks/useKeepAlive'
import { useAuth } from './contexts/AuthContext'

// Lazy-load all pages — reduces initial bundle from 1.25 MB to ~150 KB
const Login          = lazy(() => import('./pages/Login'))
const Registrar      = lazy(() => import('./pages/Registrar'))
const AceitarConvite = lazy(() => import('./pages/AceitarConvite'))
const EsqueciSenha   = lazy(() => import('./pages/EsqueciSenha'))
const RedefinirSenha = lazy(() => import('./pages/RedefinirSenha'))
const PerfilPublico  = lazy(() => import('./pages/PerfilPublico'))
const Termos         = lazy(() => import('./pages/Termos'))
const Privacidade    = lazy(() => import('./pages/Privacidade'))
const Dashboard      = lazy(() => import('./pages/Dashboard'))
const Alunos         = lazy(() => import('./pages/Alunos'))
const AlunoDetalhe   = lazy(() => import('./pages/AlunoDetalhe'))
const TreinoDetalhe  = lazy(() => import('./pages/TreinoDetalhe'))
const Exercicios     = lazy(() => import('./pages/Exercicios'))
const IA             = lazy(() => import('./pages/IA'))
const Convites       = lazy(() => import('./pages/Convites'))
const Financeiro     = lazy(() => import('./pages/Financeiro'))
const Planos         = lazy(() => import('./pages/Planos'))
const Periodizacao   = lazy(() => import('./pages/Periodizacao'))
const Referral       = lazy(() => import('./pages/Referral'))
const Analytics      = lazy(() => import('./pages/Analytics'))
const RelatorioAluno = lazy(() => import('./pages/RelatorioAluno'))
const Agenda         = lazy(() => import('./pages/Agenda'))
const Inativos       = lazy(() => import('./pages/Inativos'))
const TreinoHoje     = lazy(() => import('./pages/aluno/TreinoHoje'))
const ChatAluno      = lazy(() => import('./pages/aluno/ChatAluno'))
const SemanaTreinos  = lazy(() => import('./pages/aluno/SemanaTreinos'))
const Conquistas     = lazy(() => import('./pages/aluno/Conquistas'))
const NutricaoAluno  = lazy(() => import('./pages/aluno/NutricaoAluno'))

const qc = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60_000,       // dados frescos por 5 min
      gcTime: 30 * 60_000,          // mantém no cache por 30 min após desmontar
      refetchOnWindowFocus: false,  // não refetch ao trocar de aba — maior ganho
      refetchOnReconnect: false,
    },
  },
})

function PageLoader() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 24, height: 24, border: '2px solid #27272A', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  )
}

function P({ children }) {
  return <PageTransition>{children}</PageTransition>
}

function AnimatedRoutes() {
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  useKeepAlive(isAuthenticated)
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        {/* Públicas */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<P><Login /></P>} />
        <Route path="/registrar" element={<P><Registrar /></P>} />
        <Route path="/registro" element={<P><AceitarConvite /></P>} />
        <Route path="/esqueci-senha" element={<P><EsqueciSenha /></P>} />
        <Route path="/redefinir-senha" element={<P><RedefinirSenha /></P>} />
        <Route path="/p/:code" element={<P><PerfilPublico /></P>} />
        <Route path="/termos" element={<P><Termos /></P>} />
        <Route path="/privacidade" element={<P><Privacidade /></P>} />

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
            <div style={{ minHeight:'100vh', background:'#0C0C0D', display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center', padding:24 }}>
              <div>
                <div style={{ fontSize:40, marginBottom:16 }}>🔒</div>
                <h1 style={{ fontFamily:'Inter, sans-serif', fontSize:20, fontWeight:600, color:'#F4F4F5', marginBottom:8 }}>Acesso negado</h1>
                <p style={{ color:'#71717A', marginBottom:24, fontSize:14 }}>Você não tem permissão para acessar esta página.</p>
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
            <Suspense fallback={<PageLoader />}>
              <AnimatedRoutes />
            </Suspense>
          </BrowserRouter>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
