import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/context';
import type { Project } from '../types';
import { Magnetic } from './motion/Magnetic';

interface ProjectChapterProps {
  project: Project;
  index: number;
  total: number;
}

/**
 * A large, alternating panel that previews a project on the home page.
 * Animations come from the page's `usePageAnimations` attributes.
 */
export function ProjectChapter({ project, index, total }: ProjectChapterProps) {
  const { t, l, lang } = useI18n();
  const [active, setActive] = useState(0);

  const href = `/projetos/${project.slug}`;
  const pad = (value: number) => String(value).padStart(2, '0');
  const number = new Intl.NumberFormat(lang === 'pt' ? 'pt-BR' : 'en');
  const tags = [
    t(`category.${project.category}`),
    project.area ? `${number.format(project.area)} m²` : null,
    project.model ? t('home.has3d') : null,
    project.details.length ? `${project.details.length} ${t('home.sheets')}` : null,
  ].filter((tag): tag is string => Boolean(tag));

  return (
    <li className="chapter">
      <div className="chapter__media">
        <Link
          to={href}
          className="chapter__stage"
          aria-label={l(project.title)}
          data-reveal="image"
          data-cursor={t('cursor.view')}
        >
          {project.model && <span className="chapter__badge">{t('home.has3d')}</span>}
          <span className="chapter__parallax" data-parallax>
            <span className="chapter__zoom" data-media>
              {project.renders.map((render, i) => (
                <img
                  key={render.src}
                  src={render.src}
                  alt={i === active ? l(render.caption) : ''}
                  data-active={i === active ? '' : undefined}
                  loading={index === 0 && i === 0 ? 'eager' : 'lazy'}
                />
              ))}
            </span>
          </span>
        </Link>
        <ul className="chapter__thumbs" data-reveal="stagger">
          {project.renders.map((render, i) => (
            <li key={render.src}>
              <button
                type="button"
                aria-pressed={i === active}
                aria-label={l(render.caption)}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
              >
                <img src={render.src} alt="" loading="lazy" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="chapter__text">
        <p className="chapter__number">
          <strong data-split="chars">{pad(index + 1)}</strong>
          <span data-reveal="fade">/ {pad(total)}</span>
          <span className="chapter__number-line" data-reveal="rule" aria-hidden="true" />
        </p>
        <h3 className="chapter__title display">
          <Link to={href} data-split="chars">
            {l(project.title)}
          </Link>
        </h3>
        <p className="chapter__summary" data-split="lines" data-delay="0.15">
          {l(project.summary)}
        </p>
        <ul className="chapter__tags" data-reveal="stagger" data-delay="0.25">
          {tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
        <Magnetic>
          <Link to={href} className="chapter__link" data-reveal="fade" data-delay="0.35">
            {t('home.view')}
          </Link>
        </Magnetic>
      </div>
    </li>
  );
}
