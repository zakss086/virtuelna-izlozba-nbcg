// Lower-cases and strips diacritics so "Nikšić", "niksic" and "NIKŠIĆ" compare equal.
export function normalizeText(text: string) {
  return text
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/đ/g, 'd')
}
