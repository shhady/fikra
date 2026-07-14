'use client';

import Link from 'next/link';
import { FaWhatsapp, FaLinkedinIn, FaInstagram } from 'react-icons/fa';

/**
 * Footer.
 *
 * Fixes two things that were quietly costing credibility:
 *
 *  1. It listed FOUR services while the services page listed SIX — AI agents and
 *     AI automation, the two things the company most wants to sell, were missing
 *     from the footer entirely.
 *
 *  2. Its service links pointed at anchors (#web, #ai, #marketing, #data) that
 *     exist on no page. Every one of them was a dead link.
 *
 * @param {{ lang: string, t: object }} props
 */
export default function Footer({ lang, t }) {
  const year = new Date().getFullYear();

  // All six, keyed off the same dictionary the services page reads, so the two
  // can never drift apart again.
  const serviceKeys = ['webDev', 'business', 'marketing', 'content', 'aiAgents', 'aiAutomation'];

  const social = [
    { Icon: FaWhatsapp, href: 'https://wa.me/972543113297', label: t.footer.social.whatsapp },
    {
      Icon: FaLinkedinIn,
      href: 'https://www.linkedin.com/in/shhady-serhan-a11403124',
      label: t.footer.social.linkedin,
    },
    { Icon: FaInstagram, href: 'https://www.instagram.com/fikranova_/', label: t.footer.social.instagram },
  ];

  return (
    <footer className="border-t border-hairline bg-ink">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-mono text-sm font-semibold tracking-[0.08em] text-chalk">FIKRANOVA</p>

            <p className="mt-4 max-w-[32ch] text-sm leading-relaxed text-slate">
              {t.footer.description}
            </p>

            <ul className="mt-6 flex gap-3">
              {social.map(({ Icon, href, label }) => (
                <li key={href}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded border border-hairline text-steel transition-colors hover:border-steel hover:text-chalk"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <FooterColumn title={t.footer.services.title}>
            {serviceKeys.map((key) => (
              <FooterLink key={key} href={`/${lang}/services`}>
                {t.home.services.items[key].title}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title={t.footer.quickLinks.title}>
            <FooterLink href={`/${lang}`}>{t.nav.home}</FooterLink>
            <FooterLink href={`/${lang}/about`}>{t.nav.about}</FooterLink>
            <FooterLink href={`/${lang}/projects`}>{t.nav.projects}</FooterLink>
            <FooterLink href={`/${lang}/blog`}>{t.nav.blog}</FooterLink>
          </FooterColumn>

          <FooterColumn title={t.footer.contact.title}>
            <FooterLink href={`/${lang}/contact`}>{t.footer.contact.contactUs}</FooterLink>
            <FooterLink href={`/${lang}/faq`}>{t.footer.contact.faq}</FooterLink>
            <FooterLink href={`/${lang}/support`}>{t.footer.contact.support}</FooterLink>
            <FooterLink href={`/${lang}/privacy`}>{t.privacy.title}</FooterLink>
            <FooterLink href={`/${lang}/terms`}>{t.terms.title}</FooterLink>
          </FooterColumn>
        </div>

        <div className="perf my-12" />

        <p className="font-mono text-xs text-slate">© {year} FikraNova</p>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }) {
  return (
    <div>
      <p className="eyebrow">{title}</p>
      <ul className="mt-5 space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }) {
  return (
    <li>
      <Link href={href} className="text-sm text-steel transition-colors hover:text-chalk">
        {children}
      </Link>
    </li>
  );
}
