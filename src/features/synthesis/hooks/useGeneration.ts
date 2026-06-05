/**
 * 批量生成的核心调度
 */
import { useCallback, useEffect, useRef } from 'react';
import { useGenerationStore } from '@/store/useGenerationStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useLogsStore } from '@/store/useLogsStore';
import { useToastStore } from '@/store/useToastStore';
import { useVoicesStore } from '@/store/useVoicesStore';
import { callTTS, runWithConcurrency } from '@/lib/api';
import { existsInDir, writeFileToDir } from '@/lib/fs-api';

const CONSECUTIVE_FAIL_LIMIT = 5;
const FAIL_PAUSE_MS = 10_000;

function sleep(ms: number, shouldAbort: () => boolean): Promise<void> {
  return new Promise((resolve) => {
    const tick = () => {
      if (shouldAbort()) {
        resolve();
        return;
      }
      if (ms <= 0) {
        resolve();
        return;
      }
      ms -= 200;
      setTimeout(tick, 200);
    };
    tick();
  });
}

export function useGeneration() {
  const entries = useGenerationStore((s) => s.entries);
  const isGenerating = useGenerationStore((s) => s.isGenerating);
  const setIsGenerating = useGenerationStore((s) => s.setIsGenerating);
  const updateEntry = useGenerationStore((s) => s.updateEntry);
  const dirHandle = useGenerationStore((s) => s.dirHandle);

  const apiKey = useSettingsStore((s) => s.apiKey);
  const model = useSettingsStore((s) => s.model);
  const language = useSettingsStore((s) => s.language);
  const speed = useSettingsStore((s) => s.speed);
  const vol = useSettingsStore((s) => s.vol);
  const pitch = useSettingsStore((s) => s.pitch);
  const concurrency = useSettingsStore((s) => s.concurrency);
  const audioFormat = useSettingsStore((s) => s.audioFormat);
  const sampleRate = useSettingsStore((s) => s.sampleRate);
  const langVoices = useVoicesStore((s) => s.langVoices);

  const addLog = useLogsStore((s) => s.add);
  const push = useToastStore((s) => s.push);

  const abortedRef = useRef(false);

  // 暴露状态给其他模块
  useEffect(() => {
    abortedRef.current = !isGenerating;
  }, [isGenerating]);

  const start = useCallback(async () => {
    if (!apiKey) {
      push('请先设置 API Key', 'warning');
      return;
    }
    if (entries.length === 0) {
      push('请先导入文本', 'warning');
      return;
    }
    // 必须先选择保存目录，否则无法写入文件
    if (!dirHandle) {
      push('请先选择保存目录', 'warning');
      return;
    }

    setIsGenerating(true);
    abortedRef.current = false;
    addLog('正在扫描已有文件...', 'info');

    // 1. 扫描已存在文件
    if (dirHandle) {
      let skipped = 0;
      for (let i = 0; i < entries.length; i++) {
        if (abortedRef.current) {
          addLog('扫描被中断', 'warn');
          setIsGenerating(false);
          return;
        }
        const e = entries[i];
        if (!e) continue;
        if ((e.status === 'pending' || e.status === 'error') && !e._retry) {
          if (await existsInDir(dirHandle, e._filename)) {
            updateEntry(i, { status: 'skipped', errorMsg: '文件已存在，自动跳过' });
            skipped++;
          }
        }
      }
      if (skipped > 0) addLog(`自动跳过 ${skipped} 个已有文件`, 'warn');
      else addLog('无已有文件，全部生成', 'success');
    }

    const pending = entries
      .map((e, i) => (e.status === 'pending' ? i : -1))
      .filter((i) => i >= 0);

    if (pending.length === 0) {
      setIsGenerating(false);
      push('所有条目已完成或已跳过', 'success');
      return;
    }

    addLog(`开始生成 ${pending.length} 条语音`, 'info');

    const langBoost = langVoices[language]?.langBoost ?? '';
    let consecutiveFails = 0;
    let completed = 0;
    const total = pending.length;

    await runWithConcurrency(
      total,
      concurrency,
      async (idx) => {
        if (abortedRef.current) return;
        const entryIdx = pending[idx];
        if (entryIdx === undefined) return;
        const entry = entries[entryIdx];
        if (!entry) return;

        updateEntry(entryIdx, { status: 'processing', _retry: false });

        try {
          const blob = await callTTS(apiKey, {
            model,
            text: entry.wordText,
            voice_id: entry.voiceId,
            speed,
            vol,
            pitch,
            format: audioFormat,
            sampleRate,
            langBoost,
          });
          if (abortedRef.current) return;

          const patch: { status: 'done'; blob: Blob; errorMsg: null; saved?: boolean } = {
            status: 'done',
            blob,
            errorMsg: null,
          };
          if (dirHandle) {
            const ok = await writeFileToDir(dirHandle, entry._filename, blob);
            if (ok) patch.saved = true;
            else addLog(`写入文件失败: ${entry._filename}`, 'error');
          }
          updateEntry(entryIdx, patch);
          consecutiveFails = 0;
        } catch (err) {
          if (abortedRef.current) return;
          const msg = (err as Error).message;
          updateEntry(entryIdx, { status: 'error', errorMsg: msg, blob: null });
          consecutiveFails++;
          addLog(
            `失败(连续${consecutiveFails}次): ${entry.wordText} - ${msg.substring(0, 60)}`,
            'error',
          );
          if (consecutiveFails >= CONSECUTIVE_FAIL_LIMIT) {
            addLog('⚠ 连续失败5次，已停止生成', 'error');
            setIsGenerating(false);
            abortedRef.current = true;
            return;
          }
          addLog('等待10秒后继续...', 'warn');
          await sleep(FAIL_PAUSE_MS, () => abortedRef.current);
        }
        completed++;
        // 这里用闭包变量进度（实时计算由 UI 端 derive）
        void completed;
      },
      () => abortedRef.current,
    );

    if (!abortedRef.current) setIsGenerating(false);
    else abortedRef.current = false;

    // 汇总
    const cur = useGenerationStore.getState().entries;
    const doneCount = cur.filter((e) => e.status === 'done').length;
    const failCount = cur.filter((e) => e.status === 'error').length;
    const savedCount = cur.filter((e) => e.saved).length;
    let summary = `生成完毕：成功 ${doneCount} 个`;
    if (failCount > 0) summary += `，失败 ${failCount} 个`;
    if (savedCount > 0) summary += `，已自动保存 ${savedCount} 个到目录`;
    addLog(summary, failCount > 0 ? 'warn' : 'success');
    push(summary, failCount > 0 ? 'warning' : 'success');
  }, [
    apiKey,
    entries,
    dirHandle,
    model,
    language,
    speed,
    vol,
    pitch,
    concurrency,
    audioFormat,
    sampleRate,
    langVoices,
    addLog,
    push,
    setIsGenerating,
    updateEntry,
  ]);

  const stop = useCallback(() => {
    abortedRef.current = true;
    setIsGenerating(false);
    addLog('用户手动停止', 'warn');
    push('已停止', 'warning');
  }, [setIsGenerating, addLog, push]);

  const retryFailed = useCallback(() => {
    const cur = useGenerationStore.getState().entries;
    cur.forEach((_, idx) => {
      const e = cur[idx];
      if (e?.status === 'error') updateEntry(idx, { status: 'pending', errorMsg: null, _retry: true });
    });
    void start();
  }, [start, updateEntry]);

  const retrySingle = useCallback(
    (idx: number) => {
      updateEntry(idx, { status: 'pending', errorMsg: null, _retry: true });
      void start();
    },
    [start, updateEntry],
  );

  const forceRetrySingle = useCallback(
    (idx: number) => {
      updateEntry(idx, { status: 'pending', errorMsg: null, _retry: true });
      const e = useGenerationStore.getState().entries[idx];
      addLog(`强制生成: ${e?.wordText ?? ''}`, 'info');
      void start();
    },
    [start, updateEntry, addLog],
  );

  return { start, stop, retryFailed, retrySingle, forceRetrySingle };
}
