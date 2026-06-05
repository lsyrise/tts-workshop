/** 一条音色元数据：从 voice_id 名称/描述中解析出的结构化标签 */
export type VoiceMeta = {
  gender: 'male' | 'female' | '';
  age: 'child' | 'young' | 'middle' | 'elder' | '';
  accent: string;
  fullDesc: string;
};

/** 系统音色表中的最小条目。1:1 兼容原 HTML 中的 LANG_VOICES 结构。 */
export type Voice = {
  /** API 中使用的 voice_id */
  id: string;
  /** 中文短名 */
  name: string;
  /** 可选元数据 */
  meta?: VoiceMeta;
};

/** 一门语言下的音色集合 */
export type LangVoices = {
  label: string;
  /** language_boost 传给 API */
  langBoost: string;
  voices: Voice[];
  /** 该语言下出现的口音列表（用于筛选） */
  accents?: string[];
};

/** 一个语言代码到 LangVoices 的 map（与原 LANG_VOICES 完全一致） */
export type LangVoicesMap = Record<string, LangVoices>;

/** 简化的语言选项：用于 <select> */
export type LangOption = {
  code: string;
  label: string;
  count: number;
};

/** 用户自定义音色 */
export type CustomVoice = {
  voice_id: string;
  voice_name: string;
  description: string[];
  _meta?: VoiceMeta;
};

/** 音色筛选条件 */
export type VoiceFilter = {
  gender: '' | VoiceMeta['gender'];
  age: '' | VoiceMeta['age'];
  accent: string;
};

/** 用户配置的音色槽（用于批量生成多版本） */
export type VoiceSlot = {
  id: string;
  short: string;
};
