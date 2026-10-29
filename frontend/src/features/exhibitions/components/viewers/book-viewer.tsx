import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, type KeyboardEvent, type ReactNode } from 'react'

import { SmartImage } from '@/components/smart-image'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

import { useMediaQuery } from '../../hooks/use-media-query'
import type { Exhibition, ExhibitionItem, Section } from '../../types'
import { ItemDialog } from '../item-dialog'

type Side = 'left' | 'right' | 'single'

type PageFrameProps = {
  side: Side
  folio?: number
  dark?: boolean
  backdrop?: ReactNode
  children: ReactNode
}

// One page of paper (or the dark cover). Paper stays light in both themes, like the logo plate.
function PageFrame({ side, folio, dark = false, backdrop, children }: PageFrameProps) {
  return (
    <div
      className={cn(
        'relative flex h-full flex-col overflow-hidden p-6 md:p-8',
        dark ? 'bg-ink text-on-ink' : 'bg-plate text-ink',
        side === 'left' && 'rounded-l-sm',
        side === 'right' && 'rounded-r-sm',
        side === 'single' && 'rounded-sm shadow-lg',
      )}
    >
      {backdrop}
      <div className="relative flex min-h-0 flex-1 flex-col">{children}</div>
      {folio !== undefined && (
        <span className="pt-3 text-center font-heading text-xs text-ink/70">{folio}</span>
      )}
      {side !== 'single' && (
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-y-0 w-10 from-ink/25 to-transparent',
            side === 'left' ? 'right-0 bg-gradient-to-l' : 'left-0 bg-gradient-to-r',
          )}
        />
      )}
    </div>
  )
}

type CoverPageProps = { exhibition: Exhibition; side: Side }

function CoverPage({ exhibition, side }: CoverPageProps) {
  const { t, l } = useI18n()

  return (
    <PageFrame
      side={side}
      dark
      backdrop={
        <>
          <SmartImage
            src={exhibition.coverUrl}
            alt=""
            className="absolute inset-0 size-full object-cover opacity-30"
          />
          <span aria-hidden="true" className="pointer-events-none absolute inset-3 border border-accent/70" />
        </>
      }
    >
      <div className="relative flex flex-1 flex-col items-center justify-center gap-4 px-2 text-center">
        <p className="text-[0.65rem] tracking-[0.25em] uppercase opacity-80">{t('app.orgShort')}</p>
        <span aria-hidden="true" className="size-2 rotate-45 bg-accent" />
        <h2 className="text-2xl leading-tight font-semibold text-balance text-accent md:text-3xl">
          {l(exhibition.title)}
        </h2>
        <p className="font-heading text-sm italic opacity-90">{exhibition.period}</p>
      </div>
    </PageFrame>
  )
}

type ImagePageProps = { section: Section; side: Side; folio: number; onOpen: (item: ExhibitionItem) => void }

