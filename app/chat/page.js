'use client'
import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiSend } from 'react-icons/fi'
import { useLanguage } from '../../context/LanguageContext'
import Image from 'next/image'

export default function ChatPage() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { language, isRTL } = useLanguage()
  const messagesContainerRef = useRef(null)
  const hasEmailBeenSent = useRef(false)
  const currentMessages = useRef([])
  const [viewportHeight, setViewportHeight] = useState('100dvh')

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Keep currentMessages ref updated with latest messages
  useEffect(() => {
    currentMessages.current = messages;
  }, [messages]);

  // Add cleanup effect to send chat history
  useEffect(() => {
    // Function to send chat history
    const sendChatHistory = async () => {
      const messagesToSend = currentMessages.current;
      if (messagesToSend.length > 0 && !hasEmailBeenSent.current) {
        try {
          hasEmailBeenSent.current = true;
          await fetch('/api/chat', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: messagesToSend })
          });
        } catch (error) {
          console.error('Failed to send chat history:', error);
          hasEmailBeenSent.current = false;
        }
      }
    };

    // Function to handle page unload
    const handleUnload = () => {
      const messagesToSend = currentMessages.current;
      if (messagesToSend.length > 0 && !hasEmailBeenSent.current) {
        hasEmailBeenSent.current = true;
        const blob = new Blob([JSON.stringify({ messages: messagesToSend })], { type: 'application/json' });
        navigator.sendBeacon('/api/chat', blob);
      }
    };

    // Add unload event listener
    window.addEventListener('beforeunload', handleUnload);
    
    // Cleanup function
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      // Only send if not already sent
      if (!hasEmailBeenSent.current) {
        sendChatHistory();
      }
    };
  }, []); // Remove messages dependency, use ref instead

  useEffect(() => {
    const handleResize = () => {
      // Get the visual viewport height
      const height = window.visualViewport?.height || window.innerHeight
      setViewportHeight(`${height}px`)
      
      // Prevent automatic scrolling when keyboard opens
      if (window.visualViewport) {
        window.scrollTo(0, 0)
        document.body.scrollTop = 0
        document.documentElement.scrollTop = 0
        
        // Add a small delay to ensure the layout has adjusted
        setTimeout(() => {
          scrollToBottom()
        }, 100)
      }
    }

    // Add event listeners
    window.visualViewport?.addEventListener('resize', handleResize)
    window.visualViewport?.addEventListener('scroll', handleResize)

    // Initial call
    handleResize()

    // Cleanup
    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize)
      window.visualViewport?.removeEventListener('scroll', handleResize)
    }
  }, [])

  // Add overflow hidden to body when component mounts
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }

  const formatMessage = (content) => {8
    if (typeof content !== 'string') return content;
    
    // Convert markdown links to HTML first
    content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-blue-400 hover:text-blue-300 underline">$1</a>');
    
    // Split content by line breaks or markdown headers
    const lines = content.split(/\n|(?=###?\s)/);
    return lines.map((line, index) => {
      // Check for headers
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-bold mt-4 mb-2">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-bold mt-6 mb-3">{line.replace('## ', '')}</h2>;
      }
      // Check for bullet points
      if (line.trim().startsWith('- ')) {
        return <li key={index} className="ml-4 mb-1">{line.trim().substring(2)}</li>;
      }
      // Check for numbered lists
      if (line.trim().match(/^\d+\.\s/)) {
        return <li key={index} className="ml-4 mb-1">{line.trim().substring(line.indexOf('.') + 2)}</li>;
      }
      // Regular paragraph with HTML support
      if (line.trim()) {
        return <p key={index} className="mb-2" dangerouslySetInnerHTML={{ __html: line }} />;
      }
      return null;
    });
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'text/plain',
        },
        body: JSON.stringify({ messages: [...messages, userMessage] })
      })

      if (!response.ok) {
        throw new Error(language === 'he' ? 'נא לפנות לדף יצירת הקשר שלנו <a href="https://fikranova.com/contact" target="_blank" class="text-blue-400 hover:text-blue-300 underline">https://fikranova.com/contact</a>' : 
                       language === 'en' ? 'Please visit our contact page at <a href="https://fikranova.com/contact" target="_blank" class="text-blue-400 hover:text-blue-300 underline">https://fikranova.com/contact</a>' : 
                       'يرجى زيارة صفحة الاتصال الخاصة بنا <a href="https://fikranova.com/contact" target="_blank" class="text-blue-400 hover:text-blue-300 underline">https://fikranova.com/contact</a>');
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = { role: 'assistant', content: '' }
      
      setMessages(prev => [...prev, assistantMessage])

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        const text = decoder.decode(value)
        assistantMessage.content += text
        setMessages(prev => [...prev.slice(0, -1), { ...assistantMessage }])
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: error.message
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col bg-black fixed inset-0 overflow-hidden max-h-[100dvh]" style={{ height: viewportHeight }}>
      {/* Header */}
      {/* <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-gray-900 to-black border-b border-gray-800">
        <div className="flex items-center h-16 px-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-4.png"
              alt="Logo"
              width={120}
              height={40}
              className="object-contain"
            />
          </div>
        </div>
      </div> */}

      {/* Messages Container */}
      <div className="flex-1 mt-20 relative" style={{ height: `calc(${viewportHeight} - 72px - 80px)` }}>
        <div 
          ref={messagesContainerRef}
          className="absolute inset-0 overflow-y-auto"
        >
          <div className="max-w-4xl mx-auto px-4 py-4">
            {/* Welcome Message */}
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start gap-4 mb-4"
              >
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                  🤖
                </div>
                <div className="bg-gray-800 text-gray-200 rounded-2xl px-4 py-2">
                  {language === 'he' ? 'שלום! איך אוכל לעזור לך היום?' :
                   language === 'en' ? 'Hello! How can I help you today?' :
                   'مرحباً! كيف يمكنني مساعدتك اليوم؟'}
                </div>
              </motion.div>
            )}

            {/* Chat Messages */}
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start gap-4 mb-4 ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' ? 'bg-blue-500' : 'bg-purple-500'
                }`}>
                  {message.role === 'user' ? '👤' : '🤖'}
                </div>
                
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  message.role === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-800 text-gray-200'
                }`}>
                  <div className="prose prose-invert max-w-none">
                    {formatMessage(message.content)}
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Loading Indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start gap-4 mb-4"
              >
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                  🤖
                </div>
                <div className="bg-gray-800 rounded-2xl px-4 py-2">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Input Form - Fixed at bottom */}
      <div className="h-20 bg-gradient-to-r from-gray-900 to-black border-t border-gray-800">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-4 p-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={scrollToBottom}
            placeholder={
              language === 'he' ? 'הקלד את הודעתך כאן...' :
              language === 'en' ? 'Type your message here...' :
              'اكتب رسالتك هنا...'
            }
            className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl px-6 py-2 flex items-center gap-2 transition-all duration-200 ${
              isLoading || !input.trim()
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:from-blue-600 hover:to-blue-700'
            }`}
          >
            <span className="hidden sm:inline">
              {language === 'he' ? 'שלח' :
               language === 'en' ? 'Send' :
               'إرسال'}
            </span>
            <FiSend className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  )
} 