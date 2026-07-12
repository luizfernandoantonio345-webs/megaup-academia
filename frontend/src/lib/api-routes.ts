import api from './api'

// ── Auth ──────────────────────────────────────────────────────────────────────
export const login = (data: { email: string; senha: string }) =>
  api.post('/auth/login', data)
export const registrarPersonal = (data: Record<string, unknown>) =>
  api.post('/auth/registrar-personal', data)
export const aceitarConvite = (data: Record<string, unknown>) =>
  api.post('/auth/aceitar-convite', data)

// ── Convites ──────────────────────────────────────────────────────────────────
export const gerarConvite = (data: Record<string, unknown>) =>
  api.post('/convites/', data)
export const infoConvite = (token: string) => api.get(`/convites/${token}`)

// ── Alunos ────────────────────────────────────────────────────────────────────
export const listarAlunos = () => api.get('/alunos/')
export const meuPerfilAluno = () => api.get('/alunos/meu-perfil')
export const atualizarMeuPerfil = (data: Record<string, unknown>) =>
  api.patch('/alunos/meu-perfil', data)
export const criarAluno = (data: Record<string, unknown>) =>
  api.post('/alunos/', data)
export const obterAluno = (id: number | string) => api.get(`/alunos/${id}`)
export const atualizarAluno = (id: number | string, data: Record<string, unknown>) =>
  api.patch(`/alunos/${id}`, data)
export const obterAnamnese = (id: number | string) =>
  api.get(`/alunos/${id}/anamnese`)
export const salvarAnamnese = (id: number | string, data: Record<string, unknown>) =>
  api.put(`/alunos/${id}/anamnese`, data)
export const treinoDodia = (id: number | string) =>
  api.get(`/alunos/${id}/treino-do-dia`)
export const historicoCarga = (alunoId: number | string, exercicioId: number | string) =>
  api.get(`/alunos/${alunoId}/historico-carga/${exercicioId}`)
export const sugestoesAluno = (id: number | string) =>
  api.get(`/alunos/${id}/sugestoes`)
export const gamificacaoAluno = (id: number | string) =>
  api.get(`/alunos/${id}/gamificacao`)
export const feedConquistas = () => api.get('/alunos/feed-conquistas')

// ── Treinos ───────────────────────────────────────────────────────────────────
export const listarTreinos = (alunoId?: number | string) =>
  api.get('/treinos/', { params: alunoId ? { aluno_id: alunoId } : {} })
export const criarTreino = (data: Record<string, unknown>) =>
  api.post('/treinos/', data)
export const obterTreino = (id: number | string) => api.get(`/treinos/${id}`)
export const adicionarItem = (treinoId: number | string, data: Record<string, unknown>) =>
  api.post(`/treinos/${treinoId}/itens/`, data)
export const removerItem = (treinoId: number | string, itemId: number | string) =>
  api.delete(`/treinos/${treinoId}/itens/${itemId}`)
export const executarTreino = (treinoId: number | string, data: Record<string, unknown>) =>
  api.post(`/treinos/${treinoId}/executar`, data)
export const duplicarTreino = (treinoId: number | string, data: Record<string, unknown> = {}) =>
  api.post(`/treinos/${treinoId}/duplicar`, data)

// ── Exercícios ────────────────────────────────────────────────────────────────
export const listarExercicios = () => api.get('/exercicios/')
export const criarExercicio = (data: Record<string, unknown>) =>
  api.post('/exercicios/', data)

// ── IA ────────────────────────────────────────────────────────────────────────
export const sugerirCarga = (historico: unknown) =>
  api.post('/ia/sugerir-carga', historico)
export const treinoAlternativo = (data: Record<string, unknown>) =>
  api.post('/ia/treino-alternativo', data)
export const gerarTreino = (data: Record<string, unknown>) =>
  api.post('/ia/gerar-treino', data)

// ── Pagamentos ────────────────────────────────────────────────────────────────
export const listarPlanos = () => api.get('/pagamentos/planos/')
export const criarPlano = (data: Record<string, unknown>) =>
  api.post('/pagamentos/planos/', data)
