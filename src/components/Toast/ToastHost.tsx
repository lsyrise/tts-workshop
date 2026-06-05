import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import { useToastStore } from '@/store/useToastStore';
import styles from './ToastHost.module.css';

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
} as const;

export function ToastHost() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((t) =>
      setTimeout(() => dismiss(t.id), 3000),
    );
    return () => {
      timers.forEach(clearTimeout);
    };
  }, [toasts, dismiss]);

  return (
    <div className={styles.host} aria-live="polite">
      {toasts.map((t) => {
        const Icon = ICONS[t.type];
        return (
          <div key={t.id} className={clsx(styles.toast, styles[`t-${t.type}`])}>
            <Icon size={14} strokeWidth={2} />
            <span>{t.msg}</span>
          </div>
        );
      })}
    </div>
  );
}
