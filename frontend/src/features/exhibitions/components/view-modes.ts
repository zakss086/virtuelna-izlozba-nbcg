import { TEMPLATES, type Exhibition, type ExhibitionTemplate } from '../types'

// Every viewer can show any exhibition, because all of them read the same sections and objects.
// The map is the exception: it needs a place for every section.
export function availableTemplates(exhibition: Exhibition): ExhibitionTemplate[] {
  // The curator can fix the way the exhibition is shown; then there is nothing to choose.
  if (exhibition.allowViewSwitch === false) return [exhibition.template]
  const allPlaced = exhibition.sections.every((section) => section.place)
  return TEMPLATES.filter((template) => template === exhibition.template || template !== 'map' || allPlaced)
}

export function parseTemplate(value: string | null): ExhibitionTemplate | undefined {
  return TEMPLATES.find((template) => template === value)
}
