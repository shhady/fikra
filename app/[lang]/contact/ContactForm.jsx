'use client';

import { useState } from 'react';
import { validateContactValues } from '@/lib/contactFields.mjs';

/**
 * The contact form.
 *
 * The service dropdown now offers all SIX services. It previously offered four —
 * AI agents and AI automation were missing, which are the two the studio most
 * wants to sell. Someone who came here specifically to ask about an AI agent had
 * no way to say so.
 *
 * @param {{ t: object, services: string[] }} props
 */
export default function ContactForm({ t, services }) {
  const [values, setValues] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [state, setState] = useState('idle'); // idle | sending | sent | failed

  function set(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validate() {
    const next = {};

    // The field list lives in lib/contactFields.mjs, shared with the server
    // mailer. Duplicating it here is what caused `service` to be required by
    // the backend but never asked for by the form.
    //
    // Note `form.errors[field]`, not `form[field]`: the latter is the field's
    // LABEL, so an invalid email would surface an error reading "Email Address",
    // which tells the visitor nothing.
    for (const field of validateContactValues(values)) {
      next[field] = t.contact.form.errors[field];
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    setState('sending');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error('failed');

      setState('sent');
      setValues({ name: '', email: '', phone: '', service: '', message: '' });
    } catch {
      setState('failed');
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="card p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="name" label={t.contact.form.name} error={errors.name}>
          <input
            id="name"
            value={values.name}
            onChange={(e) => set('name', e.target.value)}
            className={input(errors.name)}
            autoComplete="name"
          />
        </Field>

        <Field id="email" label={t.contact.form.email} error={errors.email}>
          <input
            id="email"
            type="email"
            dir="ltr"
            value={values.email}
            onChange={(e) => set('email', e.target.value)}
            className={input(errors.email)}
            autoComplete="email"
          />
        </Field>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Field id="phone" label={t.contact.form.phone}>
          <input
            id="phone"
            type="tel"
            dir="ltr"
            value={values.phone}
            onChange={(e) => set('phone', e.target.value)}
            className={input()}
            autoComplete="tel"
          />
        </Field>

        <Field id="service" label={t.contact.form.service} error={errors.service}>
          <select
            id="service"
            value={values.service}
            onChange={(e) => set('service', e.target.value)}
            className={input(errors.service)}
          >
            <option value="" className="bg-surface">
              {t.contact.form.selectService}
            </option>
            {services.map((service) => (
              <option key={service} value={service} className="bg-surface">
                {service}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-5">
        <Field id="message" label={t.contact.form.message} error={errors.message}>
          <textarea
            id="message"
            rows={6}
            value={values.message}
            onChange={(e) => set('message', e.target.value)}
            placeholder={t.contact.form.messagePlaceholder}
            className={`${input(errors.message)} resize-y`}
          />
        </Field>
      </div>

      {state === 'sent' ? (
        <p
          role="status"
          className="mt-5 rounded-lg border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-gold-soft"
        >
          {t.contact.form.success}
        </p>
      ) : null}

      {state === 'failed' ? (
        <p
          role="alert"
          className="mt-5 rounded-lg border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-300"
        >
          {t.contact.form.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={state === 'sending'}
        className="mt-7 w-full rounded-full bg-chalk px-8 py-3.5 font-medium text-ink transition-colors hover:bg-white disabled:opacity-60 sm:w-auto"
      >
        {state === 'sending' ? t.contact.form.submitting : t.contact.form.submit}
      </button>
    </form>
  );
}

function Field({ id, label, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm text-steel">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-2 text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function input(error) {
  return `w-full rounded-lg border bg-ink px-4 py-3 text-[15px] text-chalk placeholder:text-slate focus:outline-none focus:ring-2 focus:ring-gold/40 ${
    error ? 'border-red-800' : 'border-hairline focus:border-gold/50'
  }`;
}
