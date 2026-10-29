import { cva } from 'class-variance-authority'

import { useI18n } from '@/lib/i18n'

const imageVariants = cva('relative w-auto', {
  variants: {
    size: {
      header: 'h-12 lg:h-16',
      footer: 'h-16',
    },
  },
  defaultVariants: { size: 'header' },
})

type BrandLogoProps = { size?: 'header' | 'footer' }

// The library's logo on a light plate with a thin gold inner frame, so it stays readable on the dark header and footer.
// The logo file is small (167 x 83 px), so it is never shown much larger than its natural size.
export function BrandLogo({ size = 'header' }: BrandLogoProps) {
  const { t } = useI18n()

  return (
    <span className="relative inline-block shrink-0 rounded-sm bg-plate p-2 shadow-lg ring-1 ring-accent">
      <span aria-hidden="true" className="pointer-events-none absolute inset-1 rounded-[1px] border border-accent/60" />
      <img src="/nbcg-logo.png" alt={t('app.org')} width={144} height={72} className={imageVariants({ size })} />
    </span>
  )
}
