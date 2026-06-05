import { Box, Cpu } from 'lucide-react';
import { GroupCard } from '@/components/GroupCard/GroupCard';
import { SelectField } from '@/components/SelectField/SelectField';
import { useSettingsStore } from '@/store/useSettingsStore';
import { TTS_MODELS } from '@/lib/voices-db';
import styles from './ModelLanguageSection.module.css';

const LANG_LABELS: Record<string, string> = {
  zh: '中文 (普通话)',
  yue: '中文 (粤语)',
  en: '英语',
  ja: '日语',
  ko: '韩语',
  es: '西班牙语',
  fr: '法语',
  de: '德语',
  pt: '葡萄牙语',
  ru: '俄语',
  id: '印尼语',
  ar: '阿拉伯语',
  it: '意大利语',
  tr: '土耳其语',
  nl: '荷兰语',
  th: '泰语',
  vi: '越南语',
  uk: '乌克兰语',
  pl: '波兰语',
  hi: '印地语',
};

const ALL_LANGS = Object.keys(LANG_LABELS);

export function ModelLanguageSection() {
  const model = useSettingsStore((s) => s.model);
  const setModel = useSettingsStore((s) => s.setModel);
  const language = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);

  return (
    <GroupCard
      color="blue"
      icon={<Box size={18} strokeWidth={2} />}
      title="模型与语言"
      description="选择 TTS 模型和目标语言"
    >
      <div className={styles.row}>
        <SelectField
          id="model-select"
          label={<><Cpu size={11} /> 模型</>}
          value={model}
          onChange={(e) => setModel(e.target.value)}
          options={TTS_MODELS.map((m) => ({ value: m.value, label: m.label }))}
        />
        <SelectField
          id="lang-select"
          label="🌐 语言"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          options={ALL_LANGS.map((l) => ({
            value: l,
            label: LANG_LABELS[l] ?? l,
          }))}
        />
      </div>
    </GroupCard>
  );
}
