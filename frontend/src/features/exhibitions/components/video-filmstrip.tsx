import { ChevronLeft, ChevronRight, Play } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'

import type { VideoEntry } from '../api/use-video-entries'
import { VideoCredit } from './video-credit'
import { VideoEmbed } from './video-embed'
import { parseEmbedSource } from './video-embed-source'

type VideoFilmstripProps = { entries: VideoEntry[] }

// A horizontal film strip: swipe or use the arrows; the frame in the middle plays when chosen.
export function VideoFilmstrip({ entries }: VideoFilmstripProps) {
  const { t, l } = useI18n()
  const track = useRef<HTMLUListElement>(null)
  const [playing, setPlaying] = useState<number | null>(null)

  const scroll = (direction: 1 | -1) => {
    const node = track.current
    if (!node) return
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    node.scrollBy({ left: direction * node.clientWidth * 0.8, behavior: smooth ? 'smooth' : 'auto' })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="icon" onClick={() => scroll(-1)} aria-label={t('videos.prev')}>
          <ChevronLeft aria-hidden="true" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => scroll(1)} aria-label={t('videos.next')}>
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
      <div className="rounded-lg bg-ink py-3 text-on-ink">
        <div aria-hidden="true" className="film-perforation mb-3" />
        <ul
          ref={track}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:thin]"
          tabIndex={0}
          aria-label={t('videos.title')}
        >
          {entries.map(({ video, exhibition }) => {
            const embed = parseEmbedSource(video.src)
            return (
              <li key={video.id} className="w-[82%] shrink-0 snap-center sm:w-[46%] lg:w-[32%]">
                <div className="group passepartout relative aspect-video overflow-hidden rounded-md ring-1 ring-on-ink/20">
                  {embed ? (
                    <VideoEmbed video={video} source={embed} />
                  ) : (
                    <>
                      <video
                        src={`${video.src}#t=1`}
                        controls={playing === video.id}
                        autoPlay={playing === video.id}
                        preload="metadata"
                        muted={playing !== video.id}
                        playsInline
                        aria-label={l(video.title)}
                        className="size-full object-cover sepia-[.35] transition-[filter,transform] duration-500 motion-safe:group-hover:scale-105 group-hover:sepia-0"
                      />
                      {playing !== video.id && (
                        <button
                          type="button"
                          onClick={() => setPlaying(video.id)}
                          aria-label={t('videos.play', { title: l(video.title) })}
                          className="absolute inset-0 flex items-center justify-center focus-visible:outline-2 focus-visible:outline-ring"
                        >
                          <span className="flex size-12 items-center justify-center rounded-full bg-ink/60 backdrop-blur-sm transition-transform group-hover:scale-110">
                            <Play className="size-5 fill-current" aria-hidden="true" />
                          </span>
                        </button>
                      )}
                    </>
                  )}
                </div>
                <h3 className="mt-3 text-lg font-semibold">{l(video.title)}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-on-ink/75">{l(video.description)}</p>
                <p className="mt-2 text-xs text-on-ink/70">
                  <Link to={`/exhibitions/${exhibition.slug}`} className="text-accent hover:underline">
                    {l(exhibition.title)}
                  </Link>
                </p>
                <VideoCredit video={video} className="mt-1 text-xs text-on-ink/55" />
              </li>
            )
          })}
        </ul>
        <div aria-hidden="true" className="film-perforation mt-3" />
      </div>
    </div>
  )
}
