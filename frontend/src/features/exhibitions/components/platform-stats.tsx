import { useI18n } from '@/lib/i18n'

import { useExhibitions } from '../api/use-exhibitions'

type PlatformStatsProps = {
  /** `hero` renders on a dark background; `plain` on the page background. */
  tone?: 'hero' | 'plain'
}

export function PlatformStats({ tone = 'plain' }: PlatformStatsProps) {
  const { t } = useI18n()
  const { data } = useExhibitions({ status: 'published' })

  const exhibitions = data?.length ?? 0
  const objects =
    data?.reduce((sum, e) => sum + e.sections.reduce((s, section) => s + section.items.length, 0), 0) ?? 0
  const videos = data?.reduce((sum, e) => sum + e.videos.length, 0) ?? 0

  const stats = [
    { value: exhibitions, label: t('home.stat.exhibitions') },
    { value: objects, label: t('home.stat.objects') },
    { value: videos, label: t('home.stat.videos') },
    { value: 5, label: t('home.stats.templates') },
  ]

  return (
    <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={tone === 'hero' ? 'border-l border-accent/60 pl-4' : 'border-l border-gold/50 pl-4'}
        >
          <dd className="font-heading text-4xl font-semibold text-accent">{stat.value}</dd>
          <dt className={tone === 'hero' ? 'text-sm opacity-80' : 'text-sm text-muted-foreground'}>
            {stat.label}
          </dt>
        </div>
      ))}
    </dl>
  )
}
