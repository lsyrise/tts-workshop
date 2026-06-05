import clsx from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'ghost-danger';
export type ButtonSize = 'sm' | 'md' | 'xs';

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  block?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  block = false,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={clsx(
        styles.btn,
        styles[`v-${variant}`],
        size === 'sm' && styles.szSm,
        size === 'xs' && styles.szXs,
        block && styles.block,
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
