'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiMail, FiPhone, FiMapPin, FiClock, FiMessageCircle, FiCheckCircle, FiLinkedin, FiFacebook, FiInstagram } from 'react-icons/fi'

const contactInfo = [
  {
    icon: <FiMail className="w-6 h-6" />,
    title: 'البريد الإلكتروني',
    details: 'shhadyse@gmail.com',
    link: 'mailto:shhadyse@gmail.com'
  },
  {
    icon: <FiPhone className="w-6 h-6" />,
    title: 'رقم الهاتف',
    details: '0543113297',
    link: 'tel:+972543113297'
  },
  {
    icon: <FiMapPin className="w-6 h-6" />,
    title: 'العنوان',
    details: 'الناصرة',
    link: 'https://maps.google.com/?q=Nazareth'
  },
  {
    icon: <FiClock className="w-6 h-6" />,
    title: 'ساعات العمل',
    details: 'الاثنين - الجمعة: ٩ ص - ٥ م',
    link: null
  }
]

const socialLinks = [
  {
    icon: <FiLinkedin className="w-6 h-6" />,
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/shhady-serhan-a11403124'
  },
//   {
//     icon: <FiFacebook className="w-6 h-6" />,
//     name: 'Facebook',
//     url: 'https://facebook.com/yourcompany'
//   },
  {
    icon: <FiInstagram className="w-6 h-6" />,
    name: 'Instagram',
    url: 'https://www.instagram.com/fikra__ai/'
  }
]

