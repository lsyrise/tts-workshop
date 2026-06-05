/**
 * 日志环形 buffer (最多 5 条)
 * 同步驱动 LogWindow 与终端式显示
 */
import { create } from 'zustand';
import type { LogMessage, LogType } from '@/types/log';

type LogsState = {
  messages: LogMessage[];
  add: (msg: string, type?: LogType) => void;
  clear: () => void;
};

const MAX = 5;

export const useLogsStore = create<LogsState>()((set) => ({
  messages: [{ time: '00:00:00', msg: '等待操作...', type: 'info' }],
  add: (msg, type = 'info') => {
    const time = new Date().toTimeString().substring(0, 8);
    set((s) => {
      const next = [...s.messages, { time, msg, type }];
      return { messages: next.slice(-MAX) };
    });
  },
  clear: () => set({ messages: [] },
)}));
