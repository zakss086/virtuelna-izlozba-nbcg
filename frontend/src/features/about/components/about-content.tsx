import { Mail, Search, Send, Wand2 } from 'lucide-react'
import type { ComponentType, ReactNode } from 'react'

import { Reveal } from '@/components/reveal'
import { SmartImage } from '@/components/smart-image'
import { useI18n } from '@/lib/i18n'
import type { MessageKey } from '@/lib/messages'

const HERO =
  'https://commons.wikimedia.org/wiki/Special:FilePath/Cetinje%2C%20october%202021%20-%2001.jpg?width=1600'

const STEPS: { icon: ComponentType<{ className?: string }>; title: MessageKey; text: MessageKey }[] = [
  { icon: Search, title: 'about.how.1.title', text: 'about.how.1.text' },
  { icon: Wand2, title: 'about.how.2.title', text: 'about.how.2.text' },
  { icon: Send, title: 'about.how.3.title', text: 'about.how.3.text' },
]

type AboutContentProps = {
  /** Platform statistics, composed in by the route (they come from another feature). */
  stats: ReactNode
}

export function AboutContent({ stats }: AboutContentProps) {
  const { t } = useI18n()

  return (
    <div className="flex flex-col gap-16">
      <section className="relative -mx-4 -mt-8 isolate overflow-hidden bg-ink text-on-ink sm:mx-0 sm:mt-0 sm:rounded-lg">
        <SmartImage
          src={HERO}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 -z-10 size-full object-cover opacity-50"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/70 to-transparent"
        />
        <div className="flex min-h-80 flex-col justify-center gap-4 px-6 py-16 sm:px-12">
          <h1 className="text-5xl font-semibold text-accent">{t('about.title')}</h1>
          <p className="max-w-2xl text-lg opacity-90">{t('about.lead')}</p>
        </div>
      </section>

      <Reveal>
        <section aria-labelledby="mission" className="grid gap-8 md:grid-cols-[1fr_2fr]">
          <h2 id="mission" className="text-3xl font-semibold">
            {t('about.mission.title')}
          </h2>
          <p className="text-lg leading-relaxed text-muted-foreground first-letter:float-left first-letter:pr-3 first-letter:font-heading first-letter:text-5xl first-letter:leading-[0.8] first-letter:text-gold">
            {t('about.mission.text')}
          </p>
        </section>
      </Reveal>

      <section aria-labelledby="how">
        <Reveal>
          <h2 id="how" className="text-3xl font-semibold">
            {t('about.how.title')}
          </h2>
        </Reveal>
        <ol className="mt-8 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            return (
              <li key={step.title}>
                <Reveal delay={index * 100} className="h-full">
                  <div className="relative flex h-full flex-col gap-3 rounded-lg border bg-card p-6">
                    <span
                      aria-hidden="true"
                      className="absolute right-4 top-2 font-heading text-6xl text-gold/20"
                    >
                      {index + 1}
                    </span>
                    <span className="flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
                      <Icon className="size-6" />
                    </span>
                    <h3 className="text-xl font-semibold">{t(step.title)}</h3>
                    <p className="text-muted-foreground">{t(step.text)}</p>
                  </div>
                </Reveal>
              </li>
            )
          })}
        </ol>
      </section>

      <Reveal>
        <section aria-labelledby="numbers" className="rounded-lg bg-ink p-8 text-on-ink">
          <h2 id="numbers" className="mb-6 text-2xl font-semibold">
            {t('about.numbers.title')}
          </h2>
          {stats}
        </section>
      </Reveal>

      <div className="grid gap-8 md:grid-cols-2">
        <Reveal>
          <section aria-labelledby="contact" className="flex h-full flex-col gap-3 rounded-lg border p-6">
            <h2 id="contact" className="flex items-center gap-2 text-2xl font-semibold">
              <Mail className="size-6 text-gold" aria-hidden="true" />
              {t('about.contact.title')}
            </h2>
            <p className="text-muted-foreground">{t('about.contact.text')}</p>
            <ul className="mt-auto flex flex-col gap-1 text-sm">
              <li>
                <a
                  href="https://nb-cg.me"
                  target="_blank"
                  rel="noreferrer"
                  className="text-gold hover:underline"
                >
                  {t('about.contact.site')}: nb-cg.me
                </a>
              </li>
              <li>
                <a
                  href="https://dlib.me"
                  target="_blank"
                  rel="noreferrer"
                  className="text-gold hover:underline"
                >
                  {t('about.contact.dlib')}: dlib.me
                </a>
              </li>
            </ul>
          </section>
        </Reveal>
        <Reveal delay={100}>
          <section
            aria-labelledby="credits"
            className="flex h-full flex-col gap-3 rounded-lg border bg-secondary p-6"
          >
            <h2 id="credits" className="text-2xl font-semibold">
              {t('about.credits.title')}
            </h2>
            <p className="text-muted-foreground">{t('about.credits.text')}</p>
          </section>
        </Reveal>
      </div>
    </div>
  )
}
