import clsx from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './FilterPill.module.css';

type FilterPillProps = {
  active?: boolean;
  children: ReactNode;
  icon?: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function FilterPill({ active, children, icon, className, ...rest }: FilterPillProps) {
  return (
    <button className={clsx(styles.pill, active && styles.active, className)} {...rest}>
      {icon}
      {children}
    </button>
  );
}
