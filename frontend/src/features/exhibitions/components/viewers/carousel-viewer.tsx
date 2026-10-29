import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'

import { SmartImage } from '@/components/smart-image'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

import { useMediaQuery } from '../../hooks/use-media-query'
import type { Exhibition } from '../../types'
import { ItemDialog } from '../item-dialog'

const MIN_SLOTS = 8
const AUTOPLAY_MS = 4500
const SWIPE_PX = 40

const mod = (n: number, m: number) => ((n % m) + m) % m

type CarouselViewerProps = { exhibition: Exhibition }

// Objects stand in a ring that turns in 3D; the one in front is the active one. Few objects are repeated around
// the ring so it is always full. It turns by itself until paused, hovered or focused, and not at all with
// reduced motion.
export function CarouselViewer({ exhibition }: CarouselViewerProps) {
  const { t, l } = useI18n()
  const wide = useMediaQuery('(min-width: 768px)')
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)')

  const entries = exhibition.sections.flatMap((section) => section.items.map((item) => ({ item, section })))
  const count = entries.length
  const slots = count * Math.max(1, Math.ceil(MIN_SLOTS / Math.max(count, 1)))

  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [held, setHeld] = useState(false)
  const [opened, setOpened] = useState<number | null>(null)
  const swipeStart = useRef<number | null>(null)
  const swiped = useRef(false)

  const autoplay = playing && !held && !reduced && opened === null && count > 1

  useEffect(() => {
    if (!autoplay) return
    const id = window.setInterval(() => setStep((s) => s + 1), AUTOPLAY_MS)
    return () => window.clearInterval(id)
  }, [autoplay])

  const current = count === 0 ? undefined : entries[mod(step, slots) % count]
  if (!current) return null

  const cardWidth = wide ? 224 : 148
  const cardHeight = Math.round((cardWidth * 5) / 4)
  const angle = 360 / slots
  const radius = Math.round(cardWidth / 2 / Math.tan(Math.PI / slots)) + 24
  const activeIndex = mod(step, slots) % count
  const { item, section } = current

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowRight') setStep((s) => s + 1)
    if (event.key === 'ArrowLeft') setStep((s) => s - 1)
  }

  return (
    <>
      <div role="region" aria-label={t('tpl.carousel')} onKeyDown={onKeyDown} className="flex flex-col gap-6">
        <div
          className="relative touch-pan-y overflow-hidden rounded-lg bg-ink py-10 text-on-ink"
          onMouseEnter={() => setHeld(true)}
          onMouseLeave={() => setHeld(false)}
          onFocus={() => setHeld(true)}
          onBlur={() => setHeld(false)}
          onPointerDown={(event) => {
            swipeStart.current = event.clientX
            swiped.current = false
          }}
          onPointerUp={(event) => {
            if (swipeStart.current === null) return
            const dx = event.clientX - swipeStart.current
            swipeStart.current = null
            if (Math.abs(dx) < SWIPE_PX) return
            swiped.current = true
            setStep((s) => s + (dx < 0 ? 1 : -1))
          }}
        >
          <span aria-hidden="true" className="pointer-events-none absolute inset-3 border border-accent/30" />
          <div
            className="relative mx-auto flex items-center justify-center"
            style={{ height: cardHeight + 48, perspective: '1600px' }}
          >
            <div
              className="relative"
              style={{
                width: cardWidth,
                height: cardHeight,
                transformStyle: 'preserve-3d',
                transform: `translateZ(${-radius}px) rotateY(${-step * angle}deg)`,
                transition: reduced ? 'none' : 'transform 900ms cubic-bezier(0.22, 0.8, 0.3, 1)',
              }}
            >
              {Array.from({ length: slots }, (_, i) => {
                const entry = entries[i % count]
                if (!entry) return null
                const offset = mod(i - step, slots)
                const signed = offset > slots / 2 ? offset - slots : offset
                const front = signed === 0
                return (
                  <button
                    key={i}
                    type="button"
                    inert={Math.abs(signed) > 1}
                    aria-label={l(entry.item.title)}
                    aria-current={front}
                    onClick={() => {
                      if (swiped.current) return
                      if (front) setOpened(i % count)
                      else setStep(step + signed)
                    }}
                    className="group absolute inset-0 overflow-hidden rounded-sm border border-accent/60 bg-ink shadow-lg focus-visible:outline-2 focus-visible:outline-ring"
                    style={{
                      transform: `rotateY(${i * angle}deg) translateZ(${radius}px)`,
                      backfaceVisibility: 'hidden',
                    }}
                  >
                    <SmartImage
                      src={entry.item.imageUrl}
                      alt=""
                      draggable={false}
                      className="size-full object-cover"
                    />
                    <span
                      aria-hidden="true"
                      className={cn(
                        'pointer-events-none absolute inset-0 bg-ink transition-opacity duration-500',
                        front ? 'opacity-0' : 'opacity-50',
                      )}
                    />
                    <span aria-hidden="true" className="pointer-events-none absolute inset-2 border border-accent/60" />
                  </button>
                )
              })}
            </div>
          </div>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-4 left-1/2 h-4 w-3/5 -translate-x-1/2 rounded-full bg-accent/20 blur-xl"
          />
        </div>

        <div className="mx-auto flex w-full max-w-md items-center justify-between gap-4">
          <Button variant="outline" size="icon" onClick={() => setStep(step - 1)} aria-label={t('viewer.prev')}>
            <ChevronLeft />
          </Button>
          <div className="flex items-center gap-3">
            {!reduced && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPlaying(!playing)}
                aria-label={playing ? t('viewer.pause') : t('viewer.play')}
              >
                {playing ? <Pause /> : <Play />}
              </Button>
            )}
            <p aria-live="polite" className="text-sm text-muted-foreground">
              {t('viewer.position', { a: activeIndex + 1, b: count })}
            </p>
          </div>
          <Button variant="outline" size="icon" onClick={() => setStep(step + 1)} aria-label={t('viewer.next')}>
            <ChevronRight />
          </Button>
        </div>

        <div className="mx-auto max-w-2xl text-center" aria-live={autoplay ? 'off' : 'polite'}>
          <p className="text-sm font-medium tracking-widest text-gold uppercase">{l(section.title)}</p>
          <h2 className="mt-2 text-3xl font-semibold">{l(item.title)}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {[item.creator, item.year, t(`type.${item.type}`)].filter(Boolean).join(' · ')}
          </p>
          <p className="mt-4 text-muted-foreground">{l(section.text)}</p>
          <Button className="mt-6" variant="outline" onClick={() => setOpened(activeIndex)}>
            {t('viewer.details')}
          </Button>
        </div>
        <p className="text-center text-sm text-muted-foreground">{t('viewer.carouselHint')}</p>
      </div>

      {opened !== null && entries[opened] && (
        <ItemDialog
          item={entries[opened].item}
          onClose={() => setOpened(null)}
          onPrev={opened > 0 ? () => setOpened(opened - 1) : undefined}
          onNext={opened < count - 1 ? () => setOpened(opened + 1) : undefined}
        />
      )}
    </>
  )
}
