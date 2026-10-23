const STORAGE_KEY = 'nbcg.favorites'
const listeners = new Set<() => void>()

let cached: { raw: string | null; ids: number[] } = { raw: null, ids: [] }

function read(): number[] {
  let raw: string | null = null
  try {
    raw = localStorage.getItem(STORAGE_KEY)
  } catch {
    return cached.ids
  }
  if (raw === cached.raw) return cached.ids
  let ids: number[] = []
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : []
    ids = Array.isArray(parsed) ? parsed.filter((v): v is number => typeof v === 'number') : []
  } catch {
    ids = []
  }
  cached = { raw, ids }
  return ids
}

export const favoritesStore = {
  get: read,
  subscribe: (listener: () => void) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
  toggle: (id: number) => {
    const current = read()
    const next = current.includes(id) ? current.filter((v) => v !== id) : [...current, id]
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // storage unavailable
    }
    listeners.forEach((listener) => listener())
  },
}
