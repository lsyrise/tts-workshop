import { Mic } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useVoicesStore } from '@/store/useVoicesStore';
import { FilterPill } from '@/components/FilterPill/FilterPill';
import styles from './VoiceGrid.module.css';

const GENDER_LABELS: Record<string, string> = { male: '男', female: '女' };
const AGE_LABELS: Record<string, string> = {
  child: '儿童',
  young: '青年',
  middle: '中年',
  elder: '老年',
};

export function VoiceGrid() {
  const language = useSettingsStore((s) => s.language);
  const langVoices = useVoicesStore((s) => s.langVoices);
  const voiceFilter = useVoicesStore((s) => s.voiceFilter);
  const setVoiceFilter = useVoicesStore((s) => s.setVoiceFilter);

  const langEntry = langVoices[language];
  const voices = langEntry?.voices ?? [];
  const accents = langEntry?.accents ?? [];

  const filtered = voices.filter((v) => {
    const m = v.meta;
    if (!m) return true;
    if (voiceFilter.gender && m.gender !== voiceFilter.gender) return false;
    if (voiceFilter.age && m.age !== voiceFilter.age) return false;
    if (voiceFilter.accent && m.accent !== voiceFilter.accent) return false;
    return true;
  });
  // 按 id 去重
  const unique = Array.from(new Map(filtered.map((v) => [v.id, v])).values());

  const hasFilter = voiceFilter.gender || voiceFilter.age || voiceFilter.accent;

  return (
    <div className={styles.section}>
      <div className={styles.metaRow}>
        <div className={styles.langLabel}>
          {langEntry?.label ?? language}
          <span className={styles.count}>
            {unique.length}/{voices.length}
          </span>
        </div>
        {hasFilter && (
          <button
            className={styles.clear}
            onClick={() => setVoiceFilter({ gender: '', age: '', accent: '' })}
          >
            清除筛选
          </button>
        )}
      </div>

      {voices.length > 0 && (
        <div className={styles.pills}>
          <FilterPill
            active={!!voiceFilter.gender}
            onClick={() =>
              setVoiceFilter({
                gender: voiceFilter.gender === 'male' ? 'female' : voiceFilter.gender === 'female' ? '' : 'male',
              })
            }
          >
            {voiceFilter.gender ? GENDER_LABELS[voiceFilter.gender] ?? voiceFilter.gender : '性别'}
          </FilterPill>
          <FilterPill
            active={!!voiceFilter.age}
            onClick={() =>
              setVoiceFilter({
                age: voiceFilter.age === 'child' ? 'young' : voiceFilter.age === 'young' ? 'middle' : voiceFilter.age === 'middle' ? 'elder' : '',
              })
            }
          >
            {voiceFilter.age ? AGE_LABELS[voiceFilter.age] ?? voiceFilter.age : '年龄'}
          </FilterPill>
          {accents.length > 0 && (
            <FilterPill
              active={!!voiceFilter.accent}
              onClick={() =>
                setVoiceFilter({
                  accent: voiceFilter.accent ? '' : (accents[0] ?? ''),
                })
              }
            >
              {voiceFilter.accent || '口音'}
            </FilterPill>
          )}
        </div>
      )}

      <div className={styles.grid}>
        {unique.length === 0 && (
          <div className={styles.empty}>
            <Mic size={20} />
            <span>
              {voices.length === 0
                ? '该语言暂无音色'
                : '无匹配，试试调整筛选条件'}
            </span>
          </div>
        )}
        {unique.map((v) => (
          <div key={v.id} className={styles.card}>
            <div className={styles.cardName}>{v.name}</div>
            <div className={styles.cardId}>{v.id}</div>
            {v.meta && (v.meta.gender || v.meta.age) && (
              <div className={styles.cardMeta}>
                {v.meta.gender && <span>{GENDER_LABELS[v.meta.gender] ?? v.meta.gender}</span>}
                {v.meta.age && <span>{AGE_LABELS[v.meta.age] ?? v.meta.age}</span>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
