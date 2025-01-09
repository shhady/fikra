'use client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'

const Services = () => {
  const router = useRouter()

  const services = [
    {
      id: 'ai-development',
      title: 'تطوير تطبيقات الذكاء الاصطناعي',
      shortDesc: 'حلول ذكية لتطوير الأعمال',
      description: 'نقدم خدمات متكاملة في تطوير تطبيقات الذكاء الاصطناعي المخصصة لاحتياجات عملك',
      image: '/services/ai-dev.jpg',
      benefits: [
        'تحسين الكفاءة التشغيلية',
        'تقليل التكاليف',
        'زيادة الإنتاجية',
        'تحسين تجربة العملاء',
      ],
    },
    {
      id: 'data-analytics',
      title: 'تحليل البيانات',
      shortDesc: 'رؤى تحليلية متقدمة',
      description: 'نحول بياناتك إلى رؤى قيمة تساعدك في اتخاذ قرارات أفضل',
      image: '/services/data-analytics.jpg',
      benefits: [
        'فهم أفضل للسوق',
        'تحسين الأداء',
        'توقع الاتجاهات',
        'تحسين استراتيجية العمل',
      ],
    },
    {
      id: 'ai-consulting',
      title: 'استشارات الذكاء الاصطناعي',
      shortDesc: 'خبرة متخصصة',
      description: 'نقدم استشارات متخصصة لمساعدتك في تبني وتطبيق حلول الذكاء الاصطناعي',
      image: '/services/ai-consulting.jpg',
      benefits: [
        'استراتيجية رقمية واضحة',
        'خارطة طريق للتحول',
        'تقييم الجاهزية التقنية',
        'تدريب الفريق',
      ],
    },
  ]

  const handleServiceSelect = (serviceId, serviceTitle) => {
    router.push(`/contact?service=${encodeURIComponent(serviceTitle)}&id=${serviceId}`)
  }

  return (
    <section className="py-16 bg-gradient-to-b from-black to-blue-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-4"
          >
            خدماتنا المتخصصة
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-400"
          >
            نقدم مجموعة متكاملة من الحلول المبتكرة لتطوير أعمالك
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300"
            >
              <div className="relative h-48">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover"
                />
              </div>
              
              <div className="p-6">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {service.title}
                </h3>
                <p className="text-gray-400 mb-4">
                  {service.description}
                </p>
                
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-white mb-3">
                    المميزات:
                  </h4>
                  <ul className="space-y-2">
                    {service.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center text-gray-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleServiceSelect(service.id, service.title)}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium"
                >
                  اطلب الخدمة
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Services 