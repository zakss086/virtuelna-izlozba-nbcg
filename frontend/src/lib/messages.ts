import { en } from './messages-en'
import { me } from './messages-me'

// UI strings for both languages. Montenegrin uses the Latin script.
// Add a key in messages-me.ts and messages-en.ts for every new piece of UI copy; never hardcode text in components.
export const messages = { me, en }

export type MessageKey = keyof typeof me
