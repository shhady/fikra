/**
 * The work.
 *
 * Lifted out of `app/[lang]/projects/page.js`, where all eight projects were
 * hardcoded inside the JSX with inline `language === 'he' ? … : language === 'en'
 * ? … : …` ternaries — which is why the page could only ever be a client
 * component, and why nobody noticed that the CiciliaImport copy had been
 * truncated mid-sentence on the live site for months:
 *
 *     "…see pack sizes & MOQs, download a price list, "
 *
 * All three languages ended on a dangling comma. Completed below.
 *
 * Server-only, so all three languages living here costs the visitor nothing.
 */

/**
 * `featured` controls the homepage "Selected work" section only; the /projects
 * page still lists everything.
 *
 * A project is featured only while its live URL actually resolves. As of
 * 2026-07-14, KeysMatch (504), Stella (404) and BrokerAffiliate (TLS failure)
 * do not, so they are listed but not featured. When they are revived, flip the
 * flag back on — and update BROKEN in tests/projects-featured.test.mjs.
 */
/**
 * The link contract: a project has either a live `url` (external site, opens in
 * a new tab) or a `slug` (internal case-study page at /[lang]/projects/[slug]).
 * `slug` exists for work that cannot honestly ship an external link — a product
 * still in development has no live site, and a dead link is worse than none.
 */
