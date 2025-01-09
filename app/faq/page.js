'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPlus, FiMinus } from 'react-icons/fi'

// export const metadata = {
//   title: 'الأسئلة الشائعة | وكالة الذكاء الاصطناعي',
//   description: 'اجابات على الأسئلة الأكثر شيوعاً حول خدماتنا وحلول الذكاء الاصطناعي',
// }

const faqCategories = [
  {
    id: 'general',
    title: 'أسئلة عامة',
    questions: [
      {
        id: 'q1',
        question: 'ما هي خدمات الذكاء الاصطناعي التي تقدمونها؟',
        answer: 'نقدم مجموعة متكاملة من خدمات الذكاء الاصطناعي تشمل تطوير المواقع الذكية، تحليل البيانات، التسويق الرقمي، وأتمتة العمليات. كل خدماتنا مصممة لتلبية احتياجات عملك وتحسين كفاءة عملياتك.'
      },
      {
        id: 'q2',
        question: 'كيف يمكن للذكاء الاصطناعي تحسين أعمالي؟',
        answer: 'يمكن للذكاء الاصطناعي تحسين أعمالك من خلال أتمتة المهام الروتينية، تحليل البيانات لاتخاذ قرارات أفضل، تحسين تجربة العملاء، وزيادة الإنتاجية. نحن نساعدك في تحديد أفضل الحلول المناسبة لاحتياجات عملك.'
      },
      {
        id: 'q3',
        question: 'هل خدماتكم مناسبة للشركات الصغيرة والمتوسطة؟',
        answer: 'نعم، نقدم حلولاً مرنة تناسب الشركات من جميع الأحجام. لدينا باقات مخصصة للشركات الصغيرة والمتوسطة تمكنها من الاستفادة من تقنيات الذكاء الاصطناعي بتكلفة معقولة.'
      }
    ]
  },
  {
    id: 'technical',
    title: 'الأسئلة التقنية',
    questions: [
      {
        id: 'q4',
        question: 'ما هي التقنيات التي تستخدمونها في مشاريعكم؟',
        answer: 'نستخدم أحدث التقنيات مثل Python, TensorFlow, React, Next.js, وغيرها من التقنيات المتقدمة. نختار التقنيات المناسبة لكل مشروع بناءً على متطلباته وأهدافه.'
      },
      {
        id: 'q5',
        question: 'كيف تضمنون أمان وخصوصية البيانات؟',
        answer: 'نتبع أفضل ممارسات الأمان وحماية البيانات، ونلتزم بمعايير GDPR وغيرها من معايير الخصوصية العالمية. نستخدم تقنيات تشفير متقدمة ونضمن حماية بيانات عملائنا.'
      },
      {
        id: 'q6',
        question: 'هل تقدمون خدمات الصيانة والدعم بعد إطلاق المشروع؟',
        answer: 'نعم، نقدم خدمات صيانة ودعم شاملة لضمان استمرار عمل المشروع بكفاءة. لدينا فريق دعم متخصص متاح للمساعدة في أي وقت.'
      }
    ]
  },
  {
    id: 'pricing',
    title: 'الأسعار والمدفوعات',
    questions: [
      {
        id: 'q7',
        question: 'كيف يتم تحديد تكلفة المشروع؟',
        answer: 'نحدد التكلفة بناءً على حجم المشروع، متطلباته التقنية، والوقت اللازم للتنفيذ. نقدم عرض سعر مفصل يشمل جميع مراحل المشروع.'
      },
      {
        id: 'q8',
        question: 'هل تقدمون خطط دفع مرنة؟',
        answer: 'نعم، نقدم خطط دفع مرنة تناسب ميزانيتك. يمكن تقسيم المدفوعات على مراحل المشروع المختلفة.'
      },
      {
        id: 'q9',
        question: 'هل هناك تكاليف إضافية للصيانة والدعم؟',
        answer: 'نقدم خطط صيانة ودعم شهرية وسنوية بأسعار تنافسية. يتم توضيح جميع التكاليف في العقد المبدئي.'
      }
    ]
  },
  {
    id: 'process',
    title: 'مراحل العمل',
    questions: [
      {
        id: 'q10',
        question: 'كم تستغرق عملية تطوير المشروع؟',
        answer: 'تختلف مدة التطوير حسب حجم وتعقيد المشروع. نقدم جدولاً زمنياً مفصلاً في بداية المشروع ونلتزم بالمواعيد المحددة.'
      },
      {
        id: 'q11',
        question: 'ما هي مراحل تنفيذ المشروع؟',
        answer: 'تشمل مراحل المشروع: تحليل المتطلبات، التصميم، التطوير، الاختبار، الإطلاق، والدعم المستمر. نشرك العميل في كل مرحلة لضمان تحقيق النتائج المطلوبة.'
      },
      {
        id: 'q12',
        question: 'هل يمكنني متابعة تقدم العمل في المشروع؟',
        answer: 'نعم، نوفر تقارير دورية عن تقدم العمل ونستخدم منصات إدارة المشاريع التي تتيح للعميل متابعة التطورات أولاً بأول.'
      }
    ]
  }
]

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('general')
  const [openQuestions, setOpenQuestions] = useState([])

  const toggleQuestion = (questionId) => {
    setOpenQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    )
  }

  return (
    <main className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-black to-black opacity-90"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            الأسئلة الشائعة
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            إجابات على أكثر الأسئلة شيوعاً حول خدماتنا وكيفية عملنا
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-4 mb-12 justify-center">
            {faqCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-3 rounded-full text-lg transition-all duration-300 ${
                  activeCategory === category.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {category.title}
              </button>
            ))}
          </div>

          {/* Questions */}
          <div className="space-y-6">
            {faqCategories
              .find(cat => cat.id === activeCategory)
              ?.questions.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-gray-900 to-black rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => toggleQuestion(item.id)}
                    className="w-full px-6 py-4 flex items-center justify-between text-right"
                  >
                    <span className="text-lg font-semibold text-white">
                      {item.question}
                    </span>
                    <span className="text-gray-400">
                      {openQuestions.includes(item.id) ? (
                        <FiMinus className="w-6 h-6" />
                      ) : (
                        <FiPlus className="w-6 h-6" />
                      )}
                    </span>
                  </button>
                  
                  <AnimatePresence>
                    {openQuestions.includes(item.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-6 pb-4 text-gray-400">
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-3xl p-8 md:p-16 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              لم تجد إجابة لسؤالك؟
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              فريقنا جاهز للإجابة على جميع استفساراتك
            </p>
            <a
              href="/contact"
              className="inline-block bg-white text-blue-900 px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-50 transition-colors duration-300"
            >
              تواصل معنا
            </a>
          </div>
        </div>
      </section>
    </main>
  )
} 