import clsx from 'clsx';
import { Loader } from 'lucide-react';
import type { EntryStatus } from '@/types/entry';
import styles from './StatusBadge.module.css';

const LABELS: Record<EntryStatus, string> = {
  pending: '等待中',
  processing: '生成中',
  done: '完成',
  error: '失败',
  skipped: '已跳过',
};

type StatusBadgeProps = {
  status: EntryStatus;
  showIcon?: boolean;
};

export function StatusBadge({ status, showIcon = false }: StatusBadgeProps) {
  return (
    <span className={clsx(styles.badge, styles[status])}>
      {showIcon && status === 'processing' && (
        <Loader size={10} strokeWidth={2} className={styles.spin} />
      )}
      {LABELS[status]}
    </span>
  );
}
