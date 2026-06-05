/**
 * 文本处理工具：文件名安全、HTML 转义
 */

export function sanitizeFilename(text: string): string {
  return text
    .replace(/\s+/g, '')
    .replace(/[<>:"/\\|?*']+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .substring(0, 80);
}

export function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
