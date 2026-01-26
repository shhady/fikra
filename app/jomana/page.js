"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { Great_Vibes, Playfair_Display, Rubik } from "next/font/google";
import { UserPlus, Phone, Mail, Instagram, QrCode, X } from "lucide-react";
import * as Lucide from "lucide-react";
import Link from "next/link";

// Fonts
const scriptFont = Great_Vibes({ 
  weight: "400", 
  subsets: ["latin"],
  variable: "--font-script",
});

const serifFont = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

const sansFont = Rubik({
  subsets: ["hebrew", "latin"],
  variable: "--font-sans",
});

// Brand Colors
const colors = {
  bg: "#EAE6E1",
  dark: "#333333",
  accent: "#B39B85",
  white: "#FFFFFF",
};

export default function JomanaDigitalCard() {
  const [activeTab, setActiveTab] = useState("contact");
  const [showQrModal, setShowQrModal] = useState(false);
  const [showCopiedAlert, setShowCopiedAlert] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Robust icon fallback (prevents runtime crash if Turbopack drops a named import binding)
  const ShareIcon =
    Lucide.Share2 ||
    Lucide.Share ||
    function ShareFallbackIcon(props) {
      return (
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
          className={props?.className}
          style={props?.style}
          width={props?.width}
          height={props?.height}
        >
          <path
            d="M16 7a3 3 0 1 0-2.83-4H13a3 3 0 0 0 .17 6.0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6 14l8-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6 10a3 3 0 1 0 0 6a3 3 0 0 0 0-6Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 21a3 3 0 1 0-2.83-4H13a3 3 0 0 0 .17 6.0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6 14l8 5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    };

  useEffect(() => {
    setMounted(true);
  }, []);

  const generateVCF = () => {
    const vcfData = `BEGIN:VCARD
VERSION:3.0
N:;Jomana;;;
FN:Jomana Interior Design
ORG:JOMANA Studio
TITLE:Interior Designer & Home Stylist
TEL;TYPE=CELL:0546849896
EMAIL;TYPE=WORK:JOMANA_AN@HOTMAIL.COM
URL:https://www.leadpage.co/jomana
END:VCARD`;

    const blob = new Blob([vcfData], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Jomana_Studio.vcf");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  function ActionCard({
    title,
    subtitle,
    icon,
    href,
    onClick,
    variant = "secondary", // "secondary" | "primary"
    external = false,
  }) {
    const isPrimary = variant === "primary";
    const Tag = href ? "a" : "button";

    const baseStyle = isPrimary
      ? {
          backgroundColor: colors.dark,
          color: colors.white,
          borderColor: "transparent",
        }
      : {
          backgroundColor: "#F2EFE9", // More opaque beige/bone fill like reference
          color: colors.dark,
          borderColor: "#E6DEC3", // Visible border color
        };

    const badgeStyle = isPrimary
      ? {
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderColor: "rgba(255, 255, 255, 0.5)",
          color: colors.dark,
        }
      : {
          backgroundColor: "#FFFFFF",
          borderColor: "#E6DEC3",
          color: colors.accent,
        };

    const commonProps = href
      ? {
          href,
          target: external ? "_blank" : undefined,
          rel: external ? "noopener noreferrer" : undefined,
        }
      : {
          type: "button",
          onClick,
        };

    return (
      <motion.div
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.99 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        <Tag
          {...commonProps}
          className="block w-full rounded-2xl border px-5 py-4 shadow-sm transition-colors hover:bg-[#EAE4D6]"
          style={baseStyle}
          dir="rtl"
        >
          <div className="flex items-center gap-4">
            {/* Icon Badge (Right side in RTL) */}
            <div
              className="h-12 w-12 rounded-full border shadow-sm flex items-center justify-center shrink-0 bg-white"
              style={badgeStyle}
              aria-hidden="true"
            >
              <div className="h-6 w-6 flex items-center justify-center">{icon}</div>
            </div>

            {/* Text (Left side of icon in RTL) */}
            <div className="flex-1 text-right">
              <div className="text-xl font-medium leading-snug">{title}</div>
              {subtitle ? (
                <div
                  className="text-base leading-snug mt-1"
                  style={{ opacity: isPrimary ? 0.9 : 0.75 }}
                >
                  {subtitle}
                </div>
              ) : null}
            </div>
          </div>
        </Tag>
      </motion.div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const tabContentVariants = {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: 10, transition: { duration: 0.2 } },
  };

  const toggleQrModal = () => {
    setShowQrModal(!showQrModal);
  };

  // Handle share functionality with Web Share API
  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Jomana Interior Design | Digital Business Card',
          text: 'Digital business card — Jomana Interior Design & Home Stylist',
          url,
        });
      } catch (error) {
        console.error('Error sharing:', error);
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  // Copy URL to clipboard
  const copyToClipboard = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => {
          setShowCopiedAlert(true);
          setTimeout(() => setShowCopiedAlert(false), 2000);
        })
        .catch((err) => {
          console.error('Failed to copy:', err);
        });
    }
  };

  return (
    <main 
      className={`min-h-screen flex flex-col items-center py-10 px-6 ${scriptFont.variable} ${serifFont.variable} ${sansFont.variable}`}
      style={{ backgroundColor: colors.bg, color: colors.dark }}
    >
      {/* Header */}
      <motion.header 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center mb-8 w-full max-w-md text-center"
      >
        <div className="relative w-72 h-48">
          <Image 
            src="/jomana-logo-transparent.png" 
            alt="Jomana Studio" 
            fill 
            className="object-cover"
            priority
          />
        </div>
        <h1 className="text-4xl font-serif tracking-wide mb-2">JOMANA</h1>
        <h2 
          className="text-2xl font-script"
          style={{ color: colors.accent }}
        >
          עיצוב פנים והום סטיילינג
        </h2>
      </motion.header>

      {/* Navigation */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.2 }}
        className="flex w-full max-w-md mb-8 border-b"
        style={{ borderColor: `${colors.accent}4D` }} // 30% opacity equivalent
      >
        <button 
          onClick={() => setActiveTab("contact")}
          className={`flex-1 pb-3 text-center transition-all duration-300 font-sans text-lg`}
          style={{
            color: activeTab === "contact" ? colors.dark : colors.accent,
            borderBottom: activeTab === "contact" ? `2px solid ${colors.accent}` : "none",
            fontWeight: activeTab === "contact" ? 500 : 300,
            opacity: activeTab === "contact" ? 1 : 0.7,
          }}
        >
          יצירת קשר
        </button>
        <button 
          onClick={() => setActiveTab("about")}
          className={`flex-1 pb-3 text-center transition-all duration-300 font-sans text-lg`}
          style={{
            color: activeTab === "about" ? colors.dark : colors.accent,
            borderBottom: activeTab === "about" ? `2px solid ${colors.accent}` : "none",
            fontWeight: activeTab === "about" ? 500 : 300,
            opacity: activeTab === "about" ? 1 : 0.7,
          }}
        >
          אודות
        </button>
      </motion.div>

      {/* Conditional Content */}
      <div className="w-full max-w-md grow">
        <AnimatePresence mode="wait">
          {activeTab === "contact" ? (
            <motion.div
              key="contact"
              variants={tabContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col gap-4 font-sans"
            >
              <ActionCard
                title="טלפון"
                subtitle="054-684-9896"
                href="tel:0546849896"
                icon={<Phone className="h-6 w-6" />}
              />

              <ActionCard
                title="וואטסאפ"
                subtitle="שליחת הודעה מיידית"
                href="https://wa.me/972546849896"
                external
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                }
              />

              <ActionCard
                title="אימייל"
                subtitle="שליחת אימייל"
                href="mailto:JOMANA_AN@HOTMAIL.COM"
                icon={<Mail className="h-6 w-6" />}
              />

              <ActionCard
                title="אינסטגרם"
                subtitle="@jomana_interior_design"
                href="https://www.instagram.com/jomana_interior_design/"
                external
                icon={<Instagram className="h-6 w-6" />}
              />
              <div className="border-b border-gray-300 my-2"></div>
              <ActionCard
                variant="primary"
                title="שמירת איש קשר"
                subtitle="הוספה מהירה לאנשי הקשר בטלפון"
                onClick={generateVCF}
                icon={<UserPlus className="h-6 w-6" />}
              />

              <ActionCard
                title={showCopiedAlert ? "הקישור הועתק בהצלחה!" : "שיתוף"}
                subtitle="שיתוף כרטיס הביקור"
                onClick={handleShare}
                icon={<ShareIcon className="h-6 w-6" />}
              />

              <ActionCard
                title="QR CODE"
                subtitle="סרקו כדי לשמור את פרטי הקשר"
                onClick={toggleQrModal}
                icon={<QrCode className="h-6 w-6" />}
              />
            </motion.div>
          ) : (
            <motion.div
              key="about"
              variants={tabContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="text-right leading-relaxed font-sans"
              style={{ color: colors.dark }}
            >
              <p className="text-lg font-light leading-8">
                סטודיו JOMANA מתמחה בעיצוב פנים והום-סטיילינג, תוך יצירת חללים יוקרתיים, על-זמניים ומוקפדים. 
                <br /><br />
                אני מאמינה כי עיצוב נכון הוא איזון מדויק בין אסתטיקה מעודנת לפונקציונליות חכמה, עם דגש על הפרטים הקטנים ביותר. התהליך מתחיל בהקשבה עמוקה לצרכי הלקוח ותרגומם לשפת עיצוב עשירה בחומרים איכותיים וטקסטורות. 
                <br /><br />
                המטרה שלי היא להפוך את החזון שלכם למציאות שתעלה על כל דמיון, וליצור עבורכם בית שתרגישו בו הכי אתם.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
       <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="mt-12 flex flex-col items-center"
      >
      
        <div className="py-2">
          <p className="text-center text-gray-600 text-sm">
            © {new Date().getFullYear()} Jomana Interior Design
          </p>
          <p className="text-center text-gray-600 text-sm mt-2">פותח ע״י <Link href="https://www.leadpage.co" target="_blank" rel="noopener noreferrer" className="text-[#C9A25E] hover:text-[#a88340] transition-colors">LeadPage</Link></p>
        </div>
      </motion.footer> 

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQrModal && (
          <>
            {/* Semi-transparent backdrop */}
            <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-40" onClick={toggleQrModal}></div>

            {/* Modal content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none"
            >
              <div
                className="bg-[#F8F6F2] rounded-2xl p-6 shadow-2xl max-w-xs md:max-w-sm w-full mx-auto relative pointer-events-auto border"
                style={{ borderColor: `${colors.accent}4D` }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={toggleQrModal}
                  className="absolute top-2 right-2 text-gray-500 hover:text-[#B39B85] transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>

                <div className="text-center mb-4">
                  <h3 className={`text-lg font-bold text-gray-900 mb-1 ${serifFont.className}`}>קוד QR</h3>
                  <p className="text-sm text-gray-700">סרקו כדי לשמור את פרטי הקשר</p>
                </div>

                {mounted && (
                  <div className="p-4 bg-white rounded-2xl shadow-md border mx-auto max-w-[200px] flex justify-center items-center" style={{ borderColor: `${colors.accent}4D` }}>
                    <QRCodeSVG
                      value={typeof window !== 'undefined' ? window.location.href : 'https://www.leadpage.co/jomana'}
                      size={180}
                      bgColor="#FFFFFF"
                      fgColor={colors.dark}
                      level="M"
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
          className="fixed bottom-4 right-1/2 transform translate-x-1/2 bg-[#333333] text-white px-4 py-3 rounded-lg shadow-lg text-sm z-50"
        >
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-[#B39B85]"
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
    </main>
  );
}
