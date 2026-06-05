import { useCallback } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useToastStore } from '@/store/useToastStore';

export function useApiKey() {
  const apiKey = useSettingsStore((s) => s.apiKey);
  const setApiKey = useSettingsStore((s) => s.setApiKey);
  const push = useToastStore((s) => s.push);

  const save = useCallback(
    (key: string) => {
      const trimmed = key.trim();
      if (!trimmed) {
        push('API Key 不能为空', 'warning');
        return;
      }
      setApiKey(trimmed);
      push('API Key 已保存', 'success');
    },
    [setApiKey, push],
  );

  const clear = useCallback(() => {
    setApiKey('');
    push('API Key 已清除', 'success');
  }, [setApiKey, push]);

  return { apiKey, save, clear };
}
