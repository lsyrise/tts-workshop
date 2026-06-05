import { useRef, useState, useCallback } from 'react';
import { Upload, X, FileText, PenLine } from 'lucide-react';
import clsx from 'clsx';
import { GroupCard } from '@/components/GroupCard/GroupCard';
import { Button } from '@/components/Button/Button';
import { useGenerationStore } from '@/store/useGenerationStore';
import { useImport } from '../hooks/useImport';
import { useToastStore } from '@/store/useToastStore';
import type { TextMode } from '@/types/entry';
import styles from './InputArea.module.css';

const MODES: { id: TextMode; label: string; hint: string }[] = [
  { id: 'word', label: '单词', hint: '每行一个，自动去重' },
  { id: 'sentence', label: '句子', hint: '每行一句' },
  { id: 'passage', label: '短文', hint: '空行分段' },
];

export function InputArea() {
  const text = useGenerationStore((s) => s.text);
  const setText = useGenerationStore((s) => s.setText);
  const setEntries = useGenerationStore((s) => s.setEntries);
  const isGenerating = useGenerationStore((s) => s.isGenerating);
  const push = useToastStore((s) => s.push);
  const { importLines, setTextMode, textMode } = useImport();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleImport = useCallback(() => {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      push('请先输入或粘贴文本', 'warning');
      return;
    }
    importLines(lines);
  }, [text, importLines, push]);

  const handleClear = useCallback(() => {
    setText('');
    setEntries([]);
  }, [setText, setEntries]);

  const handleFile = useCallback(
    async (file: File) => {
      try {
        const content = await file.text();
        setText(content);
        const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);
        if (lines.length > 0) importLines(lines);
      } catch (e) {
        push(`读取文件失败: ${(e as Error).message}`, 'error');
      }
    },
    [setText, importLines, push],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.name.endsWith('.txt')) {
        void handleFile(file);
      } else if (file) {
        push('仅支持 .txt 文件', 'warning');
      }
    },
    [handleFile, push],
  );

  const handleModeSwitch = (mode: TextMode) => {
    if (mode === textMode) return;
    setTextMode(mode);
    setEntries([]);
  };

  return (
    <GroupCard
      color="green"
      icon={<PenLine size={18} strokeWidth={2} />}
      title="文本输入"
      description="支持粘贴、拖拽 .txt、选择模式后点击导入"
    >
      <div className={styles.modes}>
        {MODES.map((m) => (
          <button
            key={m.id}
            className={clsx(styles.mode, textMode === m.id && styles.modeActive)}
            onClick={() => handleModeSwitch(m.id)}
            disabled={isGenerating}
            title={m.hint}
          >
            {m.label}
          </button>
        ))}
        <span className={styles.hint}>{MODES.find((m) => m.id === textMode)?.hint}</span>
      </div>

      <div
        className={clsx(styles.drop, isDragging && styles.dropActive)}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
      >
        <textarea
          className={styles.textarea}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            textMode === 'word'
              ? '每行一个词，重复自动合并。\n例：\nhello\nworld\n你好'
              : textMode === 'sentence'
                ? '每行一句。\n例：\n今天天气真好。\nHow are you?'
                : '用空行分隔不同短文。\n例：\n第一段…\n\n第二段…'
          }
          disabled={isGenerating}
          spellCheck={false}
        />
        <div className={styles.toolbar}>
          <input
            ref={fileRef}
            type="file"
            accept=".txt"
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
              if (fileRef.current) fileRef.current.value = '';
            }}
          />
          <Button
            size="xs"
            variant="ghost"
            onClick={() => fileRef.current?.click()}
            disabled={isGenerating}
          >
            <Upload size={12} /> .txt
          </Button>
          <Button
            size="xs"
            variant="ghost"
            onClick={handleClear}
            disabled={isGenerating || (!text && useGenerationStore.getState().entries.length === 0)}
          >
            <X size={12} /> 清空
          </Button>
          <span className={styles.spacer} />
          <span className={styles.count}>
            <FileText size={11} />{' '}
            {text.split('\n').filter((l) => l.trim()).length} 行
          </span>
        </div>
      </div>

      <div className={styles.action}>
        <Button
          variant="primary"
          onClick={handleImport}
          disabled={isGenerating || !text.trim()}
        >
          导入到任务列表
        </Button>
      </div>
    </GroupCard>
  );
}
