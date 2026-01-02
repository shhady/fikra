'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function SitemapPage() {
  const pages = [
    { href: "/", title: "الصفحة الرئيسية" },
    { href: "/services", title: "خدماتنا" },
    { href: "/blog", title: "المدونة" },
    { href: "/faq", title: "الأسئلة الشائعة" },
    { href: "/contact", title: "تواصل معنا" },
    { href: "/support", title: "الدعم الفني" },
    { href: "/privacy", title: "سياسة الخصوصية" },
    { href: "/terms", title: "الشروط والأحكام" }
  ]

  return (
    <div className="min-h-screen bg-black py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white mb-8"
        >
          خريطة الموقع
        </motion.h1>
        <div className="space-y-6">
          {pages.map((page, index) => (
            <motion.div
              key={page.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <SitemapLink href={page.href} title={page.title} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SitemapLink({ href, title }) {
  return (
    <div className="bg-gray-900 rounded-xl p-6 hover:bg-gray-800 transition-colors">
      <Link 
        href={href} 
        className="text-xl text-white hover:text-blue-400 transition-colors"
      >
        {title}
      </Link>
      <p className="text-gray-400 mt-2 text-sm dir-ltr">
        {`https://www.fikranova.com${href}`}
      </p>
    </div>
  )
} 