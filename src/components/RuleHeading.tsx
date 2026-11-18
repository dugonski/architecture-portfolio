import type { ReactNode } from 'react';

interface RuleHeadingProps {
  children: ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'p';
  small?: boolean;
  id?: string;
  /** Animate on page entry instead of on scroll. */
  hero?: boolean;
}

/**
 * Uppercase title followed by a thin rule, as used on every page of the PDF
 * portfolio. The text rises from a mask and the rule draws itself.
 */
export function RuleHeading({ children, as: Tag = 'h2', small, id, hero }: RuleHeadingProps) {
  const entry = hero ? { 'data-hero': '' } : {};
  return (
    <Tag id={id} className={small ? 'rule-heading rule-heading--small' : 'rule-heading'}>
      <span className="rule-heading__text" data-split="lines" {...entry}>
        {children}
      </span>
      <span className="rule-heading__line" data-reveal="rule" aria-hidden="true" {...entry} />
    </Tag>
  );
}
