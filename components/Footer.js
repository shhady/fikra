'use client'
import Image from 'next/image'
import Link from 'next/link'
import { FaTwitter, FaLinkedinIn, FaInstagram, FaWhatsapp } from 'react-icons/fa'
import { useLanguage } from '../context/LanguageContext'
import { ar } from '../translations/ar'
import { he } from '../translations/he'
import { en } from '../translations/en'

const Footer = () => {
  const { language, isRTL } = useLanguage()
  
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

  const getFooterLinks = (translations) => [
    {
      title: translations.footer.quickLinks.title,
      links: [
        { name: translations.nav.home, href: '/' },
        { name: translations.nav.about, href: '/about' },
        { name: translations.nav.services, href: '/services' },
        { name: translations.nav.blog, href: '/blog' },
      ],
    },
    {
      title: translations.footer.services.title,
      links: [
        { name: translations.home.services.items.webDev.title, href: '/services#web' },
        { name: translations.home.services.items.business.title, href: '/services#ai' },
        { name: translations.home.services.items.marketing.title, href: '/services#marketing' },
        { name: translations.home.services.items.content.title, href: '/services#data' },
      ],
    },
    {
      title: translations.footer.contact.title,
      links: [
        { name: translations.footer.contact.faq, href: '/faq' },
        { name: translations.footer.contact.support, href: '/support' },
        { name: translations.footer.contact.contactUs, href: '/contact' },
      ],
    },
  ]

  const socialLinks = [
    { icon: FaWhatsapp, href: 'https://wa.me/972543113297', label: translations.footer.social.whatsapp },
    { icon: FaLinkedinIn, href: 'https://www.linkedin.com/in/shhady-serhan-a11403124', label: translations.footer.social.linkedin },
    { icon: FaInstagram, href: 'https://www.instagram.com/fikranova_/', label: translations.footer.social.instagram },
  ]

  const footerLinks = getFooterLinks(translations)

  return (
    <footer className="bg-gradient-to-b from-black to-blue-950 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className={`lg:col-span-2 ${isRTL ? 'text-right' : 'text-left'}`}>
            <Link href="/" className="text-2xl font-bold text-white">
              <Image src="/logo-4.png" alt="Logo" width={100} height={100} />
            </Link>
            <p className="mt-4 text-gray-400 text-sm leading-relaxed">
              {translations.footer.description}
            </p>
            {/* Social Links */}
            <div className={`mt-6 flex gap-6 ${isRTL ? 'justify-start' : 'justify-start'}`}>
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
            <div key={section.title} className={isRTL ? 'text-right' : 'text-left'}>
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
          <div className={`flex flex-col md:flex-row justify-between items-center gap-4 ${isRTL ? 'text-right' : 'text-left'}`}>
            <p className="text-gray-400 text-sm">
              {translations.footer.copyright.text}{' '}
              <span className="text-white mx-1">FIKRANOVA</span>
            </p>
            <div className={`flex gap-6 text-sm ${isRTL ? 'md:justify-start' : 'md:justify-end'}`}>
              <Link
                href="/privacy"
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                {translations.footer.links.privacy}
              </Link>
              <Link
                href="/terms"
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                {translations.footer.links.terms}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer 