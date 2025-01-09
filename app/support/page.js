'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiHelpCircle, FiBook, FiMessageCircle, FiPhone } from 'react-icons/fi'

const supportCategories = [
  {
    icon: <FiHelpCircle className="w-8 h-8" />,
    title: 'الدعم الفني',
    description: 'مساعدة تقنية فورية لجميع خدماتنا',
    link: '#technical-support'
  },
  {
    icon: <FiBook className="w-8 h-8" />,
    title: 'قاعدة المعرفة',
    description: 'إرشادات وحلول للمشاكل الشائعة',
    link: '#knowledge-base'
  },
  {
    icon: <FiMessageCircle className="w-8 h-8" />,
    title: 'المحادثة المباشرة',
    description: 'تحدث مباشرة مع فريق الدعم',
    link: '#live-chat'
  },
  {
    icon: <FiPhone className="w-8 h-8" />,
    title: 'اتصل بنا',
    description: 'تواصل معنا عبر الهاتف',
    link: '/contact'
  }
]

const faqs = [
  {
    question: 'ما هي خدمات الدعم التي تقدمونها؟',
    answer: 'نقدم مجموعة شاملة من خدمات الدعم تشمل الدعم الفني، الاستشارات التقنية، حل المشكلات، وتحديثات النظام.'
  },
  {
    question: 'كيف يمكنني الحصول على المساعدة الفورية؟',
    answer: 'يمكنك التواصل معنا عبر المحادثة المباشرة، الاتصال بنا، أو إرسال طلب دعم من خلال النموذج أدناه.'
  },
  {
    question: 'ما هي ساعات عمل فريق الدعم؟',
    answer: 'فريق الدعم متاح من الأحد إلى الخميس، من الساعة 9 صباحاً حتى 5 مساءً.'
  },
  {
    question: 'كم تستغرق مدة الرد على طلبات الدعم؟',
    answer: 'نسعى للرد على جميع الطلبات خلال 24 ساعة عمل. الحالات العاجلة يتم التعامل معها بأولوية قصوى.'
  }
]

export default function SupportPage() {
  const [ticketData, setTicketData] = useState({
    name: '',
    email: '',
    subject: '',
    priority: '',
    description: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle ticket submission
    console.log('Ticket submitted:', ticketData)
  }

  return (
    <main className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative py-24">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-purple-900/90"></div>
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              مركز المساعدة والدعم
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              فريق الدعم الفني جاهز لمساعدتك. اختر الخدمة المناسبة أو ابحث في قاعدة المعرفة.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Support Categories */}
      <section className="py-16 relative z-10 -mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportCategories.map((category, index) => (
              <motion.a
                key={index}
                href={category.link}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-2xl hover:from-blue-900/20 hover:to-purple-900/20 transition-all duration-300"
              >
                <div className="text-blue-500 mb-4">{category.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{category.title}</h3>
                <p className="text-gray-400">{category.description}</p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Support Ticket Form */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 md:p-12 shadow-2xl"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                فتح تذكرة دعم فني
              </h2>
              <p className="text-gray-400">
                املأ النموذج أدناه وسيقوم فريق الدعم بالرد عليك في أقرب وقت
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-400 mb-2">الاسم</label>
                  <input
                    type="text"
                    value={ticketData.name}
                    onChange={(e) => setTicketData({ ...ticketData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={ticketData.email}
                    onChange={(e) => setTicketData({ ...ticketData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-400 mb-2">الموضوع</label>
                  <input
                    type="text"
                    value={ticketData.subject}
                    onChange={(e) => setTicketData({ ...ticketData, subject: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">الأولوية</label>
                  <select
                    value={ticketData.priority}
                    onChange={(e) => setTicketData({ ...ticketData, priority: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                    required
                  >
                    <option value="" className="bg-gray-900">اختر الأولوية</option>
                    <option value="low" className="bg-gray-900">منخفضة</option>
                    <option value="medium" className="bg-gray-900">متوسطة</option>
                    <option value="high" className="bg-gray-900">عالية</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-2">وصف المشكلة</label>
                <textarea
                  value={ticketData.description}
                  onChange={(e) => setTicketData({ ...ticketData, description: e.target.value })}
                  rows="6"
                  className="w-full px-4 py-3 bg-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
              >
                إرسال طلب الدعم
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gradient-to-t from-blue-900/20 to-transparent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">
            الأسئلة الشائعة
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/5 rounded-2xl p-6 hover:bg-white/10 transition-colors duration-300"
              >
                <h3 className="text-xl font-semibold text-white mb-3">{faq.question}</h3>
                <p className="text-gray-300">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
} 