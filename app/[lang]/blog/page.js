'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useMemo } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { blogData } from '@/lib/blogData'

export default function BlogPage() {
  const { language } = useLanguage()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState({ type: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const texts = useMemo(() => {
    const dict = {
      he: {
        title: 'הבלוג',
        subtitle: 'עדכונים ומאמרים על בינה מלאכותית ופיתוח עסקי',
        readMore: 'קרא עוד',
        newsletterTitle: 'הצטרפו לניוזלטר שלנו',
        newsletterSubtitle: 'קבלו עדכונים ומאמרים ישירות למייל',
        emailPlaceholder: 'האימייל שלך',
        subscribe: isSubmitting ? 'נרשם...' : 'הירשם עכשיו',
        author: 'צוות FikraNova'
      },
      en: {
        title: 'Blog',
        subtitle: 'Latest news and insights on AI and business development',
        readMore: 'Read more',
        newsletterTitle: 'Join our newsletter',
        newsletterSubtitle: 'Get updates and articles straight to your inbox',
        emailPlaceholder: 'Your email',
        subscribe: isSubmitting ? 'Subscribing...' : 'Subscribe now',
        author: 'FikraNova Team'
      },
      ar: {
        title: 'المدونة',
        subtitle: 'آخر الأخبار والمقالات حول الذكاء الاصطناعي وتطوير الأعمال',
        readMore: 'اقرأ المزيد',
        newsletterTitle: 'اشترك في نشرتنا البريدية',
        newsletterSubtitle: 'احصل على آخر الأخبار والمقالات على بريدك',
        emailPlaceholder: 'بريدك الإلكتروني',
        subscribe: isSubmitting ? 'جاري الاشتراك...' : 'اشترك الآن',
        author: 'فريق فكرة نوفا'
      }
    };
    return dict[language] || {};
  }, [language, isSubmitting])

  // Select posts by current language: slugs starting with lang prefix.
  const posts = useMemo(() => {
    const entries = Object.entries(blogData)
    if (language === 'en') return entries.filter(([k]) => k.startsWith('en-'))
    if (language === 'he') return entries.filter(([k]) => k.startsWith('he-'))
    // Arabic: prefer ar- plus legacy Arabic posts without prefix
    return entries.filter(([k]) => k.startsWith('ar-') || !k.match(/^(en|he)-/))
  }, [language]).map(([key, v]) => ({ id: v.slug, ...v }))

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setStatus({ type: '', message: '' })

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()
      if (response.ok) { setStatus({ type: 'success', message: data.message }); setEmail('') }
      else { setStatus({ type: 'error', message: data.error }) }
    } catch {
      setStatus({ type: 'error', message: language === 'he' ? 'אירעה שגיאה' : language === 'en' ? 'An error occurred' : 'حدث خطأ أثناء الاشتراك' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-black to-black opacity-90"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">{texts.title}</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">{texts.subtitle}</p>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((blog, index) => (
              <motion.article
                key={blog.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image src={blog.image} alt={blog.title} fill className="object-cover transition-transform duration-300 hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 right-4">
                    <span className="px-3 py-1 bg-blue-500/80 backdrop-blur-sm rounded-full text-sm text-white">
                      {blog.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden">
                      <Image src="/android-chrome-192x192.png" alt={texts.author} fill className="object-cover" />
                    </div>
                    <div>
                      <h3 className="text-white text-sm font-medium">{texts.author}</h3>
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <span>{blog.date}</span>
                        <span>•</span>
                        <span>{blog.readTime}</span>
                      </div>
                    </div>
                  </div>

                  <h2 className="text-xl font-bold text-white mb-3 line-clamp-2">{blog.title}</h2>
                  <p className="text-gray-400 mb-4 line-clamp-3">{blog.excerpt}</p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {(blog.tags || []).map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-white/5 rounded-lg text-sm text-gray-400">#{tag}</span>
                    ))}
                  </div>

                  <Link href={`/${language}/blog/${blog.id}`} className="inline-block w-full text-center py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300">
                    {texts.readMore}
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-3xl p-8 md:p-16">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-white mb-4">{texts.newsletterTitle}</h2>
              <p className="text-gray-300 mb-8">{texts.newsletterSubtitle}</p>
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={texts.emailPlaceholder}
                  className="flex-1 px-6 py-4 bg-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-8 py-4 bg-white text-blue-900 rounded-xl font-semibold ${!isSubmitting ? 'hover:bg-blue-50' : 'opacity-75 cursor-not-allowed'} transition-colors duration-300`}
                >
                  {texts.subscribe}
                </button>
              </form>
              {status.message && (
                <p className={`mt-4 text-sm ${status.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {status.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
} 
