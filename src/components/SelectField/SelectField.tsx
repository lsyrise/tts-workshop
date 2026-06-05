import clsx from 'clsx';
import type { SelectHTMLAttributes, ReactNode } from 'react';
import styles from './SelectField.module.css';

type SelectFieldProps = {
  label?: ReactNode;
  options: { value: string; label: string }[];
  className?: string;
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'>;

export function SelectField({ label, options, className, id, ...rest }: SelectFieldProps) {
  return (
    <div className={styles.field}>
      {label && (
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
      )}
      <select id={id} className={clsx(styles.select, className)} {...rest}>
        {options.map((o, i) => (
          <option key={`${i}-${o.value}`} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
