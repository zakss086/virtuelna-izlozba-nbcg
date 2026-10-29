import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

import { SmartImage } from '@/components/smart-image'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

import type { Exhibition, ExhibitionItem } from '../../types'
import { ItemDialog } from '../item-dialog'
import { itemRows } from '../item-rows'

// Tabs on the cards step across this many positions, like the tabs of a real card index.
const TAB_POSITIONS = 4

type CatalogCardProps = {
  item: ExhibitionItem
  index: number
  open: boolean
  onToggle: () => void
  onOpenImage: () => void
}

function CatalogCard({ item, index, open, onToggle, onOpenImage }: CatalogCardProps) {
  const { t, l } = useI18n()
  const panelId = `card-${item.id}`

  return (
    <li className="relative mt-8 first:mt-6">
      <span
        aria-hidden="true"
        className="absolute -top-5 rounded-t-md bg-plate px-3 text-[0.7rem] leading-5 font-medium tracking-wide text-ink uppercase"
        style={{ left: `${1 + (index % TAB_POSITIONS) * 8}rem` }}
      >
        {t(`type.${item.type}`)}
      </span>
      <div className="relative overflow-hidden rounded-md border-t-2 border-cinnabar bg-plate text-ink shadow-lg">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex w-full items-center justify-between gap-4 px-5 py-3 text-left focus-visible:outline-2 focus-visible:outline-ring"
        >
          <span className="flex flex-col">
            <span className="font-heading text-lg leading-snug font-semibold">{l(item.title)}</span>
            <span className="text-xs text-ink/70">
              {[item.creator, item.year].filter(Boolean).join(' · ')}
            </span>
          </span>
          <ChevronDown
            aria-hidden="true"
            className={cn(
              'size-5 shrink-0 transition-transform motion-reduce:transition-none',
              open && 'rotate-180',
            )}
          />
        </button>
        <div
          id={panelId}
          className={cn(
            'grid transition-[grid-template-rows] duration-300 motion-reduce:transition-none',
            open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
          )}
        >
          <div inert={!open} className="relative overflow-hidden">
            <div className="grid gap-6 px-5 pt-2 pb-8 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
              <button
                type="button"
                onClick={onOpenImage}
                aria-label={`${l(item.title)}: ${t('viewer.details')}`}
                className="group h-fit overflow-hidden rounded-sm bg-ink focus-visible:outline-2 focus-visible:outline-ring"
              >
                <SmartImage
                  src={item.imageUrl}
                  alt={l(item.title)}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                />
              </button>
              <dl className="text-sm">
                {itemRows(item, t).map(([label, value]) => (
                  <div
                    key={label}
                    className="flex justify-between gap-4 border-b border-dotted border-ink/40 py-1.5"
                  >
                    <dt className="text-ink/70">{label}</dt>
                    <dd className="text-right font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <span
              aria-hidden="true"
              className="absolute bottom-2 left-1/2 size-3 -translate-x-1/2 rounded-full bg-ink"
            />
          </div>
        </div>
      </div>
    </li>
  )
}

type CardsViewerProps = { exhibition: Exhibition }

// Objects as cards in a library card catalogue drawer, one group per section. Select a card to pull it out.
export function CardsViewer({ exhibition }: CardsViewerProps) {
  const { t, l } = useI18n()
  const all = exhibition.sections.flatMap((section) => section.items)
  const [selected, setSelected] = useState<number | null>(all[0]?.id ?? null)
  const [opened, setOpened] = useState<number | null>(null)
  const dialogItem = opened === null ? null : all[opened]

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg bg-ink p-4 text-on-ink ring-1 ring-accent/40 sm:p-8">
        <div className="flex flex-col gap-12">
          {exhibition.sections.map((section) => (
            <section key={section.id} aria-labelledby={`drawer-${section.id}`}>
              <div className="flex items-center gap-3">
                <h2
                  id={`drawer-${section.id}`}
                  className="rounded-sm bg-accent px-3 py-1 text-sm font-semibold text-accent-foreground"
                >
                  {l(section.title)}
                </h2>
                <span aria-hidden="true" className="h-px flex-1 bg-accent/40" />
              </div>
              <p className="mt-3 max-w-prose text-sm opacity-80">{l(section.text)}</p>
              <ul>
                {section.items.map((item, index) => (
                  <CatalogCard
                    key={item.id}
                    item={item}
                    index={index}
                    open={selected === item.id}
                    onToggle={() => setSelected(selected === item.id ? null : item.id)}
                    onOpenImage={() => setOpened(all.findIndex((x) => x.id === item.id))}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
      <p className="text-center text-sm text-muted-foreground">{t('viewer.cardsHint')}</p>

      {dialogItem && opened !== null && (
        <ItemDialog
          item={dialogItem}
          onClose={() => setOpened(null)}
          onPrev={opened > 0 ? () => setOpened(opened - 1) : undefined}
          onNext={opened < all.length - 1 ? () => setOpened(opened + 1) : undefined}
        />
      )}
    </div>
  )
}
