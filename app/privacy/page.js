'use client'
import { motion } from 'framer-motion'

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black overflow-hidden">
      {/* Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full filter blur-[150px] opacity-10"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full filter blur-[150px] opacity-10"></div>
      </div>

      {/* Hero Section */}
      <section className="relative py-20">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-950/50 to-transparent">
            <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-5 animate-pulse"></div>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            transition={{ duration: 1.5 }}
            className="absolute top-20 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"
          ></motion.div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-white mb-4">سياسة الخصوصية</h1>
            <div className="relative h-1 w-20 mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 blur-sm"></div>
            </div>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="space-y-8"
          >
            <div className="relative p-8 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-950 to-black"></div>
              
              <div className="relative space-y-12">
                <div>
                  <h2 className="text-2xl font-semibold text-blue-400 mb-4">١. مقدمة</h2>
                  <p className="text-gray-300 leading-relaxed">
                    توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية معلوماتك من قبل شركتنا ("الشركة"، "نحن"، "لنا") عند استخدام خدماتنا.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-blue-400 mb-4">٢. المعلومات التي نجمعها</h2>
                  <ul className="text-gray-300 leading-relaxed list-disc pr-6 space-y-2">
                    <li>المعلومات الشخصية: الاسم، البريد الإلكتروني، رقم الهاتف، والمعلومات الأخرى التي تقدمها.</li>
                    <li>بيانات الاستخدام: عنوان IP، نوع المتصفح، والصفحات التي تمت زيارتها.</li>
                    <li>ملفات تعريف الارتباط: ملفات صغيرة مخزنة على جهازك لتحسين تجربة المستخدم.</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-blue-400 mb-4">٣. كيف نستخدم معلوماتك</h2>
                  <ul className="text-gray-300 leading-relaxed list-disc pr-6 space-y-2">
                    <li>لتقديم وتحسين خدماتنا.</li>
                    <li>للتواصل معك بشأن التحديثات والعروض الترويجية والدعم.</li>
                    <li>للامتثال للالتزامات القانونية.</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-blue-400 mb-4">٤. مشاركة المعلومات</h2>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    نحن لا نبيع معلوماتك الشخصية. ومع ذلك، قد نشاركها مع:
                  </p>
                  <ul className="text-gray-300 leading-relaxed list-disc pr-6 space-y-2">
                    <li>مقدمي الخدمات الذين يساعدون في عملياتنا.</li>
                    <li>السلطات إذا كان ذلك مطلوباً بموجب القانون.</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-blue-400 mb-4">٥. أمن البيانات</h2>
                  <p className="text-gray-300 leading-relaxed">
                    نقوم بتنفيذ تدابير قياسية في الصناعة لحماية بياناتك. ومع ذلك، لا توجد طريقة نقل عبر الإنترنت آمنة تماماً.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-blue-400 mb-4">٦. حقوقك</h2>
                  <ul className="text-gray-300 leading-relaxed list-disc pr-6 space-y-2">
                    <li>الوصول إلى بياناتك.</li>
                    <li>طلب تصحيح أو حذف بياناتك.</li>
                    <li>إلغاء الاشتراك في الاتصالات التسويقية.</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-blue-400 mb-4">٧. الاحتفاظ بالبيانات</h2>
                  <p className="text-gray-300 leading-relaxed">
                    نحتفظ ببياناتك طالما كان ذلك ضرورياً لتحقيق الأغراض الموضحة في هذه السياسة.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-blue-400 mb-4">٨. روابط الطرف الثالث</h2>
                  <p className="text-gray-300 leading-relaxed">
                    قد يحتوي موقعنا على روابط لمواقع الطرف الثالث. نحن لسنا مسؤولين عن ممارسات الخصوصية الخاصة بهم.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-blue-400 mb-4">٩. التغييرات في سياسة الخصوصية</h2>
                  <p className="text-gray-300 leading-relaxed">
                    قد نقوم بتحديث هذه السياسة من وقت لآخر. سيتم نشر التغييرات على هذه الصفحة مع تاريخ المراجعة المحدث.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-blue-400 mb-4">١٠. اتصل بنا</h2>
                  <p className="text-gray-300 leading-relaxed">
                    للأسئلة حول سياسة الخصوصية هذه، يرجى التواصل معنا عبر صفحة الاتصال.
                  </p>
                </div>
              </div>

              {/* Decorative corner elements */}
              <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-blue-500/10 rounded-tr-3xl"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-purple-500/10 rounded-bl-3xl"></div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
} 