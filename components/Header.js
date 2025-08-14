'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { useLanguage } from '../context/LanguageContext'
import { ar } from '../translations/ar'
import { he } from '../translations/he'
import { en } from '../translations/en'

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { language, changeLanguage } = useLanguage()
  
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

  const navigation = [
    { name: translations.nav.home, href: '/' },
    { name: translations.nav.about, href: '/about' },
    { name: translations.nav.services, href: '/services' },
    { name: translations.nav.projects, href: '/projects' },
    { name: 'FAQ', href: '/faq' },
    { name: translations.nav.contact, href: '/contact' },
  ]

  return (
    <header className="fixed w-full z-50 from-black/50 to-[rgb(30,35,46)] bg-gradient-to-l backdrop-blur-lg border-b border-white/10 py-2">
      <nav className="max-w-7xl mx-auto px-4 sm:pr-6 lg:pr-8">
        <div className="flex flex-row items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex flex-row justify-center items-center gap-2">
            <Link href="/" className="text-2xl font-bold text-white">
             <Image src="/logo-10-removebg.png" alt="Logo" width={100} height={100} className='h-8 w-8 object-contain' />
            </Link>
            <p className='text-white text-xl h-10 flex items-center'>FIKRANOVA</p>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 flex-row-reverse">
            {/* Language Switcher - Always First (Right) */}
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="bg-black text-gray-300 border border-gray-600 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-400 order-first"
            >
              <option value="ar">العربية</option>
              <option value="he">עברית</option>
              <option value="en">English</option>
            </select>

            {/* Navigation Links */}
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  pathname === item.href
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-300 hover:text-white'
                } px-1 py-2 text-sm font-medium transition-colors duration-200`}
              >
                {item.name}
              </Link>
            ))}

            {/* Start Project Button */}
            <Link href="/contact">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200">
                {language === 'he' ? 'התחל פרויקט' : language === 'en' ? 'Start Project' : 'ابدأ مشروعك'}
              </button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-400 hover:text-white"
            >
              <span className="sr-only">Menu</span>
              {!isMobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {/* Mobile Language Switcher */}
              <select
                value={language}
                onChange={(e) => {changeLanguage(e.target.value);setIsMobileMenuOpen(false)}}
                className="w-full bg-black text-gray-300 border border-gray-600 rounded px-3 py-2 mb-2 text-base focus:outline-none focus:border-blue-400"
              >
                <option value="ar">العربية</option>
                <option value="he">עברית</option>
                <option value="en">English</option>
              </select>

              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    pathname === item.href
                      ? 'text-blue-400 bg-black/30'
                      : 'text-gray-300 hover:text-white hover:bg-black/30'
                  } block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 text-right`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)}>
                <button className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200">
                  {language === 'he' ? 'התחל פרויקט' : language === 'en' ? 'Start Project' : 'ابدأ مشروعك'}
                </button>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

export default Header 