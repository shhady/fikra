'use client'
import { motion } from 'framer-motion'

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black py-24">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-white mb-8">الشروط والأحكام</h1>
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300 mb-6">
            يرجى قراءة هذه الشروط والأحكام بعناية قبل استخدام خدماتنا.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">قبول الشروط</h2>
          <p className="text-gray-300 mb-6">
            باستخدامك لموقعنا وخدماتنا، فإنك توافق على الالتزام بهذه الشروط والأحكام.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">الخدمات</h2>
          <p className="text-gray-300 mb-6">
            نقدم خدمات تطوير المواقع والتسويق الرقمي وحلول الذكاء الاصطناعي. نحتفظ بالحق في تعديل أو إيقاف خدماتنا في أي وقت.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">الملكية الفكرية</h2>
          <p className="text-gray-300 mb-6">
            جميع المحتويات والمواد المنشورة على موقعنا محمية بموجب حقوق الملكية الفكرية.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">المسؤولية</h2>
          <p className="text-gray-300 mb-6">
            لا نتحمل المسؤولية عن أي أضرار مباشرة أو غير مباشرة تنتج عن استخدام خدماتنا.
          </p>
        </div>
      </div>
    </main>
  )
} 