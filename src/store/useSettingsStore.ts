/**
 * 全局设置 + 合成参数 store
 *
 * 设计原则：与原 HTML 1:1 兼容，persist key 保持原名：
 *   - minimax_api_key
 *   - tts_language
 *   - tts_modelSelect / tts_speed / tts_vol / tts_pitch /
 *     tts_concurrency / tts_audioFormat / tts_sampleRate
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AudioFormat, Concurrency, SampleRate, TtsModel } from '@/types/settings';

type SettingsState = {
  apiKey: string;
  language: string;
  model: TtsModel;
  speed: number;
  vol: number;
  pitch: number;
  concurrency: Concurrency;
  audioFormat: AudioFormat;
  sampleRate: SampleRate;

  // actions
  setApiKey: (v: string) => void;
  setLanguage: (v: string) => void;
  setModel: (v: TtsModel) => void;
  setSpeed: (v: number) => void;
  setVol: (v: number) => void;
  setPitch: (v: number) => void;
  setConcurrency: (v: Concurrency) => void;
  setAudioFormat: (v: AudioFormat) => void;
  setSampleRate: (v: SampleRate) => void;
};

const storage = createJSONStorage(() => localStorage);

// 为 settings 主 store 实现：使用 partial persist 把不同字段映射到不同 key。
// 简化方案：用一个统一的 persist，存为 'tts_settings_v2'，但保留兼容读取原 key。
// 这里采用**保留原 key 名**的策略，通过 onRehydrateStorage 把旧 key 数据迁移进来。

type PersistedShape = {
  apiKey: string;
  language: string;
  model: string;
  speed: number;
  vol: number;
  pitch: number;
  concurrency: number;
  audioFormat: string;
  sampleRate: number;
};

// 先从原 key 读一遍（迁移）
function migrateFromLegacyKeys(): Partial<PersistedShape> {
  if (typeof window === 'undefined') return {};
  const out: Partial<PersistedShape> = {};
  const apiKey = localStorage.getItem('minimax_api_key');
  if (apiKey) out.apiKey = apiKey;
  const lang = localStorage.getItem('tts_language');
  if (lang) out.language = lang;
  const model = localStorage.getItem('tts_modelSelect');
  if (model) out.model = model;
  ['speed', 'vol', 'pitch', 'concurrency', 'audioFormat', 'sampleRate'].forEach((k) => {
    const v = localStorage.getItem(`tts_${k}`);
    if (v) {
      const num = Number(v);
      (out as Record<string, unknown>)[k] = Number.isFinite(num) && k !== 'audioFormat' ? num : v;
    }
  });
  return out;
}

const migrated = migrateFromLegacyKeys();

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      apiKey: migrated.apiKey ?? '',
      language: migrated.language ?? 'zh',
      model: migrated.model ?? 'speech-2.8-hd',
      speed: migrated.speed ?? 1,
      vol: migrated.vol ?? 1,
      pitch: migrated.pitch ?? 0,
      concurrency: (migrated.concurrency as Concurrency) ?? 1,
      audioFormat: (migrated.audioFormat as AudioFormat) ?? 'mp3',
      sampleRate: (migrated.sampleRate as SampleRate) ?? 32000,

      setApiKey: (apiKey) => set({ apiKey }),
      setLanguage: (language) => set({ language }),
      setModel: (model) => set({ model }),
      setSpeed: (speed) => set({ speed }),
      setVol: (vol) => set({ vol }),
      setPitch: (pitch) => set({ pitch }),
      setConcurrency: (concurrency) => set({ concurrency }),
      setAudioFormat: (audioFormat) => set({ audioFormat }),
      setSampleRate: (sampleRate) => set({ sampleRate }),
    }),
    {
      name: 'tts_settings_v2',
      storage,
      // 第一次加载时已经 merge 了 migrated，不需要再做 onRehydrateStorage
    },
  ),
);

/** 为了 100% 兼容原 key 行为：写新 key 时也同步写原 key */
function syncLegacyKey(field: string, value: string): void {
  try {
    if (field === 'apiKey') {
      localStorage.setItem('minimax_api_key', value);
    } else if (field === 'language') {
      localStorage.setItem('tts_language', value);
    } else {
      localStorage.setItem(`tts_${field}`, value);
    }
  } catch {
    // ignore
  }
}

// 订阅器：每次 settings 变化时同步到原 key
if (typeof window !== 'undefined') {
  useSettingsStore.subscribe((state) => {
    syncLegacyKey('apiKey', state.apiKey);
    syncLegacyKey('language', state.language);
    syncLegacyKey('modelSelect', state.model);
    syncLegacyKey('speed', String(state.speed));
    syncLegacyKey('vol', String(state.vol));
    syncLegacyKey('pitch', String(state.pitch));
    syncLegacyKey('concurrency', String(state.concurrency));
    syncLegacyKey('audioFormat', state.audioFormat);
    syncLegacyKey('sampleRate', String(state.sampleRate));
  });
}
