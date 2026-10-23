import { useParams } from 'react-router'

import { ExhibitionDetail } from '@/features/exhibitions/components/exhibition-detail'
import { FavoriteButton } from '@/features/favorites/components/favorite-button'

export function Exhibition() {
  const { slug } = useParams()

  return <ExhibitionDetail slug={slug} actions={(id) => <FavoriteButton exhibitionId={id} withLabel />} />
}
