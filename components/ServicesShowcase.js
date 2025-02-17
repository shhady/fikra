'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  FaCode, 
  FaChartLine, 
  FaMegaport, 
  FaVideo, 
  FaRobot,
  FaCogs,
} from 'react-icons/fa'
import { useLanguage } from '../context/LanguageContext'
import { ar } from '../translations/ar'
import { he } from '../translations/he'
import { en } from '../translations/en'

const ServicesShowcase = () => {
  const router = useRouter()
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
      features: translations.home.services.items.webDev.features.map((text, index) => ({
        id: `web-${index + 1}`,
        text
      })),
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
      features: translations.home.services.items.business.features.map((text, index) => ({
        id: `bus-${index + 1}`,
        text
      })),
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
      features: translations.home.services.items.marketing.features.map((text, index) => ({
        id: `mkt-${index + 1}`,
        text
      })),
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
      features: translations.home.services.items.content.features.map((text, index) => ({
        id: `cnt-${index + 1}`,
        text
      })),
      technologies: [
        { id: 'tech-15', name: 'Adobe Creative Suite' },
        { id: 'tech-16', name: 'Midjourney' },
        { id: 'tech-17', name: 'DALL-E' },
        { id: 'tech-18', name: 'Stable Diffusion' },
      ],
    },
    {
      id: 'ai-automation',
      title: translations.home.services.items.aiAutomation.title,
      description: translations.home.services.items.aiAutomation.description,
      icon: FaCogs,
      gradient: 'from-blue-600 to-indigo-400',
      features: translations.home.services.items.aiAutomation.features.map((text, index) => ({
        id: `aut-${index + 1}`,
        text
      })),
      technologies: [
        { id: 'tech-24', name: 'Make.com' },
        { id: 'tech-25', name: 'Zapier' },
        { id: 'tech-27', name: 'N8N' },
        // { id: 'tech-28', name: 'Google Cloud AI' },

      ],
    },
    {
      id: 'ai-agents',
      title: `${translations.home.services.items.aiAgents.title} (${language === 'he' ? 'בקרוב' : language === 'en' ? 'Soon' : 'قريباً'})`,
      description: translations.home.services.items.aiAgents.description,
      icon: FaRobot,
      gradient: 'from-indigo-500 to-violet-400',
      features: translations.home.services.items.aiAgents.features.map((text, index) => ({
        id: `agt-${index + 1}`,
        text
      })),
      technologies: [
        { id: 'tech-19', name: 'OpenAI' },
        { id: 'tech-20', name: 'LangChain' },
        { id: 'tech-21', name: 'Hugging Face' },
        { id: 'tech-22', name: 'TensorFlow' },
        { id: 'tech-23', name: 'PyTorch' },
      ],
    },
   
  ]

  return (
    <div className="bg-black py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            {translations.home.services.title}
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            {translations.home.services.subtitle}
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-8"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="relative bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden"
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
                    {service.features.map((feature) => (
                      <li key={feature.id} className={`flex items-center text-gray-300 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${service.gradient} ${isRTL ? 'ml-2' : 'mr-2'}`}></span>
                        {feature.text}
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
                  className="relative z-20 block w-full text-center py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium"
                >
                  {translations.home.services.requestService}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ServicesShowcase 