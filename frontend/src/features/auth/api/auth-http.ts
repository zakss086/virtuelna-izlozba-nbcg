import { MAX_PAGE_SIZE, request, setSessionExpiredHandler, tokenStore, type Page } from '@/lib/http'

import type { User } from '../types'
import { DEMO_PASSWORD, demoUsers } from './auth-mock'

const USER_KEY = 'nbcg.user'
const listeners = new Set<() => void>()

let cached: { raw: string | null; user: User | null } = { raw: null, user: null }

function readSession(): User | null {
  let raw: string | null = null
  try {
    raw = tokenStore.get() ? localStorage.getItem(USER_KEY) : null
  } catch {
    return null
  }
  // The same object for the same stored text, as useSyncExternalStore requires.
  if (raw === cached.raw) return cached.user
  let user: User | null = null
  try {
    user = raw ? (JSON.parse(raw) as User) : null
  } catch {
    user = null
  }
  cached = { raw, user }
  return user
}

function emit() {
  listeners.forEach((listener) => listener())
}

function endSession() {
  tokenStore.clear()
  try {
    localStorage.removeItem(USER_KEY)
  } catch {
    // storage unavailable
  }
  emit()
}

// A token the server no longer accepts (expired, or the account is gone) signs the user out.
setSessionExpiredHandler(endSession)

// Staff sign-in against the backend: the token is kept in the browser and sent with every request.
export const httpAuthApi = {
  demoUsers,

  current: readSession,

  subscribe: (listener: () => void) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },

  signIn: async (email: string, password: string) => {
    const { token, user } = await request<{ token: string; user: User }>('POST', '/auth/sign-in', {
      body: { email: email.trim(), password },
    })
    tokenStore.set(token)
    try {
      localStorage.setItem(
        USER_KEY,
        JSON.stringify({ id: user.id, name: user.name, email: user.email, role: user.role }),
      )
    } catch {
      // storage unavailable
    }
    emit()
    return readSession() ?? user
  },

  signOut: endSession,

  list: async () => (await request<Page<User>>('GET', '/users', { query: { size: MAX_PAGE_SIZE } })).items,
}

export { DEMO_PASSWORD }
