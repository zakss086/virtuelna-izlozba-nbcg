import { Copy } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'
import { showToast } from '@/lib/toast'

import type { Exhibition } from '../types'

type ExhibitionIntroProps = { exhibition: Exhibition }

// Curator's introduction, the facts about the exhibition and a ready-made citation.
export function ExhibitionIntro({ exhibition }: ExhibitionIntroProps) {
  const { t, l, lang } = useI18n()
  const objects = exhibition.sections.reduce((sum, section) => sum + section.items.length, 0)
  const collections = [
    ...new Set(exhibition.sections.flatMap((section) => section.items.map((item) => item.collection))),
  ]

  const citation = t('viewer.citeText', {
    author: exhibition.authorName,
    title: l(exhibition.title),
    org: t('app.orgShort'),
    year: exhibition.createdAt.slice(0, 4),
    url: `${window.location.origin}/exhibitions/${exhibition.slug}`,
    date: new Date().toLocaleDateString(lang === 'me' ? 'sr-Latn-ME' : 'en-GB'),
  })

  async function copyCitation() {
    try {
      await navigator.clipboard.writeText(citation)
      showToast('success', t('viewer.citeCopied'))
    } catch {
      showToast('error', t('viewer.citeCopy'))
    }
  }

  const facts: [string, string][] = [
    [t('viewer.curator'), exhibition.authorName],
    [t('viewer.period'), exhibition.period],
    [t('viewer.collections'), collections.join(', ')],
    [t('viewer.objects'), String(objects)],
    [t('viewer.posted'), exhibition.createdAt.slice(0, 4)],
  ]

  return (
    <section
      aria-labelledby="exhibition-about"
      className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-12"
    >
      <div className="flex flex-col gap-4">
        <h2 id="exhibition-about" className="text-sm font-medium tracking-[0.2em] text-gold uppercase">
          {exhibition.intro ? t('viewer.intro') : t('viewer.about')}
        </h2>
        <p className="max-w-prose font-heading text-xl leading-relaxed text-balance">
          {l(exhibition.intro ?? exhibition.summary)}
        </p>
        <div className="mt-2 flex flex-col gap-2 border-l-2 border-accent pl-4">
          <h3 className="text-sm font-medium">{t('viewer.cite')}</h3>
          <p className="max-w-prose text-sm text-muted-foreground">{citation}</p>
          <Button variant="outline" size="sm" onClick={copyCitation} className="w-fit">
            <Copy />
            {t('viewer.citeCopy')}
          </Button>
        </div>
      </div>
      <dl className="grid h-fit grid-cols-[auto_1fr] gap-x-4 gap-y-3 rounded-lg border bg-card p-6 text-sm">
        {facts.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-muted-foreground first-letter:uppercase">{label}</dt>
            <dd className="font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
