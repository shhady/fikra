'use client'
import { useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { IoChatbubbleEllipsesOutline } from 'react-icons/io5'
import { useLanguage } from '../context/LanguageContext'

export default function ChatButton() {
  const router = useRouter()
  const pathname = usePathname()
  const { language } = useLanguage()

  // Hide button on chat page
  if (pathname === '/chat') return null;

  const tooltipText = {
    en: 'Chat with AI Assistant',
    ar: 'تحدث مع المساعد الذكي',
    he: 'שוחח עם העוזר החכם'
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        className="relative group"
      >
        <button
          onClick={() => router.push('/chat')}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 
                     text-white rounded-full p-3 shadow-lg transition-all duration-300
                     flex items-center justify-center"
          aria-label="Open Chat"
        >
          <IoChatbubbleEllipsesOutline className="w-6 h-6" />
        </button>
        
        {/* Tooltip */}
        <div className="absolute bottom-full mb-2 hidden group-hover:block">
          <div className="bg-gray-900 text-white text-sm rounded-lg py-1 px-3 whitespace-nowrap ml-[-100px]">
            {tooltipText[language]}
          </div>
          <div className="w-2 h-2 bg-gray-900 transform rotate-45 translate-x-1/2 translate-y-[-4px] mx-auto"></div>
        </div>
      </motion.div>
    </div>
  )
} 