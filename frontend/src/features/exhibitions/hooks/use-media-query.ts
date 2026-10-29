import { useEffect, useState } from 'react'

// Tracks a CSS media query, e.g. `(min-width: 768px)` or `(prefers-reduced-motion: reduce)`.
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const list = window.matchMedia(query)
    const update = () => setMatches(list.matches)
    update()
    list.addEventListener('change', update)
    return () => list.removeEventListener('change', update)
  }, [query])

  return matches
}
