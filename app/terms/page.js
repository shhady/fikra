'use client'
import { motion } from 'framer-motion'

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
}

export default function TermsPage() {
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
            <h1 className="text-4xl font-bold text-white mb-4">الشروط والأحكام</h1>
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
                    مرحباً بك في شركتنا ("الشركة"، "نحن"، "لنا"). باستخدامك لموقعنا الإلكتروني أو خدماتنا، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا لم توافق على ذلك، يرجى الامتناع عن استخدام خدماتنا.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-blue-400 mb-4">٢. الأهلية</h2>
                  <p className="text-gray-300 leading-relaxed">
                    يجب أن يكون عمرك 18 عاماً على الأقل لاستخدام خدماتنا. بالوصول إلى منصتنا، فإنك تؤكد أنك تستوفي هذا الشرط العمري.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-blue-400 mb-4">٣. استخدام الخدمات</h2>
                  <ul className="text-gray-300 leading-relaxed list-disc pr-6 space-y-2">
                    <li>توافق على استخدام خدماتنا للأغراض المشروعة فقط.</li>
                    <li>لن تستخدم منصتنا لأي أنشطة احتيالية أو غير قانونية.</li>
                    <li>أنت مسؤول عن ضمان امتثال استخدامك للخدمات لجميع القوانين واللوائح المعمول بها.</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-blue-400 mb-4">٤. الملكية الفكرية</h2>
                  <ul className="text-gray-300 leading-relaxed list-disc pr-6 space-y-2">
                    <li>جميع المحتويات والتصاميم والملكية الفكرية على موقعنا مملوكة لنا أو لمرخصينا.</li>
                    <li>لا يجوز لك نسخ أو توزيع أو إنشاء أعمال مشتقة دون موافقة كتابية مسبقة.</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-blue-400 mb-4">٥. حسابات المستخدمين</h2>
                  <ul className="text-gray-300 leading-relaxed list-disc pr-6 space-y-2">
                    <li>أنت مسؤول عن الحفاظ على سرية معلومات حسابك.</li>
                    <li>توافق على إخطارنا فوراً بأي استخدام غير مصرح به لحسابك.</li>
                    <li>نحتفظ بالحق في تعليق أو إنهاء الحسابات التي تنتهك هذه الشروط.</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-blue-400 mb-4">٦. سياسة الدفع والاسترداد</h2>
                  <ul className="text-gray-300 leading-relaxed list-disc pr-6 space-y-2">
                    <li>جميع المدفوعات مقابل الخدمات مستحقة وقت الشراء ما لم يُحدد خلاف ذلك.</li>
                    <li>سيتم معالجة المبالغ المستردة وفقاً لسياسة الاسترداد الخاصة بنا.</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-blue-400 mb-4">٧. حدود المسؤولية</h2>
                  <ul className="text-gray-300 leading-relaxed list-disc pr-6 space-y-2">
                    <li>نحن غير مسؤولين عن أي أضرار غير مباشرة أو عرضية ناشئة عن استخدامك لخدماتنا.</li>
                    <li>مسؤوليتنا الكاملة محدودة بالمبلغ المدفوع مقابل الخدمات المعنية.</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-blue-400 mb-4">٨. الإنهاء</h2>
                  <p className="text-gray-300 leading-relaxed">
                    نحتفظ بالحق في إنهاء أو تعليق وصولك إلى خدماتنا وفقاً لتقديرنا المطلق، دون إشعار مسبق، للسلوك الذي نعتقد أنه ينتهك هذه الشروط أو يضر بالمستخدمين الآخرين أو بنا.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-blue-400 mb-4">٩. التعديلات</h2>
                  <p className="text-gray-300 leading-relaxed">
                    قد نقوم بتحديث هذه الشروط والأحكام من وقت لآخر. استمرارك في استخدام خدماتنا يعني موافقتك على الشروط المعدلة.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-blue-400 mb-4">١٠. القانون الحاكم</h2>
                  <p className="text-gray-300 leading-relaxed">
                    تخضع هذه الشروط والأحكام لقوانين المملكة العربية السعودية.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-blue-400 mb-4">١١. اتصل بنا</h2>
                  <p className="text-gray-300 leading-relaxed">
                    للأسئلة حول هذه الشروط، يرجى التواصل معنا عبر صفحة الاتصال.
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