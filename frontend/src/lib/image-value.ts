// The picture of an exhibition object as the editor holds it. The editor (exhibitions) and the media library (media)
// meet through this shape, which is why it lives here and neither feature imports the other.
export type ImageValue = {
  /** Where the picture is served from; empty means none chosen (a placeholder is drawn). */
  url: string
  /** Author and licence, shown with the object. */
  rights: string
  /** The page of the original, when there is one. */
  sourceUrl: string
}

export const NO_IMAGE: ImageValue = { url: '', rights: '', sourceUrl: '' }
