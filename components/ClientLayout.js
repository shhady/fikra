'use client'
import Header from './Header'
import Footer from './Footer'
import { Analytics } from "@vercel/analytics/react"
import { LanguageProvider } from '../context/LanguageContext'
import ChatButton from './ChatButton'
import { usePathname } from 'next/navigation'

export default function ClientLayout({ children, font }) {
  const pathname = usePathname()
  const isChatPage = pathname === '/chat'

  return (
    <LanguageProvider>
      <html lang="ar" dir="rtl">
        <body className={font}>
          <Header />
          <main className={`${isChatPage ? 'h-screen' : 'min-h-screen'} pt-16`}>
            {children}
          </main>
          {!isChatPage && <Footer />}
          <ChatButton />
          <Analytics />
        </body>
      </html>
    </LanguageProvider>
  )
} 