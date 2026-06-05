/**
 * 文本 → entries[] 的导入逻辑
 */
import { useCallback } from 'react';
import { useGenerationStore } from '@/store/useGenerationStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useVoicesStore } from '@/store/useVoicesStore';
import { useToastStore } from '@/store/useToastStore';
import { sanitizeFilename } from '@/lib/text';
import type { TextMode } from '@/types/entry';
import type { VoiceSlot } from '@/types/voice';

const FIRST_WORD_STRIP = /^[\s，。！？、；：""''（）【】《》,.!?;:'"()\[\]\s]+/;
const FIRST_WORD_SPLIT = /[\s，。！？、；：""''（）【】《》,.!?;:'"()\[\]]+/;

function firstWord(text: string): string {
  return text.replace(FIRST_WORD_STRIP, '').split(FIRST_WORD_SPLIT)[0] ?? '';
}

/** 取前 N 个单词，用于短文/句子模式文件名 */
function headWords(text: string, n = 2): string {
  const cleaned = text.replace(FIRST_WORD_STRIP, '');
  return cleaned.split(FIRST_WORD_SPLIT).slice(0, n).join('_') || 'text';
}

function splitTexts(lines: string[], mode: TextMode): string[] {
  if (mode === 'passage') {
    return lines
      .join('\n')
      .split(/\n\s*\n/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (mode === 'word') {
    return Array.from(new Set(lines));
  }
  return lines;
}

function timeStamp(): string {
  return new Date().toTimeString().substring(0, 8).replace(/:/g, '');
}

function buildFilenames(
  texts: string[],
  mode: TextMode,
  slots: VoiceSlot[],
  format: string,
): string[] {
  const hasMultiple = slots.length > 1;
  const ts = timeStamp();
  return texts.flatMap((text) => {
    let base: string;
    if (mode === 'word') {
      base = sanitizeFilename(text);
    } else {
      const prefix = mode === 'passage' ? 'p' : 's';
      const words = mode === 'passage' ? headWords(text, 2) : sanitizeFilename(firstWord(text)) || 'text';
      base = `${prefix}_${words}_${ts}`;
    }
      return slots.map((s) => {
        const ext = hasMultiple ? `-${sanitizeFilename(s.short)}` : '';
        return `${base}${ext}.${format}`;
      });
  });
}

export function useImport() {
  const textMode = useGenerationStore((s) => s.textMode);
  const setTextMode = useGenerationStore((s) => s.setTextMode);
  const setEntries = useGenerationStore((s) => s.setEntries);
  const updateEntry = useGenerationStore((s) => s.updateEntry);
  const voiceSlotsByLang = useVoicesStore((s) => s.voiceSlotsByLang);
  const language = useSettingsStore((s) => s.language);
  const audioFormat = useSettingsStore((s) => s.audioFormat);
  const push = useToastStore((s) => s.push);

  const importLines = useCallback(
    (lines: string[]) => {
      if (lines.length === 0) {
        push('未识别到有效文本', 'warning');
        return;
      }
      const texts = splitTexts(lines, textMode);
      if (texts.length === 0) {
        push('未识别到有效文本', 'warning');
        return;
      }
      const slots: VoiceSlot[] = voiceSlotsByLang[language] ?? voiceSlotsByLang['__default'] ?? [];
      if (slots.length === 0) {
        push('请先配置至少一个音色', 'warning');
        return;
      }
      const filenames = buildFilenames(texts, textMode, slots, audioFormat);

      const entries = texts.flatMap((text, ti) =>
        slots.map((s, si) => {
          const tag = String.fromCharCode(65 + si);
          return {
            wordText: text,
            voiceId: s.id,
            voiceShort: s.short,
            voiceTag: tag,
            status: 'pending' as const,
            blob: null,
            errorMsg: null,
            saved: false,
            _filename: filenames[ti * slots.length + si] ?? `${sanitizeFilename(text)}.${audioFormat}`,
          };
        }),
      );
      setEntries(entries);
      push(`已导入 ${texts.length} 个文本 → ${entries.length} 条语音任务`, 'success');
    },
    [textMode, voiceSlotsByLang, language, audioFormat, setEntries, push],
  );

  /** 单词模式在生成前需要根据当前 format 重新计算文件名 */
  const rebuildFilenamesForWord = useCallback(() => {
    const entries = useGenerationStore.getState().entries;
    if (textMode !== 'word' || entries.length === 0) return;
    entries.forEach((e, i) => {
      const newName = `${sanitizeFilename(e.wordText)}-${sanitizeFilename(e.voiceShort)}.${audioFormat}`;
      updateEntry(i, { _filename: newName });
    });
  }, [textMode, audioFormat, updateEntry]);

  return { importLines, setTextMode, textMode, rebuildFilenamesForWord };
}
