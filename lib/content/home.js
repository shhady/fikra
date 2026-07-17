/**
 * Homepage content, in three languages. Server-only, so all three living in one
 * file costs the visitor nothing.
 *
 * ---------------------------------------------------------------------------
 * On the positioning.
 *
 * FikraNova is an AI solutions and software studio. It is NOT a restaurant
 * agency — but the previous copy read like one. Not in its headline, which sold
 * "business systems" broadly, but in every concrete example a visitor actually
 * met: the hero led with "websites that take orders", the industries list led
 * with restaurants, integrations name-checked "your printer", and the closing
 * CTA opened with "Orders taken by phone during service." Someone who does not
 * run a restaurant read that and self-selected out.
 *
 * Meanwhile three of the six things the studio sells — RAG assistants,
 * marketing systems, visual content — appeared nowhere on the page.
 *
 * Restaurants remain one of eight industries. They are not the identity.
 *
 * On proof: this page used to claim "17 systems delivered" and "8 industries".
 * Nobody could check either, which makes them a liability rather than a proof.
 * They are gone. The proof is now the work itself — five systems that are live,
 * linked, and clickable — plus a language claim a visitor verifies by switching
 * locale and watching the layout flip to RTL. Do not reintroduce a counter
 * unless a visitor can verify it.
 * ---------------------------------------------------------------------------
 */

