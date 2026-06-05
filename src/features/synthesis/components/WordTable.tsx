import { Play, RefreshCw, Trash2, ListChecks } from 'lucide-react';
import { GroupCard } from '@/components/GroupCard/GroupCard';
import { Button } from '@/components/Button/Button';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import { VoiceTag } from '@/components/VoiceTag/VoiceTag';
import { useGenerationStore } from '@/store/useGenerationStore';
import { useToastStore } from '@/store/useToastStore';
import styles from './WordTable.module.css';

export function WordTable() {
  const entries = useGenerationStore((s) => s.entries);
  const updateEntry = useGenerationStore((s) => s.updateEntry);
  const isGenerating = useGenerationStore((s) => s.isGenerating);
  const push = useToastStore((s) => s.push);

  if (entries.length === 0) {
    return null;
  }

  const handlePreview = (idx: number) => {
    const e = entries[idx];
    if (!e || !e.blob) {
      push('尚无音频可试听', 'warning');
      return;
    }
    const url = URL.createObjectURL(e.blob);
    const audio = new Audio(url);
    audio.onended = () => URL.revokeObjectURL(url);
    void audio.play();
  };

  const handleRemove = (idx: number) => {
    updateEntry(idx, {
      status: 'pending',
      blob: null,
      errorMsg: null,
      saved: false,
    });
  };

  const doneCount = entries.filter((e) => e.status === 'done').length;
  const errorCount = entries.filter((e) => e.status === 'error').length;

  return (
    <GroupCard
      color="pink"
      icon={<ListChecks size={18} strokeWidth={2} />}
      title="任务列表"
      description={`共 ${entries.length} 条 — 已完成 ${doneCount}${errorCount > 0 ? ` · 失败 ${errorCount}` : ''}`}
    >
      <div className={styles.wrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.colIdx}>#</th>
              <th className={styles.colVoice}>音色</th>
              <th className={styles.colText}>文本</th>
              <th className={styles.colFile}>文件名</th>
              <th className={styles.colStatus}>状态</th>
              <th className={styles.colAction}>操作</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, idx) => (
              <tr key={idx} className={e.status === 'error' ? styles.rowError : ''}>
                <td className={styles.colIdx}>{idx + 1}</td>
                <td className={styles.colVoice}>
                  <VoiceTag letter={e.voiceTag} />
                  <span className={styles.short}>{e.voiceShort}</span>
                </td>
                <td className={styles.colText}>
                  <span className={styles.wordText}>{e.wordText}</span>
                  {e.errorMsg && <span className={styles.errMsg}>{e.errorMsg}</span>}
                </td>
                <td className={styles.colFile}>
                  <code className={styles.filename}>{e._filename}</code>
                </td>
                <td className={styles.colStatus}>
                  <StatusBadge status={e.status} />
                </td>
                <td className={styles.colAction}>
                  {e.blob && (
                    <Button size="xs" variant="ghost" onClick={() => handlePreview(idx)} title="试听">
                      <Play size={12} />
                    </Button>
                  )}
                  {e.status === 'error' && !isGenerating && (
                    <Button size="xs" variant="ghost" onClick={() => handleRemove(idx)} title="重置">
                      <RefreshCw size={12} />
                    </Button>
                  )}
                  {!isGenerating && (
                    <Button size="xs" variant="ghost-danger" onClick={() => handleRemove(idx)} title="清除">
                      <Trash2 size={12} />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GroupCard>
  );
}
