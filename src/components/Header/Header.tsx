import { Link, NavLink } from 'react-router-dom';
import { Mic, Key, Settings as SettingsIcon, FileText } from 'lucide-react';
import clsx from 'clsx';
import { useSettingsStore } from '@/store/useSettingsStore';
import styles from './Header.module.css';

type HeaderProps = {
  children?: React.ReactNode;
  rightSlot?: React.ReactNode;
};

export function Header({ children, rightSlot }: HeaderProps) {
  const apiKey = useSettingsStore((s) => s.apiKey);
  const hasKey = apiKey.length > 0;

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.brand}>
        <div className={styles.logo}>
          <Mic size={16} strokeWidth={2} />
        </div>
        <h1 className={styles.brandText}>语音合成工坊</h1>
        <span className={styles.tag}>v2</span>
      </Link>

      {children && <div className={styles.center}>{children}</div>}

      <div className={styles.right}>
        {rightSlot ?? (
          <>
            <div
              className={clsx(styles.keyIndicator, hasKey && styles.keySet)}
              title={hasKey ? 'API Key 已配置' : '未设置 API Key'}
            >
              <Key size={11} strokeWidth={1.8} />
              <span>{hasKey ? '已配置' : '未配置'}</span>
            </div>
            <NavLink
              to="/"
              end
              className={({ isActive }) => clsx(styles.navBtn, isActive && styles.navBtnActive)}
            >
              <FileText size={12} strokeWidth={1.8} />
              <span>合成</span>
            </NavLink>
            <NavLink
              to="/voices"
              className={({ isActive }) => clsx(styles.navBtn, isActive && styles.navBtnActive)}
            >
              <SettingsIcon size={12} strokeWidth={1.8} />
              <span>音色</span>
            </NavLink>
          </>
        )}
      </div>
    </header>
  );
}
