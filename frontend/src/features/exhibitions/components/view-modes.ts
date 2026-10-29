import { TEMPLATES, type Exhibition, type ExhibitionTemplate } from '../types'

// Every viewer can show any exhibition, because all of them read the same sections and objects.
// The map is the exception: it needs a place for every section.
export function availableTemplates(exhibition: Exhibition): ExhibitionTemplate[] {
  const allPlaced = exhibition.sections.every((section) => section.place)
  return TEMPLATES.filter((template) => template === exhibition.template || template !== 'map' || allPlaced)
}

export function parseTemplate(value: string | null): ExhibitionTemplate | undefined {
  return TEMPLATES.find((template) => template === value)
}
