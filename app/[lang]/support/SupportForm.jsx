'use client';

import { useState } from 'react';

/**
 * The support ticket form.
 *
 * Rules the old one broke:
 *
 *  - Errors are specific and actionable. "This field is required" tells someone
 *    nothing they cannot see; "We need a name to reply to" tells them why.
 *  - Errors appear on the field, after a failed submit — not as a wall of red
 *    before anyone has typed anything.
 *  - The button says what happens ("Send ticket"), and the success message uses
 *    the same word back ("Ticket received").
 *  - An empty/finished state is an invitation to act, not a dead end.
 *
 * @param {{ c: object, lang: string }} props
 */
export default function SupportForm({ c }) {
  const [values, setValues] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    priority: 'medium',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [state, setState] = useState('idle'); // idle | sending | sent | failed

  function set(field, value) {
    setValues((current) => ({ ...current, [field]: value }));

    // Clear the error the moment they start fixing it. Leaving it up while they
    // type is nagging.
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  }

  function validate() {
    const next = {};

    if (!values.name.trim()) next.name = c.errors.name;

    if (!values.email.trim()) next.email = c.errors.email;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = c.errors.emailInvalid;

    if (!values.subject.trim()) next.subject = c.errors.subject;

    if (!values.message.trim()) next.message = c.errors.message;
    else if (values.message.trim().length < 15) next.message = c.errors.messageShort;

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validate()) return;

    setState('sending');

    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          // The Support model has no priority column, so rather than send a field
          // the API would silently drop, it goes where a human will actually read
          // it: the subject line.
          subject: `[${values.priority.toUpperCase()}] ${values.subject.trim()}`,
          message: values.message.trim(),
        }),
      });

      if (!response.ok) throw new Error('Request failed');

      setState('sent');
    } catch {
      setState('failed');
    }
  }

  if (state === 'sent') {
    return (
      <div className="card p-8 text-center sm:p-12">
        <p className="text-xl font-semibold text-chalk">{c.success.title}</p>

        <p className="mx-auto mt-4 max-w-prose text-[16px] leading-relaxed text-steel">
          {c.success.body}
        </p>

        <button
          type="button"
          onClick={() => {
            setValues({ name: '', email: '', phone: '', subject: '', priority: 'medium', message: '' });
            setState('idle');
          }}
          className="mt-8 rounded-full border border-hairline px-5 py-2.5 text-sm text-chalk transition-colors hover:border-gold/50"
        >
          {c.success.again}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="card p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={c.form.name} error={errors.name} id="name">
          <input
            id="name"
            value={values.name}
            onChange={(e) => set('name', e.target.value)}
            className={input(errors.name)}
            autoComplete="name"
          />
        </Field>

        <Field label={c.form.email} error={errors.email} id="email">
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
        <Field label={c.form.subject} error={errors.subject} id="subject">
          <input
            id="subject"
            value={values.subject}
            onChange={(e) => set('subject', e.target.value)}
            className={input(errors.subject)}
          />
        </Field>

        <Field label={c.form.priority} id="priority">
          <select
            id="priority"
            value={values.priority}
            onChange={(e) => set('priority', e.target.value)}
            className={input()}
          >
            {Object.entries(c.priorities).map(([key, label]) => (
              <option key={key} value={key} className="bg-surface">
                {label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-5">
        <Field label={c.form.message} error={errors.message} id="message">
          <textarea
            id="message"
            rows={6}
            value={values.message}
            onChange={(e) => set('message', e.target.value)}
            placeholder={c.form.messagePlaceholder}
            className={`${input(errors.message)} resize-y`}
          />
        </Field>
      </div>

      {state === 'failed' ? (
        <p role="alert" className="mt-5 rounded border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          {c.failure}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={state === 'sending'}
        className="mt-7 w-full rounded-full bg-chalk px-6 py-3.5 font-medium text-ink transition-colors hover:bg-white disabled:opacity-60 sm:w-auto sm:px-8"
      >
        {state === 'sending' ? c.form.submitting : c.form.submit}
      </button>
    </form>
  );
}

function Field({ label, error, id, children }) {
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
