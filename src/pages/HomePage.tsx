import { lazy, Suspense, useRef } from 'react';
import { Marquee } from '../components/motion/Marquee';
import { ProjectChapter } from '../components/ProjectChapter';
import { RuleHeading } from '../components/RuleHeading';
import { projects } from '../data/projects';
import { site } from '../data/site';
import { useI18n } from '../i18n/context';
import { usePageAnimations } from '../lib/usePageAnimations';

const HeroFurniture = lazy(() => import('../components/hero/HeroFurniture'));

export default function HomePage() {
  const { t, l } = useI18n();
  const page = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  usePageAnimations(page);

  return (
    <div ref={page}>
      {/* Cover, mirroring the first page of the PDF */}
      <div className="hero" ref={heroRef}>
        <Suspense fallback={null}>
          <HeroFurniture eventSource={heroRef} content={textRef} />
        </Suspense>
        <section className="cover container">
          <div className="cover__top">
            <RuleHeading as="p" hero>
              {t('home.portfolio')}
            </RuleHeading>
            <p className="cover__subtitle" data-split="lines" data-hero data-delay="0.15">
              {t('home.subtitle')}
            </p>
          </div>

          <div className="cover__center">
            <div ref={textRef} className="cover__text" data-speed="0.85">
              <h1 className="cover__name display" data-split="chars" data-hero>
                {site.brand}
              </h1>
              <p className="cover__role" data-split="lines" data-hero data-delay="0.5">
                {l(site.role)}
              </p>
              <p className="cover__intro" data-split="lines" data-hero data-delay="0.65">
                {t('home.intro')}
              </p>
            </div>
          </div>

          <div className="cover__contact" data-reveal="fade" data-hero data-delay="0.8">
            <a href={`mailto:${site.email}`}>{site.email}</a>
            <span className="cover__contact-separator" aria-hidden="true">
              -
            </span>
            <a href={`tel:+55${site.phone.replace(/\D/g, '')}`}>{site.phone}</a>
            <span className="cover__contact-rule" aria-hidden="true" />
            <span>{l(site.city)}</span>
          </div>

          <a href="#sumario" className="scroll-hint" data-reveal="fade" data-hero data-delay="1">
            <span>{t('home.scroll')}</span>
            <span className="scroll-hint__line" aria-hidden="true" />
          </a>
        </section>
      </div>

      <Marquee items={site.skills.map(l)} />

      {/* Projects, one chapter each */}
      <section id="sumario" className="contents container">
        <RuleHeading>{t('home.summary')}</RuleHeading>
        <ol className="chapters">
          {projects.map((project, index) => (
            <ProjectChapter key={project.slug} project={project} index={index} total={projects.length} />
          ))}
        </ol>
      </section>
    </div>
  );
}
