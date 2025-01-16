import { Metadata } from 'next'
import ServicesShowcase from '@/components/ServicesShowcase'
import { motion } from 'framer-motion'

export const metadata = {
  title: 'خدماتنا | وكالة الذكاء الاصطناعي',
  description: 'اكتشف خدماتنا المتخصصة في مجال الذكاء الاصطناعي وتطوير الأعمال',
}

export default function ServicesPage() {
  const stats = [
    { id: 1, number: '20+', label: 'زبون راضٍ' },
    { id: 2, number: '20+', label: 'مشروع مكتمل' },
    { id: 3, number: '3+', label: 'سنوات خبرة' },
  ]

  const processSteps = [
    {
      id: 1,
      title: 'تحليل المتطلبات',
      description: 'نقوم بدراسة شاملة لاحتياجات عملك وأهدافك',
      icon: '🎯',
    },
    {
      id: 2,
      title: 'تصميم الحل',
      description: 'نصمم حلاً مخصصاً يناسب متطلباتك',
      icon: '💡',
    },
    {
      id: 3,
      title: 'التنفيذ',
      description: 'نقوم بتنفيذ الحل باستخدام أحدث التقنيات',
      icon: '⚙️',
    },
    {
      id: 4,
      title: 'المتابعة والتطوير',
      description: 'نتابع أداء الحل ونطوره باستمرار',
      icon: '📈',
    },
  ]

  return (
    <main className="bg-black min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-black to-black opacity-90"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              خدماتنا المتخصصة
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              نقدم حلولاً متكاملة في مجال الذكاء الاصطناعي وتطوير الأعمال، مصممة خصيصاً لتلبية احتياجات عملك
            </p>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-8">
            {stats.map((stat) => (
              <div key={stat.id} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Showcase */}
      <ServicesShowcase />

      {/* Process Section */}
      <section className="py-20 bg-gradient-to-b from-black to-blue-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              كيف نعمل
            </h2>
            <p className="text-xl text-gray-400">
              نتبع منهجية واضحة لضمان تحقيق أفضل النتائج
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step) => (
              <div
                key={step.id}
                className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-xl hover:shadow-2xl transition-all duration-300"
              >
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-blue-950 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-3xl p-8 md:p-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-50"></div>
            <div className="relative z-10">
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  جاهز لبدء مشروعك؟
                </h2>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                  تواصل معنا اليوم لمناقشة كيف يمكننا مساعدتك في تحقيق أهدافك
                </p>
                <a
                  href="/contact"
                  className="inline-block bg-white text-blue-900 px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-50 transition-colors duration-300"
                >
                  ابدأ الآن
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
} 