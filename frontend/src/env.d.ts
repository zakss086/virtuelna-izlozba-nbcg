/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** `http` talks to the backend through `/api`; anything else (the default) uses the in-browser mock data. */
  readonly VITE_API_MODE?: 'mock' | 'http'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
