import { create } from 'zustand'

export type ToastVariant = 'info' | 'success' | 'error'

interface Toast {
  id: number
  message: string
  variant: ToastVariant
}

interface ToastState {
  current: Toast | null
  /** Show a toast. Replaces any currently-visible toast (FIFO is not worth the complexity here). */
  show: (message: string, variant?: ToastVariant) => void
  /** Hide explicitly. Called by the Toast component when the auto-dismiss timer fires. */
  dismiss: (id?: number) => void
}

let nextId = 1

export const useToastStore = create<ToastState>((set, get) => ({
  current: null,
  show(message, variant = 'info') {
    set({ current: { id: nextId++, message, variant } })
  },
  dismiss(id) {
    const cur = get().current
    if (!cur) return
    if (id === undefined || cur.id === id) {
      set({ current: null })
    }
  },
}))

/** Imperative shortcut for non-React code (e.g. apiFetch error paths). */
export const toast = {
  info: (msg: string) => useToastStore.getState().show(msg, 'info'),
  success: (msg: string) => useToastStore.getState().show(msg, 'success'),
  error: (msg: string) => useToastStore.getState().show(msg, 'error'),
}
