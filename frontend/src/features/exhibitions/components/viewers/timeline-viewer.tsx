import { SmartImage } from '@/components/smart-image'
import { useEffect, useRef, useState } from 'react'

import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

import type { Exhibition, ExhibitionItem } from '../../types'
import { ItemDialog } from '../item-dialog'

type TimelineViewerProps = { exhibition: Exhibition }

export function TimelineViewer({ exhibition }: TimelineViewerProps) {
  const { t, l } = useI18n()
  const [active, setActive] = useState(0)
  const [open, setOpen] = useState<ExhibitionItem | null>(null)
  const refs = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number(entry.target.getAttribute('data-index')))
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    refs.current.forEach((node) => node && observer.observe(node))
    return () => observer.disconnect()
  }, [exhibition.sections.length])

  const current = exhibition.sections[active] ?? exhibition.sections[0]
  const currentItem = current?.items[0]

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-16">
      <div className="hidden md:block">
        <div className="sticky top-24 flex flex-col gap-4">
          {currentItem && (
            <button
              type="button"
              onClick={() => setOpen(currentItem)}
              className="group overflow-hidden rounded-lg bg-ink focus-visible:outline-2 focus-visible:outline-ring"
              aria-label={l(currentItem.title)}
            >
              <SmartImage
                key={currentItem.id}
                src={currentItem.imageUrl}
                alt={l(currentItem.title)}
                className="aspect-[4/3] w-full animate-in fade-in object-cover duration-500 group-hover:scale-105"
              />
            </button>
          )}
          {current?.year && <p className="font-heading text-6xl font-semibold text-gold">{current.year}</p>}
          {currentItem && (
            <p className="text-sm text-muted-foreground">
              {l(currentItem.title)} · {currentItem.creator}
            </p>
          )}
        </div>
      </div>

      <ol className="relative border-l border-gold/40 pl-6 md:pl-8">
        {exhibition.sections.map((section, index) => (
          <li
            key={section.id}
            ref={(node) => {
              refs.current[index] = node
            }}
            data-index={index}
            className={cn(
              'relative flex min-h-[60vh] flex-col justify-center gap-4 py-8 transition-opacity',
              index !== active && 'md:opacity-40',
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                'absolute -left-[31px] top-1/2 size-3 -translate-y-1/2 rounded-full border-2 border-gold bg-background md:-left-[39px]',
                index === active && 'bg-accent',
              )}
            />
            {section.year && (
              <p className="font-heading text-3xl font-semibold text-gold md:hidden">{section.year}</p>
            )}
            <h2 className="text-3xl font-semibold">{l(section.title)}</h2>
            <p className="max-w-prose text-lg leading-relaxed text-muted-foreground">{l(section.text)}</p>
            {section.items[0] && (
              <button
                type="button"
                onClick={() => setOpen(section.items[0] ?? null)}
                className="overflow-hidden rounded-lg bg-ink md:hidden"
                aria-label={l(section.items[0].title)}
              >
                <SmartImage
                  src={section.items[0].imageUrl}
                  alt={l(section.items[0].title)}
                  className="aspect-[4/3] w-full object-cover"
                />
              </button>
            )}
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              {t('viewer.stop')} {index + 1} {t('viewer.of')} {exhibition.sections.length}
            </p>
          </li>
        ))}
      </ol>

      {open && <ItemDialog item={open} onClose={() => setOpen(null)} />}
    </div>
  )
}
