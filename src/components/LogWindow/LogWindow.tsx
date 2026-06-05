import { Terminal } from 'lucide-react';
import clsx from 'clsx';
import { useLogsStore } from '@/store/useLogsStore';
import styles from './LogWindow.module.css';

const TYPE_CLASS = {
  info: styles.info,
  warn: styles.warn,
  error: styles.error,
  success: styles.success,
} as const;

export function LogWindow() {
  const messages = useLogsStore((s) => s.messages);

  return (
    <div className={styles.win}>
      <div className={styles.header}>
        <span className={clsx(styles.dot, styles.dotRed)} />
        <span className={clsx(styles.dot, styles.dotYellow)} />
        <span className={clsx(styles.dot, styles.dotGreen)} />
        <span className={styles.title}>
          <Terminal size={11} strokeWidth={1.8} />
          运行日志
        </span>
        <span className={styles.count}>最新 {messages.length} 条</span>
      </div>
      <div className={styles.body}>
        {messages.length === 0 ? (
          <div className={clsx(styles.line, styles.info)}>等待操作...</div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={styles.line}>
              <span className={styles.time}>{m.time}</span>
              <span className={clsx(styles.msg, TYPE_CLASS[m.type])}>{m.msg}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
