import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'

import { SmartImage } from '@/components/smart-image'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

const MIN_SCALE = 1
const MAX_SCALE = 5
const STEP = 0.5

type View = { scale: number; x: number; y: number }
const START: View = { scale: 1, x: 0, y: 0 }

type ZoomableImageProps = { src: string; alt: string; className?: string }

// An image you can zoom (wheel, buttons, + and - keys, double click) and move by dragging once it is enlarged.
export function ZoomableImage({ src, alt, className }: ZoomableImageProps) {
  const { t } = useI18n()
  const frame = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; y: number } | null>(null)
  const [view, setView] = useState<View>(START)
  const [dragging, setDragging] = useState(false)

  // Keeps the enlarged picture from being pulled out of the frame.
  const clamp = useCallback((next: View): View => {
    const box = frame.current?.getBoundingClientRect()
    const limitX = box ? (box.width * (next.scale - 1)) / 2 : 0
    const limitY = box ? (box.height * (next.scale - 1)) / 2 : 0
    return {
      scale: next.scale,
      x: Math.max(-limitX, Math.min(limitX, next.x)),
      y: Math.max(-limitY, Math.min(limitY, next.y)),
    }
  }, [])

  const zoom = useCallback(
    (delta: number) =>
      setView((current) => {
        const scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, current.scale + delta))
        return scale === MIN_SCALE ? START : clamp({ ...current, scale })
      }),
    [clamp],
  )

  // React attaches wheel listeners as passive, so the wheel is wired by hand to be able to stop the page scrolling.
  useEffect(() => {
    const node = frame.current
    if (!node) return
    function onWheel(event: WheelEvent) {
      event.preventDefault()
      zoom(event.deltaY < 0 ? STEP : -STEP)
    }
    node.addEventListener('wheel', onWheel, { passive: false })
    return () => node.removeEventListener('wheel', onWheel)
  }, [zoom])

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (view.scale === MIN_SCALE) return
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = { x: event.clientX - view.x, y: event.clientY - view.y }
    setDragging(true)
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const start = drag.current
    if (!start) return
    setView((current) => clamp({ ...current, x: event.clientX - start.x, y: event.clientY - start.y }))
  }

  function endDrag() {
    drag.current = null
    setDragging(false)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === '+' || event.key === '=') zoom(STEP)
    if (event.key === '-') zoom(-STEP)
    if (event.key === '0') setView(START)
  }

  return (
    <div
      role="group"
      aria-label={alt}
      onKeyDown={onKeyDown}
      className={cn('relative overflow-hidden bg-ink', className)}
    >
      <div
        ref={frame}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={() =>
          setView((current) => (current.scale === MIN_SCALE ? { ...START, scale: 2.5 } : START))
        }
        className={cn(
          'size-full touch-none',
          view.scale > MIN_SCALE ? (dragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in',
        )}
      >
        <SmartImage
          src={src}
          alt={alt}
          draggable={false}
          className="size-full object-contain transition-transform duration-150 select-none motion-reduce:transition-none"
          style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}
        />
      </div>
      <div className="absolute top-2 right-2 flex gap-1 rounded-md bg-ink/80 p-1 text-on-ink">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => zoom(STEP)}
          aria-label={t('item.zoomIn')}
          className="hover:bg-on-ink/10 hover:text-on-ink"
        >
          <ZoomIn />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => zoom(-STEP)}
          aria-label={t('item.zoomOut')}
          className="hover:bg-on-ink/10 hover:text-on-ink"
        >
          <ZoomOut />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setView(START)}
          aria-label={t('item.zoomReset')}
          className="hover:bg-on-ink/10 hover:text-on-ink"
        >
          <RotateCcw />
        </Button>
      </div>
    </div>
  )
}
