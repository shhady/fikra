'use client'
import { motion } from 'framer-motion'
import { useLanguage } from '@/context/LanguageContext'
import { ar } from '@/translations/ar'
import { he } from '@/translations/he'
import { en } from '@/translations/en'

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
}

export default function TermsPage() {
  const { language, isRTL } = useLanguage()
  
  const getTranslations = () => {
    switch (language) {
      case 'he':
        return he;
      case 'en':
        return en;
      default:
        return ar;
    }
  };

  const translations = getTranslations();

  return (
    <main className="min-h-screen bg-black py-24">
      <div className="max-w-4xl mx-auto px-4">
        <motion.h1 
          className={`text-4xl font-bold text-white mb-8 ${isRTL ? 'text-right' : 'text-left'}`}
          variants={fadeInUp}
          initial="initial"
          animate="animate"
        >
          {translations.terms.title}
        </motion.h1>
        <div className={`prose prose-invert max-w-none ${isRTL ? 'text-right' : 'text-left'}`}>
          <motion.p 
            className="text-gray-300 mb-8 text-lg"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            {translations.terms.intro}
          </motion.p>

          {translations.terms.sections.map((section, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: index * 0.1 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-white mb-4">
                {section.title}
              </h2>
              <p className="text-gray-300">
                {section.content}
              </p>
            </motion.div>
          ))}

          <motion.p 
            className="text-sm text-gray-400 mt-12 pt-8 border-t border-gray-800"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            {translations.terms.lastUpdated}
          </motion.p>
        </div>
      </div>
    </main>
  )
} 