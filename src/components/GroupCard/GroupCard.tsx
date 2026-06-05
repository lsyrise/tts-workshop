import clsx from 'clsx';
import type { ReactNode } from 'react';
import styles from './GroupCard.module.css';

export type CardColor = 'blue' | 'yellow' | 'pink' | 'green' | 'purple' | 'orange';

const ICON_COLORS: Record<CardColor, { bg: string; fg: string; stripe: string }> = {
  blue:   { bg: 'var(--icon-blue-bg)',   fg: 'var(--icon-blue-fg)',   stripe: 'var(--gradient-blue)' },
  yellow: { bg: 'var(--icon-yellow-bg)', fg: 'var(--icon-yellow-fg)', stripe: 'var(--gradient-yellow)' },
  pink:   { bg: 'var(--icon-pink-bg)',   fg: 'var(--icon-pink-fg)',   stripe: 'var(--gradient-pink)' },
  green:  { bg: 'var(--icon-green-bg)',  fg: 'var(--icon-green-fg)',  stripe: 'var(--gradient-green)' },
  purple: { bg: 'var(--icon-purple-bg)', fg: 'var(--icon-purple-fg)', stripe: 'var(--gradient-purple)' },
  orange: { bg: 'var(--icon-orange-bg)', fg: 'var(--icon-orange-fg)', stripe: 'var(--gradient-orange)' },
};

type GroupCardProps = {
  color?: CardColor;
  icon?: ReactNode;
  title: string;
  description?: string;
  /** 右上角小标签/角标 */
  badge?: ReactNode;
  /** 顶部右侧操作按钮区域 */
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function GroupCard({
  color = 'blue',
  icon,
  title,
  description,
  badge,
  actions,
  className,
  children,
}: GroupCardProps) {
  const c = ICON_COLORS[color];
  return (
    <section className={clsx(styles.card, className)}>
      <div className={styles.stripe} style={{ background: c.stripe }} />
      <div className={styles.body}>
        <div className={styles.head}>
          {icon && (
            <div
              className={styles.iconWrap}
              style={{ background: c.bg, color: c.fg }}
            >
              {icon}
            </div>
          )}
          <div className={styles.titleBlock}>
            <h2 className={styles.title}>
              {title}
              {badge && <span className={styles.badge}>{badge}</span>}
            </h2>
            {description && <p className={styles.desc}>{description}</p>}
          </div>
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
        <div className={styles.content}>{children}</div>
      </div>
    </section>
  );
}
