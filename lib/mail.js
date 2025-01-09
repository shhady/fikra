import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

export async function sendNotificationEmail(data) {
  const { name, email, subject, message, phone, service, type = 'Contact' } = data;

  // Format the date in Arabic locale
  const submissionDate = new Date().toLocaleString('ar-SA', {
    timeZone: 'Asia/Jerusalem'
  });

  let emailTemplate;
  
  if (type === 'Contact') {
    emailTemplate = `
      <h2>طلب تواصل جديد</h2>
      <p><strong>الاسم:</strong> ${name}</p>
      <p><strong>البريد الإلكتروني:</strong> ${email}</p>
      <p><strong>رقم الهاتف:</strong> ${phone || 'غير متوفر'}</p>
      <p><strong>نوع الخدمة:</strong> ${service || 'غير محدد'}</p>
      <p><strong>الرسالة:</strong></p>
      <p>${message}</p>
      <p><strong>تاريخ الإرسال:</strong> ${submissionDate}</p>
    `;
  } else {
    emailTemplate = `
      <h2>طلب دعم فني جديد</h2>
      <p><strong>الاسم:</strong> ${name}</p>
      <p><strong>البريد الإلكتروني:</strong> ${email}</p>
      <p><strong>رقم الهاتف:</strong> ${phone || 'غير متوفر'}</p>
      <p><strong>الموضوع:</strong> ${subject || 'غير متوفر'}</p>
      <p><strong>الرسالة:</strong></p>
      <p>${message}</p>
      <p><strong>تاريخ الإرسال:</strong> ${submissionDate}</p>
    `;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.MY_EMAIL,
    subject: type === 'Contact' ? `طلب تواصل جديد من ${name}` : `طلب دعم فني جديد من ${name}`,
    html: emailTemplate
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Notification email sent successfully');
  } catch (error) {
    console.error('Error sending notification email:', error);
    throw error;
  }
} 