function ImagePage({ section, side, folio, onOpen }: ImagePageProps) {
  const { t, l } = useI18n()
  const [first, ...rest] = section.items

  return (
    <PageFrame side={side} folio={folio}>
      {first && (
        <>
          <button
            type="button"
            onClick={() => onOpen(first)}
            aria-label={`${l(first.title)}: ${t('viewer.details')}`}
            className="group relative min-h-0 flex-1 overflow-hidden rounded-sm bg-ink focus-visible:outline-2 focus-visible:outline-ring"
          >
            <SmartImage
              src={first.imageUrl}
              alt={l(first.title)}
              loading="lazy"
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-2 border border-accent/70"
            />
          </button>
          <p className="mt-3 font-heading text-sm leading-snug italic">{l(first.title)}</p>
          <p className="text-xs text-ink/70">{[first.creator, first.year].filter(Boolean).join(' · ')}</p>
        </>
      )}
      {rest.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-2">
          {rest.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onOpen(item)}
                aria-label={`${l(item.title)}: ${t('viewer.details')}`}
                className="block overflow-hidden rounded-sm bg-ink focus-visible:outline-2 focus-visible:outline-ring"
              >
                <SmartImage
                  src={item.imageUrl}
                  alt={l(item.title)}
                  loading="lazy"
                  className="size-10 object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </PageFrame>
  )
}

type TextPageProps = { section: Section; side: Side; folio: number }

function TextPage({ section, side, folio }: TextPageProps) {
  const { l } = useI18n()

  return (
    <PageFrame side={side} folio={folio}>
      {section.year && <p className="font-heading text-3xl font-semibold">{section.year}</p>}
      <h2 className="mt-1 text-xl leading-tight font-semibold text-balance md:text-2xl">
        {l(section.title)}
      </h2>
      <div aria-hidden="true" className="my-4 flex items-center gap-2">
        <span className="h-px w-10 bg-accent" />
        <span className="size-1.5 rotate-45 bg-accent" />
      </div>
      <p className="min-h-0 overflow-y-auto text-sm leading-relaxed text-ink/80 first-letter:float-left first-letter:mr-2 first-letter:font-heading first-letter:text-5xl first-letter:leading-[0.8] first-letter:text-ink md:text-base">
        {l(section.text)}
      </p>
    </PageFrame>
  )
}

type CreditsPageProps = { items: ExhibitionItem[]; side: Side; folio: number }

function CreditsPage({ items, side, folio }: CreditsPageProps) {
  const { t, l } = useI18n()

  return (
    <PageFrame side={side} folio={folio}>
      <h2 className="text-xl font-semibold md:text-2xl">{t('viewer.bookCredits')}</h2>
      <div aria-hidden="true" className="my-4 flex items-center gap-2">
        <span className="h-px w-10 bg-accent" />
        <span className="size-1.5 rotate-45 bg-accent" />
      </div>
      <ul className="min-h-0 space-y-2 overflow-y-auto text-xs leading-snug text-ink/80">
        {items.map((item) => (
          <li key={item.id}>
            <span className="font-medium text-ink">{l(item.title)}</span>
            <br />
            {[item.creator, item.collection, item.rights].filter(Boolean).join(' · ')}
          </li>
        ))}
      </ul>
    </PageFrame>
  )
}

type BookViewerProps = { exhibition: Exhibition }

// A book you page through. Wide screens show an open double page with a turning sheet; phones show one page
// at a time. Positions: spread 0 is the cover, 1..N one section each (picture left, text right), N+1 the credits.
export function BookViewer({ exhibition }: BookViewerProps) {
  const { t, l } = useI18n()
  const wide = useMediaQuery('(min-width: 768px)')
  const { sections } = exhibition
  const count = sections.length
  const lastSpread = count + 1
  const all = sections.flatMap((section) => section.items)

  const [spread, setSpread] = useState(0)
  // On phones a spread is two pages: 0 is the first (left) page, 1 the second (right).
  const [half, setHalf] = useState<0 | 1>(0)
  const [opened, setOpened] = useState<number | null>(null)

  const hasSecondPage = (s: number) => s >= 1 && s <= count
  const page = spread === 0 ? 0 : 2 * spread - 1 + half
  const lastPage = 2 * count + 1

  const canPrev = wide ? spread > 0 : page > 0
  const canNext = wide ? spread < lastSpread : page < lastPage

  function next() {
    if (!canNext) return
    if (!wide && half === 0 && hasSecondPage(spread)) setHalf(1)
    else {
      setSpread(spread + 1)
      setHalf(0)
    }
  }

  function prev() {
    if (!canPrev) return
    if (!wide && half === 1) setHalf(0)
    else {
      setSpread(spread - 1)
      setHalf(!wide && hasSecondPage(spread - 1) ? 1 : 0)
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowRight') next()
    if (event.key === 'ArrowLeft') prev()
  }

  function open(item: ExhibitionItem) {
    setOpened(all.findIndex((x) => x.id === item.id))
  }

  const rightPage = (index: number, side: Side): ReactNode => {
    if (index === 0) return <CoverPage exhibition={exhibition} side={side} />
    const section = sections[index - 1]
    return section ? <TextPage section={section} side={side} folio={2 * index + 1} /> : null
  }

  const leftPage = (index: number, side: Side): ReactNode => {
    if (index === lastSpread) return <CreditsPage items={all} side={side} folio={2 * count + 2} />
    const section = sections[index - 1]
    return section ? <ImagePage section={section} side={side} folio={2 * index} onOpen={open} /> : null
  }

  // Sheet j has the right page of spread j on its front and the left page of spread j + 1 on its back.
  const sheets = Array.from({ length: count + 1 }, (_, j) => j)
  const selected = opened === null ? null : all[opened]
  const shift = spread === 0 ? -25 : spread === lastSpread ? 25 : 0
  const position = wide
    ? t('viewer.position', { a: spread + 1, b: lastSpread + 1 })
    : t('viewer.position', { a: page + 1, b: lastPage + 1 })

  return (
    <>
      {/* The key handler listens for arrows while focus is on the book controls. */}
      <div role="region" aria-label={t('tpl.book')} onKeyDown={onKeyDown} className="flex flex-col gap-6">
        {wide ? (
          <div className="mx-auto w-full max-w-4xl overflow-x-clip px-2">
            <div
              className="relative aspect-[3/2] transition-transform duration-700 ease-in-out motion-reduce:transition-none"
              style={{ perspective: '2400px', transform: `translateX(${shift}%)` }}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'absolute -inset-y-2 -left-2 w-[calc(50%+0.5rem)] rounded-l-md bg-ink ring-1 ring-accent/50 transition-opacity duration-700 motion-reduce:transition-none',
                  spread === 0 && 'opacity-0',
                )}
              />
              <span
                aria-hidden="true"
                className={cn(
                  'absolute -inset-y-2 -right-2 w-[calc(50%+0.5rem)] rounded-r-md bg-ink ring-1 ring-accent/50 transition-opacity duration-700 motion-reduce:transition-none',
                  spread === lastSpread && 'opacity-0',
                )}
              />
              {sheets.map((j) => {
                const flipped = j < spread
                return (
                  <div
                    key={j}
                    className="absolute top-0 right-0 h-full w-1/2 origin-left transition-transform duration-700 ease-in-out motion-reduce:transition-none"
                    style={{
                      transformStyle: 'preserve-3d',
                      transform: `rotateY(${flipped ? -180 : 0}deg)`,
                      zIndex: flipped ? j : sheets.length - j,
                    }}
                  >
                    <div inert={j !== spread} className="absolute inset-0 [backface-visibility:hidden]">
                      {rightPage(j, 'right')}
                    </div>
                    <div
                      inert={j !== spread - 1}
                      className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]"
                    >
                      {leftPage(j + 1, 'left')}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div key={page} className="book-turn mx-auto aspect-[3/4] w-full max-w-sm">
            {page === 0
              ? rightPage(0, 'single')
              : page === lastPage
                ? leftPage(lastSpread, 'single')
                : half === 0
                  ? leftPage(spread, 'single')
                  : rightPage(spread, 'single')}
          </div>
        )}

        <div className="mx-auto flex w-full max-w-md items-center justify-between gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={prev}
            disabled={!canPrev}
            aria-label={t('viewer.prev')}
          >
            <ChevronLeft />
          </Button>
          <p aria-live="polite" className="text-sm text-muted-foreground">
            {position}
          </p>
          <Button
            variant="outline"
            size="icon"
            onClick={next}
            disabled={!canNext}
            aria-label={t('viewer.next')}
          >
            <ChevronRight />
          </Button>
        </div>
        <p className="text-center text-sm text-muted-foreground">{t('viewer.bookHint')}</p>
        <details className="mx-auto w-full max-w-md rounded-lg border p-3 text-sm">
          <summary className="cursor-pointer font-medium">{t('viewer.contents')}</summary>
          <ol className="mt-3 flex flex-col gap-1">
            {sections.map((section, i) => (
              <li key={section.id}>
                <button
                  type="button"
                  aria-current={spread === i + 1}
                  onClick={() => {
                    setSpread(i + 1)
                    setHalf(0)
                  }}
                  className="w-full rounded px-2 py-1 text-left hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring aria-[current=true]:font-semibold"
                >
                  {section.year ? `${section.year} · ` : ''}
                  {l(section.title)}
                </button>
              </li>
            ))}
          </ol>
        </details>
      </div>

      {selected && opened !== null && (
        <ItemDialog
          item={selected}
          onClose={() => setOpened(null)}
          onPrev={opened > 0 ? () => setOpened(opened - 1) : undefined}
          onNext={opened < all.length - 1 ? () => setOpened(opened + 1) : undefined}
        />
      )}
    </>
  )
}
