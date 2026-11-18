import { lazy, Suspense, useMemo, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Figure } from '../components/Figure';
import { useLightbox, type LightboxImage } from '../components/useLightbox';
import { RuleHeading } from '../components/RuleHeading';
import { ViewerBoundary } from '../components/viewer/ViewerBoundary';
import { projects } from '../data/projects';
import { useI18n } from '../i18n/context';
import { usePageAnimations } from '../lib/usePageAnimations';
import type { Project } from '../types';
import NotFoundPage from './NotFoundPage';

const ModelViewer = lazy(() => import('../components/viewer/ModelViewer'));

export default function ProjectPage() {
  const { slug } = useParams();
  const index = projects.findIndex((project) => project.slug === slug);
  if (index < 0) return <NotFoundPage />;
  // Keyed so that lightbox state resets when moving between projects.
  return <ProjectContent key={slug} project={projects[index]} index={index} />;
}

function ProjectContent({ project, index }: { project: Project; index: number }) {
  const { t, l, lang } = useI18n();
  const number = new Intl.NumberFormat(lang === 'pt' ? 'pt-BR' : 'en');
  const page = useRef<HTMLElement>(null);
  usePageAnimations(page);

  // One lightbox for every image on the page, in reading order.
  const sheetImages = useMemo<LightboxImage[]>(
    () =>
      project.details.map((sheet) => ({
        src: sheet.src,
        caption: {
          pt: `${sheet.code} · ${sheet.title.pt} — ${sheet.room.pt}`,
          en: `${sheet.code} · ${sheet.title.en} — ${sheet.room.en}`,
        },
      })),
    [project],
  );
  const images = useMemo(
    () => [...project.renders, ...project.plans, ...project.isometric, ...sheetImages],
    [project, sheetImages],
  );
  const lightbox = useLightbox(images);
  const offset = {
    renders: 0,
    plans: project.renders.length,
    isometric: project.renders.length + project.plans.length,
    details: project.renders.length + project.plans.length + project.isometric.length,
  };

  const [mainPlan, ...sidePlans] = project.plans;
  const previous = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];

  return (
    <article ref={page} className="container">
      <header className="project-cover">
        <div className="project-cover__header">
          <RuleHeading as="p" hero>
            {t('project.label')} {String(index + 1).padStart(2, '0')}
          </RuleHeading>
          <Link to="/#sumario" className="back-link" data-reveal="fade" data-hero data-delay="0.3">
            ← {t('project.back')}
          </Link>
        </div>

        <div>
          <h1 className="project-cover__title display" data-split="chars" data-hero data-delay="0.1">
            {l(project.title)}
          </h1>
          <p className="project-cover__text" data-split="lines" data-hero data-delay="0.45">
            {l(project.description)}
          </p>
          <p className="project-meta" data-reveal="fade" data-hero data-delay="0.7">
            {[
              t(`category.${project.category}`),
              project.area ? `${number.format(project.area)} m²` : null,
              project.year ?? null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>

        <div className="project-cover__media" data-reveal="image" data-hero data-delay="0.2">
          <span className="project-cover__parallax" data-parallax>
            <img className="project-cover__image" src={project.cover} alt={l(project.renders[0].caption)} data-media />
          </span>
        </div>

        <ul className="project-tools" data-reveal="stagger">
          {project.tools.map((tool) => (
            <li key={tool.name + tool.use.pt}>
              <strong>{tool.name}</strong>
              <span>{l(tool.use)}</span>
            </li>
          ))}
        </ul>
      </header>

      {project.model && (
        <section className="project-section" aria-labelledby="modelo">
          <RuleHeading id="modelo">{t('project.model')}</RuleHeading>
          <p className="section-lead" data-split="lines">
            {t('project.modelLead')}
          </p>
          <div data-reveal="fade">
            <ViewerBoundary fallback={<p className="viewer viewer--error">{t('viewer.error')}</p>}>
              <Suspense fallback={<div className="viewer" />}>
                <ModelViewer model={project.model} projectArea={project.area} projectTitle={l(project.title)} />
              </Suspense>
            </ViewerBoundary>
          </div>
        </section>
      )}

      <section className="project-section">
        <RuleHeading>{t('project.renders')}</RuleHeading>
        <div className="renders">
          {project.renders.map((image, i) => (
            <Figure key={image.src} image={image} caption={false} onOpen={() => lightbox.open(offset.renders + i)} />
          ))}
        </div>
      </section>

      {mainPlan && (
        <section className="project-section">
          <RuleHeading>{t('project.plans')}</RuleHeading>
          {project.planLayout === 'stacked' ? (
            <div className="plans--stacked">
              <div className="plans plans__head">
                <div className="plans__main">
                  <Figure image={mainPlan} onOpen={() => lightbox.open(offset.plans)} />
                </div>
                {sidePlans[0] && <Figure image={sidePlans[0]} onOpen={() => lightbox.open(offset.plans + 1)} />}
              </div>
              <div className="plans__rest">
                {sidePlans.slice(1).map((image, i) => (
                  <div key={image.src} className={image.wide ? 'plans__wide' : undefined}>
                    <Figure image={image} onOpen={() => lightbox.open(offset.plans + i + 2)} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="plans">
              <div className="plans__main">
                <Figure image={mainPlan} onOpen={() => lightbox.open(offset.plans)} />
              </div>
              <div className="plans__side">
                {sidePlans.map((image, i) => (
                  <Figure key={image.src} image={image} onOpen={() => lightbox.open(offset.plans + i + 1)} />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {project.isometric.length > 0 && (
        <section className="project-section">
          <RuleHeading>{t('project.isometric')}</RuleHeading>
          <div className="isometric">
            {project.isometric.map((image, i) => (
              <Figure
                key={image.src}
                image={image}
                caption={false}
                onOpen={() => lightbox.open(offset.isometric + i)}
              />
            ))}
          </div>
        </section>
      )}

      {project.details.length > 0 && (
        <section className="project-section">
          <RuleHeading>{t('project.details')}</RuleHeading>
          <div className="sheets" data-reveal="stagger">
            {project.details.map((sheet, i) => (
              <Figure key={sheet.src} image={sheetImages[i]} onOpen={() => lightbox.open(offset.details + i)}>
                <span className="sheet-label">
                  <span>
                    {sheet.code} · {l(sheet.title)}
                  </span>
                  <span>{l(sheet.room)}</span>
                </span>
              </Figure>
            ))}
          </div>
        </section>
      )}

      {project.materials.length > 0 && (
        <section className="project-section">
          <RuleHeading>{t('project.materials')}</RuleHeading>
          <table className="materials">
            <thead>
              <tr>
                <th scope="col">{t('project.material')}</th>
                <th scope="col">{t('project.materialName')}</th>
                <th scope="col">{t('project.application')}</th>
              </tr>
            </thead>
            <tbody data-reveal="stagger">
              {project.materials.map((material) => (
                <tr key={material.swatch}>
                  <td>
                    <img src={material.swatch} alt="" loading="lazy" />
                  </td>
                  <td>{l(material.name)}</td>
                  <td>{l(material.application)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {projects.length > 1 && (
        <nav className="project-pager" aria-label={t('nav.projects')}>
          <Link to={`/projetos/${next.slug}`} className="project-pager__next" data-cursor={t('cursor.view')}>
            <small data-reveal="fade">{t('project.next')} →</small>
            <span className="project-pager__title display" data-split="chars">
              {l(next.title)}
            </span>
            <span className="project-pager__media" data-reveal="image">
              <img src={next.cover} alt="" loading="lazy" data-media />
            </span>
          </Link>
          <Link to={`/projetos/${previous.slug}`} className="project-pager__previous" data-reveal="fade">
            ← {t('project.previous')}: {l(previous.title)}
          </Link>
        </nav>
      )}

      {lightbox.element}
    </article>
  );
}
