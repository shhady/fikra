'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TypeAnimation } from 'react-type-animation'
import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '../context/LanguageContext'
import { ar } from '../translations/ar'
import { he } from '../translations/he'
import { en } from '../translations/en'
import { SplineScene } from '@/components/ui/splite'

export default function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
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

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const getTypingSequence = () => {
    const services = translations.home.hero.services;
    return [
      services.webDev,
      2000,
      services.dataAnalysis,
      2000,
      services.digitalMarketing,
      2000,
      services.automation,
      2000,
      services.aiAgents,
      2000,
      services.aiAutomation,
      2000,
    ];
  };

  useEffect(() => {
    // Force TypeAnimation to restart when language changes
    const typingElement = document.querySelector('.type-animation');
    if (typingElement) {
      typingElement.key = language; // Force re-render
    }
  }, [language]);

  return (
    <section className="relative min-h-screen overflow-hidden bg-black">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          style={{
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
          }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          style={{
            transform: `translate(${mousePosition.x * -0.02}px, ${mousePosition.y * -0.02}px)`,
          }}
        />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />

      {/* Mobile-only Spline background behind content */}
      <div className="absolute inset-0 lg:hidden z-0 pointer-events-none">
        <SplineScene
          scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
          className="w-full h-full"
        />
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-20 ${isRTL ? '' : 'lg:flex-row-reverse'}`}>
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={`text-${isRTL ? 'right' : 'left'}`}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className={`inline-block ${isRTL ? '' : 'w-full'}`}
            >
              <div className={`bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-px mb-8 ${isRTL ? 'inline-block' : 'inline-block'}`}>
                <div className="bg-black rounded-full px-4 py-1">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                    {translations.home.hero.badge}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              {translations.home.hero.mainHeading}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                {translations.home.hero.aiText}
              </span>
            </h1>

            {/* Typing Animation */}
            <div className={`text-xl md:text-2xl text-gray-400 mb-8 h-20 text-${isRTL ? 'right' : 'left'}`}>
              <TypeAnimation
                key={language} // Force re-render on language change
                sequence={getTypingSequence()}
                wrapper="span"
                speed={50}
                repeat={Infinity}
                cursor={true}
                className="type-animation"
              />
            </div>

            {/* CTA Buttons */}
            <div className={`flex flex-col sm:flex-row gap-4 ${isRTL ? 'justify-start' : 'justify-start'} items-center`}>
              <Link 
                href="/contact"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 text-center font-semibold text-lg shadow-lg hover:shadow-blue-500/25"
              >
                {translations.home.hero.cta.startProject}
              </Link>
              <Link 
                href="/services"
                className="w-full sm:w-auto px-8 py-4 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-300 text-center font-semibold text-lg backdrop-blur-sm"
              >
                {translations.home.hero.cta.discoverServices}
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">+20</div>
                <div className="text-gray-400">{translations.home.hero.stats.projects}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">+20</div>
                <div className="text-gray-400">{translations.home.hero.stats.clients}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">+3</div>
                <div className="text-gray-400">{translations.home.hero.stats.experience}</div>
              </div>
            </div>
          </motion.div>

          {/* Visual: 3D Spline Robot replaces previous photo/visuals */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block h-[600px]"
          >
            <SplineScene
              scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
              className="w-full h-full"
            />
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      {/* <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-white rounded-full mt-2"
          />
        </div>
      </motion.div> */}
    </section>
  )
}