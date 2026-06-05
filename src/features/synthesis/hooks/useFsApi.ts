/**
 * File System Access API 在合成页中的使用
 */
import { useCallback, useEffect } from 'react';
import { useGenerationStore } from '@/store/useGenerationStore';
import { isFsApiSupported, pickDirectory, existsInDir, writeFileToDir } from '@/lib/fs-api';
import { useToastStore } from '@/store/useToastStore';

export function useFsApi() {
  const dirHandle = useGenerationStore((s) => s.dirHandle);
  const setDirHandle = useGenerationStore((s) => s.setDirHandle);
  const push = useToastStore((s) => s.push);

  const supported = isFsApiSupported();

  useEffect(() => {
    // 保留目录名显示
    if (dirHandle) {
      // 兼容原 tts_save_dir_name
      try {
        localStorage.setItem('tts_save_dir_name', dirHandle.name);
      } catch {
        // ignore
      }
    }
  }, [dirHandle]);

  const select = useCallback(async () => {
    if (!supported) {
      push('当前浏览器不支持目录选择，请使用 Chrome / Edge', 'warning');
      return;
    }
    try {
      const handle = await pickDirectory();
      setDirHandle(handle);
      push(`保存目录已设置: ${handle.name}`, 'success');
    } catch (e) {
      if ((e as { name?: string }).name !== 'AbortError') {
        push(`目录选择失败: ${(e as Error).message}`, 'error');
      }
    }
  }, [supported, setDirHandle, push]);

  const clear = useCallback(() => {
    setDirHandle(null);
    push('已取消保存目录', 'success');
  }, [setDirHandle, push]);

  return { dirHandle, supported, select, clear, existsInDir, writeFileToDir };
}
