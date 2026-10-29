import type { MessageKey } from '@/lib/messages'

import type { ExhibitionItem } from '../types'

type Translate = (key: MessageKey) => string

// The catalogue facts about an object, as label and value pairs. Optional details appear only when they are set.
export function itemRows(item: ExhibitionItem, t: Translate): [string, string][] {
  const rows: [string, string | undefined][] = [
    [t('item.creator'), item.creator],
    [t('item.year'), item.year ? String(item.year) : undefined],
    [t('item.type'), t(`type.${item.type}`)],
    [t('item.collection'), item.collection],
    [t('item.signature'), item.signature],
    [t('item.inventory'), item.inventoryNo],
    [t('item.language'), item.language],
    [t('item.material'), item.material],
    [t('item.dimensions'), item.dimensions],
    [t('item.rights'), item.rights],
  ]
  return rows.flatMap(([label, value]) => (value ? [[label, value] as [string, string]] : []))
}
