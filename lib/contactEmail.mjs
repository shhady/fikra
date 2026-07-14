import nodemailer from 'nodemailer';
import { REQUIRED_CONTACT_FIELDS as REQUIRED_FIELDS } from './contactFields.mjs';

export const DEFAULT_CONTACT_EMAIL_RECIPIENT = 'shhadyse@gmail.com';

export class ContactValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ContactValidationError';
  }
}

const normalizeText = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
};

const sanitizeHeader = (value) => normalizeText(value).replace(/[\r\n]+/g, ' ');

const escapeHtml = (value) =>
  normalizeText(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export function getContactEmailRecipient() {
  return normalizeText(process.env.MY_EMAIL) || DEFAULT_CONTACT_EMAIL_RECIPIENT;
}

export function normalizeContactData(data = {}) {
  return {
    name: normalizeText(data.name),
    email: normalizeText(data.email),
    phone: normalizeText(data.phone),
    service: normalizeText(data.service),
    message: normalizeText(data.message),
  };
}

export function validateContactData(data) {
  const contactData = normalizeContactData(data);
  const missingFields = REQUIRED_FIELDS.filter((field) => !contactData[field]);

  if (missingFields.length > 0) {
    throw new ContactValidationError(
      `Missing required contact fields: ${missingFields.join(', ')}`
    );
  }

  return contactData;
}

export function buildContactMailOptions(data) {
  const contactData = normalizeContactData(data);
  const phone = contactData.phone || 'Not provided';
  const subjectName = sanitizeHeader(contactData.name) || 'visitor';

  return {
    from: {
      name: 'Fikra Contact Form',
      address: process.env.EMAIL_USER,
    },
    to: getContactEmailRecipient(),
    replyTo: {
      name: sanitizeHeader(contactData.name),
      address: contactData.email,
    },
    subject: `New contact message from ${subjectName}`,
    text: [
      'New contact form message',
      '',
      `Name: ${contactData.name}`,
      `Email: ${contactData.email}`,
      `Phone: ${phone}`,
      `Service: ${contactData.service}`,
      '',
      'Message:',
      contactData.message,
    ].join('\n'),
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #2563eb;">New contact form message</h2>
        <p><strong>Name:</strong> ${escapeHtml(contactData.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(contactData.email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
        <p><strong>Service:</strong> ${escapeHtml(contactData.service)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(contactData.message).replace(/\n/g, '<br />')}</p>
      </div>
    `,
  };
}

const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    throw new Error('Email configuration is missing');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });
};

export async function sendContactEmail(data) {
  const contactData = validateContactData(data);
  const transporter = createTransporter();

  await transporter.sendMail(buildContactMailOptions(contactData));
}
