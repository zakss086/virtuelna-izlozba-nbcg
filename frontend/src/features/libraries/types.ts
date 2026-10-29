export const LIBRARY_TYPES = ['national', 'university', 'public', 'special'] as const
export type LibraryType = (typeof LIBRARY_TYPES)[number]

// exact: coordinates of the library or its building; town: centre of the town (approximate).
export type LocationPrecision = 'exact' | 'town'

export type LibraryLocation = {
  lat: number
  lng: number
  precision: LocationPrecision
}

// A library in Montenegro. Names are proper nouns, so they are not translated.
export type Library = {
  id: number
  name: string
  type: LibraryType
  city: string
  address?: string
  website?: string
  email?: string
  phone?: string
  /** Missing when no trustworthy position is known; the library is then listed without a pin. */
  location?: LibraryLocation
}
