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

export default function PrivacyPage() {
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
          {translations.privacy.title}
        </motion.h1>
        <div className={`prose prose-invert max-w-none ${isRTL ? 'text-right' : 'text-left'}`}>
          <motion.p 
            className="text-gray-300 mb-6"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            {translations.privacy.intro}
          </motion.p>

          <motion.h2 
            className="text-2xl font-bold text-white mt-8 mb-4"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            {translations.privacy.collection.title}
          </motion.h2>
          <motion.p 
            className="text-gray-300 mb-6"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            {translations.privacy.collection.description}
          </motion.p>
          <motion.ul 
            className="list-disc list-inside text-gray-300 mb-6"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            {translations.privacy.collection.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </motion.ul>

          <motion.h2 
            className="text-2xl font-bold text-white mt-8 mb-4"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            {translations.privacy.usage.title}
          </motion.h2>
          <motion.p 
            className="text-gray-300 mb-6"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            {translations.privacy.usage.description}
          </motion.p>
          <motion.ul 
            className="list-disc list-inside text-gray-300 mb-6"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            {translations.privacy.usage.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </motion.ul>

          <motion.h2 
            className="text-2xl font-bold text-white mt-8 mb-4"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            {translations.privacy.protection.title}
          </motion.h2>
          <motion.p 
            className="text-gray-300 mb-6"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            {translations.privacy.protection.description}
          </motion.p>
        </div>
      </div>
    </main>
  )
} 