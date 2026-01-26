import { Geist, Geist_Mono, Heebo } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const heebo = Heebo({
  subsets: ["hebrew"],
  variable: "--font-heebo",
});

export const viewport = {
  themeColor: '#C9A25E',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata = {
  title: 'COCO NAILS | Professional Beauty Center — כרטיס ביקור דיגיטלי',
  description:
    'COCO NAILS — מרכז יופי מקצועי בחיפה: מניקור, פדיקור, בניית ציפורניים וטיפולי יופי מתקדמים.',
  manifest: '/site.webmanifest',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://example.com'),
  keywords: [
    'מניקור',
    'פדיקור',
    'בניית ציפורניים',
    'יופי',
    'טיפולי יופי',
    'COCO NAILS',
    'חיפה',
  ],
  authors: [{ name: 'Shhady Serhan' }],
  creator: 'Shhady Serhan',
  openGraph: {
    title: 'COCO NAILS | Professional Beauty Center — כרטיס ביקור דיגיטלי',
    description:
      'טיפולי ניילס ויופי מוקפדים בחיפה — מניקור, פדיקור, בניית ציפורניים וטיפולי פנים.',
    url: '/',
    siteName: 'COCO NAILS — Professional Beauty Center',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'COCO NAILS — Professional Beauty Center',
      },
    ],
    locale: 'he_IL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'COCO NAILS — Professional Beauty Center',
    description:
      'מרכז יופי מקצועי בחיפה — מניקור, פדיקור ובניית ציפורניים.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
  },
};

export default function CocoNailsLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${geistSans.variable} ${geistMono.variable} ${heebo.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
