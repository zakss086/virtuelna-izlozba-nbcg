import { Archive, BookOpen, Box, Clock, Disc3, GalleryHorizontal, Images, Map } from 'lucide-react'
import type { ComponentType } from 'react'
import { Link } from 'react-router'

import { Reveal } from '@/components/reveal'
import { useI18n } from '@/lib/i18n'

import { TEMPLATES, type ExhibitionTemplate } from '../types'

const TEMPLATE_ICONS: Record<ExhibitionTemplate, ComponentType<{ className?: string }>> = {
  timeline: Clock,
  gallery: Images,
  map: Map,
  slider: GalleryHorizontal,
  room: Box,
  book: BookOpen,
  carousel: Disc3,
  cards: Archive,
}

// One card per exhibition template; each links to the catalog filtered by that template.
export function TemplateCards() {
  const { t } = useI18n()

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {TEMPLATES.map((tpl, index) => {
        const Icon = TEMPLATE_ICONS[tpl]
        return (
          <li key={tpl}>
            <Reveal delay={index * 80} className="h-full">
              <Link
                to={`/exhibitions?template=${tpl}`}
                className="group flex h-full flex-col gap-3 rounded-lg border bg-card p-4 transition-all hover:-translate-y-1 hover:border-accent hover:shadow-lg focus-visible:outline-2 focus-visible:outline-ring"
              >
                <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-gold transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                  <Icon className="size-6" />
                </span>
                <span className="text-lg font-semibold">{t(`tpl.${tpl}`)}</span>
                <span className="text-sm text-muted-foreground">{t(`tpl.${tpl}.desc`)}</span>
              </Link>
            </Reveal>
          </li>
        )
      })}
    </ul>
  )
}
