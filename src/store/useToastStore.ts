/**
 * Toast 队列 store
 * 用法: const id = useToast.getState().push('消息', 'success')
 *       useToast.getState().dismiss(id)
 */
import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning';

export type ToastItem = {
  id: number;
  msg: string;
  type: ToastType;
};

type ToastState = {
  toasts: ToastItem[];
  push: (msg: string, type?: ToastType) => number;
  dismiss: (id: number) => void;
};

let counter = 0;

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],
  push: (msg, type = 'success') => {
    const id = ++counter;
    set((s) => ({ toasts: [...s.toasts, { id, msg, type }] }));
    return id;
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/** 简化的全局函数，方便非组件中调用 */
export function showToast(msg: string, type: ToastType = 'success'): void {
  useToastStore.getState().push(msg, type);
}