const serviceOptions = [
  'تطوير المواقع بالذكاء الاصطناعي',
  'تحليل وتحسين الأعمال',
  'التسويق الرقمي الذكي',
  'إنتاج المحتوى الإبداعي',
  'أخرى'
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  })

  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [errors, setErrors] = useState({})

  // Handle service selection from URL on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const serviceFromUrl = params.get('service')
      if (serviceFromUrl) {
        setFormData(prev => ({
          ...prev,
          service: decodeURIComponent(serviceFromUrl)
        }))
      }
    }
  }, [])

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false)
        setIsSubmitted(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [showSuccess])

  const validateForm = () => {
    const newErrors = {}
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'الاسم مطلوب'
    } else if (formData.name.length < 2) {
      newErrors.name = 'الاسم يجب أن يكون أكثر من حرفين'
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email) {
      newErrors.email = 'البريد الإلكتروني مطلوب'
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صالح'
    }

    // Phone validation (optional but must be valid if provided)
    if (formData.phone && !/^[0-9+\-\s()]{8,}$/.test(formData.phone)) {
      newErrors.phone = 'رقم الهاتف غير صالح'
    }

    // Service validation
    if (!formData.service) {
      newErrors.service = 'يرجى اختيار نوع الخدمة'
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'الرسالة مطلوبة'
    } else if (formData.message.length < 10) {
      newErrors.message = 'الرسالة يجب أن تكون أكثر من 10 أحرف'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setShowSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          service: '',
          message: ''
        });
        setErrors({});
      } else {
        setErrors(prev => ({
          ...prev,
          submit: data.error || 'حدث خطأ أثناء إرسال النموذج'
        }));
      }
    } catch (error) {
      console.error('Error:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'حدث خطأ في الاتصال بالخادم'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative py-24">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-purple-900/90"></div>
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-wide">
              تواصل معنا
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed">
              نحن هنا لمساعدتك. فريقنا جاهز للإجابة على جميع استفساراتك وتقديم الدعم اللازم.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Grid */}
      <section className="py-16 relative z-10 -mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-2xl hover:from-blue-900/20 hover:to-purple-900/20 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="text-blue-500">{info.icon}</div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{info.title}</h3>
                    {info.link ? (
                      <a
                        href={info.link}
                        className="text-gray-400 hover:text-blue-400 transition-colors"
                        target={info.link.startsWith('http') ? '_blank' : undefined}
                        rel={info.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                      >
                        {info.details}
                      </a>
                    ) : (
                      <p className="text-gray-400">{info.details}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 shadow-2xl"
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">
                  أرسل لنا رسالة
                </h2>
                <p className="text-gray-400">
                  املأ النموذج أدناه وسنتواصل معك في أقرب وقت ممكن
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-400 mb-2 font-medium">الاسم</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value })
                        if (errors.name) {
                          setErrors({ ...errors, name: '' })
                        }
                      }}
                      className={`w-full px-4 py-3 bg-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${
                        errors.name ? 'ring-2 ring-red-500' : 'focus:ring-blue-500'
                      } transition-all duration-300`}
                      required
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-2">البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value })
                        if (errors.email) {
                          setErrors({ ...errors, email: '' })
                        }
                      }}
                      className={`w-full px-4 py-3 bg-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${
                        errors.email ? 'ring-2 ring-red-500' : 'focus:ring-blue-500'
                      } transition-all duration-300`}
                      required
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-400 mb-2">رقم الهاتف</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value })
                        if (errors.phone) {
                          setErrors({ ...errors, phone: '' })
                        }
                      }}
                      className={`w-full px-4 py-3 bg-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${
                        errors.phone ? 'ring-2 ring-red-500' : 'focus:ring-blue-500'
                      } transition-all duration-300`}
                      dir="ltr"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-2">نوع الخدمة</label>
                    <select
                      value={formData.service}
                      onChange={(e) => {
                        setFormData({ ...formData, service: e.target.value })
                        if (errors.service) {
                          setErrors({ ...errors, service: '' })
                        }
                      }}
                      className={`w-full px-4 py-3 bg-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${
                        errors.service ? 'ring-2 ring-red-500' : 'focus:ring-blue-500'
                      } transition-all duration-300`}
                      required
                    >
                      <option value="" className="bg-gray-900">اختر نوع الخدمة</option>
                      {serviceOptions.map((service, index) => (
                        <option 
                          key={index} 
                          value={service} 
                          className="bg-gray-900"
                        >
                          {service}
                        </option>
                      ))}
                    </select>
                    {errors.service && (
                      <p className="mt-1 text-sm text-red-500">{errors.service}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 mb-2">الرسالة</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => {
                      setFormData({ ...formData, message: e.target.value })
                      if (errors.message) {
                        setErrors({ ...errors, message: '' })
                      }
                    }}
                    rows="4"
                    className={`w-full px-4 py-3 bg-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${
                      errors.message ? 'ring-2 ring-red-500' : 'focus:ring-blue-500'
                    } transition-all duration-300`}
                    required
                  ></textarea>
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-500">{errors.message}</p>
                  )}
                </div>

                {errors.submit && (
                  <div className="text-red-500 text-center mb-4">
                    {errors.submit}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium tracking-wide
                    ${!isSubmitting ? 'hover:from-blue-600 hover:to-purple-600' : 'opacity-75 cursor-not-allowed'}
                    transition-all duration-300 flex items-center justify-center gap-2`}
                >
                  {isSubmitting ? (
                    <>
                      <FiMessageCircle className="w-5 h-5 animate-spin" />
                      يتم الارسال...
                    </>
                  ) : showSuccess ? (
                    <>
                      <FiCheckCircle className="w-5 h-5" />
                      تم الإرسال بنجاح
                    </>
                  ) : (
                    <>
                      <FiMessageCircle className="w-5 h-5" />
                      إرسال الرسالة
                    </>
                  )}
                </button>
              </form>
            </motion.div>

            {/* Map */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="rounded-3xl overflow-hidden h-[600px] relative"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d26724.67961929919!2d35.27962973067478!3d32.70421504646431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x151c4e7cf16c0fff%3A0xd2385b30c1275dd6!2sNazareth!5e0!3m2!1sen!2sil!4v1709774008600!5m2!1sen!2sil"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Links */}
      <section className="py-16 bg-gradient-to-t from-blue-900/20 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              تابعنا على مواقع التواصل الاجتماعي
            </h2>
            <p className="text-gray-400">
              ابق على اطلاع بآخر أخبارنا ومستجداتنا
            </p>
          </div>
          <div className="flex justify-center gap-6">
            {socialLinks.map((social, index) => (
              <motion.a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-4 bg-gradient-to-br from-gray-900 to-black rounded-full text-blue-500 hover:text-blue-400 transition-all duration-300"
              >
                {social.icon}
              </motion.a>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
} 