import api from './client'

// Auth
export const login = (data) => api.post('/auth/login', data)
export const registrarPersonal = (data) => api.post('/auth/registrar-personal', data)
export const aceitarConvite = (data) => api.post('/auth/aceitar-convite', data)

// Convites
export const gerarConvite = (data) => api.post('/convites/', data)
export const infoConvite = (token) => api.get(`/convites/${token}`)

// Alunos
export const listarAlunos = () => api.get('/alunos/')
export const criarAluno = (data) => api.post('/alunos/', data)
export const obterAluno = (id) => api.get(`/alunos/${id}`)
export const atualizarAluno = (id, data) => api.patch(`/alunos/${id}`, data)
export const obterAnamnese = (id) => api.get(`/alunos/${id}/anamnese`)
export const salvarAnamnese = (id, data) => api.put(`/alunos/${id}/anamnese`, data)
export const treinoDodia = (id) => api.get(`/alunos/${id}/treino-do-dia`)
export const historicoCarga = (alunoId, exercicioId) =>
  api.get(`/alunos/${alunoId}/historico-carga/${exercicioId}`)
export const sugestoesAluno = (id) => api.get(`/alunos/${id}/sugestoes`)
export const gamificacaoAluno = (id) => api.get(`/alunos/${id}/gamificacao`)

// Treinos
export const listarTreinos = (alunoId) =>
  api.get('/treinos/', { params: alunoId ? { aluno_id: alunoId } : {} })
export const criarTreino = (data) => api.post('/treinos/', data)
export const obterTreino = (id) => api.get(`/treinos/${id}`)
export const adicionarItem = (treinoId, data) => api.post(`/treinos/${treinoId}/itens/`, data)
export const removerItem = (treinoId, itemId) =>
  api.delete(`/treinos/${treinoId}/itens/${itemId}`)
export const executarTreino = (treinoId, data) =>
  api.post(`/treinos/${treinoId}/executar`, data)

// Exercícios
export const listarExercicios = () => api.get('/exercicios/')
export const criarExercicio = (data) => api.post('/exercicios/', data)

// IA
export const sugerirCarga = (historico) => api.post('/ia/sugerir-carga', historico)
export const treinoAlternativo = (data) => api.post('/ia/treino-alternativo', data)

// Pagamentos
export const listarPlanos = () => api.get('/pagamentos/planos/')
export const criarPlano = (data) => api.post('/pagamentos/planos/', data)
export const inativarPlano = (id) => api.delete(`/pagamentos/planos/${id}`)
export const listarCobrancas = () => api.get('/pagamentos/cobrancas/')
export const criarCobranca = (data) => api.post('/pagamentos/cobrancas/', data)
export const marcarPago = (id, data) => api.patch(`/pagamentos/cobrancas/${id}/pagar`, data || {})
export const resumoFinanceiro = () => api.get('/pagamentos/resumo')

// Academia (admin)
export const listarPersonais = () => api.get('/academia/personais/')
export const adicionarPersonal = (data) => api.post('/academia/personais/', data)
export const removerPersonal = (userId) => api.delete(`/academia/personais/${userId}`)
