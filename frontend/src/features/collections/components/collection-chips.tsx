import { useI18n } from '@/lib/i18n'

import { useCollections } from '../api/use-collections'

// Compact list of collection links (used in the home page banner).
export function CollectionChips() {
  const { l, t } = useI18n()
  const { data, isPending, isError } = useCollections()

  if (isPending) return <p className="text-sm opacity-70">{t('common.loading')}</p>
  if (isError) return <p role="alert">{t('common.error')}</p>

  return (
    <ul className="flex flex-wrap gap-2">
      {data.map((collection) => (
        <li key={collection.href}>
          <a
            href={collection.href}
            target="_blank"
            rel="noreferrer"
            className="inline-block rounded-full border border-accent/60 px-3 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-ring"
          >
            {l(collection.name)}
          </a>
        </li>
      ))}
    </ul>
  )
}
