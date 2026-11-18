import { useRef, type FormEvent } from 'react';
import { Magnetic } from '../components/motion/Magnetic';
import { usePageAnimations } from '../lib/usePageAnimations';
import { RuleHeading } from '../components/RuleHeading';
import { site } from '../data/site';
import { useI18n } from '../i18n/context';

export default function ContactPage() {
  const { t, l } = useI18n();
  const page = useRef<HTMLElement>(null);
  usePageAnimations(page);

  // Without a backend, the form opens the visitor's e-mail client pre-filled.
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const subject = `${site.brand} — ${data.get('name')}`;
    const body = `${data.get('message')}\n\n${data.get('name')} <${data.get('email')}>`;
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <section ref={page} className="page container">
      <RuleHeading as="p" hero>
        {t('contact.title')}
      </RuleHeading>
      <h1 className="page__title display" data-split="words" data-hero data-delay="0.1">
        {t('contact.lead')}
      </h1>
      <div className="contact">
        <div className="contact__details" data-reveal="stagger" data-hero data-delay="0.5">
          <a href={`mailto:${site.email}`}>{site.email}</a>
          <a href={`tel:+55${site.phone.replace(/\D/g, '')}`}>{site.phone}</a>
          <span>{l(site.city)}</span>
          {site.social.map((link) => (
            <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
              {link.label}
            </a>
          ))}
        </div>
        <form className="form" onSubmit={handleSubmit} data-reveal="stagger" data-hero data-delay="0.6">
          <label>
            {t('contact.name')}
            <input name="name" required autoComplete="name" />
          </label>
          <label>
            {t('contact.email')}
            <input name="email" type="email" required autoComplete="email" />
          </label>
          <label>
            {t('contact.message')}
            <textarea name="message" required />
          </label>
          <Magnetic>
            <button type="submit" className="button">
              {t('contact.send')}
            </button>
          </Magnetic>
        </form>
      </div>

      <p className="thanks display">
        <span data-split="chars">{t('contact.thanks')}</span>
      </p>
    </section>
  );
}
