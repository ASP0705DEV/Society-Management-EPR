import { create } from "zustand";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
  fieldName?: string;
  duration?: number;
  timestamp: number;
}

interface ToastState {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, "id" | "timestamp">) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newToast: ToastItem = {
      ...toast,
      id,
      timestamp: Date.now(),
      duration: toast.duration ?? 4000,
    };
    set((state) => ({
      // Keep up to 5 most recent toasts
      toasts: [...state.toasts.slice(-4), newToast],
    }));

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, newToast.duration);
    }

    return id;
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  clearToasts: () => set({ toasts: [] }),
}));

/**
 * Convenient imperative helper to trigger toasts anywhere in the app
 */
export const toast = {
  success: (message: string, title?: string, duration?: number) =>
    useToastStore.getState().addToast({ type: "success", message, title, duration }),
  error: (message: string, title?: string, duration?: number) =>
    useToastStore.getState().addToast({ type: "error", message, title, duration }),
  info: (message: string, title?: string, duration?: number) =>
    useToastStore.getState().addToast({ type: "info", message, title, duration }),
  warning: (message: string, title?: string, duration?: number) =>
    useToastStore.getState().addToast({ type: "warning", message, title, duration }),
  field: (fieldName: string, message: string, type: ToastType = "warning", duration?: number) =>
    useToastStore.getState().addToast({
      type,
      fieldName,
      title: `${fieldName} Notice`,
      message,
      duration: duration ?? 3500,
    }),
  dismiss: (id: string) => useToastStore.getState().removeToast(id),
};
