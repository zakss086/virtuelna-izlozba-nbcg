import { useI18n } from '@/lib/i18n'

import { useExhibitions } from '../api/use-exhibitions'
import type { Exhibition } from '../types'
import { ExhibitionCard } from './exhibition-card'

type RelatedExhibitionsProps = { exhibition: Exhibition }

const LIMIT = 3

// Other published exhibitions, those sharing the most tags first.
export function RelatedExhibitions({ exhibition }: RelatedExhibitionsProps) {
  const { t } = useI18n()
  const { data } = useExhibitions({ status: 'published' })

  const related = (data ?? [])
    .filter((other) => other.id !== exhibition.id)
    .map((other) => ({ other, shared: other.tags.filter((tag) => exhibition.tags.includes(tag)).length }))
    .sort((a, b) => b.shared - a.shared)
    .slice(0, LIMIT)
    .map(({ other }) => other)

  if (related.length === 0) return null

  return (
    <section aria-labelledby="related" className="flex flex-col gap-6 print:hidden">
      <h2 id="related" className="text-2xl font-semibold">
        {t('viewer.related')}
      </h2>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((other) => (
          <li key={other.id}>
            <ExhibitionCard exhibition={other} />
          </li>
        ))}
      </ul>
    </section>
  )
}
