import { useEffect } from 'react';

type Combo = {
  /** 'mod' = Cmd on macOS, Ctrl elsewhere */
  key: string;
  mod?: boolean;
  shift?: boolean;
  alt?: boolean;
};

type Options = {
  /** 忽略事件的元素选择器（如 textarea、input） */
  ignoreIn?: string;
  /** 是否启用 */
  enabled?: boolean;
};

const isMac =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

function parseEvent(e: KeyboardEvent, combo: Combo): boolean {
  if (e.key.toLowerCase() !== combo.key.toLowerCase()) return false;
  if (combo.mod && !(isMac ? e.metaKey : e.ctrlKey)) return false;
  if ((combo.mod === undefined || !combo.mod) && (e.metaKey || e.ctrlKey)) return false;
  if (combo.shift && !e.shiftKey) return false;
  if ((combo.shift === undefined || !combo.shift) && e.shiftKey) return false;
  if (combo.alt && !e.altKey) return false;
  if ((combo.alt === undefined || !combo.alt) && e.altKey) return false;
  return true;
}

/**
 * 注册全局键盘快捷键
 */
export function useKeyboardShortcut(
  combo: Combo,
  handler: (e: KeyboardEvent) => void,
  options: Options = {},
): void {
  const { ignoreIn = 'input, textarea, [contenteditable="true"]', enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;
    function onKeyDown(e: KeyboardEvent) {
      if (!parseEvent(e, combo)) return;
      const target = e.target as HTMLElement | null;
      if (target && target.closest(ignoreIn)) return;
      e.preventDefault();
      handler(e);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [combo.key, combo.mod, combo.shift, combo.alt, handler, ignoreIn, enabled]);
}
