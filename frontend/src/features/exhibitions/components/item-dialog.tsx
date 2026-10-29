import { Download, ExternalLink, X } from 'lucide-react'
import { useEffect, useRef } from 'react'

import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'

import type { ExhibitionItem } from '../types'
import { itemRows } from './item-rows'
import { ZoomableImage } from './zoomable-image'

// Downloads are offered only for material the licence lets people copy.
const canDownload = (item: ExhibitionItem) => /public domain|cc by|cc0/i.test(item.rights)

type ItemDialogProps = {
  item: ExhibitionItem
  onClose: () => void
  onPrev?: () => void
  onNext?: () => void
}

export function ItemDialog({ item, onClose, onPrev, onNext }: ItemDialogProps) {
  const { t, l } = useI18n()
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft') onPrev?.()
      if (event.key === 'ArrowRight') onNext?.()
    }
    window.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [onClose, onPrev, onNext])

  const rows = itemRows(item, t)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={l(item.title)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-4"
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label={t('viewer.close')}
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />
      <div className="relative grid max-h-full w-full max-w-5xl overflow-auto rounded-lg bg-card text-card-foreground shadow-xl md:grid-cols-[3fr_2fr]">
        <div className="bg-ink">
          <ZoomableImage src={item.imageUrl} alt={l(item.title)} className="h-[50vh] w-full md:h-[80vh]" />
          <p className="px-3 py-2 text-xs text-on-ink/80">{t('item.zoomHint')}</p>
        </div>
        <div className="flex flex-col gap-4 p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-2xl font-semibold">{l(item.title)}</h2>
            <Button
              ref={closeRef}
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label={t('viewer.close')}
            >
              <X />
            </Button>
          </div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            {rows.map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="text-muted-foreground">{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-auto flex flex-wrap gap-2">
            <Button asChild variant="outline" className="w-fit">
              <a href={item.sourceUrl} target="_blank" rel="noreferrer">
                <ExternalLink />
                {t('item.openSource')}
              </a>
            </Button>
            {canDownload(item) && (
              <Button asChild variant="outline" className="w-fit">
                <a href={item.imageUrl} target="_blank" rel="noreferrer" download>
                  <Download />
                  {t('item.download')}
                </a>
              </Button>
            )}
          </div>
          {(onPrev || onNext) && (
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={onPrev} disabled={!onPrev}>
                {t('viewer.prev')}
              </Button>
              <Button variant="secondary" size="sm" onClick={onNext} disabled={!onNext}>
                {t('viewer.next')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
