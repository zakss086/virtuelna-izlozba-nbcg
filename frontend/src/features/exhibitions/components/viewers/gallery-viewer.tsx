import { SmartImage } from '@/components/smart-image'
import { useState } from 'react'

import { useI18n } from '@/lib/i18n'

import type { Exhibition } from '../../types'
import { ItemDialog } from '../item-dialog'

type GalleryViewerProps = { exhibition: Exhibition }

export function GalleryViewer({ exhibition }: GalleryViewerProps) {
  const { t, l } = useI18n()
  const all = exhibition.sections.flatMap((s) => s.items)
  const [index, setIndex] = useState<number | null>(null)
  const selected = index === null ? null : all[index]

  return (
    <div className="flex flex-col gap-12">
      {exhibition.sections.map((section) => (
        <section key={section.id} aria-labelledby={`g-${section.id}`}>
          <h2 id={`g-${section.id}`} className="text-3xl font-semibold">
            {l(section.title)}
          </h2>
          <p className="mt-2 max-w-prose text-muted-foreground">{l(section.text)}</p>
          <ul className="mt-6 columns-1 gap-4 sm:columns-2 lg:columns-3">
            {section.items.map((item, i) => (
              <li key={item.id} className="mb-4 break-inside-avoid">
                <button
                  type="button"
                  onClick={() => setIndex(all.findIndex((x) => x.id === item.id))}
                  className="group relative block w-full overflow-hidden rounded-lg bg-ink focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <SmartImage
                    src={item.imageUrl}
                    alt={l(item.title)}
                    loading="lazy"
                    className={`w-full object-cover transition-transform duration-500 group-hover:scale-105 ${i % 3 === 0 ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 to-transparent p-4 text-left text-sm text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    <span className="block font-medium">{l(item.title)}</span>
                    <span className="text-xs opacity-80">
                      {[item.creator, item.year, t(`type.${item.type}`)].filter(Boolean).join(' · ')}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {selected && index !== null && (
        <ItemDialog
          item={selected}
          onClose={() => setIndex(null)}
          onPrev={index > 0 ? () => setIndex(index - 1) : undefined}
          onNext={index < all.length - 1 ? () => setIndex(index + 1) : undefined}
        />
      )}
    </div>
  )
}
