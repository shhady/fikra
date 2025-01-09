import Link from 'next/link'

export default function CTASection() {
  return (
    <div className="relative bg-black py-16">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-3xl p-8 md:p-16 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-3xl"></div>
          
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-right">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                جاهز لتطوير أعمالك؟
              </h2>
              <p className="text-blue-100/80 text-lg max-w-xl">
                ابدأ رحلتك نحو التحول الرقمي اليوم واكتشف كيف يمكننا مساعدتك في تحقيق أهدافك
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/contact"
                className="px-8 py-4 bg-white text-blue-900 rounded-full text-lg font-medium hover:bg-blue-50 transform hover:scale-105 transition-all duration-200"
              >
                ابدأ الآن
              </Link>
              <Link
                href="/services"
                className="px-8 py-4 bg-blue-500/20 text-white rounded-full text-lg font-medium hover:bg-blue-500/30 backdrop-blur-sm transform hover:scale-105 transition-all duration-200"
              >
                تعرف على المزيد
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 