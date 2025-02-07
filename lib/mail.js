import nodemailer from 'nodemailer';

const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    throw new Error('Email configuration is missing');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    }
  });
};

export async function sendNotificationEmail(data) {
  try {
    const { email, type, name, phone, subject, service, message } = data;

    if (!email || !type) {
      throw new Error('Missing required email data');
    }

    const transporter = createTransporter();

    // Format the date in Arabic locale
    const submissionDate = new Date().toLocaleString('ar-SA', {
      timeZone: 'Asia/Jerusalem'
    });

    let adminTemplate, userTemplate;
    
    if (type === 'Newsletter') {
      // Newsletter templates...
      adminTemplate = `
        <div dir="rtl" style="font-family: Arial, sans-serif;">
          <h2 style="color: #2563eb;">اشتراك جديد في النشرة البريدية</h2>
          <p><strong>البريد الإلكتروني:</strong> ${email}</p>
          <p><strong>تاريخ الاشتراك:</strong> ${submissionDate}</p>
          <hr style="border: 1px solid #e5e7eb;" />
          <p>تم تسجيل اشتراك جديد في النشرة البريدية</p>
        </div>
      `;

      userTemplate = `
        <div dir="rtl" style="font-family: Arial, sans-serif;">
          <h2 style="color: #2563eb;">مرحباً بك في النشرة البريدية لفكرة نوفا</h2>
          <p>شكراً لاشتراكك في نشرتنا البريدية! نحن متحمسون لمشاركة آخر الأخبار والتحديثات معك.</p>
          <hr style="border: 1px solid #e5e7eb;" />
          <p>ستصلك رسائلنا على بريدك الإلكتروني: ${email}</p>
          <p>يمكنك إلغاء الاشتراك في أي وقت من خلال الرابط الموجود في نهاية كل رسالة.</p>
          <br />
          <p style="color: #6b7280;">مع تحيات،</p>
          <p style="color: #6b7280;">فريق فكرة نوفا</p>
        </div>
      `;
    } else if (type === 'Contact') {
      // Contact form templates...
      adminTemplate = `
        <div dir="rtl" style="font-family: Arial, sans-serif;">
          <h2 style="color: #2563eb;">طلب تواصل جديد</h2>
          <p><strong>الاسم:</strong> ${name}</p>
          <p><strong>البريد الإلكتروني:</strong> ${email}</p>
          <p><strong>رقم الهاتف:</strong> ${phone || 'غير متوفر'}</p>
          <p><strong>نوع الخدمة:</strong> ${service || 'غير محدد'}</p>
          <p><strong>الرسالة:</strong></p>
          <p>${message}</p>
          <hr style="border: 1px solid #e5e7eb;" />
          <p><strong>تاريخ الإرسال:</strong> ${submissionDate}</p>
        </div>
      `;

      userTemplate = `
        <div dir="rtl" style="font-family: Arial, sans-serif;">
          <h2 style="color: #2563eb;">شكراً لتواصلك مع فكرة نوفا</h2>
          <p>مرحباً ${name}،</p>
          <p>شكراً لك على التواصل معنا. لقد استلمنا رسالتك وسيقوم فريقنا بالرد عليك في أقرب وقت ممكن.</p>
          <hr style="border: 1px solid #e5e7eb;" />
          <p><strong>تفاصيل رسالتك:</strong></p>
          <p><strong>نوع الخدمة:</strong> ${service || 'غير محدد'}</p>
          <p><strong>الرسالة:</strong></p>
          <p>${message}</p>
          <br />
          <p style="color: #6b7280;">مع تحيات،</p>
          <p style="color: #6b7280;">فريق فكرة نوفا</p>
        </div>
      `;
    } else if (type === 'Support') {
      // Support form templates
      adminTemplate = `
        <div dir="rtl" style="font-family: Arial, sans-serif;">
          <h2 style="color: #2563eb;">طلب دعم فني جديد</h2>
          <p><strong>الاسم:</strong> ${name}</p>
          <p><strong>البريد الإلكتروني:</strong> ${email}</p>
          <p><strong>رقم الهاتف:</strong> ${phone || 'غير متوفر'}</p>
          <p><strong>الموضوع:</strong> ${subject || 'غير متوفر'}</p>
          <p><strong>الرسالة:</strong></p>
          <p>${message}</p>
          <hr style="border: 1px solid #e5e7eb;" />
          <p><strong>تاريخ الإرسال:</strong> ${submissionDate}</p>
        </div>
      `;

      userTemplate = `
        <div dir="rtl" style="font-family: Arial, sans-serif;">
          <h2 style="color: #2563eb;">شكراً لطلب الدعم الفني</h2>
          <p>مرحباً ${name}،</p>
          <p>شكراً لك على التواصل مع فريق الدعم الفني. لقد استلمنا طلبك وسيقوم فريقنا بمراجعته والرد عليك في أقرب وقت ممكن.</p>
          <hr style="border: 1px solid #e5e7eb;" />
          <p><strong>تفاصيل طلبك:</strong></p>
          <p><strong>الموضوع:</strong> ${subject || 'غير متوفر'}</p>
          <p><strong>الرسالة:</strong></p>
          <p>${message}</p>
          <br />
          <p style="color: #6b7280;">مع تحيات،</p>
          <p style="color: #6b7280;">فريق الدعم الفني - فكرة نوفا</p>
        </div>
      `;
    }

    // Send email to admin
    const adminMailOptions = {
      from: {
        name: 'فكرة نوفا',
        address: process.env.EMAIL_USER
      },
      to: process.env.MY_EMAIL,
      subject: type === 'Newsletter' 
        ? `مشترك جديد في النشرة البريدية`
        : type === 'Contact'
        ? `طلب تواصل جديد من ${name}`
        : `طلب دعم فني جديد من ${name}`,
      html: adminTemplate
    };

    // Send confirmation email to user
    const userMailOptions = {
      from: {
        name: 'فكرة نوفا',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: type === 'Newsletter'
        ? 'مرحباً بك في النشرة البريدية لفكرة نوفا'
        : type === 'Contact'
        ? 'شكراً لتواصلك مع فكرة نوفا'
        : 'تأكيد استلام طلب الدعم الفني',
      html: userTemplate
    };

    // Send both emails
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(userMailOptions)
    ]);

    console.log(`Confirmation emails sent successfully for ${type}`);

  } catch (error) {
    console.error('Detailed email sending error:', error);
    console.error('Environment variables status:', {
      hasEmailUser: !!process.env.EMAIL_USER,
      hasAppPassword: !!process.env.EMAIL_APP_PASSWORD,
      hasMyEmail: !!process.env.MY_EMAIL
    });
    throw error;
  }
} 