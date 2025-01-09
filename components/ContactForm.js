'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

const ContactForm = () => {
  const searchParams = useSearchParams()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: '',
  })

  useEffect(() => {
    // Get the service from URL parameters
    const serviceFromUrl = searchParams.get('service')
    if (serviceFromUrl) {
      setFormData(prev => ({
        ...prev,
        service: serviceFromUrl,
        message: `أود الاستفسار عن خدمة ${serviceFromUrl}`,
      }))
    }
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        // Handle success
        alert('تم إرسال رسالتك بنجاح')
        setFormData({
          name: '',
          email: '',
          phone: '',
          service: '',
          message: '',
        })
      } else {
        // Handle error
        alert('حدث خطأ أثناء إرسال الرسالة')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('حدث خطأ أثناء إرسال الرسالة')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6">
      <div className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300">
            الاسم
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300">
            البريد الإلكتروني
          </label>
          <input
            type="email"
            name="email"
            id="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-300">
            رقم الهاتف
          </label>
          <input
            type="tel"
            name="phone"
            id="phone"
            value={formData.phone}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="service" className="block text-sm font-medium text-gray-300">
            الخدمة المطلوبة
          </label>
          <select
            name="service"
            id="service"
            required
            value={formData.service}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">اختر الخدمة</option>
            <option value="تطوير المواقع بالذكاء الاصطناعي">تطوير المواقع بالذكاء الاصطناعي</option>
            <option value="تحليل وتحسين الأعمال">تحليل وتحسين الأعمال</option>
            <option value="التسويق الرقمي الذكي">التسويق الرقمي الذكي</option>
            <option value="إنتاج المحتوى الإبداعي">إنتاج المحتوى الإبداعي</option>
            <option value="أتمتة العمليات الروبوتية">أتمتة العمليات الروبوتية</option>
          </select>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-300">
            الرسالة
          </label>
          <textarea
            name="message"
            id="message"
            rows={4}
            required
            value={formData.message}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            إرسال الرسالة
          </button>
        </div>
      </div>
    </form>
  )
}

export default ContactForm 