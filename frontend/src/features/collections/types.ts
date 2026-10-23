import type { Localized } from '@/lib/i18n'

// A collection of the library's digital library, linked to dlib.me.
export type Collection = {
  name: Localized
  text: Localized
  href: string
  image: string
}
