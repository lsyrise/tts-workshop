import { Eye, EyeOff, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/Button/Button';
import { useApiKey } from '../hooks/useApiKey';
import { useState } from 'react';
import styles from './ApiKeyCard.module.css';

export function ApiKeyCard() {
  const { apiKey, save, clear } = useApiKey();
  const [input, setInput] = useState(apiKey);
  const [show, setShow] = useState(false);

  return (
    <div className={styles.wrap}>
      <div className={styles.statusRow}>
        <span
          className={styles.dot}
          data-on={apiKey.length > 0 ? 'true' : 'false'}
        />
        <span className={styles.statusText}>
          {apiKey ? '已配置' : '尚未设置 API Key'}
        </span>
        {apiKey && (
          <code className={styles.preview}>
            {show ? apiKey : `${apiKey.slice(0, 6)}…${apiKey.slice(-4)}`}
          </code>
        )}
      </div>

      <div className={styles.inputRow}>
        <input
          className={styles.input}
          type={show ? 'text' : 'password'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入 MiniMax API Key"
          autoComplete="off"
        />
        <button
          className={styles.toggle}
          onClick={() => setShow(!show)}
          title={show ? '隐藏' : '显示'}
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>

      <div className={styles.actions}>
        <Button size="sm" variant="primary" onClick={() => save(input)}>
          <Save size={12} /> 保存
        </Button>
        <Button size="sm" variant="outlined" onClick={clear}>
          <Trash2 size={12} /> 清除
        </Button>
      </div>
    </div>
  );
}
