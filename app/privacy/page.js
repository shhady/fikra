'use client'
import { motion } from 'framer-motion'

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black py-24">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-white mb-8">سياسة الخصوصية</h1>
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300 mb-6">
            نحن في فكرة نوفا نلتزم بحماية خصوصية مستخدمينا. تصف هذه السياسة كيفية جمع واستخدام وحماية معلوماتك الشخصية.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">جمع المعلومات</h2>
          <p className="text-gray-300 mb-6">
            نقوم بجمع المعلومات التي تقدمها لنا مباشرة عند:
          </p>
          <ul className="list-disc list-inside text-gray-300 mb-6">
            <li>التواصل معنا عبر نموذج الاتصال</li>
            <li>طلب خدماتنا</li>
            <li>الاشتراك في نشرتنا الإخبارية</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">استخدام المعلومات</h2>
          <p className="text-gray-300 mb-6">
            نستخدم المعلومات التي نجمعها لـ:
          </p>
          <ul className="list-disc list-inside text-gray-300 mb-6">
            <li>تقديم خدماتنا وتحسينها</li>
            <li>التواصل معك بخصوص طلباتك</li>
            <li>إرسال تحديثات عن خدماتنا</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">حماية المعلومات</h2>
          <p className="text-gray-300 mb-6">
            نتخذ إجراءات أمنية مناسبة لحماية معلوماتك من الوصول غير المصرح به أو التعديل أو الإفصاح أو الإتلاف.
          </p>
        </div>
      </div>
    </main>
  )
} 