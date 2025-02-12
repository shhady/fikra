import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

export async function sendChatHistoryEmail(chatHistory) {
  console.log('Setting up email with following config:', {
    from: process.env.EMAIL_USER,
    to: process.env.MY_EMAIL,
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.MY_EMAIL,
    subject: 'New Chat History from FikraNova',
    html: `
      <h2>Chat Session History</h2>
      <p>Time: ${new Date().toLocaleString()}</p>
      <hr/>
      <pre style="white-space: pre-wrap; font-family: Arial, sans-serif;">
${chatHistory}
      </pre>
    `,
  };

  try {
    console.log('Attempting to send email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
    return info;
  } catch (error) {
    console.error('Error sending chat history email:', error);
    console.error('Email configuration:', {
      user: process.env.EMAIL_USER ? 'Set' : 'Not set',
      pass: process.env.EMAIL_APP_PASSWORD ? 'Set' : 'Not set',
      to: process.env.MY_EMAIL ? 'Set' : 'Not set',
    });
    throw error;
  }
} 