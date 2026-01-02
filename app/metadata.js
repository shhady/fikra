export const metadata = {
  metadataBase: new URL('https://www.fikranova.com'),
  title: {
    default: 'AI Agency | FikraNova | وكالة الذكاء الاصطناعي',
    template: '%s | FikraNova'
  },
  description: 'FikraNova: Premier AI Automation Agency. We provide AI-powered web development, custom AI agents, and smart digital marketing services. فكرة نوفا: وكالة رائدة في حلول الذكاء الاصطناعي وتطوير الأعمال.',
  keywords: [
    'AI Agency',
    'Artificial Intelligence',
    'AI Automation Agency',
    'Web Development',
    'Next.js AI Integration',
    'AI Agents',
    'Chatbots',
    'Business Automation',
    'Digital Marketing',
    'Fikra Nova',
    'وكالة ذكاء اصطناعي',
    'تطوير مواقع',
    'أتمتة الأعمال',
    'סוכנות בינה מלאכותית',
    'פיתוח אתרים',
    'אוטומציה לעסקים'
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.fikranova.com',
    siteName: 'FikraNova',
    title: 'FikraNova - AI Automation & Web Development Agency',
    description: 'Transform your business with AI-powered web development, custom agents, and automation services. Serving MENA and Global markets.',
    images: [{
      url: '/android-chrome-512x512.png',
      width: 512,
      height: 512,
      alt: 'FikraNova Logo',
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FikraNova - Smart Solutions for Your Business",
    description: "We provide smart solutions to develop your business using the latest artificial intelligence technologies",
    images: ["/android-chrome-512x512.png"],
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