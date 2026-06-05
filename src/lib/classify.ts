/**
 * MiniMax 系统音色的语言分类规则
 * 1:1 移植自原 voice-manager.html
 */
import { parseVoiceMeta } from './voice-meta';
import type { ApiSystemVoice } from './api';
import type { LangVoicesMap } from '@/types/voice';

const LANG_RULES: Array<[RegExp, string, string, string]> = [
  [/Chinese.*Mandarin|^male-|^female-|^presenter_|^clever_|^cute_|^lovely_|^cartoon_|^bingjiao_|^junlang_|^chunzhen_|^lengdan_|^badao_|^tianxin_|^qiaopi_|^wumei_|^diadia_|^danya_|Arrogant|Robot_Armor/i, 'zh', '中文（普通话）', 'Chinese'],
  [/Cantonese/i, 'yue', '中文（粤语）', 'Chinese,Yue'],
  [/^English|Santa|Grinch|Rudolph|Charming|Sweet_Girl|Cute_Elf|Attractive_Girl|Serene_Woman/i, 'en', 'English', 'English'],
  [/^Japanese|^Arnold$/i, 'ja', '日本語', 'Japanese'],
  [/^Korean/i, 'ko', '한국어', 'Korean'],
  [/^Spanish/i, 'es', 'Español', 'Spanish'],
  [/^French/i, 'fr', 'Français', 'French'],
  [/^German/i, 'de', 'Deutsch', 'German'],
  [/^Portuguese/i, 'pt', 'Português', 'Portuguese'],
  [/^Russian/i, 'ru', 'Русский', 'Russian'],
  [/^Indonesian/i, 'id', 'Bahasa Indonesia', 'Indonesian'],
  [/^Arabic/i, 'ar', 'العربية', 'Arabic'],
  [/^Italian/i, 'it', 'Italiano', 'Italian'],
  [/^Turkish/i, 'tr', 'Türkçe', 'Turkish'],
  [/^Dutch/i, 'nl', 'Nederlands', 'Dutch'],
  [/^Thai/i, 'th', 'ไทย', 'Thai'],
  [/^Vietnamese/i, 'vi', 'Tiếng Việt', 'Vietnamese'],
  [/^Ukrainian/i, 'uk', 'Українська', 'Ukrainian'],
  [/^Polish/i, 'pl', 'Polski', 'Polish'],
  [/^hindi|^Hindi/i, 'hi', 'हिन्दी', 'Hindi'],
];

type LangAccentSet = {
  label: string;
  langBoost: string;
  voices: { id: string; name: string; meta: ReturnType<typeof parseVoiceMeta> }[];
  accents: Set<string>;
};

export function classifyVoices(systemVoices: ApiSystemVoice[]): LangVoicesMap {
  const langMap = new Map<string, LangAccentSet>();

  for (const v of systemVoices) {
    const meta = parseVoiceMeta(v.description);
    let matched = false;

    for (const [regex, code, label, boost] of LANG_RULES) {
      if (regex.test(v.voice_id)) {
        let entry = langMap.get(code);
        if (!entry) {
          entry = { label, langBoost: boost, voices: [], accents: new Set() };
          langMap.set(code, entry);
        }
        entry.voices.push({ id: v.voice_id, name: v.voice_name || v.voice_id, meta });
        if (meta.accent) entry.accents.add(meta.accent);
        matched = true;
        break;
      }
    }

    if (!matched) {
      let entry = langMap.get('other');
      if (!entry) {
        entry = { label: '其他语言', langBoost: '', voices: [], accents: new Set() };
        langMap.set('other', entry);
      }
      entry.voices.push({ id: v.voice_id, name: v.voice_name || v.voice_id, meta });
      if (meta.accent) entry.accents.add(meta.accent);
    }
  }

  // 将 Set 转为 string[] 以满足 LangVoicesMmap 类型
  const out: LangVoicesMap = {};
  for (const [code, entry] of langMap) {
    out[code] = {
      label: entry.label,
      langBoost: entry.langBoost,
      voices: entry.voices,
      accents: [...entry.accents].sort(),
    };
  }
  return out;
}

export function mergeClassifiedInto(
  target: LangVoicesMap,
  classified: LangVoicesMap,
): LangVoicesMap {
  for (const [code, lang] of Object.entries(classified)) {
    if (target[code]) {
      const existingIds = new Set(lang.voices.map((v) => v.id));
      const extra = target[code].voices.filter((v) => !existingIds.has(v.id));
      target[code] = { ...lang, voices: [...lang.voices, ...extra] };
    } else {
      target[code] = lang;
    }
  }
  return target;
}
