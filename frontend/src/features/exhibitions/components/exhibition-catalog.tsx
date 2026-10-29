import { SmartImage } from '@/components/smart-image'
import { useI18n } from '@/lib/i18n'

import type { Exhibition } from '../types'

type ExhibitionCatalogProps = { exhibition: Exhibition }

// The printed catalogue: visible only when printing (or saving as PDF), where the rest of the page is hidden.
export function ExhibitionCatalog({ exhibition }: ExhibitionCatalogProps) {
  const { t, l } = useI18n()
  const items = exhibition.sections.flatMap((section) => section.items)

  return (
    <div className="hidden text-black print:block">
      <p className="text-xs tracking-[0.2em] uppercase">{t('app.org')}</p>
      <p className="mt-1 text-xs">{t('catalog.printed')}</p>
      <h1 className="mt-6 text-4xl font-semibold">{l(exhibition.title)}</h1>
      <p className="mt-1 text-sm">
        {exhibition.period} · {t('viewer.curator')}: {exhibition.authorName}
      </p>
      <p className="mt-6 text-lg leading-relaxed">{l(exhibition.intro ?? exhibition.summary)}</p>

      {exhibition.sections.map((section) => (
        <section key={section.id} className="mt-10 break-inside-avoid-page">
          <h2 className="text-2xl font-semibold">
            {section.year ? `${section.year} · ` : ''}
            {l(section.title)}
          </h2>
          <p className="mt-2 leading-relaxed">{l(section.text)}</p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {section.items.map((item) => (
              <figure key={item.id} className="break-inside-avoid">
                <SmartImage
                  src={item.imageUrl}
                  alt={l(item.title)}
                  className="max-h-72 w-full object-contain"
                />
                <figcaption className="mt-1 text-xs">
                  <span className="font-medium">{l(item.title)}</span>
                  <br />
                  {[item.creator, item.year, item.collection].filter(Boolean).join(' · ')}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ))}

      <section className="mt-12 break-inside-avoid-page border-t border-black pt-4">
        <h2 className="text-xl font-semibold">{t('catalog.sources')}</h2>
        <ul className="mt-2 space-y-1 text-xs">
          {items.map((item) => (
            <li key={item.id}>
              {l(item.title)}: {[item.creator, item.collection, item.rights].filter(Boolean).join(' · ')} (
              {item.sourceUrl})
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
