import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Layout from './components/Layout'
import LayoutAluno from './pages/aluno/LayoutAluno'

import Login from './pages/Login'
import Registrar from './pages/Registrar'
import AceitarConvite from './pages/AceitarConvite'
import Dashboard from './pages/Dashboard'
import Alunos from './pages/Alunos'
import AlunoDetalhe from './pages/AlunoDetalhe'
import TreinoDetalhe from './pages/TreinoDetalhe'
import Exercicios from './pages/Exercicios'
import IA from './pages/IA'
import Convites from './pages/Convites'

import Financeiro from './pages/Financeiro'

import TreinoHoje from './pages/aluno/TreinoHoje'
import Conquistas from './pages/aluno/Conquistas'

const qc = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/registrar" element={<Registrar />} />
            <Route path="/registro" element={<AceitarConvite />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

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
            </Route>

            {/* Aluno */}
            <Route element={<ProtectedRoute roles={['aluno']} />}>
              <Route path="/aluno" element={<LayoutAluno><TreinoHoje /></LayoutAluno>} />
              <Route path="/aluno/conquistas" element={<LayoutAluno><Conquistas /></LayoutAluno>} />
            </Route>

            <Route path="/unauthorized" element={
              <div className="min-h-screen flex items-center justify-center text-center px-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso negado</h1>
                  <p className="text-gray-500 mb-4">Você não tem permissão para acessar esta página.</p>
                  <a href="/login" className="text-primary-600 hover:underline">Voltar ao login</a>
                </div>
              </div>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      </AuthProvider>
    </QueryClientProvider>
  )
}
