import { ApiError } from '@/lib/http'
import { delay } from '@/lib/mock-db'

import type { NewUser, User, UserChanges } from '../types'

// Mock accounts for `pnpm dev`. With the backend (`pnpm dev:api`) the same accounts exist there (`poetry run seed`).
export const DEMO_PASSWORD = 'demo1234'

// The three accounts offered on the sign-in page; accounts an admin creates in the mock live only in `accounts`.
export const demoUsers: User[] = [
  { id: 2, name: 'Marko Vuković', email: 'marko@nb-cg.me', role: 'curator', isActive: true },
  { id: 3, name: 'Jelena Đurović', email: 'jelena@nb-cg.me', role: 'admin', isActive: true },
  { id: 4, name: 'Nikola Radović', email: 'nikola@nb-cg.me', role: 'curator', isActive: true },
]

let accounts: User[] = demoUsers.map((user) => ({ ...user }))
const passwords = new Map<number, string>()

function passwordOf(id: number) {
  return passwords.get(id) ?? DEMO_PASSWORD
}

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
  const found = raw ? accounts.find((u) => u.id === id) : undefined
  const user = found?.isActive ? found : null
  cached = { raw, user }
  return user
}

function emit() {
  listeners.forEach((listener) => listener())
}

export const mockAuthApi = {
  demoUsers,

  current: readSession,

  subscribe: (listener: () => void) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },

  signIn: async (email: string, password: string) => {
    const user = accounts.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
    await delay(undefined)
    if (!user || password !== passwordOf(user.id)) {
      throw new ApiError(401, 'invalid_credentials', 'Wrong email or password')
    }
    if (!user.isActive) throw new ApiError(403, 'account_disabled', 'This account is switched off')
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

  list: () => delay(accounts),

  create: async (data: NewUser) => {
    await delay(undefined)
    const email = data.email.trim().toLowerCase()
    if (accounts.some((u) => u.email === email)) {
      throw new ApiError(409, 'email_already_registered', 'Email is already registered', { email: 'taken' })
    }
    const id = Math.max(0, ...accounts.map((u) => u.id)) + 1
    const user: User = { id, name: data.name, email, role: data.role, isActive: true }
    accounts = [...accounts, user]
    passwords.set(id, data.password)
    return user
  },

  update: async (id: number, changes: UserChanges) => {
    await delay(undefined)
    const user = accounts.find((u) => u.id === id)
    if (!user) throw new ApiError(404, 'user_not_found', 'User not found')
    const { password, ...fields } = changes
    if (password) passwords.set(id, password)
    const updated = { ...user, ...fields }
    accounts = accounts.map((u) => (u.id === id ? updated : u))
    return updated
  },
}
