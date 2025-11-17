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


const Hero = () => {
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

          {/* New Visual Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block h-[600px]"
          >
            {/* Main Circle */}
            <div className="absolute inset-0">
              <div 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px]"
                style={{
                  background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.3))`,
                  borderRadius: '50%',
                  filter: 'blur(40px)',
                }}
              />
            </div>

            {/* Floating Elements */}
            <div className="absolute inset-0">
              {/* Tech Cards */}
              <motion.div
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute top-20 right-20"
              >
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10">
                  <span className="text-5xl">🤖</span>
                </div>
              </motion.div>

              <motion.div
                animate={{
                  y: [0, 20, 0],
                  rotate: [0, -5, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear",
                  delay: 1
                }}
                className="absolute bottom-20 left-20"
              >
                <div className="w-32 h-32 bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10">
                  <span className="text-5xl">💡</span>
                </div>
              </motion.div>

              {/* Animated Lines */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 600">
                <motion.path
                  d="M 300 150 Q 450 150 450 300 Q 450 450 300 450 Q 150 450 150 300 Q 150 150 300 150"
                  stroke="url(#gradient)"
                  strokeWidth="0.5"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#60A5FA" />
                    <stop offset="100%" stopColor="#C084FC" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Glowing Dots */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute top-1/4 right-1/4 w-4 h-4 bg-blue-500 rounded-full blur-sm"
              />
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                  delay: 1
                }}
                className="absolute bottom-1/4 left-1/4 w-4 h-4 bg-purple-500 rounded-full blur-sm"
              />
            </div>
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

export default Hero 