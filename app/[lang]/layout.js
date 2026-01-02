import { Tajawal } from 'next/font/google'
import Script from 'next/script'
import '../globals.css'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { Analytics } from "@vercel/analytics/react"
import { LanguageProvider } from '@/context/LanguageContext'
import ChatButton from '@/components/ChatButton'
import { metadata as baseMetadata } from '../metadata'

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['400', '700'],
  display: 'swap',
})

export async function generateMetadata({ params }) {
  return {
    ...baseMetadata,
    alternates: {
      languages: {
        'x-default': 'https://www.fikranova.com/en',
        'en': 'https://www.fikranova.com/en',
        'ar': 'https://www.fikranova.com/ar',
        'he': 'https://www.fikranova.com/he',
      },
    },
  }
}

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'ar' }, { lang: 'he' }]
}

export default async function RootLayout({ children, params }) {
  const { lang } = await params
  const isRTL = lang === 'ar' || lang === 'he';
  
  return (
    <LanguageProvider initialLocale={lang}>
      <html lang={lang} dir={isRTL ? 'rtl' : 'ltr'} suppressHydrationWarning>
        <body className={tajawal.className} suppressHydrationWarning>
          <Header />
          <main className="min-h-screen pt-16">{children}</main>
          <Footer />
          <ChatButton />
          <Analytics />
          <Script
            src="https://cdn.enable.co.il/licenses/enable-L47784k8n24pqfm7-0925-75470/init.js"
            strategy="lazyOnload"
          />
        </body>
      </html>
    </LanguageProvider>
  )
}