import { useState, type ImgHTMLAttributes } from 'react'

import { makeArt } from '@/lib/art'

type SmartImageProps = ImgHTMLAttributes<HTMLImageElement>

// Image that falls back to a generated placeholder if the remote file cannot be loaded.
export function SmartImage({ src, alt = '', onError, ...rest }: SmartImageProps) {
  const [failed, setFailed] = useState(false)
  const shown = failed || !src ? makeArt('photo', alt || 'NBCG', '', false) : src

  return (
    <img
      {...rest}
      src={shown}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={(event) => {
        setFailed(true)
        onError?.(event)
      }}
    />
  )
}
