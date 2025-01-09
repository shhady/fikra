import Image from 'next/image'

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
  ]

  return (
    <div className="bg-gradient-to-b from-black to-blue-900 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            لماذا تختارنا؟
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {features.map((feature) => (
            <div
              key={feature.number}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-black px-8 py-12 rounded-lg">
                <span className="text-7xl font-bold text-white/10">
                  {feature.number}
                </span>
                <h3 className="text-2xl font-bold text-white mb-4 -mt-8">
                  {feature.title}
                </h3>
                <p className="text-gray-400">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 