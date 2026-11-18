import { useRef } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { site } from '../data/site';
import { useI18n } from '../i18n/context';
import { usePageAnimations } from '../lib/usePageAnimations';
import { Cursor } from './motion/Cursor';
import { Curtain } from './motion/Curtain';
import { Magnetic } from './motion/Magnetic';
import { SmoothScroll } from './motion/SmoothScroll';

/** Large invitation to get in touch, closing every page but the contact one. */
function FooterCallToAction() {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);
  usePageAnimations(ref);

  return (
    <section ref={ref} className="cta container">
      <p className="cta__eyebrow" data-reveal="fade">
        {t('footer.ctaEyebrow')}
      </p>
      <Link to="/contato" className="cta__link" data-cursor={t('cursor.contact')}>
        <span className="cta__title display" data-split="words">
          {t('footer.cta')}
        </span>
        <Magnetic className="cta__arrow">
          <span aria-hidden="true">→</span>
        </Magnetic>
      </Link>
    </section>
  );
}

export function Layout() {
  const { t, l, lang, setLang } = useI18n();
  const { pathname } = useLocation();
  const header = useRef<HTMLElement>(null);
  const progress = useRef<HTMLDivElement>(null);

  return (
    <>
      {/* Rendered first so the curtain sets the entry delay before pages animate. */}
      <Curtain />
      <Cursor />
      <div ref={progress} className="scroll-progress" aria-hidden="true" />

      <header ref={header} className="site-header">
        <div className="container site-header__inner">
          <Link to="/" className="site-header__brand">
            {site.brand}
          </Link>
          <nav className="site-nav" aria-label={t('nav.projects')}>
            <NavLink to="/" end className="site-nav__projects">
              {t('nav.projects')}
            </NavLink>
            <NavLink to="/sobre">{t('nav.about')}</NavLink>
            <NavLink to="/contato">{t('nav.contact')}</NavLink>
            <button
              type="button"
              className="lang-switch"
              onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')}
              aria-label={t('lang.switchLabel')}
            >
              {lang === 'pt' ? 'EN' : 'PT'}
            </button>
          </nav>
        </div>
      </header>

      <SmoothScroll header={header} progress={progress}>
        {/* Remounted on language change: split text must be rebuilt from fresh DOM. */}
        <main key={lang}>
          <Outlet />
          {pathname !== '/contato' && <FooterCallToAction />}
        </main>

        <footer className="site-footer container">
          <p className="site-footer__rule">{l(site.role)}</p>
          <div className="site-footer__meta">
            <span>
              © {new Date().getFullYear()} {site.name}
            </span>
            <div className="site-footer__links">
              <a href={`mailto:${site.email}`}>{site.email}</a>
              {site.social.map((link) => (
                <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </SmoothScroll>
    </>
  );
}
