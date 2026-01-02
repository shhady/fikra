'use client'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Script from 'next/script'
import { useLanguage } from '@/context/LanguageContext'
import { ar } from '@/translations/ar'
import { he } from '@/translations/he'
import { en } from '@/translations/en'

export default function AboutPage() {
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
    <main className="bg-black min-h-screen">
      <Script id="breadcrumbs-about" type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `https://www.fikranova.com/${language}` },
              { '@type': 'ListItem', position: 2, name: 'About', item: `https://www.fikranova.com/${language}/about` }
            ]
          })
        }}
      />
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-black to-black opacity-90"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6"
          >
            {translations.about.hero.title}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            {translations.about.hero.subtitle}
          </motion.p>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 bg-gradient-to-b from-black to-blue-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl relative group hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
              <h2 className={`text-3xl font-bold text-white mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                {translations.about.vision.title}
              </h2>
              <p className={`text-gray-300 leading-relaxed relative z-10 ${isRTL ? 'text-right' : 'text-left'}`}>
                {translations.about.vision.description}
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl relative group hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
              <h2 className={`text-3xl font-bold text-white mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                {translations.about.mission.title}
              </h2>
              <p className={`text-gray-300 leading-relaxed relative z-10 ${isRTL ? 'text-right' : 'text-left'}`}>
                {translations.about.mission.description}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-gradient-to-b from-blue-950 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className={`text-3xl font-bold text-white mb-12 ${isRTL ? 'text-right' : 'text-left'}`}
          >
            {translations.about.values.title}
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {translations.about.values.items.map((value, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-xl group hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
              >
                <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {value.icon}
                </div>
                <h3 className={`text-xl font-bold text-white mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {value.title}
                </h3>
                <p className={`text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      {/* <section className="py-16 bg-gradient-to-b from-black to-blue-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white text-center mb-12">فريقنا المتميز</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {teamMembers.map((member) => (
              <div key={member.id} className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-xl text-center">
                <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                <p className="text-gray-400 mb-4">{member.role}</p>
                <div className="flex justify-center space-x-4">
                  <a href={member.linkedin} className="text-gray-400 hover:text-white">
                    <FaLinkedinIn className="w-5 h-5" />
                  </a>
                  <a href={member.twitter} className="text-gray-400 hover:text-white">
                    <FaTwitter className="w-5 h-5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-blue-950 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-3xl p-8 md:p-16 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-black opacity-50"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  {translations.about.cta.title}
                </h2>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                  {translations.about.cta.subtitle}
                </p>
                <Link
                  href={`/${language}/contact`}
                  className="inline-block bg-white text-blue-900 px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-50 transition-colors duration-300 transform hover:scale-105"
                >
                  {translations.about.cta.button}
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
} 