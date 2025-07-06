'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiMail, FiPhone, FiMapPin, FiClock, FiMessageCircle, FiCheckCircle, FiLinkedin, FiFacebook, FiInstagram } from 'react-icons/fi'
import { useLanguage } from '../../context/LanguageContext'
import { ar } from '@/translations/ar'
import { en } from '@/translations/en'
import { he } from '@/translations/he'
// import { FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa'

const getContactInfo = (translations) => [
  // {
  //   icon: <FiMail className="w-6 h-6" />,
  //   title: translations.contact.info.email,
  //   details: 'shhadyse@gmail.com',
  //   link: 'mailto:shhadyse@gmail.com'
  // },
  // {
  //   icon: <FiPhone className="w-6 h-6" />,
  //   title: translations.contact.info.phone,
  //   details: '0543113297',
  //   link: 'tel:+972543113297'
  // },
  {
    icon: <FiMapPin className="w-6 h-6" />,
    title: translations.contact.info.address,
    details: 'الناصرة , נצרת',
    link: 'https://maps.google.com/?q=Nazareth'
  },
  {
    icon: <FiClock className="w-6 h-6" />,
    title: translations.contact.info.hours,
    details: translations.contact.info.workingHours,
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

const getServiceOptions = (translations) => [
  translations.home.services.items.webDev.title,
  translations.home.services.items.business.title,
  translations.home.services.items.marketing.title,
  translations.home.services.items.content.title,
  translations.contact.form.other
]

export default function ContactPage() {
  const { language, isRTL } = useLanguage()
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

  const getTranslations = () => {
    switch (language) {
      case 'he':
        return he
      case 'en':
        return en
      default:
        return ar
    }
  }

  const translations = getTranslations()

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

    // Message validation (required)
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
    console.log('Form submitted with data:', formData);
    
    if (!validateForm()) {
      console.log('Form validation failed:', errors);
      return;
    }

    console.log('Form validation passed, submitting...');
    setIsSubmitting(true);

    try {
      console.log('Sending request to /api/contact');
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        console.log('Form submission successful!');
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
        console.log('Form submission failed:', data.error);
        setErrors(prev => ({
          ...prev,
          submit: data.error || 'حدث خطأ أثناء إرسال النموذج'
        }));
      }
    } catch (error) {
      console.error('Error during form submission:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'حدث خطأ في الاتصال بالخادم'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
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
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-wide">
              {translations.contact.hero.title}
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed">
              {translations.contact.hero.subtitle}
            </p>
            <p className="text-xl text-gray-300 my-8">
              {translations.contact.calendly?.subtitle || 'Book a time that works best for you'}
            </p>
            <a
              href="https://calendly.com/shhadyse/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
            >
              <FiClock className="w-5 h-5 mr-2" />
              {translations.contact.calendly?.buttonText || 'Schedule Now'}
            </a>
          </motion.div>
        </div>
      </section>

      {/* Calendly Section */}
     

      {/* Contact Form Section */}
      <section className="py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form */}
            <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl">
              <h2 className={`text-2xl font-bold text-white mb-2 text-${isRTL ? 'right' : 'left'}`}>
                {translations.contact.form.title}
              </h2>
              <p className={`text-gray-400 mb-8 text-${isRTL ? 'right' : 'left'}`}>
                {translations.contact.form.subtitle}
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className={`block text-sm font-medium text-gray-300 mb-1 text-${isRTL ? 'right' : 'left'}`}>
                    {translations.contact.form.name}
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-${isRTL ? 'right' : 'left'}`}
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className={`block text-sm font-medium text-gray-300 mb-1 text-${isRTL ? 'right' : 'left'}`}>
                    {translations.contact.form.email}
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-${isRTL ? 'right' : 'left'}`}
                  />
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className={`block text-sm font-medium text-gray-300 mb-1 text-${isRTL ? 'right' : 'left'}`}>
                    {translations.contact.form.phone}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-${isRTL ? 'right' : 'left'}`}
                  />
                  {errors.phone && (
                    <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="service" className={`block text-sm font-medium text-gray-300 mb-1 text-${isRTL ? 'right' : 'left'}`}>
                    {translations.contact.form.service}
                  </label>
                  <select
                    name="service"
                    id="service"
                    required
                    value={formData.service}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-${isRTL ? 'right' : 'left'}`}
                  >
                    <option value="">{translations.contact.form.selectService}</option>
                    {getServiceOptions(translations).map((service, index) => (
                      <option key={index} value={service} className="bg-gray-900">
                        {service}
                      </option>
                    ))}
                  </select>
                  {errors.service && (
                    <p className="text-red-400 text-sm mt-1">{errors.service}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="message" className={`block text-sm font-medium text-gray-300 mb-1 text-${isRTL ? 'right' : 'left'}`}>
                    {translations.contact.form.message}
                  </label>
                  <textarea
                    name="message"
                    id="message"
                    rows={4}
                    required
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={translations.contact.form.messagePlaceholder}
                    className={`w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-${isRTL ? 'right' : 'left'}`}
                  />
                  {errors.message && (
                    <p className="text-red-400 text-sm mt-1">{errors.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg px-4 py-3 transition-all duration-300 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {isSubmitting ? translations.contact.form.submitting : translations.contact.form.submit}
                </button>

                {showSuccess && (
                  <div className="text-green-400 text-center mt-4">
                    {translations.contact.form.success}
                  </div>
                )}

                {errors.submit && (
                  <div className="text-red-400 text-center mt-4">
                    {translations.contact.form.error}
                  </div>
                )}
              </form>
            </div>

            {/* Contact Info & Map */}
            <div className="space-y-8">
              {/* Contact Info */}
              <div>
                <h2 className={`text-2xl font-bold text-white mb-6 text-${isRTL ? 'right' : 'left'}`}>
                  {translations.contact.info.title}
                </h2>
                <div className="grid grid-cols-1 gap-6">
                  {getContactInfo(translations).map((info, index) => (
                    <div key={index} className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="text-blue-500">{info.icon}</div>
                      <div className={`text-${isRTL ? 'right' : 'left'}`}>
                        <h3 className="text-white font-semibold mb-1">{info.title}</h3>
                        {info.link ? (
                          <a
                            href={info.link}
                            className="text-gray-400 hover:text-blue-400 transition-colors duration-300"
                          >
                            {info.details}
                          </a>
                        ) : (
                          <span className="text-gray-400">{info.details}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Map */}
              <div>
                <h2 className={`text-2xl font-bold text-white mb-6 text-${isRTL ? 'right' : 'left'}`}>
                  {translations.contact.map.title}
                </h2>
                <div className="h-[400px] rounded-2xl overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d26724.67961929919!2d35.27962973067478!3d32.70421504646431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x151c4e7cf16c0fff%3A0xd2385b30c1275dd6!2sNazareth!5e0!3m2!1sen!2sil!4v1709774008600!5m2!1sen!2sil"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h2 className={`text-2xl font-bold text-white mb-2 text-${isRTL ? 'right' : 'left'}`}>
                  {translations.contact.social.title}
                </h2>
                <p className={`text-gray-400 mb-6 text-${isRTL ? 'right' : 'left'}`}>
                  {translations.contact.social.subtitle}
                </p>
                <div className="flex gap-4">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-400 transition-colors duration-300"
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
} 