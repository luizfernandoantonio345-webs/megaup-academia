'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { type ReactNode, useState } from 'react'
import { AuthProvider } from '@/contexts/auth-context'
import { ThemeProvider } from '@/contexts/theme-context'

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 10 * 60_000,
            gcTime: 60 * 60_000,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
          },
        },
      })
  )

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
          <Toaster
            position="bottom-center"
            gutter={8}
            containerStyle={{
              bottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)',
            }}
            toastOptions={{
              duration: 3500,
              style: {
                background: '#18181b',
                color: '#F4F4F5',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                padding: '12px 16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
                maxWidth: '360px',
              },
              success: {
                iconTheme: { primary: '#22c55e', secondary: '#18181b' },
              },
              error: {
                iconTheme: { primary: '#E8342B', secondary: '#18181b' },
              },
            }}
          />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
