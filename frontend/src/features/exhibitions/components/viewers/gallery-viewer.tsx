import { SmartImage } from '@/components/smart-image'
import { useState } from 'react'

import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useI18n } from '@/lib/i18n'

import type { Exhibition, ExhibitionItem } from '../../types'
import { ItemDialog } from '../item-dialog'

type GalleryViewerProps = { exhibition: Exhibition }

type Sort = 'default' | 'yearAsc' | 'yearDesc'
const SORTS: Sort[] = ['default', 'yearAsc', 'yearDesc']
const ALL = 'all'

type TileProps = { item: ExhibitionItem; tall: boolean; onOpen: () => void }

function Tile({ item, tall, onOpen }: TileProps) {
  const { t, l } = useI18n()

  return (
    <li className="mb-4 break-inside-avoid">
      <button
        type="button"
        onClick={onOpen}
        className="group relative block w-full overflow-hidden rounded-lg bg-ink focus-visible:outline-2 focus-visible:outline-ring"
      >
        <SmartImage
          src={item.imageUrl}
          alt={l(item.title)}
          loading="lazy"
          className={`w-full object-cover transition-transform duration-500 group-hover:scale-105 ${tall ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}
        />
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 to-transparent p-4 text-left text-sm text-on-ink opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <span className="block font-medium">{l(item.title)}</span>
          <span className="text-xs opacity-80">
            {[item.creator, item.year, t(`type.${item.type}`)].filter(Boolean).join(' · ')}
          </span>
        </span>
      </button>
    </li>
  )
}

// Masonry gallery. With no filter it follows the sections; with a filter or a sort it becomes one flat grid.
export function GalleryViewer({ exhibition }: GalleryViewerProps) {
  const { t, l } = useI18n()
  const all = exhibition.sections.flatMap((section) => section.items)
  const [type, setType] = useState(ALL)
  const [collection, setCollection] = useState(ALL)
  const [sort, setSort] = useState<Sort>('default')
  const [index, setIndex] = useState<number | null>(null)

  const types = [...new Set(all.map((item) => item.type))]
  const collections = [...new Set(all.map((item) => item.collection))]
  const filtering = type !== ALL || collection !== ALL || sort !== 'default'

  const visible = all
    .filter(
      (item) =>
        (type === ALL || item.type === type) && (collection === ALL || item.collection === collection),
    )
    .sort((a, b) =>
      sort === 'default' ? 0 : ((a.year ?? 0) - (b.year ?? 0)) * (sort === 'yearAsc' ? 1 : -1),
    )
  // The lightbox walks through what is on screen, in the order it is shown.
  const shown = filtering ? visible : all
  const selected = index === null ? null : shown[index]

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="gallery-type">{t('gallery.type')}</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger id="gallery-type" className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t('catalog.all')}</SelectItem>
              {types.map((kind) => (
                <SelectItem key={kind} value={kind}>
                  {t(`type.${kind}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="gallery-collection">{t('gallery.collection')}</Label>
          <Select value={collection} onValueChange={setCollection}>
            <SelectTrigger id="gallery-collection" className="w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t('catalog.all')}</SelectItem>
              {collections.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="gallery-sort">{t('gallery.sort')}</Label>
          <Select
            value={sort}
            onValueChange={(value) => setSort(SORTS.find((s) => s === value) ?? 'default')}
          >
            <SelectTrigger id="gallery-sort" className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORTS.map((option) => (
                <SelectItem key={option} value={option}>
                  {t(`gallery.sort.${option}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p aria-live="polite" className="pb-2 text-sm text-muted-foreground">
          {t('gallery.count', { a: visible.length, b: all.length })}
        </p>
      </div>

      {filtering ? (
        visible.length === 0 ? (
          <p className="py-8 text-muted-foreground">{t('gallery.empty')}</p>
        ) : (
          <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {visible.map((item, i) => (
              <Tile key={item.id} item={item} tall={i % 3 === 0} onOpen={() => setIndex(i)} />
            ))}
          </ul>
        )
      ) : (
        <div className="flex flex-col gap-12">
          {exhibition.sections.map((section) => (
            <section key={section.id} aria-labelledby={`g-${section.id}`}>
              <h2 id={`g-${section.id}`} className="text-3xl font-semibold">
                {l(section.title)}
              </h2>
              <p className="mt-2 max-w-prose text-muted-foreground">{l(section.text)}</p>
              <ul className="mt-6 columns-1 gap-4 sm:columns-2 lg:columns-3">
                {section.items.map((item, i) => (
                  <Tile
                    key={item.id}
                    item={item}
                    tall={i % 3 === 0}
                    onOpen={() => setIndex(all.findIndex((x) => x.id === item.id))}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {selected && index !== null && (
        <ItemDialog
          item={selected}
          onClose={() => setIndex(null)}
          onPrev={index > 0 ? () => setIndex(index - 1) : undefined}
          onNext={index < shown.length - 1 ? () => setIndex(index + 1) : undefined}
        />
      )}
    </div>
  )
}
