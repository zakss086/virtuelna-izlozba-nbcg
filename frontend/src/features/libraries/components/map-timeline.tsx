import { Pause, Play, RotateCcw } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useI18n } from '@/lib/i18n'

type MapTimelineProps = {
  min: number
  max: number
  /** Places up to this year are shown; undefined shows all of them. */
  value: number | undefined
  onChange: (year: number | undefined) => void
}

const STEPS = 40
const TICK_MS = 450

// A slider over the years of the places in exhibitions: the story is seen as it unfolds. It can also play by itself.
export function MapTimeline({ min, max, value, onChange }: MapTimelineProps) {
  const { t } = useI18n()
  const [playing, setPlaying] = useState(false)
  const reduceMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const step = Math.max(1, Math.ceil((max - min) / STEPS))

  useEffect(() => {
    if (!playing) return
    const timer = window.setInterval(() => {
      const next = (value ?? min - step) + step
      if (next >= max) {
        onChange(undefined)
        setPlaying(false)
      } else {
        onChange(next)
      }
    }, TICK_MS)
    return () => window.clearInterval(timer)
  }, [playing, value, min, max, step, onChange])

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3">
      <Label htmlFor="map-year" className="font-medium">
        {t('map.timeline')}
      </Label>
      <input
        id="map-year"
        type="range"
        min={min}
        max={max}
        step={1}
        value={value ?? max}
        onChange={(event) => {
          setPlaying(false)
          const year = Number(event.target.value)
          onChange(year >= max ? undefined : year)
        }}
        className="min-w-40 flex-1 accent-accent"
      />
      <output htmlFor="map-year" className="w-40 text-sm text-muted-foreground" aria-live="polite">
        {value === undefined ? t('map.allYears', { min, max }) : t('map.untilYear', { year: value })}
      </output>
      <div className="flex gap-2">
        {!reduceMotion && (
          <Button type="button" variant="outline" size="sm" onClick={() => setPlaying((p) => !p)}>
            {playing ? <Pause /> : <Play />}
            {playing ? t('map.pause') : t('map.play')}
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={value === undefined && !playing}
          onClick={() => {
            setPlaying(false)
            onChange(undefined)
          }}
        >
          <RotateCcw />
          {t('map.showAll')}
        </Button>
      </div>
    </div>
  )
}
