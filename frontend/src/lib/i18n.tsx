import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'

import { contentOverrides } from '@/lib/content-overrides'
import { messages, type MessageKey } from '@/lib/messages'

export type Lang = 'me' | 'en'
export type Localized = { me: string; en: string }

type I18nValue = {
  lang: Lang
  setLang: (lang: Lang) => void
  /** Translate a UI key. `{n}` style placeholders are replaced from `vars`. */
  t: (key: MessageKey, vars?: Record<string, string | number>) => string
  /** Pick the current language from a localized content field. */
  l: (value: Localized) => string
}

const STORAGE_KEY = 'nbcg.lang'
const I18nContext = createContext<I18nValue | null>(null)

function readInitialLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'me' || stored === 'en') return stored
  } catch {
    // storage unavailable: fall through to the default
  }
  return 'me'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readInitialLang)
  // Texts an admin edited in the CMS replace the default message of the same key.
  const edited = useSyncExternalStore(contentOverrides.subscribe, contentOverrides.get)

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // ignore storage errors
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang === 'me' ? 'sr-Latn-ME' : 'en'
  }, [lang])

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      setLang,
      t: (key, vars) => {
        let text: string = edited[key]?.[lang] ?? messages[lang][key]
        if (vars) for (const [name, v] of Object.entries(vars)) text = text.replace(`{${name}}`, String(v))
        return text
      },
      l: (localized) => localized[lang],
    }),
    [lang, setLang, edited],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider')
  return ctx
}
