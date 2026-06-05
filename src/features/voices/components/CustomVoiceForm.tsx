import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/Button/Button';
import { useVoicesStore } from '@/store/useVoicesStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useToastStore } from '@/store/useToastStore';
import styles from './CustomVoiceForm.module.css';

export function CustomVoiceForm() {
  const [voiceId, setVoiceId] = useState('');
  const [voiceName, setVoiceName] = useState('');

  const addCustom = useVoicesStore((s) => s.addCustomVoice);
  const langCode = useSettingsStore((s) => s.language);
  const push = useToastStore((s) => s.push);

  const handleSubmit = () => {
    const id = voiceId.trim();
    if (!id) {
      push('请输入音色 ID', 'warning');
      return;
    }
    addCustom(langCode, {
      voice_id: id,
      voice_name: voiceName.trim() || id,
      description: [],
    });
    push(`已添加自定义音色: ${id}`, 'success');
    setVoiceId('');
    setVoiceName('');
  };

  return (
    <div className={styles.form}>
      <div className={styles.row}>
        <input
          className={styles.input}
          value={voiceId}
          onChange={(e) => setVoiceId(e.target.value)}
          placeholder="音色 ID（必填）"
        />
        <input
          className={styles.input}
          value={voiceName}
          onChange={(e) => setVoiceName(e.target.value)}
          placeholder="显示名（选填）"
        />
      </div>
      <Button size="sm" variant="primary" onClick={handleSubmit} block>
        <Plus size={13} /> 添加
      </Button>
    </div>
  );
}
