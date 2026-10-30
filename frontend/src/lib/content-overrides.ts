// Site texts an admin has edited (CMS). They sit over the default messages: `t(key)` looks here first.
// The `content` feature fills this store (through `app/content-sync.tsx`); `lib/` only holds it, so it imports nothing.

export type Localized = { me: string; en: string }
export type ContentOverrides = Readonly<Record<string, Localized>>

let overrides: ContentOverrides = {}
const listeners = new Set<() => void>()

export const contentOverrides = {
  get: (): ContentOverrides => overrides,

  set: (next: ContentOverrides) => {
    overrides = next
    listeners.forEach((listener) => listener())
  },

  subscribe: (listener: () => void) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
}
