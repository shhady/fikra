'use client';
import React, { createContext, useContext, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const LanguageContext = createContext();

export function LanguageProvider({ children, initialLocale }) {
  const router = useRouter();
  const pathname = usePathname();
  // If initialLocale is not provided, try to parse from pathname or default to 'ar'
  const currentLocale = initialLocale || pathname?.split('/')[1] || 'ar';

  const changeLanguage = (newLang) => {
    if (newLang === currentLocale) return;

    // Redirect to the new locale
    const pathSegments = pathname.split('/');
    pathSegments[1] = newLang; // Replace the locale segment
    const newPath = pathSegments.join('/');
    
    router.push(newPath);
  };

  const isRTL = currentLocale === 'ar' || currentLocale === 'he';

  useEffect(() => {
    document.documentElement.lang = currentLocale;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.body.classList.remove('rtl', 'ltr');
    document.body.classList.add(isRTL ? 'rtl' : 'ltr');
    localStorage.setItem('preferredLanguage', currentLocale);
  }, [currentLocale, isRTL]);

  return (
    <LanguageContext.Provider value={{ language: currentLocale, changeLanguage, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}