/**
 * The contact-form field contract.
 *
 * This module exists because the client form and the server mailer disagreed:
 * the server required `service`, the client never asked for it, so a visitor
 * could fill every visibly-required field and still get a generic failure.
 *
 * Both sides now import from here. Keep it dependency-free — it is imported
 * into a client component, so it must not reach for nodemailer or any Node API.
 */

export const REQUIRED_CONTACT_FIELDS = ['name', 'email', 'service', 'message'];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * @param {Record<string, string>} values
 * @returns {string[]} names of invalid fields, in REQUIRED_CONTACT_FIELDS order
 */
export function validateContactValues(values) {
  const invalid = [];

  for (const field of REQUIRED_CONTACT_FIELDS) {
    const value = typeof values[field] === 'string' ? values[field].trim() : '';

    if (!value) {
      invalid.push(field);
      continue;
    }

    if (field === 'email' && !EMAIL_PATTERN.test(value)) {
      invalid.push(field);
    }
  }

  return invalid;
}
