'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('ar'); // Default to Arabic

  const changeLanguage = (newLang) => {
    setLanguage(newLang);
    localStorage.setItem('preferredLanguage', newLang);
    document.documentElement.lang = newLang;
    // Set direction based on language
    const isRTL = newLang === 'ar' || newLang === 'he';
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    // Update body class for styling
    document.body.classList.remove('rtl', 'ltr');
    document.body.classList.add(isRTL ? 'rtl' : 'ltr');
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage) {
      changeLanguage(savedLanguage);
    } else {
      // Try to detect user's browser language
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.includes('ar')) {
        changeLanguage('ar');
      } else if (browserLang.includes('he')) {
        changeLanguage('he');
      } else {
        changeLanguage('en');
      }
    }
  }, []);

  const isRTL = language === 'ar' || language === 'he';

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, isRTL }}>
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