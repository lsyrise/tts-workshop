import clsx from 'clsx';
import styles from './VoiceTag.module.css';

const COLORS = [
  styles.c1,
  styles.c2,
  styles.c3,
  styles.c4,
  styles.c5,
] as const;

type VoiceTagProps = {
  /** A/B/C/D/E 标签 */
  letter: string;
  className?: string;
};

export function VoiceTag({ letter, className }: VoiceTagProps) {
  const idx = (letter.charCodeAt(0) - 'A'.charCodeAt(0)) % COLORS.length;
  const colorClass = COLORS[idx] ?? COLORS[0]!;
  return <span className={clsx(styles.tag, colorClass, className)}>{letter}</span>;
}
