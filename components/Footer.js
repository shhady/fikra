import Image from 'next/image'
import Link from 'next/link'
import { FaTwitter, FaLinkedinIn, FaInstagram, FaWhatsapp } from 'react-icons/fa'

const Footer = () => {
  const footerLinks = [
    {
      title: 'روابط سريعة',
      links: [
        { name: 'الرئيسية', href: '/' },
        { name: 'من نحن', href: '/about' },
        { name: 'خدماتنا', href: '/services' },
        { name: 'المدونة', href: '/blog' },
      ],
    },
    {
      title: 'خدماتنا',
      links: [
        { name: 'تطوير المواقع', href: '/services#web' },
        { name: 'الذكاء الاصطناعي', href: '/services#ai' },
        { name: 'التسويق الرقمي', href: '/services#marketing' },
        { name: 'تحليل البيانات', href: '/services#data' },
      ],
    },
    {
      title: 'تواصل معنا',
      links: [
        { name: 'الأسئلة الشائعة', href: '/faq' },
        { name: 'الدعم الفني', href: '/support' },
        { name: 'اتصل بنا', href: '/contact' },
      ],
    },
  ]

  const socialLinks = [
    { icon: FaWhatsapp, href: 'https://wa.me/YOUR_NUMBER', label: 'واتساب' },
    { icon: FaTwitter, href: '#', label: 'تويتر' },
    { icon: FaLinkedinIn, href: '#', label: 'لينكد إن' },
    { icon: FaInstagram, href: '#', label: 'انستغرام' },
  ]

  return (
    <footer className="bg-gradient-to-b from-black to-blue-950 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="text-2xl font-bold text-white">
              <Image src="/my-logo.png" alt="Logo" width={100} height={100} />
            </Link>
            <p className="mt-4 text-gray-400 text-sm leading-relaxed">
              نقدم حلولاً متكاملة في مجال الذكاء الاصطناعي لتطوير أعمالك وتحسين أدائك. نحن نجمع بين التقنيات المتقدمة والخبرة العملية لتحقيق نتائج استثنائية.
            </p>
            {/* Social Links */}
            <div className="mt-6 flex space-x-6 space-x-reverse">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                >
                  <social.icon className="h-6 w-6" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="text-white font-bold mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-300 text-sm block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} جميع الحقوق محفوظة لشركة
              <span className="text-white mx-1">اسم الشركة</span>
            </p>
            <div className="flex space-x-6 space-x-reverse text-sm">
              <Link
                href="/privacy"
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                سياسة الخصوصية
              </Link>
              <Link
                href="/terms"
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                الشروط والأحكام
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer 