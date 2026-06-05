/**
 * 文本输入条目 + 合成状态
 * 仅在内存中维护，不持久化
 */
import { create } from 'zustand';
import type { Entry, TextMode } from '@/types/entry';

type GenerationState = {
  entries: Entry[];
  isGenerating: boolean;
  abortController: AbortController | null;
  dirHandle: FileSystemDirectoryHandle | null;
  text: string;
  textMode: TextMode;

  setEntries: (entries: Entry[]) => void;
  updateEntry: (idx: number, patch: Partial<Entry>) => void;
  clearEntries: () => void;
  setIsGenerating: (v: boolean) => void;
  setAbortController: (c: AbortController | null) => void;
  setDirHandle: (h: FileSystemDirectoryHandle | null) => void;
  setText: (t: string) => void;
  setTextMode: (m: TextMode) => void;
};

export const useGenerationStore = create<GenerationState>()((set) => ({
  entries: [],
  isGenerating: false,
  abortController: null,
  dirHandle: null,
  text: '',
  textMode: 'word',

  setEntries: (entries) => set({ entries }),
  updateEntry: (idx, patch) =>
    set((s) => {
      const next = s.entries.slice();
      const cur = next[idx];
      if (cur) next[idx] = { ...cur, ...patch };
      return { entries: next };
    }),
  clearEntries: () => set({ entries: [] }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setAbortController: (abortController) => set({ abortController }),
  setDirHandle: (dirHandle) => set({ dirHandle }),
  setText: (text) => set({ text }),
  setTextMode: (textMode) => set({ textMode }),
}));
