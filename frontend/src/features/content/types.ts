import type { Localized } from '@/lib/i18n'

// A site text an admin has edited. Without a block, the site shows the default text of that message key.
export type ContentBlock = {
  key: string
  value: Localized
  updatedAt: string
}
