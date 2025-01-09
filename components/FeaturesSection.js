'use client'
import { motion } from 'framer-motion'
import { FiCode, FiTrendingUp, FiMessageSquare, FiLayout, FiTarget, FiPieChart } from 'react-icons/fi'

const features = [
  {
    icon: <FiCode className="w-8 h-8" />,
    title: 'تطوير المواقع ',
    description: 'نقدم خدمات تطوير مواقع الويب باستخدام أحدث تقنيات الذكاء الاصطناعي لتحسين تجربة المستخدم وزيادة الكفاءة.'
  },
  {
    icon: <FiTrendingUp className="w-8 h-8" />,
    title: 'تحسين الأداء',
    description: 'نستخدم تحليلات البيانات المتقدمة وخوارزميات الذكاء الاصطناعي لتحسين أداء عملك وزيادة الإنتاجية.'
  },
  {
    icon: <FiMessageSquare className="w-8 h-8" />,
    title: 'التواصل الذكي',
    description: 'نوفر حلول اتصال ذكية تعتمد على الذكاء الاصطناعي لتحسين التواصل مع العملاء وتعزيز رضاهم.'
  },
  {
    icon: <FiLayout className="w-8 h-8" />,
    title: 'تصميم تفاعلي',
    description: 'نصمم واجهات مستخدم جذابة وتفاعلية تتكيف مع جميع الأجهزة لتقديم تجربة مستخدم استثنائية.'
  },
  {
    icon: <FiTarget className="w-8 h-8" />,
    title: 'التسويق الذكي',
    description: 'نستخدم استراتيجيات تسويق مدعومة بالذكاء الاصطناعي لاستهداف جمهورك المناسب وتحقيق نتائج أفضل.'
  },
  {
    icon: <FiPieChart className="w-8 h-8" />,
    title: 'تحليل البيانات',
    description: 'نقدم تحليلات عميقة للبيانات باستخدام الذكاء الاصطناعي لمساعدتك في اتخاذ قرارات أعمال أفضل.'
  }
]

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-6">
            خدماتنا المميزة
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            نقدم مجموعة متكاملة من الحلول المبتكرة المدعومة بالذكاء الاصطناعي لتطوير وتحسين أعمالك
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl shadow-xl hover:from-blue-900/20 hover:to-purple-900/20 transition-all duration-300 flex flex-col h-full"
            >
              <div className="text-blue-500 mb-6 p-3 bg-blue-500/10 rounded-xl w-fit">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-400 flex-grow">
                {feature.description}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-6 text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2 text-sm font-medium"
                onClick={() => window.location.href = `/contact?service=${encodeURIComponent(feature.title)}`}
              >
                اطلب الخدمة الآن
                <svg className="w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
} 