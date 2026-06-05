import { Archive, Download, Loader, Play, FolderOpen } from 'lucide-react';
import { Button } from '@/components/Button/Button';
import { useGenerationStore } from '@/store/useGenerationStore';
import { useGeneration } from '../hooks/useGeneration';
import { useToastStore } from '@/store/useToastStore';
import { useFsApi } from '../hooks/useFsApi';
import { makeZip } from '@/lib/zip';
import styles from './BottomBar.module.css';

export function BottomBar() {
  const entries = useGenerationStore((s) => s.entries);
  const isGenerating = useGenerationStore((s) => s.isGenerating);
  const dirHandle = useGenerationStore((s) => s.dirHandle);
  const { start, stop, retryFailed } = useGeneration();
  const push = useToastStore((s) => s.push);
  const { select } = useFsApi();

  const doneEntries = entries.filter((e) => e.status === 'done');
  const failEntries = entries.filter((e) => e.status === 'error');
  const hasPending = entries.some((e) => e.status === 'pending');
  const hasAnyEntry = entries.length > 0;
  const noDir = !dirHandle;

  const handleGenerate = () => {
    if (noDir) {
      push('请先选择保存目录', 'warning');
      void select();
      return;
    }
    void start();
  };

  const handleZip = async () => {
    const ready = doneEntries.filter((e) => e.blob);
    if (ready.length === 0) {
      push('没有已生成的音频', 'warning');
      return;
    }
    try {
      const blob = await makeZip(
        ready.map((e) => ({
          filename: e._filename,
          blob: e.blob as Blob,
        })),
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tts_output.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      push(`已下载 ZIP (${ready.length} 个文件)`, 'success');
    } catch (e) {
      push(`ZIP 生成失败: ${(e as Error).message}`, 'error');
    }
  };

  const total = entries.length;
  const processed = doneEntries.length + failEntries.length;
  const progress = total > 0 ? Math.round((processed / total) * 100) : 0;

  return (
    <div className={styles.bar}>
      <Button
        variant="primary"
        size="md"
        onClick={handleGenerate}
        disabled={isGenerating || !hasPending}
        className={styles.genBtn}
        title={noDir ? '请先选择保存目录' : '开始生成'}
      >
        {isGenerating ? (
          <>
            <Loader size={14} /> 生成中…
          </>
        ) : (
          <>
            <Play size={14} fill="currentColor" /> 开始生成
          </>
        )}
        {hasPending && !isGenerating && (
          <span className={styles.count}>({hasPending})</span>
        )}
      </Button>

      <div className={styles.progress}>
        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className={styles.progressText}>
          {doneEntries.length}/{total || 0}
        </span>
      </div>

      <div className={styles.actions}>
        {isGenerating && (
          <Button variant="danger" onClick={stop}>
            <Loader size={13} /> 停止
          </Button>
        )}
        {failEntries.length > 0 && !isGenerating && (
          <Button variant="secondary" onClick={() => void retryFailed()}>
            <Download size={13} /> 重试 ({failEntries.length})
          </Button>
        )}
        {doneEntries.length > 0 && !isGenerating && (
          <Button variant="outlined" onClick={handleZip}>
            <Archive size={13} /> ZIP
          </Button>
        )}
        {noDir && hasAnyEntry && !isGenerating && (
          <Button variant="secondary" onClick={() => void select()}>
            <FolderOpen size={13} /> 选目录
          </Button>
        )}
      </div>
    </div>
  );
}
