'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  FaCode, 
  FaChartLine, 
  FaMegaport, 
  FaVideo, 
  FaRobot,
} from 'react-icons/fa'

const ServicesShowcase = () => {
  const router = useRouter()

  const services = [
    {
      id: 'web-dev',
      title: 'تطوير المواقع بالذكاء الاصطناعي',
      description: 'نقدم حلولاً متكاملة لتطوير المواقع الإلكترونية باستخدام أحدث تقنيات الذكاء الاصطناعي',
      icon: FaCode,
      gradient: 'from-blue-500 to-cyan-400',
      features: [
        { id: 'web-1', text: 'تصميم واجهات مستخدم ذكية وتفاعلية' },
        { id: 'web-2', text: 'تحسين تجربة المستخدم باستخدام التعلم الآلي' },
        { id: 'web-3', text: 'تكامل مع أنظمة الذكاء الاصطناعي' },
        { id: 'web-4', text: 'تحسين الأداء والسرعة' },
        { id: 'web-5', text: 'دعم متعدد اللغات' },
      ],
      technologies: [
        { id: 'tech-1', name: 'Next.js' },
        { id: 'tech-2', name: 'React' },
        { id: 'tech-3', name: 'TensorFlow.js' },
        { id: 'tech-4', name: 'Python' },
        { id: 'tech-5', name: 'Node.js' },
      ],
    },
    {
      id: 'business',
      title: 'تحليل وتحسين الأعمال',
      description: 'نساعد الشركات على تحسين عملياتها وزيادة كفاءتها من خلال حلول الذكاء الاصطناعي المتقدمة',
      icon: FaChartLine,
      gradient: 'from-purple-500 to-pink-400',
      features: [
        { id: 'bus-1', text: 'تحليل البيانات التشغيلية' },
        { id: 'bus-2', text: 'التنبؤ بالاتجاهات المستقبلية' },
        { id: 'bus-3', text: 'أتمتة العمليات الروتينية' },
        { id: 'bus-4', text: 'تحسين اتخاذ القرارات' },
        { id: 'bus-5', text: 'تقارير تحليلية متقدمة' },
      ],
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
      title: 'التسويق الرقمي الذكي',
      description: 'استراتيجيات تسويقية مدعومة بالذكاء الاصطناعي لتحقيق أفضل النتائج',
      icon: FaMegaport,
      gradient: 'from-orange-500 to-red-400',
      features: [
        { id: 'mkt-1', text: 'تحليل سلوك المستخدم' },
        { id: 'mkt-2', text: 'استهداف دقيق للجمهور' },
        { id: 'mkt-3', text: 'تحسين معدلات التحويل' },
        { id: 'mkt-4', text: 'إدارة الحملات الإعلانية' },
        { id: 'mkt-5', text: 'تحليل المنافسين' },
      ],
      technologies: [
        { id: 'tech-11', name: 'Google Analytics' },
        { id: 'tech-12', name: 'Meta Ads' },
        { id: 'tech-13', name: 'SEO Tools' },
        { id: 'tech-14', name: 'CRM Systems' },
      ],
    },
    {
      id: 'content',
      title: 'إنتاج المحتوى الإبداعي',
      description: 'إنتاج محتوى مرئي وفيديوهات احترافية باستخدام تقنيات الذكاء الاصطناعي',
      icon: FaVideo,
      gradient: 'from-green-500 to-emerald-400',
      features: [
        { id: 'cnt-1', text: 'تصميم جرافيك ذكي' },
        { id: 'cnt-2', text: 'إنتاج فيديوهات تفاعلية' },
        { id: 'cnt-3', text: 'تحرير صور احترافي' },
        { id: 'cnt-4', text: 'تصميم هويات بصرية' },
        { id: 'cnt-5', text: 'معالجة الصور والفيديو' },
      ],
      technologies: [
        { id: 'tech-15', name: 'Adobe Creative Suite' },
        { id: 'tech-16', name: 'Midjourney' },
        { id: 'tech-17', name: 'DALL-E' },
        { id: 'tech-18', name: 'Stable Diffusion' },
      ],
    },
    // {
    //   id: 'automation',
    //   title: 'أتمتة العمليات الروبوتية',
    //   description: 'أتمتة العمليات التجارية باستخدام الروبوتات البرمجية وتقنيات الذكاء الاصطناعي',
    //   icon: FaRobot,
    //   gradient: 'from-indigo-500 to-blue-400',
    //   features: [
    //     { id: 'auto-1', text: 'أتمتة المهام المتكررة' },
    //     { id: 'auto-2', text: 'معالجة المستندات الذكية' },
    //     { id: 'auto-3', text: 'التكامل مع الأنظمة الحالية' },
    //     { id: 'auto-4', text: 'تحسين الكفاءة التشغيلية' },
    //     { id: 'auto-5', text: 'تقليل الأخطاء البشرية' },
    //   ],
    //   technologies: [
    //     { id: 'tech-19', name: 'UiPath' },
    //     { id: 'tech-20', name: 'Blue Prism' },
    //     { id: 'tech-21', name: 'Automation Anywhere' },
    //     { id: 'tech-22', name: 'Python RPA' },
    //   ],
    // },
  ]

  return (
    <div className="bg-black py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            خدماتنا المتميزة
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            نقدم مجموعة شاملة من الحلول المبتكرة المدعومة بأحدث تقنيات الذكاء الاصطناعي
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
                <div className="flex items-start gap-4 mb-6">
                  <div className={`p-4 rounded-xl bg-gradient-to-r ${service.gradient}`}>
                    <service.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
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
                  <h4 className="text-lg font-semibold text-white mb-3">المميزات الرئيسية:</h4>
                  <ul className="space-y-2">
                    {service.features.map((feature) => (
                      <li key={feature.id} className="flex items-center text-gray-300">
                        <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${service.gradient} mr-2`}></span>
                        {feature.text}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Technologies */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-white mb-3">التقنيات المستخدمة:</h4>
                  <div className="flex flex-wrap gap-2">
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

                {/* CTA Button with higher z-index */}
                <Link 
                  href={`/contact?service=${encodeURIComponent(service.title)}`}
                  className="relative z-20 block w-full text-center py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium"
                >
                  اطلب الخدمة الآن
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