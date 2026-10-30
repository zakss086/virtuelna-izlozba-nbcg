import { FileDown, Maximize2, Minimize2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useI18n } from '@/lib/i18n'

import type { ExhibitionTemplate } from '../types'

type ViewToolbarProps = {
  view: ExhibitionTemplate
  options: ExhibitionTemplate[]
  onViewChange: (view: ExhibitionTemplate) => void
  fullscreen: { supported: boolean; active: boolean; toggle: () => void }
}

// Switch between viewers, go full screen, or print the catalogue.
export function ViewToolbar({ view, options, onViewChange, fullscreen }: ViewToolbarProps) {
  const { t } = useI18n()

  return (
    <div className="flex flex-wrap items-end justify-between gap-4 print:hidden">
      {options.length > 1 ? (
        <div className="flex flex-col gap-2">
          <Label htmlFor="view-as">{t('viewer.viewAs')}</Label>
          <Select
            value={view}
            onValueChange={(value) => onViewChange(options.find((o) => o === value) ?? view)}
          >
            <SelectTrigger id="view-as" className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {t(`tpl.${option}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <span />
      )}
      <div className="flex flex-wrap items-center gap-2">
        {fullscreen.supported && (
          <Button variant="outline" onClick={fullscreen.toggle}>
            {fullscreen.active ? <Minimize2 /> : <Maximize2 />}
            {fullscreen.active ? t('viewer.exitFullscreen') : t('viewer.fullscreen')}
          </Button>
        )}
        <Button variant="outline" onClick={() => window.print()} title={t('viewer.catalogHint')}>
          <FileDown />
          {t('viewer.catalog')}
        </Button>
      </div>
    </div>
  )
}
