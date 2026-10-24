import { useSyncExternalStore } from 'react'

export type ToastKind = 'success' | 'error'
export type Toast = { id: number; kind: ToastKind; message: string }

const DURATION_MS: Record<ToastKind, number> = { success: 5000, error: 8000 }

let toasts: Toast[] = []
let nextId = 1
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

export function dismissToast(id: number) {
  toasts = toasts.filter((toast) => toast.id !== id)
  emit()
}

// Shows a short message in the corner; it disappears by itself.
export function showToast(kind: ToastKind, message: string) {
  const id = nextId++
  toasts = [...toasts, { id, kind, message }]
  emit()
  window.setTimeout(() => dismissToast(id), DURATION_MS[kind])
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useToasts(): Toast[] {
  return useSyncExternalStore(subscribe, () => toasts)
}
