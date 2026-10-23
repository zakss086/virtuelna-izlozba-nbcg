import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'

export function NotFound() {
  const { t } = useI18n()

  return (
    <section className="flex flex-col items-start gap-4 py-12">
      <p className="font-heading text-8xl text-gold">404</p>
      <h1 className="text-3xl font-semibold">{t('notFound.title')}</h1>
      <Button asChild variant="outline">
        <Link to="/">{t('notFound.back')}</Link>
      </Button>
    </section>
  )
}
