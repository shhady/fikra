'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiMail, FiPhone, FiMapPin, FiClock, FiMessageCircle, FiCheckCircle, FiLinkedin, FiFacebook, FiInstagram } from 'react-icons/fi'

const contactInfo = [
  {
    icon: <FiMail className="w-6 h-6" />,
    title: 'البريد الإلكتروني',
    details: 'info@company.com',
    link: 'mailto:info@company.com'
  },
  {
    icon: <FiPhone className="w-6 h-6" />,
    title: 'رقم الهاتف',
    details: '+972 4 000 0000',
    link: 'tel:+97240000000'
  },
  {
    icon: <FiMapPin className="w-6 h-6" />,
    title: 'العنوان',
    details: 'الناصرة، شارع 6000',
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
    url: 'https://linkedin.com/company/yourcompany'
  },
  {
    icon: <FiFacebook className="w-6 h-6" />,
    name: 'Facebook',
    url: 'https://facebook.com/yourcompany'
  },
  {
    icon: <FiInstagram className="w-6 h-6" />,
    name: 'Instagram',
    url: 'https://instagram.com/yourcompany'
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

  // Handle service selection from URL on client side
  useState(() => {
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitted(true)
    setTimeout(() => setIsSubmitted(false), 3000)
  }

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
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              تواصل معنا
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
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
                    <label className="block text-gray-400 mb-2">الاسم</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-2">البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-400 mb-2">رقم الهاتف</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-2">نوع الخدمة</label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
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
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 mb-2">الرسالة</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows="4"
                    className="w-full px-4 py-3 bg-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {isSubmitted ? (
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