/**
 * Case-study pages — internal project pages for work that has no live URL yet.
 * Keyed by the project's `slug` in lib/content/projects.js.
 *
 * Server-only; all three languages in one file costs the visitor nothing.
 *
 * Honesty rules, same as the homepage: the product is IN DEVELOPMENT and the
 * page says so plainly. Every feature listed below exists in one of the three
 * source systems being merged (the operations platform, the events system, the
 * print platform) — nothing here is speculative roadmap dressed as fact. No
 * invented metrics, no fake screenshots.
 */

export const CASE_STUDIES = {
  'business-suite': {
    en: {
      meta: {
        title: 'FikraNova Suite — one system to run the whole business',
        description:
          'CRM and daily operations, event and hall management with a drag-and-drop floor planner, and kitchen printing that survives internet outages — one system, in Arabic, Hebrew and English.',
      },
      badge: 'In development',
      title: 'One system to run the whole business',
      lede: 'Most of our clients run their day across four disconnected tools: a CRM they barely open, a WhatsApp thread that is really the events calendar, a hall sketch on paper, and a printer nobody trusts. The Suite is those four things as one product.',
      overviewHeading: 'Where it comes from',
      overviewBody:
        'This is not a blank-page product. It is three systems we already built — an operations platform (CRM, leads, landing pages, staff scheduling), the events system behind Eventy-style guest management, and our print platform with its Windows agent — being merged into one login. The parts have run in the real world; the product is the merge.',
      flowHeading: 'How it works',
      steps: [
        {
          title: 'Sign in and set up your business',
          body: 'Name, business details, your logo. One account owns everything that follows.',
        },
        {
          title: 'Draw your space',
          body: 'Sketch the restaurant or hall on a canvas — tables, fixtures, walls — by dragging shapes, the way you would on paper. The map becomes the operating surface: seating, sections, service.',
        },
        {
          title: 'Load the catalogue',
          body: 'Menus, items, prices, packages for events. In the languages your customers actually read.',
        },
        {
          title: 'Run the day',
          body: 'Orders land against tables, events land against the calendar, staff shifts land against the rota. The CRM fills itself from the work instead of waiting to be filled.',
        },
        {
          title: 'Everything prints itself',
          body: 'Kitchen tickets and receipts print the moment an order lands — Arabic and Hebrew rendered correctly, and an offline queue on the till so printing survives the internet dropping mid-service.',
        },
      ],
      modulesHeading: 'What is inside',
      modules: [
        {
          name: 'Operations & CRM',
          blurb: 'The daily engine — from the operations platform.',
          features: [
            'Contacts and a leads pipeline',
            'Landing pages that feed the pipeline',
            'Digital business cards',
            'Staff shift scheduling',
          ],
        },
        {
          name: 'Events & halls',
          blurb: 'The events system, with the floor planner at its heart.',
          features: [
            'Drag-and-drop hall and floor planning',
            'Tables, fixtures and seating maps',
            'Event requests and bookings',
            'Menus and packages per event',
          ],
        },
        {
          name: 'Service & printing',
          blurb: 'The print platform and its Windows agent.',
          features: [
            'Pair a Windows till in minutes with a one-time code',
            'Kitchen tickets and receipts on thermal printers',
            'Correct Arabic and Hebrew on paper — right-to-left, properly shaped',
            'Offline queue: orders print even when the internet drops',
            'Fleet updates managed from one place',
          ],
        },
      ],
      statusNote:
        'The Suite is in active development and not yet taking customers. The pieces exist and run; the work is making them one product. If it sounds like your business, talk to us — early conversations shape what gets built first.',
      ctaPrimary: 'Talk to us about it',
      backToProjects: 'All work',
    },

    ar: {
      meta: {
        title: 'فكرة نوفا سويت — نظام واحد يدير العمل كلّه',
        description:
          'إدارة علاقات العملاء والعمليات اليومية، إدارة المناسبات والقاعات مع مخطِّط قاعة بالسحب والإفلات، وطباعة مطبخ تصمد أمام انقطاع الإنترنت — نظام واحد، بالعربية والعبرية والإنجليزية.',
      },
      badge: 'قيد التطوير',
      title: 'نظام واحد يدير العمل كلّه',
      lede: 'معظم عملائنا يديرون يومهم عبر أربع أدوات منفصلة: نظام عملاء بالكاد يُفتح، محادثة واتساب هي فعلياً رزنامة المناسبات، مخطّط قاعة على ورقة، وطابعة لا يثق بها أحد. «سويت» هو هذه الأربعة كمنتج واحد.',
      overviewHeading: 'من أين جاء',
      overviewBody:
        'هذا ليس منتجاً يبدأ من صفحة بيضاء. إنه ثلاثة أنظمة بنيناها فعلاً — منصة عمليات (عملاء، فرص، صفحات هبوط، جدولة موظفين)، نظام المناسبات وإدارة الضيوف، ومنصة الطباعة مع وكيلها على ويندوز — تُدمج في تسجيل دخول واحد. الأجزاء اشتغلت في العالم الحقيقي؛ المنتج هو الدمج.',
      flowHeading: 'كيف يعمل',
      steps: [
        {
          title: 'سجّل الدخول وجهّز عملك',
          body: 'الاسم، تفاصيل العمل، الشعار. حساب واحد يملك كل ما يأتي بعده.',
        },
        {
          title: 'ارسم مساحتك',
          body: 'خطّط المطعم أو القاعة على لوحة رسم — طاولات، تجهيزات، جدران — بسحب الأشكال، كما تفعل على الورق. الخريطة تصبح سطح التشغيل: إجلاس، أقسام، خدمة.',
        },
        {
          title: 'حمّل الكتالوج',
          body: 'قوائم الطعام، الأصناف، الأسعار، باقات المناسبات. باللغات التي يقرأها زبائنك فعلاً.',
        },
        {
          title: 'أدر اليوم',
          body: 'الطلبات تنزل على الطاولات، المناسبات على الرزنامة، ومناوبات الموظفين على الجدول. نظام العملاء يمتلئ من العمل نفسه بدل أن ينتظر من يملؤه.',
        },
        {
          title: 'كل شيء يطبع نفسه',
          body: 'تذاكر المطبخ والفواتير تُطبع لحظة وصول الطلب — العربية والعبرية مطبوعتان بشكل صحيح، وطابور غير متصل على الكاشير كي تستمر الطباعة حتى لو انقطع الإنترنت في منتصف الخدمة.',
        },
      ],
      modulesHeading: 'ماذا في الداخل',
      modules: [
        {
          name: 'العمليات وإدارة العملاء',
          blurb: 'المحرّك اليومي — من منصة العمليات.',
          features: [
            'جهات اتصال ومسار فرص بيع',
            'صفحات هبوط تغذّي المسار',
            'بطاقات أعمال رقمية',
            'جدولة مناوبات الموظفين',
          ],
        },
        {
          name: 'المناسبات والقاعات',
          blurb: 'نظام المناسبات، وفي قلبه مخطِّط القاعة.',
          features: [
            'تخطيط القاعة بالسحب والإفلات',
            'طاولات وتجهيزات وخرائط إجلاس',
            'طلبات المناسبات والحجوزات',
            'قوائم وباقات لكل مناسبة',
          ],
        },
        {
          name: 'الخدمة والطباعة',
          blurb: 'منصة الطباعة ووكيلها على ويندوز.',
          features: [
            'اربط كاشير ويندوز خلال دقائق برمز لمرة واحدة',
            'تذاكر مطبخ وفواتير على طابعات حرارية',
            'عربية وعبرية صحيحتان على الورق — من اليمين لليسار وبتشكيل سليم',
            'طابور غير متصل: الطلبات تُطبع حتى عند انقطاع الإنترنت',
            'تحديثات الأسطول تُدار من مكان واحد',
          ],
        },
      ],
      statusNote:
        '«سويت» قيد تطوير نشط ولا يستقبل عملاء بعد. الأجزاء موجودة وتعمل؛ العمل الجاري هو جعلها منتجاً واحداً. إن كان هذا يشبه عملك، كلّمنا — المحادثات المبكرة تحدد ما يُبنى أولاً.',
      ctaPrimary: 'كلّمنا عنه',
      backToProjects: 'كل الأعمال',
    },

    he: {
      meta: {
        title: 'FikraNova Suite — מערכת אחת שמנהלת את כל העסק',
        description:
          'CRM ותפעול יומיומי, ניהול אירועים ואולמות עם משרטט רצפה בגרירה, והדפסת מטבח ששורדת נפילות אינטרנט — מערכת אחת, בערבית, עברית ואנגלית.',
      },
      badge: 'בפיתוח',
      title: 'מערכת אחת שמנהלת את כל העסק',
      lede: 'רוב הלקוחות שלנו מנהלים את היום על פני ארבעה כלים מנותקים: CRM שבקושי נפתח, שרשור וואטסאפ שהוא בפועל יומן האירועים, שרטוט אולם על נייר, ומדפסת שאף אחד לא סומך עליה. ה-Suite הוא ארבעת אלה כמוצר אחד.',
      overviewHeading: 'מאיפה זה מגיע',
      overviewBody:
        'זה לא מוצר שמתחיל מדף ריק. אלה שלוש מערכות שכבר בנינו — פלטפורמת תפעול (CRM, לידים, דפי נחיתה, שיבוץ עובדים), מערכת האירועים וניהול האורחים, ופלטפורמת ההדפסה עם הסוכן שלה לווינדוס — שמתמזגות לכניסה אחת. החלקים רצו בעולם האמיתי; המוצר הוא המיזוג.',
      flowHeading: 'איך זה עובד',
      steps: [
        {
          title: 'נכנסים ומקימים את העסק',
          body: 'שם, פרטי עסק, לוגו. חשבון אחד מחזיק את כל מה שבא אחר כך.',
        },
        {
          title: 'משרטטים את החלל',
          body: 'מציירים את המסעדה או האולם על קנבס — שולחנות, מתקנים, קירות — בגרירת צורות, כמו על נייר. המפה הופכת למשטח העבודה: הושבה, אזורים, שירות.',
        },
        {
          title: 'טוענים את הקטלוג',
          body: 'תפריטים, פריטים, מחירים, חבילות לאירועים. בשפות שהלקוחות שלכם באמת קוראים.',
        },
        {
          title: 'מנהלים את היום',
          body: 'הזמנות נוחתות על שולחנות, אירועים על היומן, ומשמרות על הסידור. ה-CRM מתמלא מהעבודה עצמה במקום לחכות שימלאו אותו.',
        },
        {
          title: 'הכול מדפיס את עצמו',
          body: 'בוני מטבח וקבלות מודפסים ברגע שהזמנה נכנסת — ערבית ועברית מודפסות נכון, ותור לא-מקוון בקופה כך שההדפסה שורדת גם כשהאינטרנט נופל באמצע שירות.',
        },
      ],
      modulesHeading: 'מה יש בפנים',
      modules: [
        {
          name: 'תפעול ו-CRM',
          blurb: 'המנוע היומיומי — מפלטפורמת התפעול.',
          features: [
            'אנשי קשר ומשפך לידים',
            'דפי נחיתה שמזינים את המשפך',
            'כרטיסי ביקור דיגיטליים',
            'שיבוץ משמרות לעובדים',
          ],
        },
        {
          name: 'אירועים ואולמות',
          blurb: 'מערכת האירועים, ובליבה משרטט הרצפה.',
          features: [
            'תכנון אולם ורצפה בגרירה',
            'שולחנות, מתקנים ומפות הושבה',
            'בקשות אירועים והזמנות',
            'תפריטים וחבילות לכל אירוע',
          ],
        },
        {
          name: 'שירות והדפסה',
          blurb: 'פלטפורמת ההדפסה והסוכן שלה לווינדוס.',
          features: [
            'מחברים קופת ווינדוס תוך דקות עם קוד חד-פעמי',
            'בוני מטבח וקבלות במדפסות תרמיות',
            'ערבית ועברית נכונות על הנייר — מימין לשמאל ובעיצוב אותיות תקין',
            'תור לא-מקוון: הזמנות מודפסות גם כשהאינטרנט נופל',
            'עדכוני צי מנוהלים ממקום אחד',
          ],
        },
      ],
      statusNote:
        'ה-Suite בפיתוח פעיל ועדיין לא מקבל לקוחות. החלקים קיימים ורצים; העבודה היא להפוך אותם למוצר אחד. אם זה נשמע כמו העסק שלכם — דברו איתנו. שיחות מוקדמות מעצבות מה נבנה קודם.',
      ctaPrimary: 'דברו איתנו על זה',
      backToProjects: 'כל העבודות',
    },
  },
};

/**
 * @param {string} slug
 * @param {string} lang
 * @returns {object | null}
 */
export function getCaseStudy(slug, lang) {
  const entry = CASE_STUDIES[slug];
  if (!entry) return null;
  return entry[lang] || entry.ar;
}