export const inativarPlano = (id: number | string) =>
  api.delete(`/pagamentos/planos/${id}`)
export const listarCobrancas = () => api.get('/pagamentos/cobrancas/')
export const criarCobranca = (data: Record<string, unknown>) =>
  api.post('/pagamentos/cobrancas/', data)
export const marcarPago = (id: number | string, data: Record<string, unknown> = {}) =>
  api.patch(`/pagamentos/cobrancas/${id}/pagar`, data)
export const resumoFinanceiro = () => api.get('/pagamentos/resumo')

// ── Billing ───────────────────────────────────────────────────────────────────
export const billingStatus = () => api.get('/billing/status')
export const billingPlanos = () => api.get('/billing/planos')
export const billingCheckout = (plano: string) =>
  api.post('/billing/checkout', { plano })
export const billingPortal = () => api.post('/billing/portal')

// ── Periodização ──────────────────────────────────────────────────────────────
export const listarProgramas = () => api.get('/periodizacao/')
export const criarPrograma = (data: Record<string, unknown>) =>
  api.post('/periodizacao/', data)
export const deletarPrograma = (id: number | string) =>
  api.delete(`/periodizacao/${id}`)
export const aplicarPrograma = (data: Record<string, unknown>) =>
  api.post('/periodizacao/aplicar', data)
export const programaDoAluno = (alunoId: number | string) =>
  api.get(`/periodizacao/aluno/${alunoId}`)
export const seedExercicios = () => api.post('/exercicios/seed-global')

// ── Chat ──────────────────────────────────────────────────────────────────────
export const chatMensagens = (alunoId: number | string, desdeId = 0) =>
  api.get(`/chat/${alunoId}?desde_id=${desdeId}`)
export const chatEnviar = (alunoId: number | string, texto: string) =>
  api.post(`/chat/${alunoId}`, { texto })
export const chatNaoLidas = (alunoId: number | string) =>
  api.get(`/chat/${alunoId}/nao-lidas`)

// ── Check-in ──────────────────────────────────────────────────────────────────
export const getCheckinToken = () => api.get('/checkin/qr-data')
export const fazerCheckin = (token: string) => api.post('/checkin/', { token })
export const meusCheckins = () => api.get('/checkin/meus')

// ── Avaliações ────────────────────────────────────────────────────────────────
export const listarAvaliacoes = (alunoId: number | string) =>
  api.get(`/alunos/${alunoId}/avaliacoes`)
export const criarAvaliacao = (alunoId: number | string, data: Record<string, unknown>) =>
  api.post(`/alunos/${alunoId}/avaliacoes`, data)
export const deletarAvaliacao = (alunoId: number | string, avId: number | string) =>
  api.delete(`/alunos/${alunoId}/avaliacoes/${avId}`)

// ── Analytics ─────────────────────────────────────────────────────────────────
export const analyticsResumo = (dias = 7) =>
  api.get('/analytics/resumo', { params: { dias } })
export const analyticsAluno = (alunoId: number | string) =>
  api.get(`/analytics/aluno/${alunoId}`)

// ── Agenda ────────────────────────────────────────────────────────────────────
export const listarSessoes = (params?: Record<string, unknown>) =>
  api.get('/agenda/', { params })
export const criarSessao = (data: Record<string, unknown>) =>
  api.post('/agenda/', data)
export const atualizarSessao = (id: number | string, data: Record<string, unknown>) =>
  api.patch(`/agenda/${id}`, data)
export const deletarSessao = (id: number | string) =>
  api.delete(`/agenda/${id}`)

// ── Nutrição ──────────────────────────────────────────────────────────────────
export const planoNutricao = (alunoId: number | string) =>
  api.get(`/nutricao/aluno/${alunoId}`)

// ── Notificações ──────────────────────────────────────────────────────────────
export const resumoNotificacoes = () => api.get('/notificacoes/resumo')

// ── Perfil público ────────────────────────────────────────────────────────────
export const perfilPublico = (code: string) => api.get(`/public/perfil/${code}`)
