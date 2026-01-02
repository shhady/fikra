'use client'

import { useState } from 'react'
import Script from 'next/script'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/context/LanguageContext'
import { ar } from '@/translations/ar'
import { he } from '@/translations/he'
import { en } from '@/translations/en'
import { FaChevronDown } from 'react-icons/fa'

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
  const { language, isRTL } = useLanguage()
  const [activeCategory, setActiveCategory] = useState(0)
  const [activeQuestions, setActiveQuestions] = useState({})
  
  const getTranslations = () => {
    switch (language) {
      case 'he':
        return he;
      case 'en':
        return en;
      default:
        return ar;
    }
  };

  const translations = getTranslations();

  // Add error handling for translations
  if (!translations || !translations.faq) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  const toggleQuestion = (categoryIndex, questionIndex) => {
    setActiveQuestions(prev => {
      const key = `${categoryIndex}-${questionIndex}`
      return {
        ...prev,
        [key]: !prev[key]
      }
    })
  }

  return (
    <main className="bg-black min-h-screen">
      <Script id="faq-jsonld" type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: (translations.faq.categories || []).flatMap((cat) =>
              (cat.questions || []).map((q) => ({
                '@type': 'Question',
                name: q.question,
                acceptedAnswer: { '@type': 'Answer', text: q.answer }
              }))
            )
          })
        }}
      />
      <Script id="breadcrumbs-faq" type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `https://www.fikranova.com/${language}` },
              { '@type': 'ListItem', position: 2, name: 'FAQ', item: `https://www.fikranova.com/${language}/faq` }
            ]
          })
        }}
      />
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-black to-black opacity-90"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6"
          >
            {translations.faq.hero.title}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            {translations.faq.hero.subtitle}
          </motion.p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Categories */}
          <div className="flex flex-wrap gap-4 mb-12 justify-center">
            {translations.faq.categories.map((category, index) => (
              <button
                key={index}
                onClick={() => setActiveCategory(index)}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCategory === index
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {category.title}
              </button>
            ))}
          </div>

          {/* Questions */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {translations.faq.categories[activeCategory]?.questions.map((item, questionIndex) => (
                <motion.div
                  key={questionIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => toggleQuestion(activeCategory, questionIndex)}
                    className={`w-full p-6 text-${isRTL ? 'right' : 'left'} flex items-center justify-between gap-4`}
                  >
                    <span className="text-lg font-medium text-white">
                      {item.question}
                    </span>
                    <motion.span
                      animate={{ rotate: activeQuestions[`${activeCategory}-${questionIndex}`] ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex-shrink-0 ${isRTL ? 'ml-4' : 'mr-4'}`}
                    >
                      <FaChevronDown className="w-5 h-5 text-blue-400" />
                    </motion.span>
                  </button>
                  
                  <AnimatePresence>
                    {activeQuestions[`${activeCategory}-${questionIndex}`] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-6 pb-6"
                      >
                        <div className={`text-gray-300 text-${isRTL ? 'right' : 'left'}`}>
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-3xl p-8 md:p-16 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-black opacity-50"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  {translations.faq.cta.title}
                </h2>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                  {translations.faq.cta.subtitle}
                </p>
                <Link
                  href={`/${language}/contact`}
                  className="inline-block bg-white text-blue-900 px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-50 transition-colors duration-300 transform hover:scale-105"
                >
                  {translations.faq.cta.button}
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
} 