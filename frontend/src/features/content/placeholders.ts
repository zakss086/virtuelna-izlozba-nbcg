// A text may contain marks such as `{title}` that the site fills in (a name, a number). Editing a text must keep them.
const MARK = /\{[a-zA-Z]+\}/g

export function marksOf(text: string): string[] {
  return [...new Set(text.match(MARK) ?? [])]
}

/** The marks of the default text that the edited text no longer has. */
export function missingMarks(defaultText: string, edited: string): string[] {
  return marksOf(defaultText).filter((mark) => !edited.includes(mark))
}
