/**
 * 音色库 store
 *
 * 持久化 key：
 *   - tts_voice_cache         → langVoices (从 API 拉取后缓存)
 *   - tts_voice_cache_time    → cacheTime (ms timestamp)
 *   - tts_custom_voices       → customVoices
 *   - tts_voice_slots_<lang>  → voiceSlotsByLang
 *   - tts_voice_slots         → voiceSlotsByLang['__default']
 */
import { create } from 'zustand';
import type {
  CustomVoice,
  LangVoicesMap,
  VoiceFilter,
  VoiceSlot,
} from '@/types/voice';
import { BUILTIN_LANG_VOICES } from '@/lib/voices-db';

type VoicesState = {
  /** 当前激活的语言表（内置 + API 缓存合并） */
  langVoices: LangVoicesMap;
  /** 缓存时间戳 */
  cacheTime: number;
  /** 数据源 */
  source: 'builtin' | 'cached' | 'api';
  /** 自定义音色 */
  customVoices: Record<string, CustomVoice[]>;
  /** 用户已配置的音色槽，按语言分 */
  voiceSlotsByLang: Record<string, VoiceSlot[]>;
  /** 筛选条件 */
  voiceFilter: VoiceFilter;

  // actions
  setLangVoices: (v: LangVoicesMap, source: 'cached' | 'api') => void;
  addCustomVoice: (langCode: string, voice: CustomVoice) => void;
  removeCustomVoice: (langCode: string, voiceId: string) => void;
  setVoiceSlots: (langCode: string, slots: VoiceSlot[]) => void;
  setVoiceFilter: (filter: Partial<VoiceFilter>) => void;
};

// 启动时从原 localStorage 读
function readLegacy(): Partial<{
  langVoices: LangVoicesMap;
  cacheTime: number;
  customVoices: Record<string, CustomVoice[]>;
  voiceSlotsByLang: Record<string, VoiceSlot[]>;
}> {
  if (typeof window === 'undefined') return {};
  const out: Partial<{
    langVoices: LangVoicesMap;
    cacheTime: number;
    customVoices: Record<string, CustomVoice[]>;
    voiceSlotsByLang: Record<string, VoiceSlot[]>;
  }> = {};

  const cache = localStorage.getItem('tts_voice_cache');
  const cacheTime = localStorage.getItem('tts_voice_cache_time');
  if (cache && cacheTime) {
    const age = Date.now() - Number(cacheTime);
    if (age < 24 * 3600 * 1000) {
      try {
        out.langVoices = JSON.parse(cache);
        out.cacheTime = Number(cacheTime);
      } catch {
        // ignore
      }
    }
  }

  const custom = localStorage.getItem('tts_custom_voices');
  if (custom) {
    try {
      out.customVoices = JSON.parse(custom);
    } catch {
      // ignore
    }
  }

  // 读所有 tts_voice_slots_<lang> 键
  const slotsByLang: Record<string, VoiceSlot[]> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k) continue;
    if (k.startsWith('tts_voice_slots_') && k !== 'tts_voice_slots') {
      const langCode = k.replace('tts_voice_slots_', '');
      try {
        const parsed = JSON.parse(localStorage.getItem(k) ?? '[]');
        if (Array.isArray(parsed)) slotsByLang[langCode] = parsed;
      } catch {
        // ignore
      }
    }
  }
  // 读默认 slots
  const defaultSlots = localStorage.getItem('tts_voice_slots');
  if (defaultSlots) {
    try {
      const parsed = JSON.parse(defaultSlots);
      if (Array.isArray(parsed) && parsed.length > 0) {
        slotsByLang['__default'] = parsed;
      }
    } catch {
      // ignore
    }
  }
  if (Object.keys(slotsByLang).length > 0) {
    out.voiceSlotsByLang = slotsByLang;
  }

  return out;
}

const legacy = readLegacy();

export const useVoicesStore = create<VoicesState>()((set, get) => ({
  langVoices: legacy.langVoices ?? BUILTIN_LANG_VOICES,
  cacheTime: legacy.cacheTime ?? 0,
  source: legacy.langVoices ? 'cached' : 'builtin',
  customVoices: legacy.customVoices ?? {},
  voiceSlotsByLang: legacy.voiceSlotsByLang ?? {},
  voiceFilter: { gender: '', age: '', accent: '' },

  setLangVoices: (langVoices, source) => {
    set({ langVoices, source });
    if (source === 'api') {
      try {
        localStorage.setItem('tts_voice_cache', JSON.stringify(langVoices));
        localStorage.setItem('tts_voice_cache_time', String(Date.now()));
      } catch {
        // ignore
      }
    }
  },
  addCustomVoice: (langCode, voice) => {
    const cur = get().customVoices;
    const list = cur[langCode] ?? [];
    const next = { ...cur, [langCode]: [...list, voice] };
    set({ customVoices: next });
    try {
      localStorage.setItem('tts_custom_voices', JSON.stringify(next));
    } catch {
      // ignore
    }
  },
  removeCustomVoice: (langCode, voiceId) => {
    const cur = get().customVoices;
    const list = (cur[langCode] ?? []).filter((v) => v.voice_id !== voiceId);
    const next = { ...cur, [langCode]: list };
    if (list.length === 0) delete next[langCode];
    set({ customVoices: next });
    try {
      localStorage.setItem('tts_custom_voices', JSON.stringify(next));
    } catch {
      // ignore
    }
  },
  setVoiceSlots: (langCode, slots) => {
    const cur = get().voiceSlotsByLang;
    const next = { ...cur, [langCode]: slots };
    set({ voiceSlotsByLang: next });
    try {
      if (langCode === '__default') {
        localStorage.setItem('tts_voice_slots', JSON.stringify(slots));
      } else {
        localStorage.setItem(`tts_voice_slots_${langCode}`, JSON.stringify(slots));
      }
    } catch {
      // ignore
    }
  },
  setVoiceFilter: (filter) => {
    set({ voiceFilter: { ...get().voiceFilter, ...filter } });
  },
}));
