/**
 * File System Access API 包装
 * 浏览器不支持时回退到内存模式（ZIP 下载）
 */
declare global {
  interface Window {
    showDirectoryPicker?: (options?: { mode?: 'read' | 'readwrite' }) => Promise<FileSystemDirectoryHandle>;
  }
}

export function isFsApiSupported(): boolean {
  return typeof window !== 'undefined' && typeof window.showDirectoryPicker === 'function';
}

export async function pickDirectory(): Promise<FileSystemDirectoryHandle> {
  if (!isFsApiSupported()) {
    throw new Error('当前浏览器不支持目录选择，请使用 Chrome / Edge');
  }
  return await window.showDirectoryPicker!({ mode: 'readwrite' });
}

export async function existsInDir(
  dir: FileSystemDirectoryHandle,
  filename: string,
): Promise<boolean> {
  try {
    await dir.getFileHandle(filename);
    return true;
  } catch {
    return false;
  }
}

export async function writeFileToDir(
  dir: FileSystemDirectoryHandle,
  filename: string,
  blob: Blob,
): Promise<boolean> {
  try {
    const handle = await dir.getFileHandle(filename, { create: true });
    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
    return true;
  } catch (e) {
    console.error('写入文件失败:', filename, e);
    return false;
  }
}
