import { Link } from 'react-router'

import { Ornament } from '@/components/ornament'
import { Reveal } from '@/components/reveal'
import { Button } from '@/components/ui/button'
import { CollectionChips } from '@/features/collections/components/collection-chips'
import { ExhibitionsGrid } from '@/features/exhibitions/components/exhibitions-grid'
import { FeaturedExhibition } from '@/features/exhibitions/components/featured-exhibition'
import { HomeHero } from '@/features/exhibitions/components/home-hero'
import { TemplateCards } from '@/features/exhibitions/components/template-cards'
import { VideoGallery } from '@/features/exhibitions/components/video-gallery'
import { FavoriteButton } from '@/features/favorites/components/favorite-button'
import { useI18n } from '@/lib/i18n'

export function Home() {
  const { t } = useI18n()

  return (
    <div className="flex flex-col gap-16">
      <HomeHero />

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
        <div className="mt-8">
          <TemplateCards />
        </div>
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
          <div className="flex flex-col justify-center gap-3 bg-card/10 p-8 lg:p-12">
            <h3 className="text-lg font-semibold">{t('home.collections')}</h3>
            <CollectionChips />
          </div>
        </section>
      </Reveal>
    </div>
  )
}
