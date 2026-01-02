'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import Script from 'next/script'
import { useLanguage } from '@/context/LanguageContext'
import { ar } from '@/translations/ar'
import { he } from '@/translations/he'
import { en } from '@/translations/en'

export default function ProjectsPage() {
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

  const projectsTitle = language === 'he' ? 'הפרויקטים שלנו' : language === 'en' ? 'Our Projects' : 'مشاريعنا'
  const projectsSubtitle = language === 'he' 
    ? 'דוגמאות נבחרות של פתרונות שפיתחנו עבור לקוחותינו'
    : language === 'en' 
      ? 'Selected examples of solutions we built for our clients'
      : 'أمثلة مختارة للحلول التي بنيناها لعملائنا'
  const ctaTitle = language === 'he' ? 'רוצים לבנות משהו יחד?' : language === 'en' ? 'Want to build something together?' : 'تريد بناء شيء معنا؟'
  const ctaSubtitle = language === 'he' ? 'ספרו לנו על הרעיון או הצורך העסקי שלכם ונעזור לכם להתקדם' : language === 'en' ? 'Tell us about your idea or business need and we will help you move forward' : 'أخبرنا عن فكرتك أو حاجتك التجارية وسنساعدك على التقدم'
  const ctaButton = language === 'he' ? 'צור קשר' : language === 'en' ? 'Contact Us' : 'تواصل معنا'

  const projects = [
    {
      id: 'proj-keysmatch',
      title: 'KeysMatch',
      description: language === 'he'
        ? "קיזמאץ' היא פלטפורמה חכמה שמחברת קונים לנכסים ולסוכנים המתאימים לפי תקציב, מיקום ומספר חדרים—עם מעקב מיידי ב-WhatsApp."
        : language === 'en'
          ? 'KeysMatch is an AI-powered real-estate matcher that pairs buyers with the right properties and agents by budget, rooms, and location—plus instant WhatsApp follow-ups.'
          : 'كيز ماتش منصة عقارية ذكية توفّر تطابقًا فوريًا بين المشتري والعقار المناسب حسب الميزانية، الموقع وعدد الغرف، مع تواصل سريع عبر واتساب.',
      tagline: 'Match buyers to the right keys in seconds.',
      tags: ['AI', 'Real Estate', 'Automation'],
      gradient: 'from-blue-500 to-cyan-400',
      image: '/keysmatch.png',
      url: 'https://www.keysmatch.com'
    },
    {
      id: 'proj-eventy',
      title: 'Eventy',
      description: language === 'he'
        ? 'Eventy היא מערכת RSVP וניהול אורחים דרך WhatsApp לאירועים ולחתונות: הזמנות חכמות, תזכורות אוטומטיות, ספירת אישורי הגעה בזמן אמת, מפת הושבה וייצוא קל ל-Google Sheets. תמיכה בעברית ובערבית.'
        : language === 'en'
          ? 'Eventy is a WhatsApp-native RSVP and guest management tool for weddings and events: smart invites, auto reminders, live headcounts, seating charts, and easy export to Google Sheets. Arabic/Hebrew ready.'
          : 'Eventy منصة ذكية لإدارة الدعوات و-RSVP عبر واتساب للمناسبات والأعراس: دعوات ذكية، تذكيرات تلقائية، إحصاءات فورية، مخطط جلوس، وتصدير سهل إلى Google Sheets. تدعم العربية والعبرية.',
      tagline: 'RSVPs, seating & reminders—on autopilot.',
      tags: ['WhatsApp', 'RSVP', 'Events'],
      gradient: 'from-emerald-500 to-green-400',
      image: '/eventy.jpg',
      url: 'https://www.eventy.vip'
    },
    {
      id: 'proj-watermelon',
      title: 'Watermelon Tours',
      description: language === 'he'
        ? 'Watermelon Tours מחברת מטיילים למדריכים מקומיים מאומתים. חיפוש לפי עיר ונושא, זמינות בזמן אמת מסונכרנת ל-Google Calendar, תשלום מאובטח ואישור מיידי ב-WhatsApp. תמיכה בעברית ובאנגלית.'
        : language === 'en'
          ? 'Watermelon Tours connects travelers with verified local guides. Browse by city and theme, see real-time availability synced to Google Calendar, pay securely, and get instant WhatsApp confirmations. Arabic/English ready.'
          : 'Watermelon Tours تربطك بمرشدين محليين موثوقين. استكشف حسب المدينة والاهتمام، توفّر فوري متزامن مع Google Calendar، دفع آمن، وتأكيدات فورية عبر واتساب. تدعم العربية الانجليزيه.',
      tagline: 'Local tours. Real-time availability. Zero hassle.',
      tags: ['Travel', 'Guides', 'Calendar'],
      gradient: 'from-rose-500 to-red-400',
      image: '/watermelon.png',
      url: 'https://watermelontours.com'
    },
    {
      id: 'proj-cicilia',
      title: 'CiciliaImport',
      description: language === 'he'
        ? 'CiciliaImport הוא קטלוג B2B למוצרים איטלקיים אותנטיים—פסטות, רטבים, שמנים, גבינות ועוד. חיפוש לפי קטגוריות, גדלי אריזה ו-MOQ, הורדת מחירון ושליחת '
        : language === 'en'
          ? 'CiciliaImport is a B2B catalog for authentic Italian ingredients—pastas, sauces, oils, cheeses, and more. Browse by category, see pack sizes & MOQs, download a price list, '
          : 'CiciliaImport كتالوج B2B للمكونات الإيطالية الأصيلة—مكرونة، صلصات، زيوت، أجبان وأكثر. تصفّح حسب الفئة، شاهد أحجام العبوات والحد الأدنى للطلب، حمّل قائمة الأسعار، ',
      tagline: 'From Italy to your menu.',
      tags: ['B2B', 'Catalog', 'Food'],
      gradient: 'from-red-500 to-amber-400',
      image: '/cicilia.png',
      url: 'https://www.cicilialtd.com/'
    },
    {
      id: 'proj-bclick',
      title: 'BClick',
      description: language === 'he'
        ? 'BClick היא פלטפורמת B2B בסגנון Wolt שמחברת ספקים לעסקים: קטלוגים בזמן אמת, הזמנות חוזרות, בדיקת מלאי חכמה ומעקב משלוחים עם עדכוני WhatsApp. תמיכה בעברית/ערבית וחשבוניות מע״מ.'
        : language === 'en'
          ? 'BClick is a Wolt-style B2B platform that connects suppliers with businesses. Browse live catalogs, place/redo orders, get stock-aware checks, and track delivery with instant WhatsApp updates. Supports Arabic/Hebrew and VAT invoices.'
          : 'BClick منصة توريد بين الشركات تشبه “Wolt” للأعمال: كتالوجات مباشرة، طلبات متكررة، فحص مخزون فوري، وتتبع تسليم مع إشعارات واتساب. تدعم العربية/العبرية وفواتير ضريبية.',
      tagline: 'Wholesale orders, one click.',
      tags: ['B2B', 'Orders', 'WhatsApp'],
      gradient: 'from-amber-500 to-orange-400',
      image: '/bclick.png',
      url: 'https://bclick.co'
    },
    {
      id: 'proj-stella',
      title: 'Stella Jewellery',
      description: language === 'he'
        ? 'Stella Jewellery הוא בוטיק אונליין לתכשיטי יוקרה יומיומיים מזהב 14K וכסף סטרלינג 925. קטלוג קולקציות, תמונות אמיתיות, מידות/וריאנטים, רשימת משאלות ותשלום מאובטח—עם ממשק בעברית/בערבית ותמיכה ב-WhatsApp.'
        : language === 'en'
          ? 'Stella Jewellery is a boutique e-commerce for everyday-luxury pieces in 14K gold and 925 sterling silver. Browse curated collections, see real-life photos, choose sizes/variants, add to wishlist, and check out securely—with Arabic/Hebrew UI and WhatsApp support.'
          : 'Stella Jewellery متجر بوتيك لمجوهرات فاخرة يومية من الذهب عيار 14 والفضة الإسترلينية 925. تصفّح مجموعات منسّقة، صور واقعية، خيارات مقاسات/ألوان، أضف إلى قائمة الرغبات، وادفع بأمان—مع واجهة بالعربية/العبرية ودعم عبر واتساب.',
      taglineLocalized: { ar: 'لمعان خالد، بلمسة عصرية.' },
      tags: ['E-commerce', 'Jewellery', 'WhatsApp'],
      gradient: 'from-pink-500 to-rose-400',
      image: '/stella.png',
      url: 'https://stella-orpin-rho.vercel.app'
    },
    {
      id: 'proj-brokeraffiliate',
      title: 'BrokerAffiliate',
      description: language === 'he'
        ? 'פלטפורמה בעברית להשוואת חברות ברוקראז׳: רישוי, עמלות, סוגי חשבונות (כולל איסלאמי), ביקורות אמיתיות ומדריכים לבחירת הברוקר המתאים.'
        : language === 'en'
          ? 'An Arabic-first broker comparison hub for 2025: regulation checks, fees, account types (incl. Islamic), verified reviews, and clear guides to pick the right broker.'
          : 'منصّة عربية لمقارنة شركات الوساطة لعام 2025: تراخيص، رسوم، أنواع حسابات (يشمل إسلامية)، تقييمات حيادية، ودلائل مبسّطة لاختيار الوسيط المناسب.',
      tagline: 'Compare licensed brokers. Decide with confidence.',
      taglineLocalized: {
        ar: 'قارن الوسطاء المرخّصين بثقة وابدأ التداول بذكاء.',
        he: 'השווה ברוקרים מפוקחים וקבל החלטה חכמה.'
      },
      tags: ['Finance', 'Comparison', 'Brokers'],
      gradient: 'from-teal-500 to-cyan-400',
      image: '/brokers.jpg',
      url: 'https://www.brokersarabia.com/'
    },
    {
      id: 'proj-rojeh',
      title: 'Rojeh Naddaf',
      description: language === 'he'
        ? 'כרטיס ביקור דיגיטלי לסוכן הנדל״ן רוג׳ה נדאף: WhatsApp/שיחה בנגיעה, שמירת איש קשר, נכסים מובילים, טופס לידים, ניווט במפות ו-QR מוכן להדפסה וסטוריז. תמיכה בעברית/ערבית/אנגלית.'
        : language === 'en'
          ? 'A digital business card for real-estate agent Rojeh Naddaf: one-tap WhatsApp/call, save contact, featured listings, lead form, Maps navigation, and a print-ready QR for signs/stories. Arabic/Hebrew/English support.'
          : 'بطاقة أعمال رقمية مخصّصة لوكيل العقارات روجيه ندّاف: واتساب/مكالمة بنقرة، حفظ جهة الاتصال، عقارات مميزة، نموذج ليدز، خريطة للوصول، و-QR جاهز للطباعة والستوري. تدعم العربية/العبرية/الإنجليزية.',
      tagline: 'Your real‑estate card—one tap away.',
      tags: ['Real Estate', 'Leads', 'QR'],
      gradient: 'from-sky-500 to-blue-400',
      image: '/rojeh.png',
      url: 'https://rojeh-nadaf.com'
    },
    
  ]

  return (
    <main className="bg-black min-h-screen">
      <Script id="breadcrumbs-projects" type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `https://www.fikranova.com/${language}` },
              { '@type': 'ListItem', position: 2, name: 'Projects', item: `https://www.fikranova.com/${language}/projects` }
            ]
          })
        }}
      />
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-black to-black opacity-90"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6"
          >
            {projectsTitle}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            {projectsSubtitle}
          </motion.p>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => {
              const MotionCard = project.url ? motion.a : motion.div
              const cardProps = project.url
                ? { href: project.url, target: '_blank', rel: 'noopener noreferrer' }
                : {}
              return (
                <MotionCard
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden group hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 block"
                  {...cardProps}
                >
                  <div className={`bg-gradient-to-r ${project.gradient} opacity-5 absolute inset-0 pointer-events-none`}></div>
                  <div className="relative z-10 p-8">
                    {project.image && (
                      <div className="relative w-full h-48 mb-4 rounded-xl overflow-hidden">
                        <Image src={project.image} alt={project.title} fill className="object-cover" priority={index === 0} />
                      </div>
                    )}
                    <h3 className={`text-2xl font-bold text-white mb-2 text-${isRTL ? 'right' : 'left'}`}>
                      {project.title}
                    </h3>
                    {(project.tagline && language === 'en') || (project.taglineLocalized && project.taglineLocalized[language]) ? (
                      <p className={`text-blue-300 mb-2 text-${isRTL ? 'right' : 'left'}`}>
                        {language === 'en' ? project.tagline : project.taglineLocalized?.[language]}
                      </p>
                    ) : null}
                    <p className={`text-gray-400 mb-4 text-${isRTL ? 'right' : 'left'}`}>
                      {project.description}
                    </p>
                    <div className={`flex flex-wrap gap-2 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                      {project.tags.map((tag) => (
                        <span key={tag} className="px-3 py-1 bg-white/5 rounded-full text-sm text-gray-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </MotionCard>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-3xl p-8 md:p-16 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-black opacity-50"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  {ctaTitle}
                </h2>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                  {ctaSubtitle}
                </p>
                <Link
                  href="/contact"
                  className="inline-block bg-white text-blue-900 px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-50 transition-colors duration-300 transform hover:scale-105"
                >
                  {ctaButton}
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}

