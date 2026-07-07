import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import FotosEvolucaoTab from '../components/FotosEvolucaoTab'

vi.mock('../api', () => ({
  listarFotos: vi.fn().mockResolvedValue({ data: [] }),
  uploadFoto: vi.fn(),
  deletarFoto: vi.fn(),
}))

// Canvas API não existe no jsdom — mock mínimo para compressImage
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: () => ({ drawImage: vi.fn() }),
})
Object.defineProperty(HTMLCanvasElement.prototype, 'toDataURL', {
  value: () => 'data:image/jpeg;base64,fakebase64',
})

function renderTab(props = {}) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={qc}>
      <FotosEvolucaoTab alunoId={1} {...props} />
    </QueryClientProvider>
  )
}

describe('FotosEvolucaoTab', () => {
  beforeEach(() => vi.clearAllMocks())

  it('mostra estado vazio quando não há fotos', async () => {
    renderTab()
    await waitFor(() => {
      expect(screen.getByText(/nenhuma foto/i)).toBeInTheDocument()
    })
  })

  it('exibe botão de nova foto', async () => {
    renderTab()
    await waitFor(() => {
      const btn = screen.getByRole('button', { name: /foto/i })
      expect(btn).toBeInTheDocument()
    })
  })

  it('renderiza fotos quando a API retorna dados', async () => {
    const { listarFotos } = await import('../api')
    listarFotos.mockResolvedValue({
      data: [
        { id: 1, foto_base64: 'abc123', tipo: 'frente', data: new Date().toISOString(), peso: 80 },
        { id: 2, foto_base64: 'def456', tipo: 'costas', data: new Date().toISOString(), peso: null },
      ],
    })
    renderTab()
    await waitFor(() => {
      expect(screen.getAllByRole('img')).toHaveLength(2)
    })
  })

  it('exibe peso da foto quando disponível', async () => {
    const { listarFotos } = await import('../api')
    listarFotos.mockResolvedValue({
      data: [
        { id: 1, foto_base64: 'abc', tipo: 'frente', data: new Date().toISOString(), peso: 75.5 },
      ],
    })
    renderTab()
    await waitFor(() => {
      expect(screen.getByText('75.5 kg')).toBeInTheDocument()
    })
  })
})
