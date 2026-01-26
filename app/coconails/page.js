'use client'

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QRCode from 'react-qr-code';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Share2, Facebook, Instagram, MapPin, QrCode, X, UserPlus } from 'lucide-react';
import { FaWhatsapp, FaTiktok } from 'react-icons/fa';
import { Playfair_Display, Inter } from 'next/font/google';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export default function CocoCard() {
  const [mounted, setMounted] = useState(false);
  const [showCopiedAlert, setShowCopiedAlert] = useState(false);
  const [activeTab, setActiveTab] = useState('contact');
  const [showQrModal, setShowQrModal] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    setMounted(true);
    setCurrentUrl(window.location.href);
  }, []);

  const handleShare = async () => {
    const url = currentUrl;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'COCO NAILS — Professional Beauty Center | Digital Business Card',
          text: 'Digital business card — COCO NAILS — Professional Beauty Center',
          url,
        });
      } catch (error) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard
        .writeText(currentUrl)
        .then(() => {
          setShowCopiedAlert(true);
          setTimeout(() => setShowCopiedAlert(false), 2000);
        })
        .catch(() => {});
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const toggleQrModal = () => {
    setShowQrModal(!showQrModal);
  };

  return (
    <div
      dir="rtl"
      className={`min-h-screen  px-2 sm:px-6 bg-white ${inter.className}`}
      
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="w-full mx-auto rounded-3xl shadow-2xl overflow-hidden bg-white"
      >
        {/* Header with cover image */}
        <section
          className="h-[28vh] sm:h-[30vh] md:h-[38vh] lg:h-[60vh] xl:h-[64vh] bg-cover bg-center bg-no-repeat relative"
          style={{ backgroundImage: `url(/coconails/cococover3.png)` }}
        >
          <div className="absolute inset-0 opacity-20 mix-blend-overlay">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="pattern" width="8" height="8" patternUnits="userSpaceOnUse">
                  <circle cx="1" cy="1" r="1" fill="#C9A25E" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#pattern)" />
            </svg>
          </div>
        </section>
    
        {/* Name and Subtitle */}
        <div className="mt-6 md:mt-8 lg:mt-10 text-center px-6 bg-white">
          <h1 className={`text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 ${playfair.className}`}>
            COCO NAILS
          </h1>
          <p className="text-[#C9A25E] mt-1 text-sm md:text-base">Professional Beauty Center</p>
          <Link
            href="https://maps.app.goo.gl/vEc5y9h2x922XYp69"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 text-sm md:text-base text-[#C9A25E] mt-2 hover:text-[#a88340] transition-colors"
          >
            <MapPin className="h-4 w-4" />
            <span>חיפה | מרכז יופי מקצועי</span>
          </Link>
        </div>

        {/* Tabs Navigation */}
        <div className="mt-6 px-6 mb-4">
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => handleTabChange('contact')}
              className={`cursor-pointer px-4 py-2 rounded-full text-sm md:text-base font-medium transition-all ${
                activeTab === 'contact'
                  ? 'bg-[#C9A25E]/20 text-[#C9A25E]'
                  : 'text-gray-600 hover:bg-[#C9A25E]/10'
              }`}
            >
              פרטי קשר
            </button>
            <button
              onClick={() => handleTabChange('treatments')}
              className={`cursor-pointer px-4 py-2 rounded-full text-sm md:text-base font-medium transition-all ${
                activeTab === 'treatments'
                  ? 'bg-[#C9A25E]/20 text-[#C9A25E]'
                  : 'text-gray-600 hover:bg-[#C9A25E]/10'
              }`}
            >
              <span className="md:hidden">טיפולים</span>
              <span className="hidden md:inline">טיפולי יופי</span>
            </button>
            <button
              onClick={() => handleTabChange('about')}
              className={`cursor-pointer px-4 py-2 rounded-full text-sm md:text-base font-medium transition-all ${
                activeTab === 'about'
                  ? 'bg-[#C9A25E]/20 text-[#C9A25E]'
                  : 'text-gray-600 hover:bg-[#C9A25E]/10'
              }`}
            >
              אודות
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <div className="px-6 pb-6 min-h-[360px] md:min-h-[380px]">
            {/* Contact Tab */}
            {activeTab === 'contact' && (
              <motion.div
                key="contact"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <a
                  href="tel:+972532312888"
                  className="flex items-center gap-4 p-4 md:p-5 rounded-2xl bg-white border border-[#C9A25E]/20 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-3 md:p-3.5 bg-white border border-[#C9A25E]/30 rounded-full shadow-md">
                    <Phone className="h-5 w-5 md:h-6 md:w-6 text-[#C9A25E]" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 md:text-base">טלפון</div>
                    <div className="text-sm md:text-base text-gray-600">053-231-2888</div>
                  </div>
                </a>

                <Link
                  href="https://wa.me/972532312888"
                  className="flex items-center gap-4 p-4 md:p-5 rounded-2xl bg-white border border-[#C9A25E]/20 shadow-sm hover:shadow-md transition-shadow"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="p-3 md:p-3.5 bg-white border border-[#C9A25E]/30 rounded-full shadow-md">
                    <FaWhatsapp className="h-5 w-5 md:h-6 md:w-6 text-[#C9A25E]" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 md:text-base">וואטסאפ</div>
                    <div className="text-sm md:text-base text-gray-600">שליחת הודעה מיידית</div>
                  </div>
                </Link>

                <Link
                  href="https://ul.waze.com/ul?place=ChIJsWtkY7S7HRURISZqY3e2xcw&ll=32.81501990%2C34.99167780&navigate=yes&utm_campaign=default&utm_source=waze_website&utm_medium=lm_share_location"
                  className="flex items-center gap-4 p-4 md:p-5 rounded-2xl bg-white border border-[#C9A25E]/20 shadow-sm hover:shadow-md transition-shadow"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="p-3 md:p-3.5 bg-white border border-[#C9A25E]/30 rounded-full shadow-md">
                    <MapPin className="h-5 w-5 md:h-6 md:w-6 text-[#C9A25E]" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 md:text-base">כתובת</div>
                    <div className="text-sm md:text-base text-gray-600">חיפה | מרכז יופי מקצועי</div>
                  </div>
                </Link>

                {/* Add to Contacts (mobile only) */}
                <a
                  href="/coconails/coco-nails.vcf"
                  download
                  className="md:hidden flex items-center gap-4 p-4 md:p-5 rounded-2xl bg-white border border-[#C9A25E]/20 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-3 md:p-3.5 bg-white border border-[#C9A25E]/30 rounded-full shadow-md">
                    <UserPlus className="h-5 w-5 md:h-6 md:w-6 text-[#C9A25E]" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 md:text-base">הוסף לאנשי הקשר</div>
                    <div className="text-sm md:text-base text-gray-600">שמירת פרטי העסק במכשיר</div>
                  </div>
                </a>

                {/* Desktop-only social links inside Contact */}
                <Link
                  href="https://www.facebook.com/profile.php?id=61582720510944"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden md:flex items-center gap-4 p-4 md:p-5 rounded-2xl bg-white border border-[#C9A25E]/20 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-3 md:p-3.5 bg-white border border-[#C9A25E]/30 rounded-full shadow-md">
                    <Facebook className="h-5 w-5 md:h-6 md:w-6 text-[#C9A25E]" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 md:text-base">פייסבוק</div>
                    <div className="text-sm md:text-base text-gray-600">Facebook</div>
                  </div>
                </Link>

                <Link
                  href="https://www.instagram.com/gladis.cosmetics/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden md:flex items-center gap-4 p-4 md:p-5 rounded-2xl bg-white border border-[#C9A25E]/20 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-3 md:p-3.5 bg-white border border-[#C9A25E]/30 rounded-full shadow-md">
                    <Instagram className="h-5 w-5 md:h-6 md:w-6 text-[#C9A25E]" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 md:text-base">אינסטגרם</div>
                    <div className="text-sm md:text-base text-gray-600">Instagram</div>
                  </div>
                </Link>

                {/* Social icons-only boxes (mobile only) */}
                <div className="md:hidden grid grid-cols-2 gap-4 pt-2">
                  <Link
                    href="https://www.instagram.com/gladis.cosmetics/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="flex items-center justify-center p-6 rounded-2xl bg-white border border-[#C9A25E]/20 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="p-4 bg-white border border-[#C9A25E]/30 rounded-full shadow-md">
                      <Instagram className="h-6 w-6 text-[#C9A25E]" />
                    </div>
                  </Link>
                  <Link
                    href="https://www.facebook.com/profile.php?id=61582720510944"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="flex items-center justify-center p-6 rounded-2xl bg-white border border-[#C9A25E]/20 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="p-4 bg-white border border-[#C9A25E]/30 rounded-full shadow-md">
                      <Facebook className="h-6 w-6 text-[#C9A25E]" />
                    </div>
                  </Link>
                  {/* <Link
                    href="https://www.tiktok.com/@coco899001"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="TikTok"
                    className="flex items-center justify-center p-6 rounded-2xl bg-white border border-[#C9A25E]/20 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="p-4 bg-white border border-[#C9A25E]/30 rounded-full shadow-md">
                      <FaTiktok className="h-6 w-6 text-[#C9A25E]" />
                    </div>
                  </Link> */}
                </div>
              </motion.div>
            )}

            {/* Treatments Tab */}
            {activeTab === 'treatments' && (
              <motion.div
                key="treatments"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="bg-white border border-[#C9A25E]/20 p-5 rounded-2xl">
                  <h3 className={`text-lg font-semibold text-gray-900 mb-3 ${playfair.className}`}>
                    טיפולי יופי וניילס
                  </h3>
                  <p className="text-gray-700 text-sm">
                    טיפולים מוקפדים באווירה יוקרתית — עם התאמה אישית לכל לקוחה.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-white border border-[#C9A25E]/20">
                    <h4 className={`text-base md:text-lg font-semibold text-gray-900 mb-2 ${playfair.className}`}>
                      מניקור מקצועי
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      עיצוב, שיוף והברקה עם טיפול מזין לציפורניים ולעור הידיים — מראה מוקפד וזוהר.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-[#C9A25E]/20">
                    <h4 className={`text-base md:text-lg font-semibold text-gray-900 mb-2 ${playfair.className}`}>
                      פדיקור רפואי
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      טיפול יסודי ומדויק לבריאות כף הרגל — הסרת עור קשה, טיפול בציפורן בעייתית והחלקת העור.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-[#C9A25E]/20">
                    <h4 className={`text-base md:text-lg font-semibold text-gray-900 mb-2 ${playfair.className}`}>
                      בניית ציפורניים בג’ל ואקריל
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      חיזוק או הארכה בהתאמה אישית — עמידות גבוהה, גימור טבעי וקווי עיצוב יפיפיים.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-[#C9A25E]/20">
                    <h4 className={`text-base md:text-lg font-semibold text-gray-900 mb-2 ${playfair.className}`}>
                      טיפולי יופי לעור הפנים
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      ניקוי עמוק, הזנה והחייאת העור לשיפור מרקם וזוהר — עם חומרים איכותיים בלבד.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-[#C9A25E]/20">
                    <h4 className={`text-base md:text-lg font-semibold text-gray-900 mb-2 ${playfair.className}`}>
                      טיפולי ספא לידיים ורגליים
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      פילינג עדין, מסכה ושיקום לחות — חוויה מרגיעה עם תוצאה רכה ומטופחת.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-[#C9A25E]/20">
                    <h4 className={`text-base md:text-lg font-semibold text-gray-900 mb-2 ${playfair.className}`}>
                      עיצוב וג’ל קבוע
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      מניפת צבעים יוקרתית, עיצובים נקיים ושכבת ג’ל עמידה — מראה מושלם לאורך זמן.
                    </p>
                  </div>
                  
                  <div className="p-5 rounded-2xl bg-white border border-[#C9A25E]/20">
                    <h4 className={`text-base md:text-lg font-semibold text-gray-900 mb-2 ${playfair.className}`}>
                      בניית ציפורניים
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      בנייה מקצועית בג’ל או אקריל, עמידות גבוהה וגימור נקי.
                    </p>
                  </div>
                  
                  <div className="p-5 rounded-2xl bg-white border border-[#C9A25E]/20">
                    <h4 className={`text-base md:text-lg font-semibold text-gray-900 mb-2 ${playfair.className}`}>
                      מניקור + ג’ל
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      מניקור מלא כולל עיצוב ושכבת ג’ל עמידה.
                    </p>
                  </div>
                  
                  <div className="p-5 rounded-2xl bg-white border border-[#C9A25E]/20">
                    <h4 className={`text-base md:text-lg font-semibold text-gray-900 mb-2 ${playfair.className}`}>
                      פדיקור + ג’ל
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      פדיקור יסודי כולל טיפול בכף הרגל ושכבת ג’ל איכותית.
                    </p>
                  </div>
                  
                  <div className="p-5 rounded-2xl bg-white border border-[#C9A25E]/20">
                    <h4 className={`text-base md:text-lg font-semibold text-gray-900 mb-2 ${playfair.className}`}>
                      טיפול פנים
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      טיפולי פנים מתקדמים לניקוי, הזנה ושיפור מרקם העור.
                    </p>
                  </div>
                  
                  <div className="p-5 rounded-2xl bg-white border border-[#C9A25E]/20">
                    <h4 className={`text-base md:text-lg font-semibold text-gray-900 mb-2 ${playfair.className}`}>
                      עיצוב גבות + שעווה
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      עיצוב מדויק לשיפור מבנה הפנים בשילוב שעווה עדינה.
                    </p>
                  </div>
                  
                  <div className="p-5 rounded-2xl bg-white border border-[#C9A25E]/20">
                    <h4 className={`text-base md:text-lg font-semibold text-gray-900 mb-2 ${playfair.className}`}>
                      אפילציה
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      הסרת שיער לצמיתות בטכנולוגיה מתקדמת.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <motion.div
                key="about"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="bg-white border border-[#C9A25E]/20 p-5 rounded-2xl">
                  <h3 className={`text-lg font-semibold text-gray-900 mb-3 ${playfair.className}`}>אודות</h3>
                  <div className="text-gray-700 leading-relaxed text-sm space-y-3">
                    <p>COCO NAILS — Professional Beauty Center</p>
                    <p>
                      מרכז יופי מוביל בחיפה המתמחה במניקור, פדיקור, בניית ציפורניים וטיפולי יופי מתקדמים.
                    </p>
                    <p>
                      כל טיפול מתבצע במקצועיות, סטריליות מלאה ואווירה יוקרתית — עם התאמה אישית לכל לקוחה.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="px-6 pb-8 space-y-3">
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={handleShare}
            className="block w-full text-center border border-[#C9A25E]/30 bg-white text-gray-700 py-3.5 md:py-4 px-4 rounded-xl font-medium md:text-base transition-all hover:bg-gray-50 hover:shadow-md"
          >
            <div className="flex items-center justify-center gap-2">
              <Share2 className="h-5 w-5" />
              <span>{showCopiedAlert ? 'הקישור הועתק בהצלחה!' : 'שיתוף כרטיס הביקור'}</span>
            </div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            onClick={toggleQrModal}
            className="block w-full text-center border border-[#C9A25E]/30 bg-white text-gray-700 py-3.5 md:py-4 px-4 rounded-xl font-medium md:text-base transition-all hover:bg-gray-50 hover:shadow-md"
          >
            <div className="flex items-center justify-center gap-2">
              <QrCode className="h-5 w-5" />
              <span>QR CODE</span>
            </div>
          </motion.button>
        </div>

        {/* Footer */}
        <div className="py-4 bg-white border-t border-gray-200">
          <p className="text-center text-gray-600 text-sm">
            © {new Date().getFullYear()} COCO NAILS — Professional Beauty Center
          </p>
          <p className="text-center text-gray-600 text-sm mt-2">
            Developed by{' '}
            <Link
              href="https://www.fikranova.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C9A25E] hover:text-[#a88340] transition-colors"
            >
              Fikranova
            </Link>
          </p>
        </div>
      </motion.div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQrModal && (
          <>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-40" onClick={toggleQrModal}></div>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none"
            >
              <div
                className="bg-white rounded-2xl p-6 shadow-2xl max-w-xs md:max-w-sm w-full mx-auto relative pointer-events-auto border border-[#C9A25E]/30"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={toggleQrModal}
                  className="absolute top-2 right-2 text-gray-500 hover:text-[#C9A25E] transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
                <div className="text-center mb-4">
                  <h3 className={`text-lg font-bold text-gray-900 mb-1 ${playfair.className}`}>קוד QR</h3>
                  <p className="text-sm text-gray-700">סרקו כדי לשמור את פרטי הקשר</p>
                </div>
                {mounted && (
                  <div className="p-4 bg-white rounded-2xl shadow-md border border-[#C9A25E]/30 mx-auto max-w-[200px] flex justify-center items-center">
                    <QRCode
                      value={currentUrl || 'https://example.com'}
                      size={180}
                      bgColor="#FFFFFF"
                      fgColor="#000000"
                      className="rounded-xl"
                    />
                  </div>
                )}
                <p className="text-sm text-gray-500 text-center mt-4">סרקו את הקוד באמצעות המצלמה בטלפון הנייד</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Notification */}
      {showCopiedAlert && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-4 right-1/2 transform translate-x-1/2 bg-black text-white px-4 py-3 rounded-lg shadow-lg text-sm"
        >
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-[#C9A25E]"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 13l4 4L19 7"></path>
            </svg>
            <span>הקישור הועתק בהצלחה!</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
