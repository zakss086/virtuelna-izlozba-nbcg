import { Heart } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

import { useFavorites } from '../api/use-favorites'

type FavoriteButtonProps = {
  exhibitionId: number
  /** Show the text label next to the icon (used in the viewer header). */
  withLabel?: boolean
}

export function FavoriteButton({ exhibitionId, withLabel = false }: FavoriteButtonProps) {
  const { t } = useI18n()
  const { isFavorite, toggle } = useFavorites()
  const saved = isFavorite(exhibitionId)
  const label = saved ? t('fav.remove') : t('fav.add')

  return (
    <Button
      type="button"
      variant={withLabel ? 'secondary' : 'ghost'}
      size={withLabel ? 'sm' : 'icon'}
      aria-pressed={saved}
      aria-label={withLabel ? undefined : label}
      onClick={() => toggle(exhibitionId)}
      className={cn(!withLabel && 'rounded-full bg-ink/70 text-on-ink hover:bg-ink')}
    >
      <Heart className={cn(saved && 'fill-accent text-accent')} />
      {withLabel && label}
    </Button>
  )
}
