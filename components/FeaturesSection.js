'use client'
import { motion } from 'framer-motion'

export default function FeaturesSection() {
  const features = [
    {
      number: '01',
      title: 'تقنيات متطورة',
      description: 'نستخدم أحدث تقنيات الذكاء الاصطناعي لتطوير حلول مبتكرة تناسب احتياجاتك',
    },
    {
      number: '02',
      title: 'خبرة متخصصة',
      description: 'فريق من الخبراء المتخصصين في مجال الذكاء الاصطناعي وتطوير الأعمال',
    },
    {
      number: '03',
      title: 'نتائج مضمونة',
      description: 'نضمن تحقيق نتائج ملموسة لأعمالك من خلال حلولنا المتكاملة',
    },
    {
      number: '04',
      title: 'دعم مستمر',
      description: 'نقدم دعماً فنياً متواصلاً ونضمن استمرارية عمل الحلول بكفاءة',
    },
    {
      number: '05',
      title: 'أسعار تنافسية',
      description: 'نقدم خدماتنا بأسعار مناسبة مع ضمان أعلى جودة في التنفيذ',
    },
    {
      number: '06',
      title: 'حلول مخصصة',
      description: 'نصمم حلولاً مخصصة تناسب احتياجات عملك وتحقق أهدافك',
    }
  ]

  return (
    <div className="bg-gradient-to-b from-black to-blue-900 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            لماذا تختارنا؟
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mt-4">
            نقدم حلولاً متكاملة تجمع بين الخبرة والتقنية لتحقيق نجاح أعمالك
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-6"></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group h-full"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-black px-8 py-12 rounded-xl h-full flex flex-col justify-between">
                <div>
                  <span className="text-7xl font-bold text-white/10 absolute top-4 right-4">
                    {feature.number}
                  </span>
                  <h3 className="text-2xl font-bold text-white mb-4 relative z-10">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 relative z-10">
                    {feature.description}
                  </p>
                </div>
                <div className="mt-6 relative z-10">
                  <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
} 