export const metadata = {
  metadataBase: new URL('https://www.fikranova.com'),
  title: {
    default: 'AI Agency | FikraNova',
    template: '%s | FikraNova'
  },
  description: 'We provide smart solutions to develop your business using the latest artificial intelligence technologies. Web development, digital marketing, and data analysis services.',
  keywords: [
    'Artificial Intelligence',
    'Web Development',
    'Business Development',
    'Data Analysis',
    'Digital Marketing',
    'Fikra Nova',
    'Web Design',
    'Web Programming',
    'Web Services'
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.fikranova.com',
    siteName: 'FikraNova',
    images: [{
      url: '/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'Fikra Nova - AI Agency',
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fikra Nova - Smart Solutions for Your Business",
    description: "We provide smart solutions to develop your business using the latest artificial intelligence technologies",
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