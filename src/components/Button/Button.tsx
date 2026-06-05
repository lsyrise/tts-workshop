import clsx from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'ghost-danger' | 'outlined' | 'outlined-danger';
export type ButtonSize = 'sm' | 'md' | 'xs';

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'vPrimary',
  secondary: 'vSecondary',
  ghost: 'vGhost',
  danger: 'vDanger',
  success: 'vSuccess',
  'ghost-danger': 'vGhostDanger',
  outlined: 'vOutlined',
  'outlined-danger': 'vOutlinedDanger',
};

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
        styles[VARIANT_CLASS[variant]],
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
