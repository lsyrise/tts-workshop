/** 一条文本输入条目 */
export type TextMode = 'word' | 'sentence' | 'passage';

/** 一条待合成的任务单元 */
export type EntryStatus = 'pending' | 'processing' | 'done' | 'error' | 'skipped';

export type Entry = {
  wordText: string;
  voiceId: string;
  voiceShort: string;
  /** A/B/C/D/E 标签 */
  voiceTag: string;
  status: EntryStatus;
  blob: Blob | null;
  errorMsg: string | null;
  /** 是否已写入目录 */
  saved: boolean;
  /** 计算出的最终文件名 */
  _filename: string;
  /** 内部标记：重试 */
  _retry?: boolean;
};
