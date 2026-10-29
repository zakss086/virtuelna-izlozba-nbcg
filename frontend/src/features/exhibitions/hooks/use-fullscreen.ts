import { useCallback, useEffect, useRef, useState } from 'react'

// Full screen for one element (the viewer). `supported` is false where the browser has no such mode, e.g. iPhone.
export function useFullscreen<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [active, setActive] = useState(false)
  const supported = typeof document !== 'undefined' && document.fullscreenEnabled

  useEffect(() => {
    const update = () =>
      setActive(document.fullscreenElement !== null && document.fullscreenElement === ref.current)
    document.addEventListener('fullscreenchange', update)
    return () => document.removeEventListener('fullscreenchange', update)
  }, [])

  const toggle = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen()
    else void ref.current?.requestFullscreen()
  }, [])

  return { ref, active, supported, toggle }
}
