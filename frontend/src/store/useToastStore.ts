import { create } from "zustand";

export type ToastTone = "success" | "error" | "info";

export interface Toast {
  id: number;
  tone: ToastTone;
  message: string;
}

// How long a toast stays on screen before dismissing itself. Errors linger
// longer because they usually need reading rather than just acknowledging.
const DISMISS_AFTER: Record<ToastTone, number> = {
  success: 3500,
  info: 3500,
  error: 6000,
};

let nextId = 1;

interface ToastState {
  toasts: Toast[];
  show: (tone: ToastTone, message: string) => void;
  dismiss: (id: number) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  show: (tone, message) => {
    const id = nextId++;

    set((state) => ({ toasts: [...state.toasts, { id, tone, message }] }));

    window.setTimeout(() => get().dismiss(id), DISMISS_AFTER[tone]);
  },

  dismiss: (id) => {
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }));
  },
}));

/**
 * Convenience wrapper so callers read as `toast.success("Grade saved.")`
 * rather than reaching into the store. Usable outside React too, which is
 * why it reads `getState()` rather than being a hook.
 */
export const toast = {
  success: (message: string) => useToastStore.getState().show("success", message),
  error: (message: string) => useToastStore.getState().show("error", message),
  info: (message: string) => useToastStore.getState().show("info", message),
};
