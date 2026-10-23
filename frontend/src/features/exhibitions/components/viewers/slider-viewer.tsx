import { SmartImage } from '@/components/smart-image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

import type { Exhibition } from '../../types'
import { CompareSlider } from './compare-slider'

type SliderViewerProps = { exhibition: Exhibition }

export function SliderViewer({ exhibition }: SliderViewerProps) {
  const { t, l } = useI18n()
  const track = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const count = exhibition.sections.length

  function go(next: number) {
    const clamped = Math.max(0, Math.min(count - 1, next))
    setIndex(clamped)
    const slide = track.current?.children[clamped]
    if (slide instanceof HTMLElement)
      slide.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
  }

  return (
    <div className="flex flex-col gap-6">
      <div
        ref={track}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4"
        onScroll={(event) => {
          const el = event.currentTarget
          setIndex(Math.round(el.scrollLeft / (el.clientWidth || 1)))
        }}
      >
        {exhibition.sections.map((section) => {
          const [first, second] = section.items
          return (
            <section
              key={section.id}
              aria-label={l(section.title)}
              className="grid w-full shrink-0 snap-start gap-6 lg:grid-cols-[3fr_2fr] lg:items-center"
            >
              {first && second ? (
                <CompareSlider before={first} after={second} />
              ) : (
                first && (
                  <SmartImage
                    src={first.imageUrl}
                    alt={l(first.title)}
                    className="aspect-[16/10] w-full rounded-lg object-cover"
                  />
                )
              )}
              <div className="flex flex-col gap-3">
                {section.year && (
                  <p className="font-heading text-4xl font-semibold text-gold">{section.year}</p>
                )}
                <h2 className="text-3xl font-semibold">{l(section.title)}</h2>
                <p className="text-lg leading-relaxed text-muted-foreground">{l(section.text)}</p>
              </div>
            </section>
          )
        })}
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="icon"
          onClick={() => go(index - 1)}
          disabled={index === 0}
          aria-label={t('viewer.prev')}
        >
          <ChevronLeft />
        </Button>
        <div className="flex gap-2" role="tablist" aria-label={t('viewer.stop')}>
          {exhibition.sections.map((section, i) => (
            <button
              key={section.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`${t('viewer.stop')} ${i + 1}`}
              onClick={() => go(i)}
              className={cn(
                'h-2 rounded-full transition-all',
                i === index ? 'w-8 bg-accent' : 'w-2 bg-border',
              )}
            />
          ))}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => go(index + 1)}
          disabled={index === count - 1}
          aria-label={t('viewer.next')}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  )
}
