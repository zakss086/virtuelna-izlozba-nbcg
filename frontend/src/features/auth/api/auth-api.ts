import { delay } from '@/lib/mock-db'

import type { User } from '../types'

// Mock accounts. The real backend replaces this with sessions or tokens next workshop.
export const DEMO_PASSWORD = 'demo1234'

const users: User[] = [
  { id: 1, name: 'Ana Perović', email: 'ana@visitor.me', role: 'visitor' },
  { id: 2, name: 'Marko Vuković', email: 'marko@nb-cg.me', role: 'curator' },
  { id: 3, name: 'Jelena Đurović', email: 'jelena@nb-cg.me', role: 'admin' },
  { id: 4, name: 'Nikola Radović', email: 'nikola@nb-cg.me', role: 'curator' },
]

const STORAGE_KEY = 'nbcg.session'
const listeners = new Set<() => void>()

let cached: { raw: string | null; user: User | null } = { raw: null, user: null }

function readSession(): User | null {
  let raw: string | null = null
  try {
    raw = localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
  if (raw === cached.raw) return cached.user
  const id = Number(raw)
  const user = raw ? (users.find((u) => u.id === id) ?? null) : null
  cached = { raw, user }
  return user
}

function emit() {
  listeners.forEach((listener) => listener())
}

export const authApi = {
  demoUsers: users,

  current: readSession,

  subscribe: (listener: () => void) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },

  signIn: async (email: string, password: string) => {
    const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
    await delay(undefined)
    if (!user || password !== DEMO_PASSWORD) throw new Error('INVALID_CREDENTIALS')
    try {
      localStorage.setItem(STORAGE_KEY, String(user.id))
    } catch {
      // storage unavailable
    }
    emit()
    return user
  },

  signOut: () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // storage unavailable
    }
    emit()
  },

  list: () => delay(users),
}