export const HOME = {
  en: {
    meta: {
      title: 'FikraNova — AI solutions and software for business',
      description:
        'An AI solutions and software studio: websites and platforms, AI agents, RAG assistants, automation, marketing systems and visual content — in Arabic, Hebrew and English.',
    },

    hero: {
      // Deliberately does not repeat "AI" — the headline says it one line later.
      eyebrow: 'Software studio · Nazareth',
      headingLead: 'AI solutions and software, built to',
      headingAccent: 'sell, automate and operate.',
      lede: 'We design and build the software a business actually runs on — websites and platforms, AI agents, assistants that answer from your own documents, automations that chase the work, marketing systems, and the visuals to feed them. In Arabic, Hebrew and English.',
      primary: 'Start a project',
      secondary: 'See our work',
      capabilities: [
        'Multilingual websites',
        'AI agents',
        'RAG assistants',
        'Automation',
        'Marketing systems',
        'Visual content',
        'E-commerce',
        'Booking platforms',
        'B2B portals',
        'Dashboards',
        'Payments',
        'Custom software',
      ],
    },

    services: {
      eyebrow: 'What we do',
      heading: 'Not features. Outcomes.',
      lede: 'Every engagement starts from something that is costing you money or time, and ends with a system that runs without you watching it.',
      items: [
        {
          title: 'Websites & platforms',
          body: 'Multilingual websites and web apps that do real work: take orders, manage stock, hold customer accounts, process payments — plus the dashboard that tells you what actually happened today. Built so your staff run them, not us.',
        },
        {
          title: 'AI agents',
          body: 'Assistants pointed at one specific job: qualify a lead, answer a customer, analyse a call, draft the reply. Measured on whether they do it.',
        },
        {
          title: 'RAG assistants',
          body: 'Answers drawn from your own documents — contracts, catalogues, policies, past tickets — with the source attached, so staff and customers can check the work.',
        },
        {
          title: 'Automation & integrations',
          body: 'The follow-ups, confirmations and hand-offs that get forgotten when people are busy — and the plumbing between your site, your calendar, your CRM and your accountant. This is where most projects quietly break, and it is most of the work.',
        },
        {
          title: 'Marketing systems',
          body: 'Landing pages, lead capture, campaigns, and the follow-up that turns them into conversations. Built to be measured, not admired.',
        },
        {
          title: 'Visual content',
          body: 'Product imagery, ads, social and video — generated and art-directed, in the three languages your customers actually read.',
        },
      ],
      afterLaunch:
        'After launch: monitoring, backups, fixes, small changes — and someone who answers when something stops.',
      afterLaunchLink: 'Support',
    },

    work: {
      eyebrow: 'Selected work',
      heading: 'Systems that are live right now',
      lede: 'Each of these is running in production, in the language its customers actually read. Click through and check.',
      cta: 'See all work',
      visit: 'Visit the live site',
    },

    industries: {
      eyebrow: 'Who we build for',
      heading: 'We learn the business before we write the software',
      lede: 'An estate agent chasing a viewing and a wholesaler pricing a pallet have nothing in common — except that both are losing money to admin.',
      items: [
        'Real estate',
        'Events & weddings',
        'E-commerce & retail',
        'Restaurants & food',
        'Wholesale & B2B',
        'Tourism & booking',
        'Health & wellness',
        'Professional services',
      ],
    },

    languages: {
      heading: 'Arabic · Hebrew · English',
      body: 'Designed for native RTL and LTR experiences — right-to-left layout, correct letter shaping, bidirectional text. Designed in three scripts, not translated into them.',
    },

    cta: {
      heading: 'Tell us what is breaking',
      lede: 'Leads going cold because nobody followed up. A price list that lives in someone’s head. Bookings taken by phone, twice. Start there — the technology is our problem, not yours.',
      primary: 'Start a project',
      secondary: 'See our work',
    },
  },

  ar: {
    meta: {
      title: 'فكرة نوفا — حلول ذكاء اصطناعي وبرمجيات للأعمال',
      description:
        'استوديو حلول ذكاء اصطناعي وبرمجيات: مواقع ومنصات، وكلاء ذكاء اصطناعي، مساعدون يجيبون من مستنداتك، أتمتة، أنظمة تسويق ومحتوى بصري — بالعربية والعبرية والإنجليزية.',
    },

    hero: {
      eyebrow: 'استوديو برمجيات · الناصرة',
      headingLead: 'حلول ذكاء اصطناعي وبرمجيات،',
      headingAccent: 'تبيع، تؤتمت، وتُشغّل.',
      lede: 'نصمّم ونبني البرمجيات التي يعمل عليها عملك فعلياً — مواقع ومنصات، وكلاء ذكاء اصطناعي، مساعدون يجيبون من مستنداتك أنت، أتمتة تلاحق العمل، أنظمة تسويق، والمحتوى البصري الذي يغذّيها. بالعربية والعبرية والإنجليزية.',
      primary: 'ابدأ مشروعاً',
      secondary: 'شاهد أعمالنا',
      capabilities: [
        'مواقع متعددة اللغات',
        'وكلاء ذكاء اصطناعي',
        'مساعدون من مستنداتك',
        'أتمتة',
        'أنظمة تسويق',
        'محتوى بصري',
        'متاجر إلكترونية',
        'منصات حجز',
        'بوابات جملة',
        'لوحات تحكم',
        'مدفوعات',
        'برمجيات مخصّصة',
      ],
    },

    services: {
      eyebrow: 'ماذا نفعل',
      heading: 'لا مزايا. بل نتائج.',
      lede: 'كل مشروع يبدأ من شيء يكلّفك مالاً أو وقتاً، وينتهي بنظام يعمل من دون أن تراقبه.',
      items: [
        {
          title: 'مواقع ومنصات',
          body: 'مواقع وتطبيقات متعددة اللغات تؤدي عملاً حقيقياً: تستقبل الطلبات، تدير المخزون، تحفظ حسابات العملاء، وتعالج المدفوعات — مع لوحة التحكم التي تخبرك بما حدث اليوم فعلاً. مبنية ليديرها موظفوك، لا نحن.',
        },
        {
          title: 'وكلاء الذكاء الاصطناعي',
          body: 'مساعدون موجّهون لمهمة واحدة محدّدة: تأهيل عميل، الردّ على زبون، تحليل مكالمة، كتابة مسودّة. ويُقاسون على إنجازها.',
        },
        {
          title: 'مساعدون من مستنداتك',
          body: 'إجابات مستخرجة من مستنداتك أنت — عقود، كتالوجات، سياسات، تذاكر سابقة — مع المصدر مرفقاً، ليتحقّق منها موظفوك وزبائنك.',
        },
        {
          title: 'الأتمتة والربط',
          body: 'المتابعات والتأكيدات والتسليمات التي تُنسى حين ينشغل الناس — والربط بين موقعك وتقويمك ونظام العملاء ومحاسبك. هنا تنهار معظم المشاريع بصمت، وهنا يكمن معظم العمل.',
        },
        {
          title: 'أنظمة التسويق',
          body: 'صفحات هبوط، التقاط عملاء، حملات، والمتابعة التي تحوّلها إلى محادثات. مبنية لتُقاس، لا لتُعجب.',
        },
        {
          title: 'المحتوى البصري',
          body: 'صور منتجات، إعلانات، محتوى للسوشال وفيديو — مُولّدة ومُدارة فنياً، بالثلاث لغات التي يقرأها زبائنك فعلاً.',
        },
      ],
      afterLaunch:
        'بعد الإطلاق: مراقبة، نسخ احتياطي، إصلاحات، تعديلات صغيرة — وشخص يردّ حين يتوقف شيء.',
      afterLaunchLink: 'الدعم',
    },

    work: {
      eyebrow: 'أعمال مختارة',
      heading: 'أنظمة تعمل الآن',
      lede: 'كل واحد من هذه الأنظمة يعمل في الإنتاج، باللغة التي يقرأها زبائنه فعلاً. اضغط وتحقّق بنفسك.',
      cta: 'شاهد كل الأعمال',
      visit: 'زيارة الموقع المباشر',
    },

    industries: {
      eyebrow: 'لمن نبني',
      heading: 'نتعلّم العمل قبل أن نكتب البرمجية',
      lede: 'وكيل عقارات يلاحق معاينة وتاجر جملة يسعّر شحنة بضاعة لا يجمعهما شيء — سوى أن كليهما يخسر مالاً بسبب العمل الإداري.',
      items: [
        'عقارات',
        'مناسبات وأعراس',
        'متاجر وتجزئة',
        'مطاعم وأغذية',
        'جملة و B2B',
        'سياحة وحجوزات',
        'صحة وعافية',
        'خدمات مهنية',
      ],
    },

    languages: {
      heading: 'العربية · العبرية · الإنجليزية',
      body: 'مصمّمة لتجربة أصيلة من اليمين لليسار ومن اليسار لليمين — تخطيط صحيح، اتصال حروف سليم، ونص ثنائي الاتجاه. صُمّمت بثلاث لغات، لا تُرجمت إليها.',
    },

    cta: {
      heading: 'قل لنا ما الذي لا يعمل',
      lede: 'عملاء يبردون لأن أحداً لم يتابعهم. قائمة أسعار تعيش في رأس شخص واحد. حجوزات تُؤخذ بالهاتف، مرّتين. ابدأ من هناك — التقنية مشكلتنا نحن، لا مشكلتك.',
      primary: 'ابدأ مشروعاً',
      secondary: 'شاهد أعمالنا',
    },
  },

  he: {
    meta: {
      title: 'FikraNova — פתרונות AI ותוכנה לעסקים',
      description:
        'סטודיו לפתרונות AI ותוכנה: אתרים ופלטפורמות, סוכני AI, עוזרים שעונים מתוך המסמכים שלכם, אוטומציה, מערכות שיווק ותוכן חזותי — בערבית, עברית ואנגלית.',
    },

    hero: {
      eyebrow: 'סטודיו תוכנה · נצרת',
      headingLead: 'פתרונות AI ותוכנה,',
      headingAccent: 'שמוכרים, מאוטמטים ומפעילים.',
      lede: 'אנחנו מתכננים ובונים את התוכנה שהעסק באמת רץ עליה — אתרים ופלטפורמות, סוכני AI, עוזרים שעונים מתוך המסמכים שלכם, אוטומציות שרודפות אחרי העבודה, מערכות שיווק והתוכן החזותי שמזין אותן. בערבית, עברית ואנגלית.',
      primary: 'התחילו פרויקט',
      secondary: 'ראו את העבודות',
      capabilities: [
        'אתרים רב-לשוניים',
        'סוכני AI',
        'עוזרי RAG',
        'אוטומציה',
        'מערכות שיווק',
        'תוכן חזותי',
        'חנויות אונליין',
        'מערכות הזמנות',
        'פורטלי B2B',
        'דשבורדים',
        'תשלומים',
        'תוכנה בהתאמה אישית',
      ],
    },

    services: {
      eyebrow: 'מה אנחנו עושים',
      heading: 'לא פיצ׳רים. תוצאות.',
      lede: 'כל פרויקט מתחיל ממשהו שעולה לכם כסף או זמן, ונגמר במערכת שרצה בלי שתשגיחו עליה.',
      items: [
        {
          title: 'אתרים ופלטפורמות',
          body: 'אתרים ואפליקציות רב-לשוניים שעושים עבודה אמיתית: מקבלים הזמנות, מנהלים מלאי, מחזיקים חשבונות לקוחות, מעבדים תשלומים — עם הדשבורד שאומר מה באמת קרה היום. בנויים כדי שהצוות שלכם יפעיל אותם, לא אנחנו.',
        },
        {
          title: 'סוכני AI',
          body: 'עוזרים המכוונים למשימה אחת מוגדרת: לסנן ליד, לענות ללקוח, לנתח שיחה, לנסח טיוטה. ונמדדים על ביצועה.',
        },
        {
          title: 'עוזרי RAG',
          body: 'תשובות מתוך המסמכים שלכם — חוזים, קטלוגים, נהלים, פניות קודמות — עם המקור מצורף, כדי שהצוות והלקוחות יוכלו לבדוק.',
        },
        {
          title: 'אוטומציה ואינטגרציות',
          body: 'המעקבים, האישורים וההעברות שנשכחים כשעסוקים — והצנרת בין האתר, היומן, ה-CRM ורואה החשבון. כאן רוב הפרויקטים נשברים בשקט, וכאן רוב העבודה.',
        },
        {
          title: 'מערכות שיווק',
          body: 'דפי נחיתה, לכידת לידים, קמפיינים והמעקב שהופך אותם לשיחות. בנויות כדי להימדד, לא כדי להתפעל מהן.',
        },
        {
          title: 'תוכן חזותי',
          body: 'צילומי מוצר, מודעות, סושיאל ווידאו — מיוצרים ומבויימים, בשלוש השפות שהלקוחות שלכם באמת קוראים.',
        },
      ],
      afterLaunch:
        'אחרי העלייה לאוויר: ניטור, גיבויים, תיקונים, שינויים קטנים — ומישהו שעונה כשמשהו נעצר.',
      afterLaunchLink: 'תמיכה',
    },

    work: {
      eyebrow: 'עבודות נבחרות',
      heading: 'מערכות שרצות עכשיו',
      lede: 'כל אחת מהן רצה בפרודקשן, בשפה שהלקוחות שלה באמת קוראים. לחצו ותבדקו.',
      cta: 'לכל העבודות',
      visit: 'לאתר החי',
    },

    industries: {
      eyebrow: 'למי אנחנו בונים',
      heading: 'לומדים את העסק לפני שכותבים את הקוד',
      lede: 'למתווך שרודף אחרי סיור ולסיטונאי שמתמחר משטח סחורה אין שום דבר משותף — חוץ מזה ששניהם מפסידים כסף על בירוקרטיה.',
      items: [
        'נדל״ן',
        'אירועים וחתונות',
        'מסחר וקמעונאות',
        'מסעדות ומזון',
        'סיטונאות ו-B2B',
        'תיירות והזמנות',
        'בריאות ורווחה',
        'שירותים מקצועיים',
      ],
    },

    languages: {
      heading: 'ערבית · עברית · אנגלית',
      body: 'מתוכנן לחוויית RTL ו-LTR אמיתית — פריסה נכונה, חיבור אותיות תקין, טקסט דו-כיווני. תוכנן בשלוש שפות, לא תורגם אליהן.',
    },

    cta: {
      heading: 'ספרו לנו מה נשבר',
      lede: 'לידים שמתקררים כי אף אחד לא חזר אליהם. מחירון שחי בראש של אדם אחד. הזמנות שנרשמות בטלפון, פעמיים. תתחילו משם — הטכנולוגיה היא הבעיה שלנו, לא שלכם.',
      primary: 'התחילו פרויקט',
      secondary: 'ראו את העבודות',
    },
  },
};

/**
 * @param {string} lang
 * @returns {object}
 */
export function getHomeContent(lang) {
  return HOME[lang] || HOME.ar;
}
