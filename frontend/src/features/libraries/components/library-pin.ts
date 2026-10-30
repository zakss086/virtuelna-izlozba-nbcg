import type { LibraryType } from '../types'

// Simple line icons (24 x 24 grid) for the four kinds of library, shared by the map pins and the legend.
// They are constants in this file, never built from user data.
export const TYPE_ICON_PATHS: Record<LibraryType, string> = {
  // columns under a pediment
  national: '<path d="M3 21h18M5 21V10M9.5 21V10M14.5 21V10M19 21V10M3 10l9-6 9 6z"/>',
  // a graduation cap
  university: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2.5 9 2.5 12 0v-5"/>',
  // an open book
  public:
    '<path d="M12 6c-2-1.5-5-2-8-1.5V18c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V4.5C17 4 14 4.5 12 6z"/><path d="M12 6v13.5"/>',
  // an archive box
  special: '<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v10h14V9M10 13h4"/>',
}

// Colors per kind, from the design tokens (the map tiles stay light in both themes).
export const TYPE_PIN_CLASSES: Record<LibraryType, string> = {
  national: 'bg-accent text-accent-foreground',
  university: 'bg-ink text-on-ink',
  public: 'bg-plate text-ink',
  special: 'bg-gold text-on-ink',
}

export function typeIconSvg(type: LibraryType, size: number) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${TYPE_ICON_PATHS[type]}</svg>`
}
