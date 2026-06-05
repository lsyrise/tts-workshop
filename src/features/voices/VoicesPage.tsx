import { Key, Library, Sparkles, RefreshCw } from 'lucide-react';
import { GroupCard } from '@/components/GroupCard/GroupCard';
import { Button } from '@/components/Button/Button';
import { SelectField } from '@/components/SelectField/SelectField';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useVoicesStore } from '@/store/useVoicesStore';
import { useVoiceRefresh } from './hooks/useVoiceRefresh';
import { ApiKeyCard } from './components/ApiKeyCard';
import { VoiceGrid } from './components/VoiceGrid';
import { CustomVoiceForm } from './components/CustomVoiceForm';
import { CustomVoiceList } from './components/CustomVoiceList';
import { LogWindow } from '@/components/LogWindow/LogWindow';
import styles from './VoicesPage.module.css';

const FILTER_LABELS: Record<string, string> = {
  zh: '中文（普通话）',
  yue: '中文（粤语）',
  en: 'English',
  ja: '日本語',
  ko: '한국어',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  ru: 'Русский',
  id: 'Bahasa Indonesia',
  ar: 'العربية',
  it: 'Italiano',
  tr: 'Türkçe',
  nl: 'Nederlands',
  th: 'ไทย',
  vi: 'Tiếng Việt',
  uk: 'Українська',
  pl: 'Polski',
  hi: 'हिन्दी',
};

export function VoicesPage() {
  const language = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const source = useVoicesStore((s) => s.source);
  const { refresh } = useVoiceRefresh();

  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <h1 className={styles.title}>音色管理</h1>
        <p className={styles.subtitle}>
          配置 API Key、刷新系统音色库、管理你的自定义音色
        </p>
      </header>

      <div className={styles.grid}>
        <GroupCard
          color="yellow"
          icon={<Key size={20} strokeWidth={2} />}
          title="API Key"
          description="MiniMax T2A 接口密钥，会保存到本地"
        >
          <ApiKeyCard />
        </GroupCard>

        <GroupCard
          color="blue"
          icon={<Library size={20} strokeWidth={2} />}
          title="音色库"
          description="系统内置 + API 缓存，按语言分类"
          badge={source === 'api' ? 'API' : source === 'cached' ? '缓存' : '内置'}
          actions={
            <Button size="sm" variant="secondary" onClick={() => void refresh()}>
              <RefreshCw size={13} /> 刷新
            </Button>
          }
        >
          <div className={styles.langSelect}>
            <SelectField
              id="voices-lang-filter"
              label="语言筛选"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              options={Object.entries(FILTER_LABELS).map(([value, label]) => ({
                value,
                label,
              }))}
            />
          </div>
          <VoiceGrid />
        </GroupCard>

        <GroupCard
          color="pink"
          icon={<Sparkles size={20} strokeWidth={2} />}
          title="自定义音色"
          description="可补充 API 未返回的私有音色 ID"
        >
          <CustomVoiceForm />
          <CustomVoiceList />
        </GroupCard>
      </div>

      <div className={styles.bottom}>
        <LogWindow />
      </div>
    </div>
  );
}
