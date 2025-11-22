'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useLanguage } from '../../context/LanguageContext'
import { ar } from '../../translations/ar'
import { he } from '../../translations/he'
import { en } from '../../translations/en'
import { 
  FaCode, 
  FaChartLine, 
  FaMegaport, 
  FaVideo,
  FaRobot,
  FaCogs,
} from 'react-icons/fa'

export default function ServicesPage() {
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

  const services = [
    {
      id: 'web-dev',
      title: translations.home.services.items.webDev.title,
      description: translations.home.services.items.webDev.description,
      icon: FaCode,
      gradient: 'from-blue-500 to-cyan-400',
      features: translations.home.services.items.webDev.features,
      technologies: [
        { id: 'tech-1', name: 'Next.js' },
        { id: 'tech-2', name: 'React' },
        { id: 'tech-3', name: 'TensorFlow.js' },
        { id: 'tech-4', name: 'JavaScript' },
        { id: 'tech-5', name: 'Node.js' },
      ],
    },
    {
      id: 'business',
      title: translations.home.services.items.business.title,
      description: translations.home.services.items.business.description,
      icon: FaChartLine,
      gradient: 'from-purple-500 to-pink-400',
      features: translations.home.services.items.business.features,
      technologies: [
        { id: 'tech-6', name: 'Power BI' },
        { id: 'tech-7', name: 'Tableau' },
        { id: 'tech-8', name: 'Python' },
        { id: 'tech-9', name: 'Machine Learning' },
        { id: 'tech-10', name: 'Big Data' },
      ],
    },
    {
      id: 'marketing',
      title: translations.home.services.items.marketing.title,
      description: translations.home.services.items.marketing.description,
      icon: FaMegaport,
      gradient: 'from-orange-500 to-red-400',
      features: translations.home.services.items.marketing.features,
      technologies: [
        { id: 'tech-11', name: 'Google Analytics' },
        { id: 'tech-12', name: 'Meta Ads' },
        { id: 'tech-13', name: 'SEO Tools' },
        { id: 'tech-14', name: 'CRM Systems' },
      ],
    },
    {
      id: 'content',
      title: translations.home.services.items.content.title,
      description: translations.home.services.items.content.description,
      icon: FaVideo,
      gradient: 'from-green-500 to-emerald-400',
      features: translations.home.services.items.content.features,
      technologies: [
        { id: 'tech-15', name: 'Adobe Creative Suite' },
        { id: 'tech-16', name: 'Nano Banana' },
        { id: 'tech-17', name: 'ChatGPT' },
        { id: 'tech-18', name: 'Ideogram' },
        { id: 'tech-19', name: 'Kling' },
        { id: 'tech-20', name: 'Sora2' },
        { id: 'tech-21', name: 'Veo3' },
        { id: 'tech-22', name: 'Runway' },
      ],
    },
    {
      id: 'ai-agents',
      title: translations.home.services.items.aiAgents.title,
      description: translations.home.services.items.aiAgents.description,
      icon: FaRobot,
      gradient: 'from-indigo-500 to-violet-400',
      features: translations.home.services.items.aiAgents.features,
      technologies: [
        { id: 'tech-19', name: 'OpenAI' },
        { id: 'tech-20', name: 'LangChain' },
        { id: 'tech-21', name: 'Hugging Face' },
        { id: 'tech-22', name: 'TensorFlow' },
        { id: 'tech-23', name: 'PyTorch' },
      ],
    },
    {
      id: 'ai-automation',
      title: translations.home.services.items.aiAutomation.title,
      description: translations.home.services.items.aiAutomation.description,
      icon: FaCogs,
      gradient: 'from-blue-600 to-indigo-400',
      features: translations.home.services.items.aiAutomation.features,
      technologies: [
        { id: 'tech-24', name: 'Make.com' },
        { id: 'tech-25', name: 'Power Automate' },
        { id: 'tech-26', name: 'Python RPA' },
        { id: 'tech-27', name: 'Azure AI' },
        { id: 'tech-28', name: 'Google Cloud AI' },
      ],
    },
  ]

  return (
    <main className="bg-black min-h-screen">
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
            {translations.home.services.title}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            {translations.home.services.subtitle}
          </motion.p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden group hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300"
              >
                <div className={`bg-gradient-to-r ${service.gradient} opacity-5 absolute inset-0 pointer-events-none`}></div>
                <div className="relative z-10 p-8">
                  {/* Header */}
                  <div className={`flex items-start gap-4 mb-6 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`p-4 rounded-xl bg-gradient-to-r ${service.gradient}`}>
                      <service.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className={`text-${isRTL ? 'right' : 'left'}`}>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {service.title}
                      </h3>
                      <p className="text-gray-400">
                        {service.description}
                      </p>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-6">
                    <h4 className={`text-lg font-semibold text-white mb-3 text-${isRTL ? 'right' : 'left'}`}>
                      {translations.home.services.mainFeatures}
                    </h4>
                    <ul className="space-y-2">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className={`flex items-center text-gray-300 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${service.gradient} ${isRTL ? 'ml-2' : 'mr-2'}`}></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Technologies */}
                  <div className="mb-8">
                    <h4 className={`text-lg font-semibold text-white mb-3 text-${isRTL ? 'right' : 'left'}`}>
                      {translations.home.services.technologies}
                    </h4>
                    <div className={`flex flex-wrap gap-2 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                      {service.technologies.map((tech) => (
                        <span
                          key={tech.id}
                          className="px-3 py-1 bg-white/5 rounded-full text-sm text-gray-300"
                        >
                          {tech.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Link 
                    href={`/contact?service=${encodeURIComponent(service.title)}`}
                    className={`relative z-20 block w-full text-center py-3 px-4 bg-gradient-to-r ${service.gradient} text-white rounded-xl hover:opacity-90 transition-all duration-300 font-medium transform hover:scale-[1.02]`}
                  >
                    {translations.home.services.requestService}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
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
                  {translations.home.cta.title}
                </h2>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                  {translations.home.cta.subtitle}
                </p>
                <Link
                  href="/contact"
                  className="inline-block bg-white text-blue-900 px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-50 transition-colors duration-300 transform hover:scale-105"
                >
                  {translations.home.cta.startNow}
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
} 