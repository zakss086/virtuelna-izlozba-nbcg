// Calls to the backend (`/api`, proxied to port 8000 in development). Used only by the `*-http.ts` files of
// the features' `api/` folders, and only when the app runs with `VITE_API_MODE=http` (`pnpm dev:api`).

export const USE_API = import.meta.env.VITE_API_MODE === 'http'

const API_BASE = '/api'
const TOKEN_KEY = 'nbcg.token'

export type FieldErrors = Record<string, string>

/** An error answer of the API: `{ detail, code, fieldErrors? }`, or `status` 0 when the server cannot be reached. */
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly fieldErrors?: FieldErrors

  constructor(status: number, code: string, message: string, fieldErrors?: FieldErrors) {
    super(message)
    this.status = status
    this.code = code
    this.fieldErrors = fieldErrors
  }
}

export const tokenStore = {
  get(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },
  set(token: string) {
    try {
      localStorage.setItem(TOKEN_KEY, token)
    } catch {
      // storage unavailable: the session lasts until the page is closed
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY)
    } catch {
      // storage unavailable
    }
  },
}

let onSessionExpired: () => void = () => undefined

/** The auth module registers what happens when the server says the token is no longer valid. */
export function setSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler
}

type RequestOptions = {
  body?: unknown
  query?: Record<string, string | number | undefined>
}

type ErrorBody = { detail?: string; code?: string; fieldErrors?: FieldErrors }

export async function request<T>(
  method: string,
  path: string,
  { body, query }: RequestOptions = {},
): Promise<T> {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== '') params.set(key, String(value))
  }
  const url = `${API_BASE}${path}${params.size > 0 ? `?${params}` : ''}`

  const token = tokenStore.get()
  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let response: Response
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, 'network_error', 'The server cannot be reached')
  }

  if (response.status === 204) return undefined as T
  const text = await response.text()
  const parsed: unknown = text ? JSON.parse(text) : null

  if (!response.ok) {
    const error = (parsed ?? {}) as ErrorBody
    if (response.status === 401 && token && error.code === 'invalid_token') onSessionExpired()
    throw new ApiError(
      response.status,
      error.code ?? 'http_error',
      error.detail ?? response.statusText,
      error.fieldErrors,
    )
  }
  return parsed as T
}

/** The API answers `null` for what the frontend types call optional (`year?: number`); this drops those keys. */
export function withoutNulls<T>(value: unknown): T {
  if (Array.isArray(value)) return value.map((item) => withoutNulls(item)) as T
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, item]) => item !== null)
        .map(([key, item]) => [key, withoutNulls(item)]),
    ) as T
  }
  return value as T
}

/** A list answer of the API: `?page=&size=` (size at most 500), newest first. */
export type Page<T> = { total: number; items: T[]; pages: number | null }
export const MAX_PAGE_SIZE = 500
