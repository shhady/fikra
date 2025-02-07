'use client'
import { motion } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'
import { ar } from '../translations/ar'
import { he } from '../translations/he'
import { en } from '../translations/en'

export default function FeaturesSection() {
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
    <div className="bg-gradient-to-b from-black to-blue-900 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            {translations.home.features.title}
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mt-4">
            {translations.home.features.subtitle}
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-6"></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {translations.home.features.items.map((feature, index) => (
            <motion.div
              key={feature.number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group h-full"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-black px-8 py-12 rounded-xl h-full flex flex-col justify-between">
                <div>
                  <span className={`text-7xl font-bold text-white/10 absolute top-4 ${isRTL ? 'right-4' : 'left-4'}`}>
                    {feature.number}
                  </span>
                  <h3 className={`text-2xl font-bold text-white mb-4 relative z-10 text-${isRTL ? 'right' : 'left'}`}>
                    {feature.title}
                  </h3>
                  <p className={`text-gray-400 relative z-10 text-${isRTL ? 'right' : 'left'}`}>
                    {feature.description}
                  </p>
                </div>
                <div className={`mt-6 relative z-10 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <div className={`h-1 w-12 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300 ${isRTL ? 'mr-0' : 'ml-0'}`}></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
} 