import { Ornament } from '@/components/ornament'
import { Box, Clock, GalleryHorizontal, Images, Map } from 'lucide-react'
import type { ComponentType } from 'react'
import { Link } from 'react-router'

import { Reveal } from '@/components/reveal'
import { SmartImage } from '@/components/smart-image'
import { Button } from '@/components/ui/button'
import { ExhibitionsGrid } from '@/features/exhibitions/components/exhibitions-grid'
import { FeaturedExhibition } from '@/features/exhibitions/components/featured-exhibition'
import { PlatformStats } from '@/features/exhibitions/components/platform-stats'
import { VideoGallery } from '@/features/exhibitions/components/video-gallery'
import { TEMPLATES, type ExhibitionTemplate } from '@/features/exhibitions/types'
import { FavoriteButton } from '@/features/favorites/components/favorite-button'
import { useI18n } from '@/lib/i18n'
import type { MessageKey } from '@/lib/messages'

const commons = (file: string) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=1920`

const HERO_SLIDES = [
  { src: commons('View of Kotor bay and old town.jpg'), alt: 'Bay of Kotor' },
  { src: commons('Montenegro NP Durmitor Black Lake 01.jpg'), alt: 'Black Lake, Durmitor' },
  { src: commons('From the West, Cetinje, Montenegro WDL2608.png'), alt: 'Cetinje, late 19th century' },
]

const TEMPLATE_ICONS: Record<ExhibitionTemplate, ComponentType<{ className?: string }>> = {
  timeline: Clock,
  gallery: Images,
  map: Map,
  slider: GalleryHorizontal,
  room: Box,
}

const COLLECTIONS: { label: string; href: string }[] = [
  { label: 'Montenegrina', href: 'https://nb-cg.me' },
  { label: 'Knjige', href: 'https://dlib.me/me/knjige' },
  { label: 'Periodika', href: 'https://dlib.me/me/periodika' },
  { label: 'Rukopisi i dokumenta', href: 'https://dlib.me/me/rukopisi-i-dokumenta' },
  { label: 'Karte i planovi', href: 'https://dlib.me/me/karte-i-planovi' },
  { label: 'Plakati i likovna građa', href: 'https://dlib.me/me/plakati-i-likovna-gradja' },
  { label: 'Fotografije i razglednice', href: 'https://dlib.me/me/fotografije-i-razglednice' },
  { label: 'Njegoš', href: 'https://dlib.me/me/tematske-zbirke' },
]

export function Home() {
  const { t } = useI18n()

  return (
    <div className="flex flex-col gap-20">
      <section className="relative -mx-4 -mt-8 isolate overflow-hidden bg-ink text-primary-foreground sm:mx-0 sm:mt-0 sm:rounded-lg">
        {HERO_SLIDES.map((slide, index) => (
          <SmartImage
            key={slide.src}
            src={slide.src}
            alt=""
            aria-hidden="true"
            style={{ animationDelay: `${index * 7}s` }}
            className="hero-slide absolute inset-0 -z-10 size-full object-cover"
          />
        ))}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/75 to-ink/20"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/80 to-transparent"
        />

        <div className="flex min-h-[32rem] flex-col justify-center gap-6 px-6 py-16 sm:px-12 lg:min-h-[36rem]">
          <p className="flex items-center gap-3 text-sm uppercase tracking-widest text-accent">
            <span aria-hidden="true" className="h-px w-10 bg-accent" />
            {t('home.eyebrow')}
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-balance sm:text-6xl">
            {t('home.title')}
          </h1>
          <p className="max-w-2xl text-lg opacity-90">{t('home.lead')}</p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/exhibitions">{t('home.cta')}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/50 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link to="/videos">{t('nav.videos')}</Link>
            </Button>
          </div>
          <div className="mt-6">
            <PlatformStats tone="hero" />
          </div>
        </div>
      </section>

      <Reveal>
        <FeaturedExhibition action={(id) => <FavoriteButton exhibitionId={id} withLabel />} />
      </Reveal>

      <section aria-labelledby="latest">
        <Reveal>
          <div className="flex items-end justify-between gap-4">
            <h2 id="latest" className="text-3xl font-semibold">
              {t('home.latest')}
            </h2>
            <Link to="/exhibitions" className="text-sm text-gold hover:underline">
              {t('nav.exhibitions')} →
            </Link>
          </div>
          <Ornament />
        </Reveal>
        <Reveal className="mt-8" delay={100}>
          <ExhibitionsGrid limit={3} renderAction={(e) => <FavoriteButton exhibitionId={e.id} />} />
        </Reveal>
      </section>

      <section aria-labelledby="templates">
        <Reveal>
          <h2 id="templates" className="text-3xl font-semibold">
            {t('home.templates')}
          </h2>
          <Ornament />
        </Reveal>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {TEMPLATES.map((tpl, index) => {
            const Icon = TEMPLATE_ICONS[tpl]
            return (
              <li key={tpl}>
                <Reveal delay={index * 80} className="h-full">
                  <Link
                    to={`/exhibitions?template=${tpl}`}
                    className="group flex h-full flex-col gap-3 rounded-lg border bg-card p-5 transition-all hover:-translate-y-1 hover:border-accent hover:shadow-lg focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-gold transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                      <Icon className="size-6" />
                    </span>
                    <span className="text-lg font-semibold">{t(`tpl.${tpl}` as MessageKey)}</span>
                    <span className="text-sm text-muted-foreground">
                      {t(`tpl.${tpl}.desc` as MessageKey)}
                    </span>
                  </Link>
                </Reveal>
              </li>
            )
          })}
        </ul>
      </section>

      <section aria-labelledby="home-videos">
        <Reveal>
          <div className="flex items-end justify-between gap-4">
            <h2 id="home-videos" className="text-3xl font-semibold">
              {t('home.videos.title')}
            </h2>
            <Link to="/videos" className="text-sm text-gold hover:underline">
              {t('home.videos.more')} →
            </Link>
          </div>
          <Ornament />
        </Reveal>
        <Reveal className="mt-8" delay={100}>
          <VideoGallery limit={3} />
        </Reveal>
      </section>

      <Reveal>
        <section
          aria-labelledby="home-about"
          className="grid gap-8 overflow-hidden rounded-lg bg-ink text-primary-foreground md:grid-cols-[3fr_2fr]"
        >
          <div className="flex flex-col justify-center gap-4 p-8 lg:p-12">
            <h2 id="home-about" className="text-3xl font-semibold text-accent">
              {t('home.about.title')}
            </h2>
            <p className="max-w-xl opacity-90">{t('home.about.text')}</p>
            <Button
              asChild
              variant="outline"
              className="w-fit border-accent bg-transparent text-accent hover:bg-accent hover:text-accent-foreground"
            >
              <Link to="/about">{t('home.about.cta')}</Link>
            </Button>
          </div>
          <div className="flex flex-col justify-center gap-3 bg-secondary/10 p-8 lg:p-12">
            <h3 className="text-lg font-semibold">{t('home.collections')}</h3>
            <ul className="flex flex-wrap gap-2">
              {COLLECTIONS.map((collection) => (
                <li key={collection.label}>
                  <a
                    href={collection.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block rounded-full border border-accent/60 px-3 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    {collection.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </Reveal>
    </div>
  )
}
