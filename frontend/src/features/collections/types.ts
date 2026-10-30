import type { Localized } from '@/lib/i18n'

// A collection of the library's digital library, linked to dlib.me.
export type Collection = {
  id: number
  name: Localized
  text: Localized
  href: string
  image: string
  /** Collections are shown in the order of their position. */
  position: number
}

export type NewCollection = Omit<Collection, 'id'>
