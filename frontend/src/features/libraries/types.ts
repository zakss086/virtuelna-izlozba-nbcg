import type { Localized } from '@/lib/i18n'

export const LIBRARY_TYPES = ['national', 'university', 'public', 'special'] as const
export type LibraryType = (typeof LIBRARY_TYPES)[number]

// exact: coordinates of the library or its building; town: centre of the town (approximate).
export type LocationPrecision = 'exact' | 'town'

export type LibraryLocation = {
  lat: number
  lng: number
  precision: LocationPrecision
}

// A freely licensed photo of the building, with the credit that has to be shown next to it.
export type LibraryImage = {
  url: string
  credit: string
  license: string
  sourceUrl: string
}

export type Library = {
  id: number
  name: string
  type: LibraryType
  city: string
  address?: string
  website?: string
  email?: string
  phone?: string
  /** Short verified facts about the library; only written where a source states them. */
  description?: Localized
  /** Missing when no free photo of the building is known; a neutral placeholder is shown instead. */
  image?: LibraryImage
  /** Missing when no trustworthy position is known; the library is then listed without a pin. */
  location?: LibraryLocation
}

/** What an admin enters: a library without its id. */
export type NewLibrary = Omit<Library, 'id'>

// What is selected on the interactive map: a library or a place from an exhibition.
export type MapSelection = { kind: 'library'; id: number } | { kind: 'place'; id: string }
