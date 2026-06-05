import { Trash2 } from 'lucide-react';
import { Button } from '@/components/Button/Button';
import { useVoicesStore } from '@/store/useVoicesStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import styles from './CustomVoiceList.module.css';

export function CustomVoiceList() {
  const langCode = useSettingsStore((s) => s.language);
  const customVoices = useVoicesStore((s) => s.customVoices);
  const removeCustom = useVoicesStore((s) => s.removeCustomVoice);

  const list = customVoices[langCode] ?? [];

  if (list.length === 0) {
    return (
      <div className={styles.empty}>
        该语言下还没有自定义音色
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {list.map((v) => (
        <div key={v.voice_id} className={styles.item}>
          <div className={styles.info}>
            <span className={styles.name}>{v.voice_name || v.voice_id}</span>
            <code className={styles.id}>{v.voice_id}</code>
          </div>
          <Button
            size="xs"
            variant="outlined-danger"
            onClick={() => removeCustom(langCode, v.voice_id)}
            title="删除"
          >
            <Trash2 size={12} />
          </Button>
        </div>
      ))}
    </div>
  );
}
