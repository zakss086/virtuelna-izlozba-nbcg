import { Link } from 'react-router'

import { SmartImage } from '@/components/smart-image'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'

import { cn } from '@/lib/utils'

import { PlatformStats } from './platform-stats'

const commons = (file: string) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=1920`

// Books and documents from the collections: the Oktoih (1494), The Mountain Wreath (Vienna, 1847) and a map of the Principality.
// Slides crossfade in CSS (.hero-slide in index.css); each one starts 7s after the previous.
const HERO_SLIDES = [
  {
    src: commons('Oktoih petoglasnik iz 1494. eksponat iz zbirke Pedagoškog muzeja u Beogradu.jpg'),
    caption: 'home.hero.caption.1',
  },
  { src: commons('Bečko izdanje Gorskog vijenca 1847.png'), caption: 'home.hero.caption.2' },
  {
    src: commons('Special Karte des Fürstenthumes Montenegro (Cèrnagora) - HK 1124.jpg'),
    caption: 'home.hero.caption.3',
  },
] as const

// Gold corner brackets on a thin inner frame, like the corners of an old printed plate.
const CORNERS = [
  'left-4 top-4 border-l-2 border-t-2',
  'right-4 top-4 border-r-2 border-t-2',
  'bottom-4 left-4 border-b-2 border-l-2',
  'bottom-4 right-4 border-b-2 border-r-2',
] as const

export function HomeHero() {
  const { t } = useI18n()

  return (
    <section className="relative -mx-4 -mt-8 isolate overflow-hidden bg-ink text-on-ink sm:mx-0 sm:mt-0 sm:rounded-lg">
      {HERO_SLIDES.map(({ src }, index) => (
        <SmartImage
          key={src}
          src={src}
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

      <div aria-hidden="true" className="pointer-events-none absolute inset-4 border border-accent/30" />
      {CORNERS.map((corner) => (
        <span
          key={corner}
          aria-hidden="true"
          className={cn('pointer-events-none absolute size-6 border-accent', corner)}
        />
      ))}

      <div className="flex min-h-[32rem] flex-col justify-center gap-6 px-6 pt-16 pb-20 sm:px-12 lg:min-h-[36rem]">
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
            className="border-on-ink/50 bg-transparent text-on-ink hover:bg-on-ink/10 hover:text-on-ink"
          >
            <Link to="/videos">{t('nav.videos')}</Link>
          </Button>
        </div>
        <div className="mt-6">
          <PlatformStats tone="hero" />
        </div>
      </div>

      <div aria-hidden="true" className="absolute right-8 bottom-8 hidden flex-col items-end gap-2 text-right text-xs sm:flex">
        <div className="grid">
          {HERO_SLIDES.map(({ caption }, index) => (
            <p
              key={caption}
              style={{ animationDelay: `${index * 7}s` }}
              className="hero-caption col-start-1 row-start-1 font-heading italic"
            >
              {t(caption)}
            </p>
          ))}
        </div>
        <div className="flex gap-1.5">
          {HERO_SLIDES.map(({ caption }, index) => (
            <span
              key={caption}
              style={{ animationDelay: `${index * 7}s` }}
              className="hero-dot size-1.5 rotate-45 bg-accent"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
