'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiMessageCircle, FiCheckCircle } from 'react-icons/fi'

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [showSuccess])

  // Validation function
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

    // Subject validation
    if (!formData.subject.trim()) {
      newErrors.subject = 'الموضوع مطلوب'
    } else if (formData.subject.length < 3) {
      newErrors.subject = 'الموضوع يجب أن يكون أكثر من 3 أحرف'
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
      const response = await fetch('/api/support', {
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
          subject: '',
          message: ''
        });
        setErrors({});
      } else {
        // Handle server-side error
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
    <main className="min-h-screen bg-black py-24">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 shadow-2xl"
        >
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              الدعم الفني
            </h1>
            <p className="text-gray-400">
              نحن هنا لمساعدتك. يرجى ملء النموذج أدناه وسنقوم بالرد عليك في أقرب وقت ممكن.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-400 mb-2">الاسم</label>
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
                <label className="block text-gray-400 mb-2">الموضوع</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => {
                    setFormData({ ...formData, subject: e.target.value })
                    if (errors.subject) {
                      setErrors({ ...errors, subject: '' })
                    }
                  }}
                  className={`w-full px-4 py-3 bg-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${
                    errors.subject ? 'ring-2 ring-red-500' : 'focus:ring-blue-500'
                  } transition-all duration-300`}
                  required
                />
                {errors.subject && (
                  <p className="mt-1 text-sm text-red-500">{errors.subject}</p>
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
              className={`w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold 
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
      </div>
    </main>
  )
} 