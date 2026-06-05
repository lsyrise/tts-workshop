import { useCallback } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useVoicesStore } from '@/store/useVoicesStore';
import { useLogsStore } from '@/store/useLogsStore';
import { useToastStore } from '@/store/useToastStore';
import { fetchVoiceList } from '@/lib/api';
import { classifyVoices, mergeClassifiedInto } from '@/lib/classify';
import { BUILTIN_LANG_VOICES } from '@/lib/voices-db';

export function useVoiceRefresh() {
  const apiKey = useSettingsStore((s) => s.apiKey);
  const setLangVoices = useVoicesStore((s) => s.setLangVoices);
  const addLog = useLogsStore((s) => s.add);
  const push = useToastStore((s) => s.push);

  const refresh = useCallback(async () => {
    if (!apiKey) {
      push('请先设置 API Key', 'warning');
      return;
    }
    addLog('正在从 MiniMax 拉取音色列表...', 'info');
    try {
      const list = await fetchVoiceList(apiKey);
      if (list.length === 0) {
        addLog('API 返回空列表', 'warn');
        push('未获取到音色', 'warning');
        return;
      }
      addLog(`拉取到 ${list.length} 个音色`, 'info');
      const classified = classifyVoices(list);
      const merged = mergeClassifiedInto(BUILTIN_LANG_VOICES, classified);
      setLangVoices(merged, 'api');
      // 保存缓存
      try {
        localStorage.setItem('tts_voice_cache', JSON.stringify(merged));
        localStorage.setItem('tts_voice_cache_time', String(Date.now()));
      } catch {
        // ignore
      }
      addLog('音色库已更新', 'success');
      push(`刷新成功：${list.length} 个音色`, 'success');
    } catch (e) {
      const err = e as Error & { response?: Response; body?: string };
      // 详细日志到 console，方便调试
      console.error('[refresh voices] failed:', e);
      if (err.response) {
        console.error('[refresh voices] response status:', err.response.status);
        console.error('[refresh voices] response body:', err.body);
      }
      const detail = err.body ? ` (${err.body.substring(0, 120)})` : '';
      addLog(`刷新失败: ${err.message}${detail}`, 'error');
      push(`刷新失败: ${err.message}`, 'error');
    }
  }, [apiKey, setLangVoices, addLog, push]);

  return { refresh };
}
