import { Tajawal } from 'next/font/google'
import './globals.css'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ChatbaseProvider from '../components/ChatbaseProvider'

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['200', '300', '400', '500', '700', '800', '900'],
  display: 'swap',
})

export const metadata = {
  metadataBase: new URL('https://www.fikranova.com'),
  title: {
    default: 'وكالة الذكاء الاصطناعي | فكرة نوفا',
    template: '%s | فكرة نوفا'
  },
  description: 'نقدم حلولاً ذكية لتطوير أعمالك باستخدام أحدث تقنيات الذكاء الاصطناعي. خدمات تطوير المواقع، التسويق الرقمي، وتحليل البيانات',
  keywords: [
    'الذكاء الاصطناعي',
    'تطوير مواقع',
    'تطوير الأعمال',
    'تحليل البيانات',
    'التسويق الرقمي',
    'فكرة نوفا',
    'تصميم مواقع',
    'برمجة مواقع',
    'خدمات الويب'
  ],
  openGraph: {
    type: 'website',
    locale: 'ar_AR',
    url: 'https://www.fikranova.com',
    siteName: 'فكرة نوفا',
    images: [{
      url: '/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'فكرة نوفا - وكالة الذكاء الاصطناعي',
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "فكرة نوفا - حلول ذكية لتطوير أعمالك",
    description: "نقدم حلولاً ذكية لتطوير أعمالك باستخدام أحدث تقنيات الذكاء الاصطناعي",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: 'https://www.fikranova.com'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={tajawal.className}>
        <Header />
        <main className="min-h-screen pt-16">{children}</main>
        <Footer />
        <ChatbaseProvider />
      </body>
    </html>
  )
}
