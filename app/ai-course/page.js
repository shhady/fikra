'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiCheck, FiStar, FiUsers, FiClock, FiTarget, FiTrendingUp, FiZap, FiAward, FiPlayCircle, FiDownload, FiMail, FiPhone, FiUser } from 'react-icons/fi'
import { FaRobot, FaBrain, FaChartLine, FaGraduationCap, FaMagic, FaRocket } from 'react-icons/fa'
import Image from 'next/image'

export default function AICourse() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    course: 'רגיל'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          service: `קורס AI כללי - ${formData.course}`,
          message: `בקשה להרשמה לקורס AI כללי - חבילה: ${formData.course}`
        })
      })

      if (response.ok) {
        setShowSuccess(true)
        setFormData({ name: '', email: '', phone: '', course: 'רגיל' })
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const benefits = [
    { icon: <FaBrain className="w-8 h-8" />, title: "فهم عملي للذكاء الاصطناعي", desc: "ليس مجرد تعريف - بل تطبيق عملي في الحياة والعمل والدراسة" },
    { icon: <FaRocket className="w-8 h-8" />, title: "مساعد AI شخصي", desc: "كل مشارك يحصل على مساعد ذكي مخصص لاحتياجاته" },
    { icon: <FaMagic className="w-8 h-8" />, title: "إنشاء المحتوى", desc: "إنشاء عروض تقديمية وفيديوهات ومحتوى بصري احترافي" },
    { icon: <FaChartLine className="w-8 h-8" />, title: "تحسين الإنتاجية", desc: "أدوات وتقنيات لتحسين الأداء في العمل والدراسة" },
    // { icon: <FaGraduationCap className="w-8 h-8" />, title: "شهادة إتمام", desc: "شهادة معتمدة + دليل شامل باللغة العربية" },
    { icon: <FiUsers className="w-8 h-8" />, title: "مجتمع داعم", desc: "انضمام لمجموعة دعم مغلقة للمتابعة والمساعدة" }
  ]

  const dailyProgram = [
    {
      day: "اليوم الأول",
      title: "الأساسيات + التعرف المثير",
      items: [
        "ما هو الذكاء الاصطناعي؟ التاريخ والحاضر والمستقبل",
        "تمرين تفاعلي: هل هذا AI؟",
        "الفرق بين البرمجيات العادية والـ AI",
        "التعرف على ChatGPT ,Claude ,Gemini ,Perplexity",
        "تدريب جماعي + فتح حسابات"
      ]
    },
    {
      day: "اليوم الثاني", 
      title: "هندسة الـ Prompts: فكر مثل الـ AI",
      items: [
        "كيفية صياغة طلب دقيق يفهمه الـ AI حقاً",
        "مستويات اللغة وتفكيك المشاكل والافتراضات",
        "تقنيات متقدمة: RGC، Reverse Prompting، Chain of Thought",
        "تدريب على الـ Prompts حسب مجالات مختلفة"
      ]
    },
    {
      day: "اليوم الثالث",
      title: "AI في الحياة الحقيقية", 
      items: [
        "إدارة يومية: إدارة الوقت والقوائم وإنشاء العادات",
        "التواصل والتخطيط: الترجمة وصياغة الإيميلات",
        "العمل مع الملفات: تلخيص PDF واستخراج الجداول",
        "التخصيص الشخصي: MyGPT وCustom Instructions"
      ]
    },
    {
      day: "اليوم الرابع",
      title: "الإبداع: عروض تقديمية ومحتوى ومعرفة",
      items: [
        "بناء عروض تقديمية تلقائية مع Gamma وTome",
        "التلخيص والتحليل التلقائي للمقالات",
        "أدوات خارجية: Wordtune وDeepSeek وNapkin.ai"
      ]
    },
    {
      day: "اليوم الخامس",
      title: "إنشاء الوسائط مع AI (يوم الإبهار!)",
      items: [
        "إنشاء الصور مع DALL·E وLeonardo وMidjourney",
        "إنشاء الفيديوهات مع Runway وKling وHeyGen",
        "دمج الوسائط: الصوت والترجمة والصورة والموسيقى",
        "محتوى للشبكات الاجتماعية"
      ]
    }
  ]

  const packages = [
    {
      name: "عادي",
      price: "₪2,000",
      features: [
        "جميع الدروس",
        "الملفات والقوالب",
        "الوصول للنماذج الجاهزة",
        "دليل شامل بالعربية",
        "مجموعة دعم مغلقة"
      ],
      popular: false
    },
    {
      name: "متقدم",
      price: "₪2,500", 
      features: [
        "كل ما في الحزمة العادية",
        "مساعد GPT مخصص شخصياً",
        "ساعة عمل مركزة مع الخبير",
        "عرض تقديمي وفيديو تسويقي",
        "دعم فني متقدم"
      ],
      popular: true
    },
    {
      name: "VIP",
      price: "₪3,000",
      features: [
        "كل ما في الحزمة المتقدمة",
        "مرافقة شخصية 1:1",
        "ورشة عمل شخصية (ساعتان)",
        "دعم لدمج الأدوات في العمل",
        "استشارة مستمرة لشهر"
      ],
      popular: false
    }
  ]

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white overflow-x-hidden" dir="rtl">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden w-full">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        
        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 left-20 w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 blur-xl"
          animate={{ y: [0, -20, 0], rotate: [0, 180, 360] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-32 h-32 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full opacity-20 blur-xl"
          animate={{ y: [0, 20, 0], rotate: [0, -180, -360] }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <FaBrain className="w-16 h-16 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <FiZap className="w-4 h-4 text-gray-900" />
                </div>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              كورس AI 
            </h1>
            
            <p className="text-2xl md:text-3xl font-semibold mb-4 text-gray-200">
              5 أيام × 3 ساعات = 15 ساعة
            </p>
            
            <p className="text-xl md:text-2xl mb-8 text-gray-300 max-w-4xl mx-auto leading-relaxed">
            تطبيق عملي للذكاء الاصطناعي في الحياة والدراسة والعمل!
              
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => document.getElementById('registration').scrollIntoView({ behavior: 'smooth' })}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                سجل الآن واحصل على خصم مبكر
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => document.getElementById('program').scrollIntoView({ behavior: 'smooth' })}
                className="border-2 border-white/30 hover:border-white/50 text-white px-8 py-4 rounded-full text-lg font-semibold backdrop-blur-sm hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
              >
                <FiPlayCircle className="w-5 h-5" />
                 البرنامج التفصيلي
              </motion.button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                // { icon: <FiUsers />, value: "500+", label: "طالب تخرج" },
                // { icon: <FiStar />, value: "4.9", label: "تقييم المتدربين" },
                // { icon: <FiClock />, value: "15", label: "ساعة تدريب" },
                // { icon: <FiAward />, value: "100%", label: "شهادة إتمام" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl text-blue-400 mb-2">{stat.icon}</div>
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-900/50 w-full">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              لماذا هذا الكورس؟
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              كورس شامل ومتكامل يأخذك من الصفر إلى الاحتراف في استخدام الذكاء الاصطناعي
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 rounded-2xl backdrop-blur-sm border border-gray-700/30 hover:border-blue-500/30 transition-all duration-300 group"
              >
                <div className="text-blue-400 mb-4 group-hover:text-purple-400 transition-colors duration-300">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">{benefit.title}</h3>
                <p className="text-gray-300">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Daily Program */}
      <section id="program" className="py-20 bg-gradient-to-br from-blue-900/20 to-purple-900/20 w-full">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              البرنامج اليومي المفصل
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              خطة تعليمية متدرجة ومدروسة بعناية لضمان أقصى استفادة
            </p>
          </motion.div>

          <div className="space-y-8">
            {dailyProgram.map((day, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 p-8 rounded-2xl backdrop-blur-sm border border-gray-700/30 hover:border-blue-500/30 transition-all duration-300"
              >
                <div className="flex items-start mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg ml-4 flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex flex-col items-start min-w-0">
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{day.day}</h3>
                    <p className="text-blue-400 text-base sm:text-lg">{day.title}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-16 sm:ml-0">
                  {day.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-start gap-3 justify-start md:justify-start">
                      <FiCheck className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                      <span className="text-gray-300 text-sm sm:text-base text-right">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-20 bg-gray-900/50 w-full">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              ما الذي ستحصل عليه؟
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <FaRobot />, title: "مساعد GPT مخصص شخصياً", desc: "مساعد ذكي مصمم خصيصاً لاحتياجاتك" },
              { icon: <FiDownload />, title: "قوالب جاهزة للاستخدام", desc: "مجموعة شاملة من القوالب للعمليات اليومية" },
              { icon: <FiTarget />, title: "ملف القوالب للعمليات اليومية", desc: "أدوات عملية لتطبيق ما تعلمته فوراً" },
              { icon: <FiPlayCircle />, title: "عرض تقديمي + فيديو", desc: "منتج شخصي تنشئه بنفسك خلال الكورس" },
              { icon: <FaGraduationCap />, title: "دليل شامل بالعربية", desc: "مرجع كامل للاستخدام اليومي للذكاء الاصطناعي" },
              { icon: <FiUsers />, title: "مجموعة دعم مغلقة", desc: "انضمام لمجتمع المتدربين للدعم المستمر" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-2xl backdrop-blur-sm border border-gray-700/30 hover:border-purple-500/30 transition-all duration-300 text-center group"
              >
                <div className="text-4xl text-purple-400 mb-4 group-hover:text-blue-400 transition-colors duration-300">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-gradient-to-br from-purple-900/20 to-pink-900/20 w-full">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              حزم الكورس والأسعار
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              اختر الحزمة التي تناسب احتياجاتك وميزانيتك
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 rounded-2xl backdrop-blur-sm border transition-all duration-300 ${
                  pkg.popular 
                    ? 'border-purple-500/50 hover:border-purple-400/70 scale-105' 
                    : 'border-gray-700/30 hover:border-purple-500/30'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      الأكثر شعبية
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{pkg.name}</h3>
                  <div className="text-4xl font-bold text-purple-400 mb-4">{pkg.price}</div>
                </div>

                <div className="space-y-4 mb-8">
                  {pkg.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <FiCheck className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setFormData(prev => ({ ...prev, course: pkg.name }))
                    document.getElementById('registration').scrollIntoView({ behavior: 'smooth' })
                  }}
                  className={`w-full py-4 rounded-full font-semibold transition-all duration-300 ${
                    pkg.popular
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                      : 'border-2 border-purple-500/30 hover:border-purple-500/50 text-purple-400 hover:bg-purple-500/10'
                  }`}
                >
                  اختر هذه الحزمة
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section id="registration" className="py-20 bg-gray-900/50 w-full">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              سجل الآن واحصل على مقعدك
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              المقاعد محدودة! احجز مكانك الآن وابدأ رحلتك في عالم الذكاء الاصطناعي
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 rounded-2xl backdrop-blur-sm border border-gray-700/30"
          >
            {showSuccess ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiCheck className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">تم إرسال طلبك بنجاح!</h3>
                <p className="text-gray-300 mb-6">
                  شكراً لك! سنتواصل معك قريباً لتأكيد التسجيل وإرسال تفاصيل الدفع.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSuccess(false)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-full font-semibold"
                >
                  إرسال طلب آخر
                </motion.button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      الاسم الكامل *
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 pl-10 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                        placeholder="أدخل اسمك الكامل"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      البريد الإلكتروني *
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 pl-10 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                        placeholder="example@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      رقم الهاتف *
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 pl-10 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                        placeholder="05X-XXXXXXX"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      حزمة الكورس *
                    </label>
                    <select
                      required
                      value={formData.course}
                      onChange={(e) => setFormData(prev => ({ ...prev, course: e.target.value }))}
                      className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                    >
                      <option value="عادي">عادي - ₪2,000</option>
                      <option value="متقدم">متقدم - ₪2,500</option>
                      <option value="VIP">VIP - ₪3,000</option>
                    </select>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-4 rounded-lg font-semibold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'جاري الإرسال...' : 'سجل الآن واحصل على مقعدك'}
                </motion.button>

                <p className="text-center text-gray-400 text-sm">
                  بالضغط على "سجل الآن" فإنك توافق على شروط الخدمة وسياسة الخصوصية
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 border-t border-gray-800 w-full">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <FaBrain className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 