import type { InputHTMLAttributes } from 'react';
import styles from './RangeSlider.module.css';

type RangeSliderProps = {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  minLabel?: string;
  maxLabel?: string;
  formatValue?: (v: number) => string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type'>;

export function RangeSlider({
  label,
  value,
  onChange,
  min,
  max,
  step,
  minLabel,
  maxLabel,
  formatValue,
}: RangeSliderProps) {
  return (
    <div className={styles.field}>
      <div className={styles.head}>
        <label className={styles.label}>{label}</label>
        <span className={styles.val}>{formatValue ? formatValue(value) : value.toFixed(1)}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.bound}>{minLabel ?? min}</span>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={styles.input}
        />
        <span className={styles.bound}>{maxLabel ?? max}</span>
      </div>
    </div>
  );
}
