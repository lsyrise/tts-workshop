import { Plus, Trash2, Users } from 'lucide-react';
import { GroupCard } from '@/components/GroupCard/GroupCard';
import { SelectField } from '@/components/SelectField/SelectField';
import { Button } from '@/components/Button/Button';
import { VoiceTag } from '@/components/VoiceTag/VoiceTag';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useVoicesStore } from '@/store/useVoicesStore';
import { useToastStore } from '@/store/useToastStore';
import { useGenerationStore } from '@/store/useGenerationStore';
import type { Voice, VoiceSlot } from '@/types/voice';
import styles from './VoiceSlotSection.module.css';

const MAX_VOICE_SLOTS = 5;
const SLOT_LETTERS = ['A', 'B', 'C', 'D', 'E'];

function findVoice(voices: Voice[], voiceId: string): Voice | undefined {
  return voices.find((v) => v.id === voiceId);
}

export function VoiceSlotSection() {
  const language = useSettingsStore((s) => s.language);
  const langVoices = useVoicesStore((s) => s.langVoices);
  const customVoices = useVoicesStore((s) => s.customVoices);
  const voiceSlotsByLang = useVoicesStore((s) => s.voiceSlotsByLang);
  const setVoiceSlots = useVoicesStore((s) => s.setVoiceSlots);
  const addCustom = useVoicesStore((s) => s.addCustomVoice);
  const entries = useGenerationStore((s) => s.entries);
  const push = useToastStore((s) => s.push);

  const langEntry = langVoices[language];
  const systemVoices: Voice[] = langEntry?.voices ?? [];

  const slots: VoiceSlot[] =
    voiceSlotsByLang[language] ?? voiceSlotsByLang['__default'] ?? [];

  const handleAddSlot = () => {
    if (slots.length >= MAX_VOICE_SLOTS) {
      push(`最多支持 ${MAX_VOICE_SLOTS} 个音色`, 'warning');
      return;
    }
    const next = [...slots, { id: '', short: '' }];
    setVoiceSlots(language, next);
  };

  const handleRemove = (i: number) => {
    if (slots.length <= 1) {
      push('至少保留一个音色槽位', 'warning');
      return;
    }
    const next = slots.filter((_, idx) => idx !== i);
    setVoiceSlots(language, next);
  };

  const handleSelectVoice = (slotIdx: number, voiceId: string) => {
    if (voiceId === '__add_custom__') {
      const id = window.prompt('自定义音色 ID:');
      if (!id) return;
      const short = window.prompt('显示简称:', id) ?? id;
      addCustom(language, { voice_id: id, voice_name: short, description: [] });
      const next = slots.slice();
      next[slotIdx] = { id, short };
      setVoiceSlots(language, next);
      return;
    }
    const v = findVoice(systemVoices, voiceId);
    const next = slots.slice();
    if (!v) {
      next[slotIdx] = { id: voiceId, short: voiceId };
    } else {
      next[slotIdx] = { id: v.id, short: v.name };
    }
    setVoiceSlots(language, next);
  };

  const isDisabled = entries.length > 0;
  const lockedBadge = isDisabled ? '已锁定' : undefined;

  return (
    <GroupCard
      color="purple"
      icon={<Users size={18} strokeWidth={2} />}
      title="音色槽位"
      description="最多 5 个音色，每个文本将并行生成对应版本"
      badge={lockedBadge}
    >
      <div className={styles.list}>
        {slots.map((slot, idx) => {
          const letter = SLOT_LETTERS[idx] ?? String.fromCharCode(65 + idx);
          return (
            <div key={idx} className={styles.row}>
              <VoiceTag letter={letter} />
              <div className={styles.selectWrap}>
                <SelectField
                  value={slot.id}
                  onChange={(e) => handleSelectVoice(idx, e.target.value)}
                  disabled={isDisabled}
                  options={[
                    { value: '', label: '— 未选 —' },
                    ...systemVoices.map((v) => ({
                      value: v.id,
                      label: `[${v.name}] ${v.name}`,
                    })),
                    ...(customVoices[language] ?? []).map((v) => ({
                      value: v.voice_id,
                      label: `★[${v.voice_name}] ${v.voice_name} (自定义)`,
                    })),
                    { value: '__add_custom__', label: '+ 添加自定义音色…' },
                  ]}
                />
              </div>
              <button
                className={styles.removeBtn}
                onClick={() => handleRemove(idx)}
                disabled={isDisabled}
                title="删除该槽位"
              >
                <Trash2 size={13} />
              </button>
            </div>
          );
        })}
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleAddSlot}
        disabled={isDisabled || slots.length >= MAX_VOICE_SLOTS}
        block
      >
        <Plus size={13} /> 添加槽位
      </Button>
    </GroupCard>
  );
}