export const PROJECTS = [
  {
    // The combined platform: management-saas + tishreen-events + the print
    // platform, being merged into one product (see docs/superpowers/specs).
    // No url and no logo on purpose — it has not launched, so it gets a case
    // study instead of a pretend external link, and it must NOT be `featured`
    // (the homepage shows only projects whose live URL returns 200).
    id: 'suite',
    slug: 'business-suite',
    title: 'FikraNova Suite',
    status: 'in-development',
    industry: { en: 'Owned product', ar: 'منتج خاص بنا', he: 'מוצר שלנו' },
    tags: ['CRM', 'Events & halls', 'Printing'],
    description: {
      en: 'One system for the businesses we serve most: CRM and daily operations, event and hall management with a drag-and-drop floor planner, and receipts printing in the kitchen the moment an order lands — in Arabic, Hebrew and English.',
      ar: 'نظام واحد للأعمال التي نخدمها أكثر من غيرها: إدارة علاقات العملاء والعمليات اليومية، إدارة المناسبات والقاعات مع مخطِّط قاعة بالسحب والإفلات، وفواتير تُطبع في المطبخ لحظة وصول الطلب — بالعربية والعبرية والإنجليزية.',
      he: 'מערכת אחת לעסקים שאנחנו משרתים הכי הרבה: CRM ותפעול יומיומי, ניהול אירועים ואולמות עם משרטט רצפה בגרירה, וקבלות שמודפסות במטבח ברגע שהזמנה נכנסת — בערבית, עברית ואנגלית.',
    },
  },
  {
    id: 'keysmatch',
    title: 'KeysMatch',
    image: '/keysmatch.png',
    url: 'https://www.keysmatch.com',
    industry: { en: 'Real estate', ar: 'عقارات', he: 'נדל״ן' },
    tags: ['AI matching', 'WhatsApp', 'Automation'],
    description: {
      en: 'An AI-powered real-estate matcher that pairs buyers with the right properties and agents by budget, rooms and location — with instant WhatsApp follow-up.',
      he: "קיזמאץ' היא פלטפורמה חכמה שמחברת קונים לנכסים ולסוכנים המתאימים לפי תקציב, מיקום ומספר חדרים — עם מעקב מיידי ב-WhatsApp.",
      ar: 'كيز ماتش منصة عقارية ذكية توفّر تطابقًا فوريًا بين المشتري والعقار المناسب حسب الميزانية، الموقع وعدد الغرف، مع تواصل سريع عبر واتساب.',
    },
  },
  {
    id: 'eventy',
    title: 'Eventy',
    image: '/eventy.jpg',
    url: 'https://www.eventy.vip',
    featured: true,
    industry: { en: 'Events', ar: 'مناسبات', he: 'אירועים' },
    tags: ['WhatsApp', 'RSVP', 'Seating'],
    description: {
      en: 'A WhatsApp-native RSVP and guest management system for weddings and events: smart invitations, automatic reminders, live headcounts, seating charts, and export to Google Sheets. Arabic and Hebrew ready.',
      he: 'Eventy היא מערכת RSVP וניהול אורחים דרך WhatsApp לאירועים ולחתונות: הזמנות חכמות, תזכורות אוטומטיות, ספירת אישורי הגעה בזמן אמת, מפת הושבה וייצוא ל-Google Sheets. תמיכה בעברית ובערבית.',
      ar: 'Eventy منصة ذكية لإدارة الدعوات و-RSVP عبر واتساب للمناسبات والأعراس: دعوات ذكية، تذكيرات تلقائية، إحصاءات فورية، مخطط جلوس، وتصدير إلى Google Sheets. تدعم العربية والعبرية.',
    },
  },
  {
    id: 'bclick',
    title: 'BClick',
    image: '/bclick.png',
    url: 'https://bclick.co',
    featured: true,
    industry: { en: 'Wholesale & B2B', ar: 'جملة و B2B', he: 'סיטונאות ו-B2B' },
    tags: ['B2B orders', 'Stock', 'WhatsApp'],
    description: {
      en: 'A Wolt-style B2B platform connecting suppliers with businesses. Live catalogues, repeat ordering, stock-aware checks, delivery tracking and instant WhatsApp updates. Arabic and Hebrew, with VAT invoices.',
      he: 'BClick היא פלטפורמת B2B בסגנון Wolt שמחברת ספקים לעסקים: קטלוגים חיים, הזמנות חוזרות, בדיקות מלאי, מעקב משלוחים ועדכוני WhatsApp מיידיים. תמיכה בעברית ובערבית וחשבוניות מע״מ.',
      ar: 'BClick منصة B2B بأسلوب Wolt تربط المورّدين بالشركات: كتالوجات حيّة، طلبات متكرّرة، فحص للمخزون، تتبّع التوصيل وتحديثات فورية عبر واتساب. تدعم العربية والعبرية وفواتير ضريبية.',
    },
  },
  {
    id: 'cicilia',
    title: 'CiciliaImport',
    image: '/cicilia.png',
    url: 'https://www.cicilialtd.com/',
    featured: true,
    industry: { en: 'Wholesale & food', ar: 'جملة وأغذية', he: 'סיטונאות ומזון' },
    tags: ['B2B catalogue', 'Price lists', 'Food'],
    description: {
      // Completed. All three languages were cut off mid-sentence on the live site.
      en: 'A B2B catalogue for authentic Italian ingredients — pastas, sauces, oils, cheeses and more. Browse by category, see pack sizes and minimum order quantities, download a price list, and send an order straight through WhatsApp.',
      he: 'CiciliaImport הוא קטלוג B2B למוצרים איטלקיים אותנטיים — פסטות, רטבים, שמנים, גבינות ועוד. חיפוש לפי קטגוריות, גדלי אריזה ו-MOQ, הורדת מחירון ושליחת הזמנה ישירות ב-WhatsApp.',
      ar: 'CiciliaImport كتالوج B2B للمكونات الإيطالية الأصيلة — مكرونة، صلصات، زيوت، أجبان وأكثر. تصفّح حسب الفئة، شاهد أحجام العبوات والحد الأدنى للطلب، حمّل قائمة الأسعار، وأرسل طلبك مباشرة عبر واتساب.',
    },
  },
  {
    id: 'stella',
    title: 'Stella Jewellery',
    image: '/stella.png',
    url: 'https://stella-orpin-rho.vercel.app',
    industry: { en: 'E-commerce', ar: 'متجر إلكتروني', he: 'מסחר אונליין' },
    tags: ['E-commerce', 'Payments', 'Wishlist'],
    description: {
      en: 'A boutique store for everyday-luxury pieces in 14K gold and 925 silver: curated collections, real photography, sizes and variants, wishlist, and secure checkout — with an Arabic and Hebrew interface and WhatsApp support.',
      he: 'Stella Jewellery היא חנות בוטיק לתכשיטי זהב 14K וכסף 925: קולקציות נבחרות, צילומים אמיתיים, מידות וּוריאציות, רשימת משאלות ותשלום מאובטח — בממשק בעברית ובערבית עם תמיכה ב-WhatsApp.',
      ar: 'Stella Jewellery متجر بوتيك لقطع من ذهب 14 قيراط وفضة 925: مجموعات مختارة، صور حقيقية، مقاسات وخيارات، قائمة أمنيات ودفع آمن — بواجهة عربية وعبرية ودعم عبر واتساب.',
    },
  },
  {
    id: 'watermelon',
    title: 'Watermelon Tours',
    image: '/watermelon.png',
    url: 'https://watermelontours.com',
    featured: true,
    industry: { en: 'Tourism & booking', ar: 'سياحة وحجوزات', he: 'תיירות והזמנות' },
    tags: ['Booking', 'Google Calendar', 'Payments'],
    description: {
      en: 'Connects travellers with verified local guides: browse by city and theme, see real-time availability synced to Google Calendar, pay securely, and get an instant WhatsApp confirmation.',
      he: 'Watermelon Tours מחברת מטיילים למדריכים מקומיים מאומתים: חיפוש לפי עיר ונושא, זמינות בזמן אמת מסונכרנת ל-Google Calendar, תשלום מאובטח ואישור מיידי ב-WhatsApp.',
      ar: 'Watermelon Tours تربط المسافرين بمرشدين محليين موثوقين: تصفّح حسب المدينة والموضوع، توفّر لحظي مزامن مع Google Calendar، دفع آمن وتأكيد فوري عبر واتساب.',
    },
  },
  {
    id: 'brokers',
    title: 'BrokerAffiliate',
    image: '/brokers.jpg',
    url: 'https://www.brokersarabia.com/',
    industry: { en: 'Finance', ar: 'تمويل', he: 'פיננסים' },
    tags: ['Comparison', 'SEO', 'Arabic-first'],
    description: {
      en: 'An Arabic-first broker comparison hub: regulation checks, fees, account types including Islamic accounts, verified reviews, and plain guides to choosing the right broker.',
      he: 'מרכז השוואת ברוקרים בערבית: בדיקות רגולציה, עמלות, סוגי חשבונות (כולל חשבונות אסלאמיים), ביקורות מאומתות ומדריכים ברורים לבחירת ברוקר.',
      ar: 'منصة عربية لمقارنة الوسطاء: تدقيق التراخيص، الرسوم، أنواع الحسابات (بما فيها الإسلامية)، تقييمات موثوقة وأدلة واضحة لاختيار الوسيط المناسب.',
    },
  },
  {
    id: 'rojeh',
    title: 'Rojeh Naddaf',
    image: '/rojeh.png',
    url: 'https://rojeh-nadaf.com',
    featured: true,
    industry: { en: 'Real estate', ar: 'عقارات', he: 'נדל״ן' },
    tags: ['Digital card', 'Leads', 'QR'],
    description: {
      en: 'A digital business card for an estate agent: one-tap WhatsApp and call, save contact, featured listings, a lead form, Maps navigation, and a print-ready QR for signage. Arabic, Hebrew and English.',
      he: 'כרטיס ביקור דיגיטלי לסוכן נדל״ן: WhatsApp ושיחה בלחיצה, שמירת איש קשר, נכסים נבחרים, טופס לידים, ניווט ב-Maps וקוד QR מוכן להדפסה לשילוט. עברית, ערבית ואנגלית.',
      ar: 'بطاقة عمل رقمية لوكيل عقارات: واتساب واتصال بضغطة واحدة، حفظ جهة الاتصال، عقارات مختارة، نموذج تواصل، ملاحة عبر الخرائط، ورمز QR جاهز للطباعة على اللافتات. بالعربية والعبرية والإنجليزية.',
    },
  },
];

/**
 * @param {string} lang
 * @returns {Array<object>} projects flattened into one language
 */
export function getProjects(lang) {
  const locale = ['en', 'ar', 'he'].includes(lang) ? lang : 'ar';

  return PROJECTS.map((project) => ({
    ...project,
    industry: project.industry[locale],
    description: project.description[locale],
  }));
}

/**
 * @param {string} lang
 * @returns {object[]} featured projects, localised, in source order
 */
export function getFeaturedProjects(lang) {
  return getProjects(lang).filter((project) => project.featured);
}
