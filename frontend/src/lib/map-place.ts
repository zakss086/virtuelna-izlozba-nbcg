// A point of interest shown on the interactive map next to the libraries (e.g. a place from an exhibition).
export type MapPlace = {
  id: string
  title: string
  subtitle: string
  lat: number
  lng: number
  /** Internal route that opens the exhibition. */
  href: string
  imageUrl?: string
  /** The exhibition this stop belongs to, and its position in that exhibition (the stops form a route). */
  exhibitionId: number
  order: number
  /** The year of the section, when it has one (used by the time slider). */
  year?: number
}
