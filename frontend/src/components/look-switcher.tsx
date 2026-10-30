import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

const LOOKS = [
  { id: '', label: 'Original' },
  { id: 'a', label: 'A Galerija' },
  { id: 'b', label: 'B Kabinet' },
  { id: 'c', label: 'C Rukopis' },
] as const

const KEY = 'nbcg.look'

function readLook() {
  try {
    return localStorage.getItem(KEY) ?? ''
  } catch {
    return ''
  }
}

// TEMPORARY: lets the three proposed looks be compared on the real site. Removed once one is chosen.
export function LookSwitcher() {
  const [look, setLook] = useState(readLook)

  useEffect(() => {
    const root = document.documentElement
    const wasDark = root.dataset.lookWasDark ?? String(root.classList.contains('dark'))
    root.dataset.lookWasDark = wasDark
    if (look) root.dataset.look = look
    else delete root.dataset.look
    // The cabinet look is always dark; leaving it restores the visitor's own theme.
    if (look === 'b') root.classList.add('dark')
    else root.classList.toggle('dark', wasDark === 'true')
    try {
      localStorage.setItem(KEY, look)
    } catch {
      // storage unavailable
    }
  }, [look])

  return (
    <div
      role="group"
      aria-label="Izgled"
      className="fixed bottom-4 left-4 z-50 flex gap-1 rounded-full border bg-card p-1 text-xs shadow-lg print:hidden"
    >
      {LOOKS.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => setLook(option.id)}
          aria-pressed={look === option.id}
          className={cn(
            'rounded-full px-3 py-1.5 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring',
            look === option.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
