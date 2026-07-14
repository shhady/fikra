/**
 * Support page copy.
 *
 * The support page was 100% hardcoded ARABIC — the title, every label, every
 * validation message, the button, all of it — with no `useLanguage` call anywhere
 * in the file. An English or Hebrew visitor who clicked "Technical Support" in the
 * footer landed on a page they could not read.
 *
 * And it could not simply be wired to the dictionaries, because `translations/`
 * has no `support` key at all. The copy did not exist in English or Hebrew. It
 * does now.
 */
export const SUPPORT = {
  en: {
    meta: {
      title: 'Technical support',
      description: 'Open a support ticket. Tell us what broke and we will get back to you.',
    },
    eyebrow: 'Support',
    title: 'Something stopped working?',
    lede: 'Tell us what happened and what you were doing when it happened. The more specific you are, the faster this gets fixed.',
    form: {
      name: 'Your name',
      email: 'Email address',
      subject: 'What is this about?',
      priority: 'How urgent is it?',
      message: 'What happened?',
      messagePlaceholder:
        'What were you doing, what did you expect, and what happened instead? Include the time it happened if you can.',
      submit: 'Send ticket',
      submitting: 'Sending…',
    },
    priorities: {
      low: 'Low — a question or a small annoyance',
      medium: 'Medium — something is wrong but we can work around it',
      high: 'High — something is broken',
      urgent: 'Urgent — the business has stopped',
    },
    errors: {
      name: 'We need a name to reply to.',
      email: 'Enter an email address we can reach you on.',
      emailInvalid: 'That does not look like an email address.',
      subject: 'Give the ticket a subject.',
      message: 'Tell us what happened.',
      messageShort: 'A little more detail would help — at least a sentence.',
    },
    success: {
      title: 'Ticket received',
      body: 'We have it. You will get a reply by email. If the business has actually stopped, message us on WhatsApp as well — that reaches a person faster.',
      again: 'Send another',
    },
    failure: 'The ticket did not send. Try again, or message us on WhatsApp.',
  },

  ar: {
    meta: {
      title: 'الدعم الفني',
      description: 'افتح تذكرة دعم. أخبرنا ما الذي توقّف وسنعود إليك.',
    },
    eyebrow: 'الدعم',
    title: 'هل توقّف شيء عن العمل؟',
    lede: 'أخبرنا ماذا حدث وماذا كنت تفعل حين حدث. كلما كنت أدقّ، أصلحناه أسرع.',
    form: {
      name: 'اسمك',
      email: 'البريد الإلكتروني',
      subject: 'ما موضوع الطلب؟',
      priority: 'ما مدى الاستعجال؟',
      message: 'ماذا حدث؟',
      messagePlaceholder:
        'ماذا كنت تفعل، وماذا توقّعت، وماذا حدث بدلاً من ذلك؟ أضف وقت الحدوث إن أمكن.',
      submit: 'إرسال التذكرة',
      submitting: 'جارٍ الإرسال…',
    },
    priorities: {
      low: 'منخفض — سؤال أو إزعاج بسيط',
      medium: 'متوسط — هناك خلل لكن يمكن الالتفاف عليه',
      high: 'مرتفع — هناك شيء معطّل',
      urgent: 'عاجل — العمل متوقّف',
    },
    errors: {
      name: 'نحتاج اسماً لنردّ عليه.',
      email: 'أدخل بريداً إلكترونياً نصل إليك عبره.',
      emailInvalid: 'هذا لا يبدو بريداً إلكترونياً صحيحاً.',
      subject: 'أعطِ التذكرة موضوعاً.',
      message: 'أخبرنا ماذا حدث.',
      messageShort: 'تفصيل إضافي سيساعد — جملة واحدة على الأقل.',
    },
    success: {
      title: 'وصلت التذكرة',
      body: 'استلمناها. سيصلك ردّ بالبريد. وإذا كان العمل متوقّفاً فعلاً، راسلنا على واتساب أيضاً — يصل إلى شخص أسرع.',
      again: 'إرسال تذكرة أخرى',
    },
    failure: 'لم تُرسل التذكرة. أعد المحاولة، أو راسلنا على واتساب.',
  },

  he: {
    meta: {
      title: 'תמיכה טכנית',
      description: 'פתחו קריאת שירות. ספרו לנו מה נשבר ונחזור אליכם.',
    },
    eyebrow: 'תמיכה',
    title: 'משהו הפסיק לעבוד?',
    lede: 'ספרו לנו מה קרה ומה עשיתם כשזה קרה. ככל שתהיו ספציפיים יותר, כך זה יתוקן מהר יותר.',
    form: {
      name: 'השם שלכם',
      email: 'כתובת אימייל',
      subject: 'במה מדובר?',
      priority: 'כמה זה דחוף?',
      message: 'מה קרה?',
      messagePlaceholder:
        'מה עשיתם, למה ציפיתם, ומה קרה במקום? אם אפשר, ציינו גם את השעה.',
      submit: 'שליחת קריאה',
      submitting: 'שולח…',
    },
    priorities: {
      low: 'נמוך — שאלה או מטרד קטן',
      medium: 'בינוני — משהו לא תקין אבל אפשר לעקוף',
      high: 'גבוה — משהו שבור',
      urgent: 'דחוף — העסק עצר',
    },
    errors: {
      name: 'צריך שם כדי לחזור אליכם.',
      email: 'הזינו אימייל שאפשר להשיג אתכם בו.',
      emailInvalid: 'זה לא נראה כמו כתובת אימייל.',
      subject: 'תנו לקריאה נושא.',
      message: 'ספרו לנו מה קרה.',
      messageShort: 'עוד קצת פירוט יעזור — לפחות משפט.',
    },
    success: {
      title: 'הקריאה התקבלה',
      body: 'קיבלנו. תקבלו תשובה במייל. אם העסק באמת עצר, שלחו לנו גם וואטסאפ — זה מגיע לבן אדם מהר יותר.',
      again: 'שליחת קריאה נוספת',
    },
    failure: 'הקריאה לא נשלחה. נסו שוב, או שלחו לנו וואטסאפ.',
  },
};

/**
 * @param {string} lang
 * @returns {object}
 */
export function getSupportContent(lang) {
  return SUPPORT[lang] || SUPPORT.ar;
}
