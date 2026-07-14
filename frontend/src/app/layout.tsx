import type { Metadata, Viewport } from 'next'
import { Providers } from '@/components/providers'
import ChunkErrorHandler from '@/components/ChunkErrorHandler'
import { ServiceWorkerRegistrar } from '@/components/ServiceWorkerRegistrar'
import './globals.css'

export const metadata: Metadata = {
  title: 'MegaUp — Academia Jardim das Rosas',
  description: 'Plataforma completa de gestão para academias e personal trainers.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MegaUp',
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/icon-192.svg',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0D0D0F',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://megaup-api.onrender.com" />
        <link rel="dns-prefetch" href="https://megaup-api.onrender.com" />
      </head>
      <body>
        <Providers>
          <ChunkErrorHandler />
          <ServiceWorkerRegistrar />
          {children}
        </Providers>
      </body>
    </html>
  )
}
