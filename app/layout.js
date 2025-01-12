import { Tajawal } from 'next/font/google'
import './globals.css'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Head from 'next/head'
const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['200', '300', '400', '500', '700', '800', '900'],
  display: 'swap',
})

export const metadata = {
  metadataBase: new URL('https://fikra-theta.vercel.app/'),
  title: {
    default: 'وكالة الذكاء الاصطناعي',
    template: '%s | وكالة الذكاء الاصطناعي'
  },
  description: 'حلول ذكية لتطوير أعمالك باستخدام تقنيات الذكاء الاصطناعي',
  keywords: ['الذكاء الاصطناعي','تطوير مواقع' ,'تطوير الأعمال', 'تحليل البيانات', 'التسويق الرقمي'],
  openGraph: {
    type: 'website',
    locale: 'ar_AR',
    url: 'https://fikra-theta.vercel.app/',
    siteName: 'وكالة الذكاء الاصطناعي',
    images: [{
      url: '/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'AI Agency Platform Preview',
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "وكالة الذكاء الاصطناعي - حلول ذكية لتطوير أعمالك",
    description: "اكتشف كيف يمكن للذكاء الاصطناعي تحسين أعمالك.",
    images: ["https://yourwebsite.com/twitter-image.png"], 
    site: "@your_twitter_handle", 
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: 'your-google-verification-code',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
       <Head>
        <title>{metadata.title.default}</title>
        <meta name="description" content={metadata.description} />
        <meta name="keywords" content={metadata.keywords.join(', ')} />
        <meta name="robots" content="index, follow" />
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href={metadata.manifest} />
      </Head>
      <body className={tajawal.className}>
        <Header />
        <main className="min-h-screen pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
