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
}
