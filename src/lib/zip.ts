/**
 * 用 fflate 打包并下载 ZIP
 */
import { zip, type Zippable } from 'fflate';

export async function makeZip(
  files: { filename: string; blob: Blob }[],
): Promise<Blob> {
  const entries: Zippable = {};
  for (const f of files) {
    entries[f.filename] = new Uint8Array(await f.blob.arrayBuffer());
  }
  return new Promise<Blob>((resolve, reject) => {
    zip(entries, { level: 0 }, (err, data) => {
      if (err) reject(err);
      else resolve(new Blob([data as BlobPart]));
    });
  });
}

export async function downloadZip(
  files: { name: string; data: Uint8Array }[],
  zipName: string,
): Promise<void> {
  if (files.length === 0) throw new Error('没有可打包的文件');

  const entries: Zippable = {};
  for (const f of files) entries[f.name] = f.data;

  const blob = await new Promise<Blob>((resolve, reject) => {
    zip(entries, { level: 0 }, (err, data) => {
      if (err) reject(err);
      else resolve(new Blob([data as BlobPart]));
    });
  });

  downloadBlob(blob, zipName);
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function blobToBytes(blob: Blob): Promise<Uint8Array> {
  return new Uint8Array(await blob.arrayBuffer());
}
