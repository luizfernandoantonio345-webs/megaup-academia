import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ChatBox from '../components/ChatBox'

// Mock da API
vi.mock('../api', () => ({
  chatMensagens: vi.fn().mockResolvedValue({ data: [] }),
  chatEnviar: vi.fn().mockResolvedValue({
    data: {
      id: 1,
      texto: 'Olá!',
      meu: true,
      lido: false,
      criado_em: new Date().toISOString(),
    },
  }),
}))

function renderChatBox(props = {}) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={qc}>
      <ChatBox alunoId={1} outroNome="João" {...props} />
    </QueryClientProvider>
  )
}

describe('ChatBox', () => {
  beforeEach(() => vi.clearAllMocks())

  it('mostra estado vazio quando não há mensagens', async () => {
    renderChatBox()
    await waitFor(() => {
      expect(screen.getByText('Nenhuma mensagem ainda')).toBeInTheDocument()
    })
  })

  it('renderiza o placeholder correto no textarea', () => {
    renderChatBox({ outroNome: 'Maria' })
    expect(screen.getByPlaceholderText('Mensagem para Maria…')).toBeInTheDocument()
  })

  it('botão de envio começa desabilitado (input vazio)', () => {
    renderChatBox()
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
  })

  it('botão de envio fica habilitado quando há texto', () => {
    renderChatBox()
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'Olá!' } })
    const btn = screen.getByRole('button')
    expect(btn).not.toBeDisabled()
  })

  it('limpa o input após enviar com Enter', async () => {
    const { chatEnviar } = await import('../api')
    renderChatBox()
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'Mensagem teste' } })
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false })
    await waitFor(() => {
      expect(textarea.value).toBe('')
    })
    expect(chatEnviar).toHaveBeenCalledWith(1, 'Mensagem teste')
  })

  it('não envia com Shift+Enter (nova linha)', () => {
    renderChatBox()
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'linha 1' } })
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true })
    expect(textarea.value).toBe('linha 1')
  })

  it('exibe aviso de caracteres restantes próximo do limite', () => {
    renderChatBox()
    const textarea = screen.getByRole('textbox')
    const texto = 'a'.repeat(1850)
    fireEvent.change(textarea, { target: { value: texto } })
    expect(screen.getByText(/restantes/)).toBeInTheDocument()
  })
})
