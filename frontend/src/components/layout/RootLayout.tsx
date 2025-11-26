/**
 * Root Layout Component
 * Main layout wrapper with header, content area, and footer
 */

import type { ReactNode } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { ToastContainer } from '@components/common'

interface RootLayoutProps {
  children: ReactNode
}

export function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <ToastContainer />
    </div>
  )
}
