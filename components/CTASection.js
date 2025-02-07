'use client'
import Link from 'next/link'
import { useLanguage } from '../context/LanguageContext'
import { ar } from '../translations/ar'
import { he } from '../translations/he'
import { en } from '../translations/en'

export default function CTASection() {
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
    <div className="relative bg-black py-16">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-3xl p-8 md:p-16 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-3xl"></div>
          
          <div className={`relative flex flex-col md:flex-row items-center ${isRTL ? 'justify-between' : 'justify-between'} gap-8`}>
            <div className={`text-center md:text-${isRTL ? 'right' : 'left'}`}>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {translations.home.cta.title}
              </h2>
              <p className="text-blue-100/80 text-lg max-w-xl">
                {translations.home.cta.subtitle}
              </p>
            </div>
            
            <div className={`flex flex-col sm:flex-row gap-4 ${isRTL ? 'md:justify-start' : 'md:justify-end'}`}>
              <Link
                href="/contact"
                className="px-8 py-4 bg-white text-blue-900 rounded-full text-lg font-medium hover:bg-blue-50 transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
              >
                {translations.home.cta.startNow}
              </Link>
              <Link
                href="/services"
                className="px-8 py-4 bg-blue-500/20 text-white rounded-full text-lg font-medium hover:bg-blue-500/30 backdrop-blur-sm transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
              >
                {translations.home.cta.learnMore}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 